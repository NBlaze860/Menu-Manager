import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchCategories, deleteCategory } from '../store/categoriesSlice';
import { openCategoryModal, closeCategoryModal } from '../store/uiSlice';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import CategoryForm from '../components/forms/CategoryForm';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { CategoryCardSkeleton } from '../components/common/Skeleton';
import { useToast } from '../hooks/useToast';

const CategoriesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: categories, loading, error } = useSelector((state: RootState) => state.categories);
  const { isOpen, mode, data: categoryData } = useSelector((state: RootState) => state.ui.modals.categoryForm);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    dispatch(fetchCategories());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
        dispatch(deleteCategory(id))
            .unwrap()
            .then(() => showSuccess('Category deleted successfully'))
            .catch((err) => showError(err.message || 'Failed to delete category'));
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

    if (categories.length === 0) {
      return (
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold text-neutral-700">No categories found</h3>
          <p className="text-neutral-500 mt-2 mb-4">Get started by adding your first menu category.</p>
          <Button onClick={() => dispatch(openCategoryModal({ mode: 'create' }))}>
            <Plus className="mr-2 h-5 w-5" />
            Add Category
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Card key={category._id} className="flex flex-col">
            <img src={category.image} alt={category.name} className="w-full h-40 object-cover rounded-t-lg -m-6 mb-4" />
            <div className="flex-grow">
              <h3 className="text-lg font-bold text-neutral-800">{category.name}</h3>
              <p className="text-neutral-500 text-sm mt-1 mb-3 line-clamp-2">{category.description}</p>
               <span className={`px-2 py-1 text-xs font-semibold rounded-full ${category.taxApplicability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                Tax: {category.taxApplicability ? `${category.tax}${category.taxType === 'percentage' ? '%' : ' Fixed'}` : 'N/A'}
              </span>
            </div>
            <div className="mt-4 flex justify-end space-x-2 border-t border-neutral-200 pt-4 -mx-6 -mb-6 px-6 pb-4">
              
              <Button variant="ghost" size="sm" onClick={() => dispatch(openCategoryModal({ mode: 'edit', data: category }))}>
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-neutral-800 font-display">Categories</h1>
        <Button onClick={() => dispatch(openCategoryModal({ mode: 'create' }))}>
          <Plus className="mr-2 h-5 w-5" />
          Add Category
        </Button>
      </div>

      {renderContent()}

      <Modal
        isOpen={isOpen}
        onClose={() => dispatch(closeCategoryModal())}
        title={mode === 'create' ? 'Add New Category' : 'Edit Category'}
      >
        <CategoryForm mode={mode} category={categoryData} />
      </Modal>
    </div>
  );
};

export default CategoriesPage;
