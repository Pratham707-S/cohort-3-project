export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl?: string;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  } | string;
  createdAt: string;
  updatedAt: string;
}

export interface FieldError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  message: string;
  errors?: FieldError[];
}
