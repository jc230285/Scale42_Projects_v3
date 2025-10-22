// Supabase Edge Function: create_project_from_template
// Deploy: supabase functions deploy create_project_from_template
// Invoke example: supabase.functions.invoke("create_project_from_template", { body: JSON.stringify({ name: "Project Alpha", project_key: "ALPHA", template_code: "S42_SITE_DEV_V1" }) })

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

serve(async (req) => {
  try {
    const { name, project_key, template_code } = await req.json();
    if (!name || !project_key || !template_code) {
      return new Response("Missing required fields", { status: 400 });
    }

    // Check project_key uniqueness
    const { data: existing } = await supabase
      .from("s42_projects")
      .select("id")
      .eq("project_key", project_key)
      .maybeSingle();

    if (existing) {
      return new Response("Project key already exists", { status: 409 });
    }

    // Fetch template
    const { data: templateRow, error: tplErr } = await supabase
      .from("s42_task_templates")
      .select("template, code")
      .eq("code", template_code)
      .eq("is_active", true)
      .maybeSingle();

    if (tplErr || !templateRow) {
      return new Response("Template not found", { status: 404 });
    }

    const tpl = templateRow.template;
    if (!tpl?.tasks) {
      return new Response("Template malformed", { status: 422 });
    }

    // Create project
    const { data: project, error: projErr } = await supabase
      .from("s42_projects")
      .insert({
        name,
        project_key,
      })
      .select("id")
      .single();

    if (projErr || !project) {
      console.error("Project insert failed", projErr);
      return new Response("Failed to create project", { status: 500 });
    }

    const project_id = project.id;

    // Build tasks from template
    const tasksPayload: any[] = [];
    const checklistPayload: any[] = [];

    for (const t of tpl.tasks) {
      const title = t.title
        .replaceAll("{{PROJECT_NAME}}", name)
        .replaceAll("{{PROJECT_KEY}}", project_key);

      const task = {
        project_id,
        title,
        status: t.status || "todo",
        fields: t.fields || {},
        sort_order: t.fields?.["Fel Order"] || 0,
      };

      tasksPayload.push(task);
    }

    // Insert tasks
    const { data: tasks, error: taskErr } = await supabase
      .from("s42_tasks")
      .insert(tasksPayload)
      .select("id, title");

    if (taskErr) {
      console.error("Task creation failed", taskErr);
      return new Response("Failed to create tasks", { status: 500 });
    }

    // Map template checklists to actual task IDs
    for (let i = 0; i < tasks.length; i++) {
      const taskDef = tpl.tasks[i];
      const taskRow = tasks[i];
      if (taskDef.checklist && Array.isArray(taskDef.checklist)) {
        for (const c of taskDef.checklist) {
          checklistPayload.push({
            task_id: taskRow.id,
            name: c.name,
            checked: !!c.checked,
          });
        }
      }
    }

    if (checklistPayload.length > 0) {
      const { error: chkErr } = await supabase
        .from("s42_task_checklist")
        .insert(checklistPayload);
      if (chkErr) console.warn("Checklist insert failed", chkErr);
    }

    // Log creation
    await supabase.from("s42_logs").insert({
      category: "project",
      level: "info",
      page: "/dashboard/tasks",
      user_id: null,
      task_name: name,
      field: "create_project_from_template",
      update_value: { project_key, template_code },
    });

    return new Response(
      JSON.stringify({
        status: "ok",
        project_id,
        tasks_created: tasks.length,
        checklist_created: checklistPayload.length,
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Function error:", err);
    return new Response(`Error: ${err.message}`, { status: 500 });
  }
});
