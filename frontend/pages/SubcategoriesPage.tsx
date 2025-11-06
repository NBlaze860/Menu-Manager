import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchSubcategories, deleteSubcategory } from '../store/subcategoriesSlice';
import { fetchCategories } from '../store/categoriesSlice';
import { openSubcategoryModal, closeSubcategoryModal } from '../store/uiSlice';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import SubcategoryForm from '../components/forms/SubcategoryForm';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { CategoryCardSkeleton } from '../components/common/Skeleton';
import { useToast } from '../hooks/useToast';

const SubcategoriesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: subcategories, loading, error } = useSelector((state: RootState) => state.subcategories);
  const { data: categories } = useSelector((state: RootState) => state.categories);
  const { isOpen, mode, data: subcategoryData } = useSelector((state: RootState) => state.ui.modals.subcategoryForm);
  const { showSuccess, showError } = useToast();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    dispatch(fetchSubcategories());
    dispatch(fetchCategories());
  }, [dispatch]);
  
  const filteredSubcategories = useMemo(() => {
    if (categoryFilter === 'all') {
      return subcategories;
    }
    return subcategories.filter(sub => sub.categoryId?._id === categoryFilter);
  }, [subcategories, categoryFilter]);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this subcategory?')) {
      dispatch(deleteSubcategory(id))
        .unwrap()
        .then(() => showSuccess('Subcategory deleted successfully'))
        .catch((err) => showError(err.message || 'Failed to delete subcategory'));
    }
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

    if (filteredSubcategories.length === 0) {
      return (
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold text-neutral-700">No subcategories found</h3>
          <p className="text-neutral-500 mt-2 mb-4">Get started by adding your first subcategory.</p>
          <Button onClick={() => dispatch(openSubcategoryModal({ mode: 'create' }))}>
            <Plus className="mr-2 h-5 w-5" />
            Add Subcategory
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredSubcategories.map((sub) => (
          <Card key={sub._id} className="flex flex-col">
            <img src={sub.image} alt={sub.name} className="w-full h-40 object-cover rounded-t-lg -m-6 mb-4" />
            <div className="flex-grow">
              <span className="text-xs font-semibold text-primary-600">{sub.categoryId?.name || 'Uncategorized'}</span>
              <h3 className="text-lg font-bold text-neutral-800">{sub.name}</h3>
              <p className="text-neutral-500 text-sm mt-1 mb-3 line-clamp-2">{sub.description}</p>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${sub.taxApplicability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                Tax: {sub.taxApplicability ? `${sub.tax}%` : 'N/A'}
              </span>
            </div>
            <div className="mt-4 flex justify-end space-x-2 border-t border-neutral-200 pt-4 -mx-6 -mb-6 px-6 pb-4">
              <Button variant="ghost" size="sm" onClick={() => dispatch(openSubcategoryModal({ mode: 'edit', data: sub }))}>
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
        <h1 className="text-3xl font-bold text-neutral-800 font-display">Subcategories</h1>
        <div className="flex items-center gap-4 w-full sm:w-auto">
            <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full sm:w-48 px-3 py-2 text-neutral-900 bg-white border-2 border-neutral-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
            </select>
            <Button onClick={() => dispatch(openSubcategoryModal({ mode: 'create' }))} className="flex-shrink-0">
                <Plus className="mr-2 h-5 w-5" />
                Add New
            </Button>
        </div>
      </div>

      {renderContent()}

      <Modal
        isOpen={isOpen}
        onClose={() => dispatch(closeSubcategoryModal())}
        title={mode === 'create' ? 'Add New Subcategory' : 'Edit Subcategory'}
      >
        <SubcategoryForm mode={mode} subcategory={subcategoryData} />
      </Modal>
    </div>
  );
};

export default SubcategoriesPage;