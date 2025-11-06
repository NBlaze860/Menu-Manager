import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Subcategory } from '../types';
import subcategoryService from '../api/subcategoryService';

interface SubcategoriesState {
  data: Subcategory[];
  loading: boolean;
  error: string | null;
}

const initialState: SubcategoriesState = {
  data: [],
  loading: false,
  error: null,
};

export const fetchSubcategories = createAsyncThunk('subcategories/fetchSubcategories', async () => {
  const response = await subcategoryService.getAll();
  return response.data;
});

export const createSubcategory = createAsyncThunk('subcategories/createSubcategory', async (subcategoryData: FormData) => {
  const response = await subcategoryService.create(subcategoryData);
  return response.data;
});

export const updateSubcategory = createAsyncThunk('subcategories/updateSubcategory', async ({ id, subcategoryData }: { id: string; subcategoryData: FormData }) => {
  const response = await subcategoryService.update(id, subcategoryData);
  return response.data;
});

export const deleteSubcategory = createAsyncThunk('subcategories/deleteSubcategory', async (id: string) => {
  await subcategoryService.deleteById(id);
  return id;
});


const subcategoriesSlice = createSlice({
  name: 'subcategories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubcategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubcategories.fulfilled, (state, action: PayloadAction<Subcategory[]>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchSubcategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch subcategories';
      })
      .addCase(createSubcategory.fulfilled, (state, action: PayloadAction<Subcategory>) => {
        state.data.push(action.payload);
      })
      .addCase(updateSubcategory.fulfilled, (state, action: PayloadAction<Subcategory>) => {
        const index = state.data.findIndex((s) => s._id === action.payload._id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })
      .addCase(deleteSubcategory.fulfilled, (state, action: PayloadAction<string>) => {
        state.data = state.data.filter((s) => s._id !== action.payload);
      });
  },
});

export default subcategoriesSlice.reducer;