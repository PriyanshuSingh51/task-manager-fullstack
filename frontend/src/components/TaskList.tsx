import React from 'react';
import { Task } from '../types/task';

interface TaskListProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onDeleteTask: (id: number) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onSelectTask, onDeleteTask }) => {
  if (tasks.length === 0) {
    return <p className="text-center text-gray-500">No tasks found.</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-2">Title</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Priority</th>
            <th className="px-4 py-2">Assignee</th>
            <th className="px-4 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr
              key={task.id}
              className="border-t border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
            >
              <td className="cursor-pointer px-4 py-3" onClick={() => onSelectTask(task)}>
                {task.title}
              </td>
              <td className="px-4 py-3">{task.status.replace('_', ' ')}</td>
              <td className="px-4 py-3">{task.priority}</td>
              <td className="px-4 py-3">{task.assigneeName || '—'}</td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
