export interface Category {
  _id: string;
  name: string;
  image: string;
  description: string;
  taxApplicability: boolean;
  tax: number;
  taxType: 'percentage' | 'fixed';
  subCategoryCount?: number;
  itemCount?: number;
}

export interface Subcategory {
  _id: string;
  name:string;
  image: string;
  description: string;
  taxApplicability: boolean;
  tax: number;
  categoryId: {
    _id: string;
    name: string;
  };
}

export interface Item {
  _id: string;
  name: string;
  image: string;
  description: string;
  taxApplicability: boolean;
  tax: number;
  baseAmount: number;
  discount: number;
  totalAmount: number;
  categoryId: {
    _id: string;
    name: string;
  } | null;
  subCategoryId: {
    _id: string;
    name: string;
  } | null;
}

export interface TreeNodeData {
  id: string;
  type: 'category' | 'subcategory' | 'item';
  name: string;
  data: Category | Subcategory | Item;
  children: TreeNodeData[];
  subCategoryCount?: number;
  itemCount?: number;
}