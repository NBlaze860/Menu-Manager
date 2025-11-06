
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { createCategory, updateCategory } from '../../store/categoriesSlice';
import { closeCategoryModal } from '../../store/uiSlice';
import { Category } from '../../types';
import { useToast } from '../../hooks/useToast';
import Input from '../common/Input';
import Button from '../common/Button';
import { ImageUp, Percent, Type } from 'lucide-react';

interface CategoryFormProps {
  mode: 'create' | 'edit';
  category: Category | null;
}

type FormData = {
  name: string;
  description: string;
  image: FileList;
  taxApplicability: boolean;
  tax: number;
  taxType: 'percentage' | 'fixed';
};

const CategoryForm: React.FC<CategoryFormProps> = ({ mode, category }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { showSuccess, showError } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(category?.image || null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<FormData>({
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
      taxApplicability: category?.taxApplicability || false,
      tax: category?.tax || 0,
      taxType: category?.taxType || 'percentage',
    },
  });

  const taxApplicability = watch('taxApplicability');
  const imageFile = watch('image');

  useEffect(() => {
    if (imageFile && imageFile.length > 0) {
      const file = imageFile[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else if (!category?.image) {
        setImagePreview(null);
    }
  }, [imageFile, category?.image]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    if (data.image && data.image[0]) {
      formData.append('image', data.image[0]);
    }
    formData.append('taxApplicability', String(data.taxApplicability));
    formData.append('tax', String(data.tax));
    formData.append('taxType', data.taxType);

    try {
      if (mode === 'edit' && category) {
        await dispatch(updateCategory({ id: category._id, categoryData: formData })).unwrap();
        showSuccess('Category updated successfully!');
      } else {
        await dispatch(createCategory(formData)).unwrap();
        showSuccess('Category created successfully!');
      }
      dispatch(closeCategoryModal());
    } catch (error) {
      showError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div
        className="w-full h-48 border-2 border-dashed border-neutral-300 rounded-lg flex items-center justify-center text-neutral-500 cursor-pointer hover:border-primary-500 hover:text-primary-500 transition-colors"
        onClick={() => document.getElementById('image-upload')?.click()}
      >
        {imagePreview ? (
          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
        ) : (
          <div className="text-center">
            <ImageUp className="mx-auto h-12 w-12" />
            <p>Click to upload an image</p>
          </div>
        )}
        <input
          id="image-upload"
          type="file"
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
          {...register('image', {
            required: mode === 'create' ? 'Image is required' : false,
          })}
        />
      </div>
       {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>}

      <Input<FormData>
        label="Category Name"
        name="name"
        register={register}
        error={errors.name}
        placeholder="e.g., Italian Cuisine"
        {...register('name', { required: 'Name is required' })}
      />
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
        <textarea
          id="description"
          rows={3}
          className="w-full px-3 py-2 text-neutral-900 bg-white border-2 border-neutral-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition duration-150 ease-in-out"
          placeholder="A brief description of the category"
          {...register('description')}
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="taxApplicability"
          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          {...register('taxApplicability')}
        />
        <label htmlFor="taxApplicability" className="text-sm font-medium text-neutral-700">Tax is applicable</label>
      </div>

      {taxApplicability && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input<FormData>
            label="Tax Rate"
            name="tax"
            type="number"
            register={register}
            error={errors.tax}
            placeholder="e.g., 5"
            {...register('tax', { valueAsNumber: true, required: 'Tax rate is required' })}
          />
          <div>
            <label htmlFor="taxType" className="block text-sm font-medium text-neutral-700 mb-1">Tax Type</label>
            <select
              id="taxType"
              className="w-full px-3 py-2 text-neutral-900 bg-white border-2 border-neutral-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition duration-150 ease-in-out"
              {...register('taxType')}
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="ghost" onClick={() => dispatch(closeCategoryModal())}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {mode === 'create' ? 'Create Category' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};

export default CategoryForm;
