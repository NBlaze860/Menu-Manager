import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchItems, deleteItem } from '../store/itemsSlice';
import { fetchCategories } from '../store/categoriesSlice';
import { fetchSubcategories } from '../store/subcategoriesSlice';
import { openItemModal, closeItemModal } from '../store/uiSlice';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import ItemForm from '../components/forms/ItemForm';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { CategoryCardSkeleton } from '../components/common/Skeleton';
import { useToast } from '../hooks/useToast';
import { Item } from '../types';

const ItemsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: items, loading, error } = useSelector((state: RootState) => state.items);
  const { data: categories } = useSelector((state: RootState) => state.categories);
  const { data: subcategories } = useSelector((state: RootState) => state.subcategories);
  const { isOpen, mode, data: itemData } = useSelector((state: RootState) => state.ui.modals.itemForm);
  const { showSuccess, showError } = useToast();
  
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [subcategoryFilter, setSubcategoryFilter] = useState<string>('all');

  useEffect(() => {
    dispatch(fetchItems());
    dispatch(fetchCategories());
    dispatch(fetchSubcategories());
  }, [dispatch]);
  
  const filteredSubcategoriesForDropdown = useMemo(() => {
    if (categoryFilter === 'all') return subcategories;
    return subcategories.filter(sub => sub.categoryId._id === categoryFilter);
  }, [subcategories, categoryFilter]);

  useEffect(() => {
    setSubcategoryFilter('all');
  }, [categoryFilter]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
        const categoryMatch = categoryFilter === 'all' || item.categoryId?._id === categoryFilter || subcategories.find(s => s._id === item.subCategoryId?._id)?.categoryId._id === categoryFilter;
        const subcategoryMatch = subcategoryFilter === 'all' || item.subCategoryId?._id === subcategoryFilter;
        
        if (categoryFilter !== 'all' && subcategoryFilter !== 'all') {
            return categoryMatch && subcategoryMatch;
        }
        if (categoryFilter !== 'all') {
            return categoryMatch;
        }
        if (subcategoryFilter !== 'all') {
            return subcategoryMatch;
        }
        return true;
    });
  }, [items, categoryFilter, subcategoryFilter, subcategories]);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      dispatch(deleteItem(id))
        .unwrap()
        .then(() => showSuccess('Item deleted successfully'))
        .catch((err) => showError(err.message || 'Failed to delete item'));
    }
  };

  const getItemPath = (item: Item): string => {
    if (item.subCategoryId) {
      const sub = subcategories.find(s => s._id === item.subCategoryId?._id);
      if (sub) {
        return `${sub.categoryId.name} > ${sub.name}`;
      }
    }
    if (item.categoryId) {
      return item.categoryId.name;
    }
    return 'Uncategorized';
  };


  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => <CategoryCardSkeleton key={i} />)}
        </div>
      );
    }

    if (error) {
      return <div className="text-center text-red-500">Error: {error}</div>;
    }

    if (filteredItems.length === 0) {
      return (
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold text-neutral-700">No items found</h3>
          <p className="text-neutral-500 mt-2 mb-4">Get started by adding your first menu item.</p>
          <Button onClick={() => dispatch(openItemModal({ mode: 'create' }))}>
            <Plus className="mr-2 h-5 w-5" />
            Add Item
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item: Item) => (
          <Card key={item._id} className="flex flex-col">
            <img src={item.image} alt={item.name} className="w-full h-40 object-cover rounded-t-lg -m-6 mb-4" />
            <div className="flex-grow">
              <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-semibold text-primary-600">{getItemPath(item)}</span>
                    <h3 className="text-lg font-bold text-neutral-800">{item.name}</h3>
                  </div>
                  <span className="text-lg font-bold text-neutral-800">${item.totalAmount.toFixed(2)}</span>
              </div>
              <p className="text-neutral-500 text-sm mt-1 mb-3 line-clamp-2">{item.description}</p>
            </div>
            <div className="mt-4 flex justify-end space-x-2 border-t border-neutral-200 pt-4 -mx-6 -mb-6 px-6 pb-4">
              <Button variant="ghost" size="sm" onClick={() => dispatch(openItemModal({ mode: 'edit', data: item }))}>
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
            </div>
          </Card>
        ))}
      </div>
    );
  };
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold text-neutral-800 font-display">Items</h1>
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 text-neutral-900 bg-white border-2 border-neutral-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
            </select>
             <select
                value={subcategoryFilter}
                onChange={(e) => setSubcategoryFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 text-neutral-900 bg-white border-2 border-neutral-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            >
                <option value="all">All Subcategories</option>
                {filteredSubcategoriesForDropdown.map(sub => (
                    <option key={sub._id} value={sub._id}>{sub.name}</option>
                ))}
            </select>
            <Button onClick={() => dispatch(openItemModal({ mode: 'create' }))} className="flex-shrink-0">
                <Plus className="mr-2 h-5 w-5" />
                Add New
            </Button>
        </div>
      </div>

      {renderContent()}

      <Modal
        isOpen={isOpen}
        onClose={() => dispatch(closeItemModal())}
        title={mode === 'create' ? 'Add New Item' : 'Edit Item'}
      >
        <ItemForm mode={mode} item={itemData} />
      </Modal>
    </div>
  );
};

export default ItemsPage;