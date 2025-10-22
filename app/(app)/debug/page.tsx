'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useState } from 'react';
import { useToast, ToastContainer, Tooltip, Table, Button, Card, Stats, BarChart, Modal } from '@/components';
import Dropdown from '@/components/Dropdown';
import { formatDateShort, formatDateLong } from '@/lib';
import dynamic from 'next/dynamic';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

// Import Quill styles
import 'react-quill/dist/quill.snow.css';

export default function DebugPage() {
  const { data: session, status } = useSession();
  const { toasts, addToast, success, error, warning, info, removeToast } = useToast();

  // Notes modal state
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [editingNotes, setEditingNotes] = useState('');
  const [editingUser, setEditingUser] = useState<any>(null);

  // Quill toolbar configuration
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'blockquote', 'code-block'],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ],
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'link', 'blockquote', 'code-block',
    'color', 'background'
  ];

  return (
    <div className='space-y-6'>
      <header>
        <h1 className='text-3xl font-semibold'>Debug</h1>
        <p className='mt-2 text-sm text-zinc-400'>
          Debug and development tools.
        </p>
      </header>

      {/* Architecture & Installation Info */}
      <div className='rounded-xl border border-zinc-800 bg-zinc-900/60 p-6'>
        <h2 className='text-xl font-semibold mb-4'>Architecture & Installation</h2>
        <div className='space-y-4 text-sm text-zinc-300'>
          <div>
            <h3 className='font-semibold text-zinc-100'>Tech Stack:</h3>
            <ul className='list-disc list-inside ml-4 mt-2 space-y-1'>
              <li>Next.js 14.2.5 with App Router</li>
              <li>Supabase (PostgreSQL + Auth)</li>
              <li>Tailwind CSS for styling</li>
              <li>NextAuth.js for authentication</li>
              <li>TypeScript for type safety</li>
            </ul>
          </div>
          <div>
            <h3 className='font-semibold text-zinc-100'>Key Features:</h3>
            <ul className='list-disc list-inside ml-4 mt-2 space-y-1'>
              <li>Role-based access control (RBAC)</li>
              <li>Dynamic page management</li>
              <li>Navigation system with categories</li>
              <li>Google OAuth authentication</li>
              <li>Responsive design with dark theme</li>
            </ul>
          </div>
          <div>
            <h3 className='font-semibold text-zinc-100'>Database Schema:</h3>
            <ul className='list-disc list-inside ml-4 mt-2 space-y-1'>
              <li>s42_users - User accounts</li>
              <li>s42_groups - Permission groups</li>
              <li>s42_pages - Dynamic content pages</li>
              <li>s42_menu_items - Navigation structure</li>
              <li>s42_categories - Menu organization</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tooltip Demonstrations */}
      <div className='rounded-xl border border-zinc-800 bg-zinc-900/60 p-6'>
        <h2 className='text-xl font-semibold mb-4'>Tooltip Demonstrations</h2>
        <div className='flex flex-wrap gap-4'>
          <Tooltip content="This is a tooltip above the button">
            <button className='px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white font-semibold'>
              Top Tooltip
            </button>
          </Tooltip>

          <Tooltip content="Tooltip on the right side" position="right">
            <button className='px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-semibold'>
              Right Tooltip
            </button>
          </Tooltip>

          <Tooltip content="Bottom positioned tooltip" position="bottom">
            <button className='px-4 py-2 rounded bg-pink-600 hover:bg-pink-700 text-white font-semibold'>
              Bottom Tooltip
            </button>
          </Tooltip>

          <Tooltip content="Left side tooltip with more text" position="left">
            <button className='px-4 py-2 rounded bg-teal-600 hover:bg-teal-700 text-white font-semibold'>
              Left Tooltip
            </button>
          </Tooltip>

          <Tooltip content="Bottom-left aligned tooltip" position="bottom-left">
            <button className='px-4 py-2 rounded bg-orange-600 hover:bg-orange-700 text-white font-semibold'>
              Bottom-Left
            </button>
          </Tooltip>

          <Tooltip content="Bottom-right aligned tooltip" position="bottom-right">
            <button className='px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-700 text-white font-semibold'>
              Bottom-Right
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Toast & Auth Demo */}
      <div className='rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4'>
        <h2 className='text-xl font-semibold mb-4'>Toast & Auth System Demo</h2>
        <div className='flex flex-wrap gap-4'>
          <button
            className='px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white font-semibold'
            onClick={() => success('Operation completed successfully!')}
          >
            Success Toast
          </button>
          <button
            className='px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold'
            onClick={() => error('An error occurred!')}
          >
            Error Toast
          </button>
          <button
            className='px-4 py-2 rounded bg-yellow-600 hover:bg-yellow-700 text-white font-semibold'
            onClick={() => warning('Warning: Please check your input')}
          >
            Warning Toast
          </button>
          <button
            className='px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold'
            onClick={() => info('This is an info message')}
          >
            Info Toast
          </button>
        </div>
        <div className='flex flex-wrap gap-4'>
          <button
            className='px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white font-semibold'
            onClick={() => {
              if (status === 'authenticated') {
                success('Already logged in as ' + session?.user?.email);
              } else {
                signIn();
              }
            }}
          >
            {status === 'authenticated' ? 'Show User Info' : 'Login'}
          </button>
          <button
            className='px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold'
            onClick={() => {
              if (status === 'authenticated') {
                signOut();
              } else {
                warning('Not logged in');
              }
            }}
          >
            Logout
          </button>
        </div>
        <ToastContainer toasts={toasts} onRemove={removeToast} position="bottom-left" />
      </div>

      {/* Advanced Components Demo */}
      <div className='rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-6'>
        <h2 className='text-xl font-semibold mb-4'>Advanced Components Demo</h2>

        {/* Stats Dashboard */}
        <div className='mb-8'>
          <h3 className='text-lg font-semibold mb-4 text-zinc-100'>Statistics Dashboard</h3>
          <Stats
            stats={[
              {
                label: 'Total Users',
                value: '2,543',
                change: { value: 12.5, type: 'increase' },
                icon: '👥'
              },
              {
                label: 'Revenue',
                value: '$45,231',
                change: { value: 8.2, type: 'increase' },
                icon: '💰'
              },
              {
                label: 'Active Projects',
                value: '127',
                change: { value: 3.1, type: 'decrease' },
                icon: '📊'
              },
              {
                label: 'System Health',
                value: '98.5%',
                change: { value: 0.5, type: 'increase' },
                icon: '❤️'
              }
            ]}
          />
        </div>

        {/* Charts */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
          <Card title="Monthly Revenue">
            <BarChart
              data={[
                { label: 'Jan', value: 12000 },
                { label: 'Feb', value: 15000 },
                { label: 'Mar', value: 18000 },
                { label: 'Apr', value: 22000 },
                { label: 'May', value: 25000 },
                { label: 'Jun', value: 28000 }
              ]}
              title="Revenue Trend"
            />
          </Card>

          <Card title="User Activity">
            <BarChart
              data={[
                { label: 'Mon', value: 245 },
                { label: 'Tue', value: 312 },
                { label: 'Wed', value: 289 },
                { label: 'Thu', value: 356 },
                { label: 'Fri', value: 423 },
                { label: 'Sat', value: 198 },
                { label: 'Sun', value: 167 }
              ]}
              title="Daily Active Users"
            />
          </Card>
        </div>

        {/* Advanced Table Demo */}
        <div className='mb-8'>
          <h3 className='text-lg font-semibold mb-4 text-zinc-100'>Advanced Data Table</h3>
          <Table
            data={[
              {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                role: 'Admin',
                tags: ['urgent', 'backend', 'fullstack'],
                status: true,
                department: 'Engineering',
                salary: 75000,
                joinDate: '2022-01-15',
                notes: 'This is a long note about John Doe. He is an excellent developer with over 5 years of experience in React and Node.js. He has been instrumental in several key projects and consistently delivers high-quality work.'
              },
              {
                id: 2,
                name: 'Jane Smith',
                email: 'jane@example.com',
                role: 'Manager',
                tags: ['review', 'high-priority'],
                status: false,
                department: 'Marketing',
                salary: 65000,
                joinDate: '2021-08-22',
                notes: 'Jane is our marketing manager with a proven track record in digital campaigns. She has successfully increased our brand visibility by 40% in the last year.'
              },
              {
                id: 3,
                name: 'Bob Johnson',
                email: 'bob@example.com',
                role: 'Developer',
                tags: ['frontend', 'review'],
                status: true,
                department: 'Engineering',
                salary: 70000,
                joinDate: '2023-03-10',
                notes: 'Bob is a talented frontend developer specializing in modern JavaScript frameworks. He recently completed his certification in advanced React patterns.'
              },
              {
                id: 4,
                name: 'Alice Brown',
                email: 'alice@example.com',
                role: 'Designer',
                tags: ['completed', 'high-priority', 'frontend'],
                status: true,
                department: 'Design',
                salary: 60000,
                joinDate: '2022-11-05',
                notes: 'Alice is our UI/UX designer with an eye for detail. Her designs have significantly improved user engagement across our platform.'
              },
              {
                id: 5,
                name: 'Charlie Wilson',
                email: 'charlie@example.com',
                role: 'Analyst',
                tags: ['urgent', 'backend'],
                status: false,
                department: 'Analytics',
                salary: 55000,
                joinDate: '2023-01-20',
                notes: 'Charlie provides valuable insights through data analysis. His reports help drive strategic decisions across the organization.'
              }
            ]}
            columns={[
              {
                key: 'name',
                header: 'Name',
                sortable: true,
                width: '150px'
              },
              {
                key: 'email',
                header: 'Email',
                sortable: true,
                width: '200px'
              },
              {
                key: 'role',
                header: 'Role',
                type: 'dropdown',
                editable: true,
                sortable: true,
                filterable: true,
                filterOptions: [
                  { value: 'Admin', label: 'Administrator' },
                  { value: 'Manager', label: 'Manager' },
                  { value: 'Developer', label: 'Developer' },
                  { value: 'Designer', label: 'Designer' },
                  { value: 'Analyst', label: 'Analyst' }
                ],
                dropdownOptions: [
                  { value: 'Admin', label: 'Administrator' },
                  { value: 'Manager', label: 'Manager' },
                  { value: 'Developer', label: 'Developer' },
                  { value: 'Designer', label: 'Designer' },
                  { value: 'Analyst', label: 'Analyst' }
                ]
              },
              {
                key: 'tags',
                header: 'Tags',
                type: 'multidropdown',
                editable: true,
                dropdownOptions: [
                  { value: 'urgent', label: 'Urgent' },
                  { value: 'review', label: 'Needs Review' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'high-priority', label: 'High Priority' },
                  { value: 'backend', label: 'Backend' },
                  { value: 'frontend', label: 'Frontend' },
                  { value: 'fullstack', label: 'Full Stack' }
                ]
              },
              {
                key: 'department',
                header: 'Department',
                sortable: true,
                filterable: true,
                filterOptions: [
                  { value: 'Engineering', label: 'Engineering' },
                  { value: 'Marketing', label: 'Marketing' },
                  { value: 'Design', label: 'Design' },
                  { value: 'Analytics', label: 'Analytics' },
                  { value: 'Sales', label: 'Sales' },
                  { value: 'HR', label: 'Human Resources' }
                ]
              },
              {
                key: 'status',
                header: 'Active',
                type: 'boolean',
                editable: true,
                render: (value) => (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    <span className={`w-2 h-2 rounded-full mr-1 ${
                      value ? 'bg-green-400' : 'bg-red-400'
                    }`}></span>
                    {value ? 'Active' : 'Inactive'}
                  </span>
                )
              },
              {
                key: 'salary',
                header: 'Salary',
                type: 'number',
                sortable: true,
                editable: true,
                render: (value) => `$${value?.toLocaleString() || 0}`
              },
              {
                key: 'joinDate',
                header: 'Join Date',
                sortable: true,
                render: (value) => {
                  const shortFormat = formatDateShort(value);
                  const longFormat = formatDateLong(value);

                  return (
                    <Tooltip content={longFormat}>
                      <span className="cursor-help">{shortFormat}</span>
                    </Tooltip>
                  );
                }
              },
              {
                key: 'notes',
                header: 'Notes',
                render: (value, row) => (
                  <Tooltip content={value} position="bottom-left">
                    <button
                      className="text-blue-600 hover:text-blue-800 underline"
                      onClick={() => {
                        setEditingUser(row);
                        setEditingNotes(value);
                        setNotesModalOpen(true);
                      }}
                    >
                      View Notes
                    </button>
                  </Tooltip>
                )
              },
              {
                key: 'actions',
                header: 'Actions',
                render: (value, row) => (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => success(`Edited ${row.name}`)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => warning(`Delete ${row.name}?`)}
                    >
                      Delete
                    </Button>
                  </div>
                )
              }
            ]}
            striped={true}
            hoverable={true}
            selectable={true}
            searchable={true}
            color="default"
            onSelectionChange={(selected) => {
              info(`Selected ${selected.length} users`);
            }}
            onCellEdit={(row, column, newValue) => {
              success(`Updated ${column.header} for ${row.name} to ${newValue}`);
            }}
          />
        </div>

        {/* Component Showcase */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          <Card title="Button Variants">
            <div className="space-y-2">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="success">Success</Button>
              <Button variant="warning">Warning</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </Card>

          <Card title="Dropdown Components">
            <div className="space-y-4">
              <Dropdown
                options={[
                  { value: 'admin', label: 'Administrator' },
                  { value: 'manager', label: 'Manager' },
                  { value: 'user', label: 'User' }
                ]}
                placeholder="Select role..."
                onChange={(value) => info(`Selected: ${value}`)}
              />

              <Dropdown
                options={[
                  { value: 'engineering', label: 'Engineering' },
                  { value: 'marketing', label: 'Marketing' },
                  { value: 'sales', label: 'Sales' },
                  { value: 'hr', label: 'Human Resources' }
                ]}
                placeholder="Select department..."
                multiple={true}
                onChange={(values) => info(`Selected: ${(values as (string | number)[]).join(', ')}`)}
              />
            </div>
          </Card>

          <Card title="Interactive Elements">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="demo-checkbox" className="rounded" />
                <label htmlFor="demo-checkbox" className="text-sm">Demo Checkbox</label>
              </div>

              <div className="flex items-center gap-2">
                <input type="radio" id="demo-radio1" name="demo-radio" className="rounded-full" />
                <label htmlFor="demo-radio1" className="text-sm">Option 1</label>
              </div>

              <div className="flex items-center gap-2">
                <input type="radio" id="demo-radio2" name="demo-radio" className="rounded-full" />
                <label htmlFor="demo-radio2" className="text-sm">Option 2</label>
              </div>

              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Select an option...</option>
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </select>
            </div>
          </Card>
        </div>
      </div>

      {/* Notes Editing Modal */}
      <Modal
        isOpen={notesModalOpen}
        onClose={() => setNotesModalOpen(false)}
        title={`Edit Notes for ${editingUser?.name || ''}`}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-100 mb-2">
              Notes
            </label>
            <div className="bg-zinc-800 rounded-md">
              <ReactQuill
                value={editingNotes}
                onChange={setEditingNotes}
                modules={quillModules}
                formats={quillFormats}
                theme="snow"
                className="text-zinc-100"
                style={{
                  backgroundColor: 'rgb(39 39 42)', // zinc-800
                  color: 'rgb(244 244 245)', // zinc-100
                }}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setNotesModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                // In a real app, this would save to the database
                success(`Notes saved for ${editingUser?.name || ''}`);
                setNotesModalOpen(false);
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}