import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/Layout/AppLayout';
import { apiService } from '../services/api';
import { Task } from '../types/task';

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    apiService
      .getTask(Number(id))
      .then(setTask)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <AppLayout>
        <p>Loading task...</p>
      </AppLayout>
    );
  }

  if (!task) {
    return (
      <AppLayout>
        <p>Task not found.</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <button onClick={() => navigate(-1)} className="mb-4 text-sm text-primary-600">
        ← Back
      </button>
      <div className="max-w-2xl rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h1 className="mb-2 text-2xl font-bold">{task.title}</h1>
        <p className="mb-4 text-gray-500">{task.description}</p>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <dt className="text-gray-400">Status</dt>
          <dd>{task.status}</dd>
          <dt className="text-gray-400">Priority</dt>
          <dd>{task.priority}</dd>
          <dt className="text-gray-400">Owner</dt>
          <dd>{task.ownerName}</dd>
          <dt className="text-gray-400">Assignee</dt>
          <dd>{task.assigneeName || '—'}</dd>
          <dt className="text-gray-400">Due date</dt>
          <dd>{task.dueDate ? new Date(task.dueDate).toLocaleString() : '—'}</dd>
        </dl>
      </div>
    </AppLayout>
  );
};

export default TaskDetail;
