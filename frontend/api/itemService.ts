import axiosInstance from './axiosInstance';
import { Item } from '../types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const getAll = async (): Promise<ApiResponse<Item[]>> => {
  const { data } = await axiosInstance.get<ApiResponse<Item[]>>('/items');
  return data;
};

const create = async (itemData: FormData): Promise<ApiResponse<Item>> => {
  const { data } = await axiosInstance.post<ApiResponse<Item>>('/items', itemData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

const update = async (id: string, itemData: FormData): Promise<ApiResponse<Item>> => {
  const { data } = await axiosInstance.put<ApiResponse<Item>>(`/items/${id}`, itemData, {
     headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

const deleteById = async (id: string): Promise<ApiResponse<null>> => {
  const { data } = await axiosInstance.delete<ApiResponse<null>>(`/items/${id}`);
  return data;
};


const itemService = {
  getAll,
  create,
  update,
  deleteById,
};

export default itemService;
