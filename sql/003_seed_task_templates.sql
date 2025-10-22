-- 003_seed_task_templates.sql
-- Seed task templates for Norway and Iceland variants.
insert into public.s42_task_templates (name, code, version, template, is_active)
values
  (
    'Norway Template',
    'S42_NORWAY_V1',
    1,
    $${
      "version": 1,
      "code": "S42_NORWAY_V1",
      "variables": ["PROJECT_NAME", "PROJECT_KEY"],
      "dropdowns": {
        "FEL Stage": ["FEL-1", "FEL-2", "FEL-3"],
        "Task Category": ["Investigation", "Negotiations", "Regulatory", "Design"]
      },
      "roles": ["CIO", "CTO", "Local PM"],
      "tasks": [
        {
          "title": "Norway kickoff - {{PROJECT_NAME}}",
          "status": "todo",
          "fields": {
            "Fel Order": 1,
            "FEL Stage": "FEL-1",
            "Task Category": "Investigation",
            "Region": "Norway",
            "Lead": "Local PM"
          },
          "checklist": [
            { "name": "Verify Norwegian regulatory requirements", "checked": false },
            { "name": "Confirm local partner availability", "checked": false }
          ],
          "notes": "Initial planning with Norway-specific compliance."
        }
      ]
    }$$::jsonb,
    true
  ),
  (
    'Iceland Template',
    'S42_ICELAND_V1',
    1,
    $${
      "version": 1,
      "code": "S42_ICELAND_V1",
      "variables": ["PROJECT_NAME", "PROJECT_KEY"],
      "dropdowns": {
        "FEL Stage": ["FEL-0", "FEL-1", "FEL-2"],
        "Task Category": ["Discovery", "Permitting", "Logistics", "Design"]
      },
      "roles": ["CIO", "CTO", "Iceland PM"],
      "tasks": [
        {
          "title": "Iceland kickoff - {{PROJECT_NAME}}",
          "status": "todo",
          "fields": {
            "Fel Order": 1,
            "FEL Stage": "FEL-0",
            "Task Category": "Discovery",
            "Region": "Iceland",
            "Lead": "Iceland PM"
          },
          "checklist": [
            { "name": "Confirm geothermal capacity assumptions", "checked": false },
            { "name": "Align with Icelandic stakeholders", "checked": false }
          ],
          "notes": "Initial planning tailored for Iceland operations."
        }
      ]
    }$$::jsonb,
    true
  )
on conflict (code) do update
set
  name = excluded.name,
  version = excluded.version,
  template = excluded.template,
  is_active = excluded.is_active;
