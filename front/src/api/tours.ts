import { apiRequest } from './client';

/** Ответ API `/tours` (не путать с UI-моделью Tour в types.ts). */
export interface ApiTour {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  created_by: number;
  created_at: string;
  updated_at: string | null;
}

export interface TourPayload {
  title: string;
  description: string;
  price: number;
  location: string;
}

export const listTours = () => apiRequest<ApiTour[]>('/tours/');

export const getTour = (id: number) => apiRequest<ApiTour>(`/tours/${id}`);

export const createTour = (data: TourPayload, token: string) =>
  apiRequest<ApiTour>('/tours/', { method: 'POST', body: JSON.stringify(data) }, token);

export const updateTour = (id: number, data: TourPayload, token: string) =>
  apiRequest<ApiTour>(`/tours/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token);

export const deleteTour = (id: number, token: string) =>
  apiRequest<{ message: string }>(`/tours/${id}`, { method: 'DELETE' }, token);
