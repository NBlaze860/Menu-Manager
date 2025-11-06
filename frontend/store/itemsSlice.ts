import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Item } from '../types';
import itemService from '../api/itemService';

interface ItemsState {
  data: Item[];
  loading: boolean;
  error: string | null;
}

const initialState: ItemsState = {
  data: [],
  loading: false,
  error: null,
};

export const fetchItems = createAsyncThunk('items/fetchItems', async () => {
  const response = await itemService.getAll();
  return response.data;
});

export const createItem = createAsyncThunk('items/createItem', async (itemData: FormData) => {
  const response = await itemService.create(itemData);
  return response.data;
});

export const updateItem = createAsyncThunk('items/updateItem', async ({ id, itemData }: { id: string; itemData: FormData }) => {
  const response = await itemService.update(id, itemData);
  return response.data;
});

export const deleteItem = createAsyncThunk('items/deleteItem', async (id: string) => {
  await itemService.deleteById(id);
  return id;
});


const itemsSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchItems.fulfilled, (state, action: PayloadAction<Item[]>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch items';
      })
      // Create
      .addCase(createItem.fulfilled, (state, action: PayloadAction<Item>) => {
        state.data.push(action.payload);
      })
      // Update
      .addCase(updateItem.fulfilled, (state, action: PayloadAction<Item>) => {
        const index = state.data.findIndex((i) => i._id === action.payload._id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })
      // Delete
      .addCase(deleteItem.fulfilled, (state, action: PayloadAction<string>) => {
        state.data = state.data.filter((i) => i._id !== action.payload);
      });
  },
});

export default itemsSlice.reducer;
