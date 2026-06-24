import React, { useEffect, useState } from 'react';
import { AppLayout } from '../components/Layout/AppLayout';
import { TaskBoard } from '../components/TaskBoard';
import { TaskList } from '../components/TaskList';
import { TaskForm } from '../components/TaskForm';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useTasks } from '../hooks/useTasks';
import { useDebounce } from '../hooks/useDebounce';
import { websocketService } from '../services/websocket';
import { Task, TaskStatus } from '../types/task';

type ViewMode = 'board' | 'list';

const Dashboard: React.FC = () => {
  const { tasks, loading, error, fetchTasks, createTask, deleteTask, updateTaskStatus } =
    useTasks();
  const [view, setView] = useState<ViewMode>('board');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    websocketService.connect();
    fetchTasks();
    return () => websocketService.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const stats = {
    total: tasks.length,
    overdue: tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED'
    ).length,
    completed: tasks.filter((t) => t.status === 'COMPLETED').length,
  };

  const handleStatusChange = (id: number, status: TaskStatus) => {
    updateTaskStatus(id, status).catch(() => {});
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-gray-500">
              {stats.total} tasks • {stats.overdue} overdue • {stats.completed} completed
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
            />

            <div className="flex rounded border border-gray-300 dark:border-gray-600">
              <button
                onClick={() => setView('board')}
                className={`px-3 py-2 text-sm ${view === 'board' ? 'bg-primary-600 text-white' : ''}`}
              >
                Board
              </button>
              <button
                onClick={() => setView('list')}
                className={`px-3 py-2 text-sm ${view === 'list' ? 'bg-primary-600 text-white' : ''}`}
              >
                List
              </button>
            </div>

            <button
              onClick={() => setShowForm((prev) => !prev)}
              className="rounded bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              + New Task
            </button>
          </div>
        </div>

        {showForm && (
          <TaskForm
            onSubmit={async (data) => {
              await createTask(data);
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        )}

        {error && <p className="text-red-600">{error}</p>}

        {loading && tasks.length === 0 ? (
          <LoadingSkeleton rows={5} />
        ) : view === 'board' ? (
          <TaskBoard
            tasks={filteredTasks}
            onStatusChange={handleStatusChange}
            onSelectTask={setSelectedTask}
          />
        ) : (
          <TaskList
            tasks={filteredTasks}
            onSelectTask={setSelectedTask}
            onDeleteTask={(id) => deleteTask(id).catch(() => {})}
          />
        )}

        {selectedTask && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setSelectedTask(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-xl bg-white p-6 dark:bg-gray-800"
            >
              <h2 className="mb-2 text-xl font-semibold">{selectedTask.title}</h2>
              <p className="mb-4 text-gray-500">
                {selectedTask.description || 'No description provided.'}
              </p>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <dt className="text-gray-400">Status</dt>
                <dd>{selectedTask.status}</dd>
                <dt className="text-gray-400">Priority</dt>
                <dd>{selectedTask.priority}</dd>
                <dt className="text-gray-400">Owner</dt>
                <dd>{selectedTask.ownerName}</dd>
                <dt className="text-gray-400">Assignee</dt>
                <dd>{selectedTask.assigneeName || '—'}</dd>
              </dl>
              <button
                className="mt-6 rounded bg-gray-100 px-4 py-2 text-sm dark:bg-gray-700"
                onClick={() => setSelectedTask(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
