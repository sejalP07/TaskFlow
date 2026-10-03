import axios from "axios";

const API_BASE_URL = "http://10.0.2.2:5000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
    };
    token: string;
  };
}

export const registerUser = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/register", {
    email,
    password,
  });

  return response.data;
};

export const loginUser = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/login", {
    email,
    password,
  });

  return response.data;
};

export const getMe = async (token: string) => {
  const response = await api.get("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  scheduledAt?: string;
  deadline?: string;
  priority: TaskPriority;
  category?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TasksResponse {
  success: boolean;
  data: {
    tasks: Task[];
    count: number;
  };
}

interface TaskResponse {
  success: boolean;
  message: string;
  data: {
    task: Task;
  };
}

export const getTasks = async (
  token: string
): Promise<TasksResponse> => {
  const response = await api.get<TasksResponse>("/tasks", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const createTask = async (
  token: string,
  task: {
    title: string;
    description?: string;
    scheduledAt?: string;
    deadline?: string;
    priority?: TaskPriority;
    category?: string;
  }
): Promise<TaskResponse> => {
  const response = await api.post<TaskResponse>(
    "/tasks",
    task,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const toggleTaskComplete = async (
  token: string,
  taskId: string
): Promise<TaskResponse> => {
  const response = await api.patch<TaskResponse>(
    `/tasks/${taskId}/complete`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const deleteTask = async (
  token: string,
  taskId: string
) => {
  const response = await api.delete(
    `/tasks/${taskId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};
export const updateTask = async (
  token: string,
  taskId: string,
  task: {
    title?: string;
    description?: string;
    scheduledAt?: string;
    deadline?: string;
    priority?: TaskPriority;
    category?: string;
    completed?: boolean;
  }
): Promise<TaskResponse> => {
  const response = await api.put<TaskResponse>(
    `/tasks/${taskId}`,
    task,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};