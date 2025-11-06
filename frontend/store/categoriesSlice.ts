
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Category } from '../types';
import categoryService from '../api/categoryService';

interface CategoriesState {
  data: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  data: [],
  loading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk('categories/fetchCategories', async () => {
  const response = await categoryService.getAll();
  return response.data;
});

export const createCategory = createAsyncThunk('categories/createCategory', async (categoryData: FormData) => {
  const response = await categoryService.create(categoryData);
  return response.data;
});

export const updateCategory = createAsyncThunk('categories/updateCategory', async ({ id, categoryData }: { id: string; categoryData: FormData }) => {
  const response = await categoryService.update(id, categoryData);
  return response.data;
});

export const deleteCategory = createAsyncThunk('categories/deleteCategory', async (id: string) => {
  await categoryService.deleteById(id);
  return id;
});


const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch categories';
      })
      // Create
      .addCase(createCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.data.push(action.payload);
      })
      // Update
      .addCase(updateCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        const index = state.data.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })
      // Delete
      .addCase(deleteCategory.fulfilled, (state, action: PayloadAction<string>) => {
        state.data = state.data.filter((c) => c._id !== action.payload);
      });
  },
});

export default categoriesSlice.reducer;
