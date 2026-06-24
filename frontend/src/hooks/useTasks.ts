import { useState, useCallback, useEffect } from 'react';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../types/task';
import { apiService } from '../services/api';
import { websocketService } from '../services/websocket';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(
    async (params?: { status?: string; priority?: string; assigneeId?: number }) => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiService.getTasks(params);
        setTasks(response.content);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch tasks');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const unsubscribe = websocketService.subscribe((event) => {
      const payload = event.payload as Task & { id: number };

      if (event.type === 'TASK_CREATED') {
        setTasks((prev) => (prev.some((t) => t.id === payload.id) ? prev : [...prev, payload]));
      } else if (event.type === 'TASK_UPDATED' || event.type === 'TASK_STATUS_CHANGED') {
        setTasks((prev) => prev.map((t) => (t.id === payload.id ? payload : t)));
      } else if (event.type === 'TASK_DELETED') {
        setTasks((prev) => prev.filter((t) => t.id !== payload.id));
      }
    });

    return unsubscribe;
  }, []);

  const createTask = useCallback(async (taskData: CreateTaskRequest) => {
    setLoading(true);
    setError(null);

    try {
      const newTask = await apiService.createTask(taskData);
      setTasks((prev) => [...prev, newTask]);
      return newTask;
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTask = useCallback(async (id: number, taskData: UpdateTaskRequest) => {
    setLoading(true);
    setError(null);

    try {
      const updatedTask = await apiService.updateTask(id, taskData);
      setTasks((prev) => prev.map((task) => (task.id === id ? updatedTask : task)));
      return updatedTask;
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTask = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      await apiService.deleteTask(id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete task');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTaskStatus = useCallback(async (id: number, status: string) => {
    setLoading(true);
    setError(null);

    try {
      const updatedTask = await apiService.updateTaskStatus(id, status);
      setTasks((prev) => prev.map((task) => (task.id === id ? updatedTask : task)));
      return updatedTask;
    } catch (err: any) {
      setError(err.message || 'Failed to update task status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
  };
};
