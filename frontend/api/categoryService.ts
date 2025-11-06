
import axiosInstance from './axiosInstance';
import { Category } from '../types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const getAll = async (): Promise<ApiResponse<Category[]>> => {
  const { data } = await axiosInstance.get<ApiResponse<Category[]>>('/categories');
  return data;
};

const create = async (categoryData: FormData): Promise<ApiResponse<Category>> => {
  const { data } = await axiosInstance.post<ApiResponse<Category>>('/categories', categoryData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

const update = async (id: string, categoryData: FormData): Promise<ApiResponse<Category>> => {
  const { data } = await axiosInstance.put<ApiResponse<Category>>(`/categories/${id}`, categoryData, {
     headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

const deleteById = async (id: string): Promise<ApiResponse<null>> => {
  const { data } = await axiosInstance.delete<ApiResponse<null>>(`/categories/${id}`);
  return data;
};


const categoryService = {
  getAll,
  create,
  update,
  deleteById,
};

export default categoryService;
