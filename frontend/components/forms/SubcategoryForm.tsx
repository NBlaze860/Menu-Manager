import React, { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { createSubcategory, updateSubcategory } from '../../store/subcategoriesSlice';
import { closeSubcategoryModal } from '../../store/uiSlice';
import { Subcategory } from '../../types';
import { useToast } from '../../hooks/useToast';
import Input from '../common/Input';
import Button from '../common/Button';
import { ImageUp, Info } from 'lucide-react';

interface SubcategoryFormProps {
  mode: 'create' | 'edit';
  subcategory: Subcategory | null;
}

type FormData = {
  name: string;
  description: string;
  image: FileList;
  categoryId: string;
  taxApplicability: boolean;
  tax: number;
};

const SubcategoryForm: React.FC<SubcategoryFormProps> = ({ mode, subcategory }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { showSuccess, showError } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(subcategory?.image || null);
  const [isLoading, setIsLoading] = useState(false);
  const { data: categories } = useSelector((state: RootState) => state.categories);
  
  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm<FormData>({
    defaultValues: {
      name: subcategory?.name || '',
      description: subcategory?.description || '',
      categoryId: subcategory?.categoryId?._id || '',
      taxApplicability: subcategory?.taxApplicability ?? false,
      tax: subcategory?.tax || 0,
    },
  });

  const [useCustomTax, setUseCustomTax] = useState(subcategory?.taxApplicability ?? false);
  const selectedCategoryId = watch('categoryId');
  const imageFile = watch('image');

  const parentCategory = useMemo(() => 
    categories.find(c => c._id === selectedCategoryId),
    [categories, selectedCategoryId]
  );

  useEffect(() => {
    if (imageFile && imageFile.length > 0) {
      const file = imageFile[0];
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else if (!subcategory?.image) {
      setImagePreview(null);
    }
  }, [imageFile, subcategory?.image]);
  
  useEffect(() => {
    if (parentCategory && !useCustomTax) {
      setValue('taxApplicability', parentCategory.taxApplicability);
      setValue('tax', parentCategory.tax);
    }
  }, [parentCategory, useCustomTax, setValue]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('categoryId', data.categoryId);
    if (data.image && data.image[0]) {
      formData.append('image', data.image[0]);
    }

    if (useCustomTax) {
        formData.append('taxApplicability', String(data.taxApplicability));
        if(data.taxApplicability){
            formData.append('tax', String(data.tax));
        }
    } else if (parentCategory) {
        formData.append('taxApplicability', String(parentCategory.taxApplicability));
        if (parentCategory.taxApplicability) {
            formData.append('tax', String(parentCategory.tax));
        }
    }

    try {
      if (mode === 'edit' && subcategory) {
        await dispatch(updateSubcategory({ id: subcategory._id, subcategoryData: formData })).unwrap();
        showSuccess('Subcategory updated!');
      } else {
        await dispatch(createSubcategory(formData)).unwrap();
        showSuccess('Subcategory created!');
      }
      dispatch(closeSubcategoryModal());
    } catch (error) {
      showError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="w-full h-48 border-2 border-dashed border-neutral-300 rounded-lg flex items-center justify-center text-neutral-500 cursor-pointer" onClick={() => document.getElementById('image-upload-sub')?.click()}>
        {imagePreview ? <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" /> : <div className="text-center"><ImageUp className="mx-auto h-12 w-12" /><p>Upload an image</p></div>}
        <input id="image-upload-sub" type="file" accept="image/*" className="hidden" {...register('image', { required: mode === 'create' ? 'Image is required' : false })}/>
      </div>
      {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>}

      <Input<FormData> label="Subcategory Name" name="name" register={register} error={errors.name} placeholder="e.g., Pasta" {...register('name', { required: 'Name is required' })}/>
      
      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium text-neutral-700 mb-1">Parent Category</label>
        <select id="categoryId" className="w-full px-3 py-2 text-neutral-900 bg-white border-2 border-neutral-300 rounded-lg" {...register('categoryId', { required: 'Parent category is required' })}>
          <option value="">Select a category</option>
          {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
        </select>
        {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>}
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
        <textarea id="description" rows={3} className="w-full px-3 py-2 text-neutral-900 bg-white border-2 border-neutral-300 rounded-lg" placeholder="A brief description" {...register('description')}/>
      </div>
      
      <div className="p-3 bg-neutral-100 rounded-lg">
        {parentCategory && !useCustomTax && (
            <div className="flex items-center text-sm text-neutral-600 mb-2">
                <Info className="w-4 h-4 mr-2 text-primary-500" />
                Inheriting Tax: <strong>{parentCategory.taxApplicability ? `${parentCategory.tax}${parentCategory.taxType === 'percentage' ? '%' : ' Fixed'}` : 'Not Applicable'}</strong>
            </div>
        )}
        <div className="flex items-center space-x-2">
            <input type="checkbox" id="useCustomTax" checked={useCustomTax} onChange={e => setUseCustomTax(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary-600" />
            <label htmlFor="useCustomTax" className="text-sm font-medium text-neutral-700">Override inherited tax</label>
        </div>
      </div>

      {useCustomTax && (
        <div className="p-4 border border-neutral-200 rounded-lg space-y-4">
            <div className="flex items-center space-x-2">
                <input type="checkbox" id="taxApplicability" className="h-4 w-4 rounded border-gray-300 text-primary-600" {...register('taxApplicability')} />
                <label htmlFor="taxApplicability" className="text-sm font-medium text-neutral-700">Tax is applicable</label>
            </div>
            {watch('taxApplicability') && (
                <Input<FormData> label="Tax Rate" name="tax" type="number" register={register} error={errors.tax} placeholder="e.g., 5" {...register('tax', { valueAsNumber: true, required: 'Tax rate is required' })}/>
            )}
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="ghost" onClick={() => dispatch(closeSubcategoryModal())}>Cancel</Button>
        <Button type="submit" isLoading={isLoading}>{mode === 'create' ? 'Create Subcategory' : 'Save Changes'}</Button>
      </div>
    </form>
  );
};

export default SubcategoryForm;