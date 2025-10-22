'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Tabs, Table, Button, Tooltip, ToastContainer, useToast, Modal, StatusDropdown, StyledDropdown, UserSelectorModal, type User } from '@/components';
import dynamic from 'next/dynamic';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import type { Column } from '@/components/Table';

// Date formatting utility
const formatDateWithTooltip = (dateString: string, showSinceUntil: boolean = false) => {
  if (!dateString) return <span className="text-zinc-500">-</span>;

  const date = new Date(dateString);
  const now = new Date();

  // Format as dd/mm/yyyy
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const shortFormat = `${day}/${month}/${year}`;

  // Tooltip format: dd/mmmm/yyyy (full month name)
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const fullMonth = monthNames[date.getMonth()];
  const tooltipFormat = `${day}/${fullMonth}/${year}`;

  // Calculate days since/until
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let sinceUntilText = '';
  if (showSinceUntil) {
    if (diffDays > 0) {
      sinceUntilText = ` (${diffDays} days until)`;
    } else if (diffDays < 0) {
      sinceUntilText = ` (${Math.abs(diffDays)} days since)`;
    } else {
      sinceUntilText = ' (today)';
    }
  }

  const tooltipContent = showSinceUntil ? `${tooltipFormat}${sinceUntilText}` : tooltipFormat;

  return (
    <Tooltip content={tooltipContent}>
      <span className="cursor-help text-zinc-300">{shortFormat}</span>
    </Tooltip>
  );
};

type Project = {
  id: string;
  name: string;
  project_key: string;
  created_at: string;
  meta?: {
    status?: string;
    priority?: string;
    tags?: string[];
    description?: string;
  };
  // Additional fields for table display
  status?: string;
  priority?: string;
  tags?: string[];
  description?: string;
};

