import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Category, Subcategory, Item, TreeNodeData } from '../types';

interface ModalState<T> {
  isOpen: boolean;
  mode: 'create' | 'edit';
  data: T | null;
}

interface SidePanelState {
    isOpen: boolean;
    data: TreeNodeData | null;
}

interface UiState {
  modals: {
    categoryForm: ModalState<Category>;
    subcategoryForm: ModalState<Subcategory>;
    itemForm: ModalState<Item>;
  };
  sidePanel: SidePanelState;
}

const initialState: UiState = {
  modals: {
    categoryForm: { isOpen: false, mode: 'create', data: null },
    subcategoryForm: { isOpen: false, mode: 'create', data: null },
    itemForm: { isOpen: false, mode: 'create', data: null },
  },
  sidePanel: {
    isOpen: false,
    data: null,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openCategoryModal: (state, action: PayloadAction<{ mode: 'create' | 'edit'; data?: Category }>) => {
      state.modals.categoryForm.isOpen = true;
      state.modals.categoryForm.mode = action.payload.mode;
      state.modals.categoryForm.data = action.payload.data || null;
    },
    closeCategoryModal: (state) => {
      state.modals.categoryForm.isOpen = false;
      state.modals.categoryForm.data = null;
    },
    openSubcategoryModal: (state, action: PayloadAction<{ mode: 'create' | 'edit'; data?: Subcategory }>) => {
        state.modals.subcategoryForm.isOpen = true;
        state.modals.subcategoryForm.mode = action.payload.mode;
        state.modals.subcategoryForm.data = action.payload.data || null;
    },
    closeSubcategoryModal: (state) => {
        state.modals.subcategoryForm.isOpen = false;
        state.modals.subcategoryForm.data = null;
    },
    openItemModal: (state, action: PayloadAction<{ mode: 'create' | 'edit'; data?: Item }>) => {
        state.modals.itemForm.isOpen = true;
        state.modals.itemForm.mode = action.payload.mode;
        state.modals.itemForm.data = action.payload.data || null;
    },
    closeItemModal: (state) => {
        state.modals.itemForm.isOpen = false;
        state.modals.itemForm.data = null;
    },
    openSidePanel: (state, action: PayloadAction<TreeNodeData>) => {
        state.sidePanel.isOpen = true;
        state.sidePanel.data = action.payload;
    },
    closeSidePanel: (state) => {
        state.sidePanel.isOpen = false;
        // Data is kept to avoid visual flicker while panel is closing
    },
  },
});

export const {
  openCategoryModal,
  closeCategoryModal,
  openSubcategoryModal,
  closeSubcategoryModal,
  openItemModal,
  closeItemModal,
  openSidePanel,
  closeSidePanel,
} = uiSlice.actions;

export default uiSlice.reducer;