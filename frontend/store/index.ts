import { configureStore } from '@reduxjs/toolkit';
import categoriesReducer from './categoriesSlice';
import subcategoriesReducer from './subcategoriesSlice';
import itemsReducer from './itemsSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    categories: categoriesReducer,
    subcategories: subcategoriesReducer,
    items: itemsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