type Task = {
  id: string;
  project_id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'blocked' | 'done';
  fields: Record<string, any>;
  sort_order: number;
  task_type?: 'Application'|'Decision Gate'|'Design'|'Investigation'|'Negotiations'|'Permit'|'Presentation'|'Report'|'Study'|'Travel'|'Work Package' | null;
  task_topic?: 'Cooling'|'Design'|'ESG'|'Fibre'|'Heat Reuse'|'Land'|'Local Engagement'|'Organisation'|'Other'|'Power'|'Restrictions'|'Studies'|'Travel'|'Zoning & Permit' | null;
  budget?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  lead_id?: string | null;
  lead?: { id: string; email: string; display_name: string | null; avatar_url: string | null };
  assignees?: Array<{ id: string; email: string; display_name: string | null; avatar_url: string | null }>;
  notes?: string | null;
  third_party?: string | null;
  s42_projects?: {
    name: string;
    project_key: string;
  };
};
type TemplateOption = { code: string; name: string };

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [name, setName] = useState('Demo Project');
  const [key, setKey] = useState('DEMO');
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [template, setTemplate] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [felNames, setFelNames] = useState<any[]>([]);
  const [projectComments, setProjectComments] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // WYSIWYG Editor Modal State
  const [editorModalOpen, setEditorModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingField, setEditingField] = useState<'notes' | 'third_party' | null>(null);
  const [editorContent, setEditorContent] = useState('');

  // User Selector Modal State
  const [userSelectorOpen, setUserSelectorOpen] = useState(false);
  const [userSelectorMode, setUserSelectorMode] = useState<'lead' | 'assignees'>('lead');
  const [selectedTaskForUsers, setSelectedTaskForUsers] = useState<Task | null>(null);

  const { toasts, addToast, success, error, warning, info, removeToast } = useToast();

  const fetchProjects = useCallback(async () => {
    const res = await fetch('/api/projects', { cache: 'no-store' });
    if (!res.ok) {
      console.warn('Failed to load projects', await res.text());
      setProjects([]);
      return;
    }
    const data: Project[] = await res.json();
    setProjects(data);
  }, []);

  const fetchTemplates = useCallback(async () => {
    const res = await fetch('/api/templates', { cache: 'no-store' });
    if (!res.ok) {
      console.warn('Failed to load templates', await res.text());
      setTemplates([]);
      return;
    }
    const data: TemplateOption[] = await res.json();
    setTemplates(data);
    if (data.length > 0) {
      setTemplate((current) => current || data[0].code);
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    const res = await fetch('/api/tasks', { cache: 'no-store' });
    if (!res.ok) {
      console.warn('Failed to load tasks', await res.text());
      setTasks([]);
      return;
    }
    const data: any[] = await res.json();
    // Flatten tasks from the nested project structure
    const allTasks = data.flatMap(project => 
      project.tasks.map((task: any) => ({
        ...task,
        s42_projects: {
          name: project.name,
          project_key: project.project_key
        },
        // Transform assignees from junction table format
        assignees: task.assignees?.map((a: any) => a.user).filter(Boolean) || []
      }))
    );
    setTasks(allTasks);
  }, []);

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    console.log('[updateTask] Starting update for task:', taskId, 'with updates:', updates);
    try {
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: taskId, ...updates }),
      });

      console.log('[updateTask] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[updateTask] API error:', errorData);
        throw new Error(errorData.error || 'Failed to update task');
      }

      const result = await response.json();
      console.log('[updateTask] API success:', result);

      // Refetch tasks to get the latest data after successful update
      await fetchTasks();

      return { success: true, data: result.data };
    } catch (error) {
      console.error('Task update error:', error);
      throw error;
    }
  }, [fetchTasks]);

  const fetchFelNames = useCallback(async () => {
    try {
      const res = await fetch('/api/projects?fel_names=true');
      if (res.ok) {
        const data = await res.json();
        setFelNames(data.fel_names || []);
      }
    } catch (error) {
      console.error('Failed to fetch FEL names:', error);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
    fetchTemplates();
    fetchTasks();
    fetchFelNames();
  }, [fetchProjects, fetchTemplates, fetchTasks, fetchFelNames]);

  const createProject = async () => {
    try {
      // Auto-generate project key from name (first 3-4 letters, uppercase)
      const autoKey = name
        .trim()
        .split(/\s+/)[0] // Take first word
        .substring(0, 4)  // Max 4 characters
        .toUpperCase();

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: name.trim(), 
          project_key: autoKey,
          // Don't use template - create empty project
        }),
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || 'Failed to create project');
      }

      const data = await res.json();
      await fetchProjects();
      await fetchTasks();
      success(`Created project "${name}"`);
      setShowCreateForm(false);
      setName('');
      setKey('');
      setTemplate('');
    } catch (err: any) {
      error(err?.message ?? 'Project creation failed');
    }
  };

  const openCommentsSidebar = (project: Project) => {
    setSidebarOpen(true);
    // In a real app, you would fetch existing comments here
    setProjectComments('');
  };

  const saveComments = () => {
    // In a real app, you would save comments to the database
    alert(`Comments saved`);
    setSidebarOpen(false);
    setProjectComments('');
  };

  // WYSIWYG Editor Functions
  const openEditorModal = (task: Task, field: 'notes' | 'third_party') => {
    setEditingTask(task);
    setEditingField(field);
    setEditorContent(task[field] || '');
    setEditorModalOpen(true);
  };

  const saveEditorContent = async () => {
    if (!editingTask || !editingField) return;

    try {
      await updateTask(editingTask.id, { [editingField]: editorContent });
      success(`${editingField === 'notes' ? 'Notes' : '3 Party'} updated successfully for "${editingTask.title}"`);
      setEditorModalOpen(false);
      setEditingTask(null);
      setEditingField(null);
      setEditorContent('');
    } catch (err) {
      error(`Failed to update ${editingField}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const closeEditorModal = () => {
    setEditorModalOpen(false);
    setEditingTask(null);
    setEditingField(null);
    setEditorContent('');
  };

  // User Selector Functions
  const handleUserSelection = async (users: User[]) => {
    if (!selectedTaskForUsers) return;

    try {
      if (userSelectorMode === 'lead') {
        // Update lead (single user)
        const leadId = users.length > 0 ? users[0].id : null;
        await updateTask(selectedTaskForUsers.id, { lead_id: leadId });
        success(`Lead ${leadId ? 'assigned' : 'removed'} successfully`);
      } else {
        // Update assignees (multiple users)
        const taskId = selectedTaskForUsers.id;
        
        // Get current assignees
        const currentAssigneeIds = selectedTaskForUsers.assignees?.map(a => a.id) || [];
        const newAssigneeIds = users.map(u => u.id);
        
        // Find users to add and remove
        const toAdd = newAssigneeIds.filter(id => !currentAssigneeIds.includes(id));
        const toRemove = currentAssigneeIds.filter(id => !newAssigneeIds.includes(id));
        
        // Remove assignees
        for (const userId of toRemove) {
          await fetch(`/api/tasks/${taskId}/assignees?user_id=${userId}`, {
            method: 'DELETE',
          });
        }
        
        // Add assignees
        if (toAdd.length > 0) {
          await fetch(`/api/tasks/${taskId}/assignees`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_ids: toAdd }),
          });
        }
        
        success(`Assignees updated successfully`);
      }
      
      // Refresh tasks to show updated data
      await fetchTasks();
    } catch (err) {
      error(`Failed to update ${userSelectorMode}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Generate transposed table data and columns using FEL names
  const generateTransposedTable = () => {
    // Create columns: Order + FEL Stage + one column per project
    const columns: Column<any>[] = [
      {
        key: 'order',
        header: 'FEL Order',
        width: '100px',
        render: (_: any, row: any) => (
          <span className="font-mono text-sm font-medium text-zinc-100">
            {row.isProgressRow ? 'Progress' : row.isActionsRow ? 'Actions' : parseFloat(row.code).toFixed(2)}
          </span>
        ),
      },
      {
        key: 'fel_stage',
        header: 'FEL Stage',
        width: '300px',
        render: (_: any, row: any) => (
          <div className="font-medium text-zinc-100">
            {row.isProgressRow ? 'Overall Progress' : row.isActionsRow ? 'Actions' : row.name}
          </div>
        ),
      },
      ...sortedProjects.map(project => ({
        key: `project_${project.id}`,
        header: project.name,
        width: '120px',
        type: 'custom' as const,
        editable: false, // Handled in render with select
        render: (_: any, row: any) => {
          if (row.isProgressRow) {
            // Overall progress row with 4-color segmented bar
            const breakdown = getProjectStatusBreakdown(project);
            const total = breakdown.done + breakdown.in_progress + breakdown.blocked + breakdown.todo;
            
            return (
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-zinc-700 rounded-full h-2 flex overflow-hidden">
                  {/* Done - Green */}
                  {breakdown.done > 0 && (
                    <div
                      className="bg-green-500 h-2 transition-all duration-300"
                      style={{ width: `${breakdown.done}%` }}
                      title={`Done: ${Math.round(breakdown.done)}%`}
                    />
                  )}
                  {/* In Progress - Blue */}
                  {breakdown.in_progress > 0 && (
                    <div
                      className="bg-blue-500 h-2 transition-all duration-300"
                      style={{ width: `${breakdown.in_progress}%` }}
                      title={`In Progress: ${Math.round(breakdown.in_progress)}%`}
                    />
                  )}
                  {/* Blocked - Orange */}
                  {breakdown.blocked > 0 && (
                    <div
                      className="bg-orange-500 h-2 transition-all duration-300"
                      style={{ width: `${breakdown.blocked}%` }}
                      title={`Blocked: ${Math.round(breakdown.blocked)}%`}
                    />
                  )}
                  {/* To Do - Red */}
                  {breakdown.todo > 0 && (
                    <div
                      className="bg-red-500 h-2 transition-all duration-300"
                      style={{ width: `${breakdown.todo}%` }}
                      title={`To Do: ${Math.round(breakdown.todo)}%`}
                    />
                  )}
                </div>
                <span className="text-xs text-zinc-400 font-mono">
                  {Math.round(breakdown.done)}%
                </span>
              </div>
            );
          } else if (row.isActionsRow) {
            // Actions row
            return (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  // TODO: Implement FEL naming convention action
                  info(`FEL naming convention applied to ${project.name}`);
                }}
                className="text-xs"
              >
                Use FEL Names
              </Button>
            );
          } else {
            // Regular FEL stage rows - show dropdown
            // Match by sort_order with tolerance for floating point comparison
            const targetSortOrder = parseFloat(row.code);
            const task = tasks.find(t => 
              Math.abs(t.sort_order - targetSortOrder) < 0.01 && 
              t.project_id === project.id
            );
            
            if (!task) {
              return (
                <StatusDropdown
                  value=""
                  onChange={async (status) => {
                    try {
                      const response = await fetch('/api/tasks', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          project_id: project.id,
                          title: row.name,
                          status: status,
                          sort_order: targetSortOrder,
                        }),
                      });
                      if (!response.ok) {
                        throw new Error('Failed to create task');
                      }
                      await fetchTasks();
                      success(`Task "${row.name}" created with status ${status}`);
                    } catch (err) {
                      error(`Failed to create task: ${err instanceof Error ? err.message : 'Unknown error'}`);
                    }
                  }}
                  className="bg-zinc-800 border border-zinc-600"
                  placeholder="Select..."
                />
              );
            } else {
              return (
                <StatusDropdown
                  key={task.id}
                  value={task.status || 'todo'}
                  onChange={async (status) => {
                    try {
                      console.log('[Status] Updating task:', task.id, 'to:', status);
                      await updateTask(task.id, { status: status as Task['status'] });
                      success(`Task status updated to ${status}`);
                    } catch (err) {
                      console.error('[Status] Update failed:', err);
                      error(`Failed to update task status: ${err instanceof Error ? err.message : 'Unknown error'}`);
                    }
                  }}
                />
              );
            }
          }
        }
      }))
    ];

    // Get all unique sort_order values from tasks across all projects
    const uniqueSortOrders = new Set<number>();
    tasks.forEach(task => {
      if (task.sort_order !== null && task.sort_order !== undefined) {
        uniqueSortOrders.add(task.sort_order);
      }
    });

    // Convert to array and sort numerically
    const sortedOrders = Array.from(uniqueSortOrders).sort((a, b) => a - b);

    // Create rows for each unique sort_order
    const taskRows = sortedOrders.map(sortOrder => {
      // Find a task with this sort_order to get the title
      const sampleTask = tasks.find(t => Math.abs(t.sort_order - sortOrder) < 0.01);
      const taskTitle = sampleTask?.title || `Task ${sortOrder.toFixed(2)}`;
      
      return {
        code: sortOrder.toFixed(2),
        name: taskTitle
      };
    });

    // Create data with progress row first, then actions row, then all unique task rows
    const tableData = [
      { isProgressRow: true, code: 'Pro', name: 'Overall Progress' },
      { isActionsRow: true, code: 'Act', name: 'Actions' },
      ...taskRows
    ];

    return { columns, data: tableData };
  };

  // Calculate status breakdown for each project
  const getProjectStatusBreakdown = (project: Project) => {
    const projectTasks = tasks.filter(task => task.project_id === project.id);
    const total = projectTasks.length;
    
    if (total === 0) return { done: 0, blocked: 0, in_progress: 0, todo: 0 };
    
    const done = projectTasks.filter(task => task.status === 'done').length;
    const blocked = projectTasks.filter(task => task.status === 'blocked').length;
    const in_progress = projectTasks.filter(task => task.status === 'in_progress').length;
    const todo = projectTasks.filter(task => task.status === 'todo').length;
    
    return {
      done: (done / total) * 100,
      blocked: (blocked / total) * 100,
      in_progress: (in_progress / total) * 100,
      todo: (todo / total) * 100
    };
  };

  // Calculate completion percentage for each project
  const getProjectCompletion = (project: Project) => {
    const projectTasks = tasks.filter(task => task.project_id === project.id);
    if (projectTasks.length === 0) return 0;
    const completedTasks = projectTasks.filter(task => task.status === 'done').length;
    return (completedTasks / projectTasks.length) * 100;
  };

  // Sort projects by completion percentage (most complete first)
  const sortedProjects = [...projects].sort((a, b) => getProjectCompletion(b) - getProjectCompletion(a));
  const projectsTableColumns: Column<Project>[] = [
    {
      key: 'name',
      header: 'Project Name',
      sortable: true,
      width: '250px',
      render: (value: string, row: Project) => (
        <Link
          href={`/projects/${row.project_key}`}
          className="text-blue-400 hover:text-blue-300 underline font-medium"
        >
          {value}
        </Link>
      ),
    },
    {
      key: 'progress',
      header: 'Progress',
      sortable: true,
      width: '200px',
      render: (_: any, row: Project) => {
        const completion = getProjectCompletion(row);
        const projectTasks = tasks.filter(task => task.project_id === row.id);
        const completedTasks = projectTasks.filter(task => task.status === 'done').length;

        return (
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-zinc-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completion}%` }}
              />
            </div>
            <span className="text-sm text-zinc-400 font-mono">
              {completedTasks}/{projectTasks.length}
            </span>
          </div>
        );
      }
    },
  ];

  const taskTableColumns: Column<Task>[] = [
    {
      key: 'sort_order',
      header: 'Order',
      sortable: true,
      editable: true,
      width: '80px',
      render: (value: number) => (
        <span className="font-mono text-sm text-zinc-300">
          {value.toFixed(2)}
        </span>
      ),
    },
    {
      key: 's42_projects',
      header: 'Project',
      sortable: true,
      width: '200px',
      hidden: true, // Hide by default
      render: (value: Project) => (
        <div className="font-medium text-zinc-100">
          {value?.name || 'Unknown Project'}
        </div>
      ),
    },
    {
      key: 'title',
      header: 'Task Title',
      sortable: true,
      editable: true, // Make inline editable
      width: '300px',
      render: (value: string, row: Task) => (
        <div className="font-medium text-zinc-100">
          {value}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      filterable: true,
      width: '140px',
      filterOptions: [
        { value: 'todo', label: 'To Do' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'blocked', label: 'Blocked' },
        { value: 'done', label: 'Done' }
      ],
      render: (value: string, row: Task) => (
        <StatusDropdown
          value={value as any}
          onChange={async (newValue) => {
            await updateTask(row.id, { status: newValue as any });
          }}
        />
      )
    },
    {
      key: 'lead_id',
      header: 'Lead',
      width: '140px',
      render: (value: string, row: Task) => (
        <button
          onClick={() => {
            setSelectedTaskForUsers(row);
            setUserSelectorMode('lead');
            setUserSelectorOpen(true);
          }}
          className="text-left w-full px-2 py-1 rounded hover:bg-zinc-800 transition-colors"
        >
          {row.lead ? (
            <div className="flex items-center gap-2">
              {row.lead.avatar_url ? (
                <img src={row.lead.avatar_url} alt="" className="w-6 h-6 rounded-full" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-xs text-zinc-300">
                  {(row.lead.display_name || row.lead.email).charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-zinc-300 text-sm truncate">
                {row.lead.display_name || row.lead.email}
              </span>
            </div>
          ) : (
            <span className="text-zinc-500 text-sm">Unassigned</span>
          )}
        </button>
      )
    },
    {
      key: 'assignees',
      header: 'Assignees',
      width: '180px',
      render: (value: any[], row: Task) => (
        <button
          onClick={() => {
            setSelectedTaskForUsers(row);
            setUserSelectorMode('assignees');
            setUserSelectorOpen(true);
          }}
          className="text-left w-full px-2 py-1 rounded hover:bg-zinc-800 transition-colors"
        >
          {row.assignees && row.assignees.length > 0 ? (
            <div className="flex items-center gap-1">
              <div className="flex -space-x-2">
                {row.assignees.slice(0, 3).map((assignee, idx) => (
                  assignee.avatar_url ? (
                    <img
                      key={idx}
                      src={assignee.avatar_url}
                      alt=""
                      className="w-6 h-6 rounded-full border-2 border-zinc-900"
                    />
                  ) : (
                    <div
                      key={idx}
                      className="w-6 h-6 rounded-full bg-zinc-700 border-2 border-zinc-900 flex items-center justify-center text-xs text-zinc-300"
                    >
                      {(assignee.display_name || assignee.email).charAt(0).toUpperCase()}
                    </div>
                  )
                ))}
              </div>
              {row.assignees.length > 3 && (
                <span className="text-xs text-zinc-400 ml-1">+{row.assignees.length - 3}</span>
              )}
            </div>
          ) : (
            <span className="text-zinc-500 text-sm">No assignees</span>
          )}
        </button>
      )
    },
    {
      key: 'task_type',
      header: 'Task',
      sortable: true,
      filterable: true,
      width: '160px',
      filterOptions: [
        { value: 'Application', label: 'Application' },
        { value: 'Decision Gate', label: 'Decision Gate' },
        { value: 'Design', label: 'Design' },
        { value: 'Investigation', label: 'Investigation' },
        { value: 'Negotiations', label: 'Negotiations' },
        { value: 'Permit', label: 'Permit' },
        { value: 'Presentation', label: 'Presentation' },
        { value: 'Report', label: 'Report' },
        { value: 'Study', label: 'Study' },
        { value: 'Travel', label: 'Travel' },
        { value: 'Work Package', label: 'Work Package' }
      ],
      render: (value: string, row: Task) => (
        <StyledDropdown
          value={value}
          options={[
            { value: 'Application', label: 'Application' },
            { value: 'Decision Gate', label: 'Decision Gate' },
            { value: 'Design', label: 'Design' },
            { value: 'Investigation', label: 'Investigation' },
            { value: 'Negotiations', label: 'Negotiations' },
            { value: 'Permit', label: 'Permit' },
            { value: 'Presentation', label: 'Presentation' },
            { value: 'Report', label: 'Report' },
            { value: 'Study', label: 'Study' },
            { value: 'Travel', label: 'Travel' },
            { value: 'Work Package', label: 'Work Package' }
          ]}
          onChange={async (newValue) => {
            try {
              console.log('[Task Type] Updating task:', row.id, 'to:', newValue);
              await updateTask(row.id, { task_type: newValue as any });
              success(`Task type updated to ${newValue}`);
            } catch (err) {
              console.error('[Task Type] Update failed:', err);
              error(`Failed to update task type: ${err instanceof Error ? err.message : 'Unknown error'}`);
            }
          }}
          placeholder="Select task type"
          color="blue"
          searchable={true}
        />
      )
    },
    {
      key: 'task_topic',
      header: 'Topic',
      sortable: true,
      filterable: true,
      width: '180px',
      filterOptions: [
        { value: 'Cooling', label: 'Cooling' },
        { value: 'Design', label: 'Design' },
        { value: 'ESG', label: 'ESG' },
        { value: 'Fibre', label: 'Fibre' },
        { value: 'Heat Reuse', label: 'Heat Reuse' },
        { value: 'Land', label: 'Land' },
        { value: 'Local Engagement', label: 'Local Engagement' },
        { value: 'Organisation', label: 'Organisation' },
        { value: 'Other', label: 'Other' },
        { value: 'Power', label: 'Power' },
        { value: 'Restrictions', label: 'Restrictions' },
        { value: 'Studies', label: 'Studies' },
        { value: 'Travel', label: 'Travel' },
        { value: 'Zoning & Permit', label: 'Zoning & Permit' }
      ],
      render: (value: string, row: Task) => (
        <StyledDropdown
          value={value}
          options={[
            { value: 'Cooling', label: 'Cooling' },
            { value: 'Design', label: 'Design' },
            { value: 'ESG', label: 'ESG' },
            { value: 'Fibre', label: 'Fibre' },
            { value: 'Heat Reuse', label: 'Heat Reuse' },
            { value: 'Land', label: 'Land' },
            { value: 'Local Engagement', label: 'Local Engagement' },
            { value: 'Organisation', label: 'Organisation' },
            { value: 'Other', label: 'Other' },
            { value: 'Power', label: 'Power' },
            { value: 'Restrictions', label: 'Restrictions' },
            { value: 'Studies', label: 'Studies' },
            { value: 'Travel', label: 'Travel' },
            { value: 'Zoning & Permit', label: 'Zoning & Permit' }
          ]}
          onChange={async (newValue) => {
            try {
              console.log('[Task Topic] Updating task:', row.id, 'to:', newValue);
              await updateTask(row.id, { task_topic: newValue as any });
              success(`Task topic updated to ${newValue}`);
            } catch (err) {
              console.error('[Task Topic] Update failed:', err);
              error(`Failed to update task topic: ${err instanceof Error ? err.message : 'Unknown error'}`);
            }
          }}
          placeholder="Select topic"
          color="purple"
          searchable={true}
        />
      )
    },
    {
      key: 'budget',
      header: 'Budget',
      editable: true,
      sortable: true,
      width: '100px',
      render: (value: number) => (
        <span className="font-mono text-sm text-zinc-300">
          {value !== null && value !== undefined ? `$${value.toFixed(2)}` : '-'}
        </span>
      )
    },
    {
      key: 'start_date',
      header: 'Start Date',
      sortable: true,
      render: (value: string) => formatDateWithTooltip(value, true)
    },
    {
      key: 'end_date',
      header: 'End Date',
      sortable: true,
      render: (value: string) => formatDateWithTooltip(value, true)
    },
    {
      key: 'notes',
      header: 'Notes',
      render: (value: string, row: Task) => (
        <span
          className="text-zinc-400 cursor-pointer hover:text-zinc-300"
          title={value || 'Click to add notes'}
          onClick={() => openEditorModal(row, 'notes')}
        >
          {value ? '📝' : '➕'}
        </span>
      )
    },
    {
      key: 'third_party',
      header: '3 Party',
      render: (value: string, row: Task) => (
        <span
          className="text-zinc-400 cursor-pointer hover:text-zinc-300"
          title={value || 'Click to add third party info'}
          onClick={() => openEditorModal(row, 'third_party')}
        >
          {value ? '🤝' : '➕'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, row: Task) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => console.log('Edit task:', row.title)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => console.log('View task details:', row.title)}
          >
            View
          </Button>
        </div>
      ),
    },
  ];

  const tabs = [
    {
      id: 'projects',
      label: 'Projects',
      content: (
        <div className="flex flex-col h-full">
          {/* Projects Table with Progress and Actions */}
          <div className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 overflow-hidden">
            {/* FEL Stages Matrix */}
            <div className="h-full overflow-auto">
              <Table
                data={generateTransposedTable().data}
                columns={generateTransposedTable().columns}
                striped={true}
                hoverable={true}
                selectable={false}
                searchable={false}
                color="default"
              />
            </div>
          </div>
        </div>
      ),
    },
    // Add individual project tabs sorted by completion (most complete first)
    ...sortedProjects.map(project => ({
      id: project.id,
      label: project.name,
      content: (
        <div className="flex flex-col h-full space-y-6">
          <div className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-zinc-100">{project.name}</h3>
                <p className="text-sm text-zinc-400">{project.meta?.description || 'No description available'}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => openCommentsSidebar(project)}
                >
                  Comments
                </Button>
                <Button
                  onClick={() => window.open(`/projects/${project.project_key}`, '_blank')}
                >
                  View Project
                </Button>
              </div>
            </div>

            {/* Project Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-zinc-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-zinc-100">
                  {tasks.filter(task => task.project_id === project.id).length}
                </div>
                <div className="text-sm text-zinc-400">Total Tasks</div>
              </div>
              <div className="bg-zinc-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-400">
                  {tasks.filter(task => task.project_id === project.id && task.status === 'done').length}
                </div>
                <div className="text-sm text-zinc-400">Completed</div>
              </div>
              <div className="bg-zinc-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-400">
                  {tasks.filter(task => task.project_id === project.id && task.status === 'in_progress').length}
                </div>
                <div className="text-sm text-zinc-400">In Progress</div>
              </div>
              <div className="bg-zinc-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-400">
                  {tasks.filter(task => task.project_id === project.id && task.status === 'todo').length}
                </div>
                <div className="text-sm text-zinc-400">To Do</div>
              </div>
            </div>

            {/* Tasks Table */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <h4 className="text-md font-medium text-zinc-100 mb-4">Tasks</h4>
              {tasks.filter(task => task.project_id === project.id).length > 0 ? (
                <div className="flex-1 overflow-auto">
                  <Table
                    data={tasks.filter(task => task.project_id === project.id)}
                    columns={taskTableColumns}
                    striped={true}
                    hoverable={true}
                    selectable={true}
                    searchable={true}
                    color="default"
                    defaultSort={{ key: 'sort_order', direction: 'asc' }}
                    onSelectionChange={(selected) => {
                      console.log('Selected tasks:', selected);
                    }}
                    onCellEdit={async (row, column, newValue) => {
                      try {
                        // Convert string values back to appropriate types
                        let processedValue = newValue;
                        if (column.key === 'sort_order') {
                          processedValue = newValue === '' ? 0 : parseFloat(newValue);
                        } else if (column.key === 'budget') {
                          // Round to 2 decimal places
                          processedValue = newValue === '' ? null : Math.round(parseFloat(newValue) * 100) / 100;
                        } else if (column.key === 'start_date' || column.key === 'end_date') {
                          processedValue = newValue === '' ? null : newValue;
                        } else if (column.key === 'title') {
                          processedValue = newValue.trim();
                        }
                        // task_type, task_topic, lead_id, notes, third_party are strings and don't need conversion

                        await updateTask(row.id, { [column.key]: processedValue });
                        success(`${column.header} updated successfully for "${row.title}"`);
                      } catch (err) {
                        error(`Failed to update ${column.header}: ${err instanceof Error ? err.message : 'Unknown error'}`);
                      }
                    }}
                  />
                </div>
              ) : (
                <div className='text-sm text-zinc-500 border border-dashed border-zinc-700 rounded-xl px-4 py-6 text-center'>
                  No tasks yet for this project.
                </div>
              )}
            </div>
          </div>
        </div>
      ),
    })),
  ];

  return (
    <div className="h-full flex flex-col">
      <header className='flex items-center justify-between mb-6'>
        <div className='space-y-2'>
          <h1 className='text-2xl font-semibold'>Projects</h1>
          <p className='text-sm text-zinc-400'>
            Instantiate projects from Supabase templates and manage their autogenerated tasks.
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg'
        >
          Create Project
        </Button>
      </header>

      {/* Create Project Modal */}
      {showCreateForm && (
          <Modal
            isOpen={showCreateForm}
            title="Create New Project"
            onClose={() => setShowCreateForm(false)}
            size="sm"
          >
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-zinc-300 mb-2'>Project Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder='Enter project name'
                  className='w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && name.trim()) {
                      createProject();
                    }
                  }}
                />
                <p className='text-xs text-zinc-500 mt-1'>
                  You can configure project details in the Projects tab after creation.
                </p>
              </div>
              <div className='flex gap-3 pt-2'>
                <Button
                  onClick={createProject}
                  disabled={!name.trim()}
                  className='flex-1'
                >
                  Create Project
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setName('');
                  }}
                  className='flex-1'
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Modal>
        )}

      <Tabs tabs={tabs} defaultTab="projects" />

      {/* Comments Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-96 bg-zinc-900 border-l border-zinc-700 shadow-xl">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-zinc-700">
              <h2 className="text-lg font-semibold text-zinc-100">
                Comments
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                ✕
              </Button>
            </div>

            <div className="flex-1 p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-100 mb-2">
                  Project Comments
                </label>
                <textarea
                  value={projectComments}
                  onChange={(e) => setProjectComments(e.target.value)}
                  className="w-full h-64 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Add comments about this project..."
                />
              </div>
            </div>

            <div className="p-4 border-t border-zinc-700">
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setSidebarOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveComments}
                  className="flex-1"
                >
                  Save Comments
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* WYSIWYG Editor Modal */}
      <Modal
        isOpen={editorModalOpen}
        onClose={closeEditorModal}
        title={`Edit ${editingField === 'notes' ? 'Notes' : 'Third Party'} - ${editingTask?.title}`}
        size="lg"
      >
        <div className="space-y-4">
          <div className="min-h-64">
            <ReactQuill
              value={editorContent}
              onChange={setEditorContent}
              theme="snow"
              className="bg-zinc-800 text-zinc-100"
              style={{
                backgroundColor: '#27272a',
                color: '#f4f4f5'
              }}
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={closeEditorModal}>
              Cancel
            </Button>
            <Button onClick={saveEditorContent}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      {/* User Selector Modal */}
      <UserSelectorModal
        isOpen={userSelectorOpen}
        onClose={() => {
          setUserSelectorOpen(false);
          setSelectedTaskForUsers(null);
        }}
        onSelect={handleUserSelection}
        selectedUserIds={
          userSelectorMode === 'lead'
            ? (selectedTaskForUsers?.lead_id ? [selectedTaskForUsers.lead_id] : [])
            : (selectedTaskForUsers?.assignees?.map(a => a.id) || [])
        }
        multiple={userSelectorMode === 'assignees'}
        title={userSelectorMode === 'lead' ? 'Select Lead' : 'Select Assignees'}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
