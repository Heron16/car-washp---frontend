export type UserRole = 'client' | 'admin';
export type ServiceStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type VehicleType = 'car' | 'motorcycle' | 'truck' | 'suv';

export interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  phone?: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  vehicleTypes: VehicleType[];
  active: boolean;
}

export interface Vehicle {
  id: string;
  userId: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  color: string;
  type: VehicleType;
}

export interface Appointment {
  id: string;
  userId: string;
  vehicleId: string;
  serviceId: string;
  vehicle?: Vehicle;
  service?: Service;
  scheduledAt: string;
  status: ServiceStatus;
  notes?: string;
  totalPrice: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  cpf: string;
}

export interface EditUserForm {
  name: string;
  cpf: string;
  phone: string;
  password: string;
  confirmPassword: string;
}
