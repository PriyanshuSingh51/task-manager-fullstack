import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  PaginatedResponse,
} from '../types/task';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../types/auth';

class ApiService {
  private axiosInstance: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            const response = await axios.post(`${this.baseURL}/auth/refresh`, {
              refreshToken,
            });

            const { accessToken, refreshToken: newRefreshToken } = response.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;

            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.axiosInstance.post('/auth/login', data);
    return response.data;
  }

  async register(data: RegisterRequest): Promise<void> {
    await this.axiosInstance.post('/auth/register', data);
  }

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await this.axiosInstance.post('/auth/logout', { refreshToken });
      } catch {
        // ignore network errors on logout
      }
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.axiosInstance.get('/users/me');
    return response.data;
  }

  async getUsers(): Promise<User[]> {
    const response = await this.axiosInstance.get('/users');
    return response.data;
  }

  // Task methods
  async getTasks(params?: {
    status?: string;
    priority?: string;
    assigneeId?: number;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<PaginatedResponse<Task>> {
    const response = await this.axiosInstance.get('/tasks', { params });
    return response.data;
  }

  async getTask(id: number): Promise<Task> {
    const response = await this.axiosInstance.get(`/tasks/${id}`);
    return response.data;
  }

  async createTask(task: CreateTaskRequest): Promise<Task> {
    const response = await this.axiosInstance.post('/tasks', task);
    return response.data;
  }

  async updateTask(id: number, task: UpdateTaskRequest): Promise<Task> {
    const response = await this.axiosInstance.put(`/tasks/${id}`, task);
    return response.data;
  }

  async deleteTask(id: number): Promise<void> {
    await this.axiosInstance.delete(`/tasks/${id}`);
  }

  async updateTaskStatus(id: number, status: string): Promise<Task> {
    const response = await this.axiosInstance.put(`/tasks/${id}/status`, { status });
    return response.data;
  }
}

export const apiService = new ApiService();
