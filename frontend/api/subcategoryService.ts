import axiosInstance from './axiosInstance';
import { Subcategory } from '../types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const getAll = async (): Promise<ApiResponse<Subcategory[]>> => {
  const { data } = await axiosInstance.get<ApiResponse<Subcategory[]>>('/subcategories');
  return data;
};

const create = async (subcategoryData: FormData): Promise<ApiResponse<Subcategory>> => {
  const { data } = await axiosInstance.post<ApiResponse<Subcategory>>('/subcategories', subcategoryData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

const update = async (id: string, subcategoryData: FormData): Promise<ApiResponse<Subcategory>> => {
  const { data } = await axiosInstance.put<ApiResponse<Subcategory>>(`/subcategories/${id}`, subcategoryData, {
     headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

const deleteById = async (id: string): Promise<ApiResponse<null>> => {
  const { data } = await axiosInstance.delete<ApiResponse<null>>(`/subcategories/${id}`);
  return data;
};


const subcategoryService = {
  getAll,
  create,
  update,
  deleteById,
};

export default subcategoryService;