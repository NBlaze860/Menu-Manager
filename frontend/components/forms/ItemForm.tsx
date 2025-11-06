import React, { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { createItem, updateItem } from '../../store/itemsSlice';
import { closeItemModal } from '../../store/uiSlice';
import { Item } from '../../types';
import { useToast } from '../../hooks/useToast';
import Input from '../common/Input';
import Button from '../common/Button';
import { ImageUp, Info } from 'lucide-react';

interface ItemFormProps {
  mode: 'create' | 'edit';
  item: Item | null;
}

type FormData = {
  name: string;
  description: string;
  image: FileList;
  parentCategoryId: string; // Used for filtering subcategories
  parentSubcategoryId: string;
  baseAmount: number;
  discount: number;
  taxApplicability: boolean;
  tax: number;
};

const ItemForm: React.FC<ItemFormProps> = ({ mode, item }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { showSuccess, showError } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(item?.image || null);
  const [isLoading, setIsLoading] = useState(false);
  const { data: categories } = useSelector((state: RootState) => state.categories);
  const { data: subcategories } = useSelector((state: RootState) => state.subcategories);

  const [parentType, setParentType] = useState<'category' | 'subcategory'>(
    item?.subCategoryId ? 'subcategory' : 'category'
  );
  
  const [useCustomTax, setUseCustomTax] = useState(() => {
    if (mode === 'edit' && item) {
        if(item.subCategoryId) {
            const parentSub = subcategories.find(s => s._id === item.subCategoryId?._id);
            return parentSub ? item.tax !== parentSub.tax : true;
        }
        if(item.categoryId) {
            const parentCat = categories.find(c => c._id === item.categoryId?._id);
            return parentCat ? item.tax !== parentCat.tax : true;
        }
    }
    return false;
  });


  const { register, handleSubmit, watch, formState: { errors }, setValue, reset } = useForm<FormData>({
    defaultValues: {
      name: item?.name || '',
      description: item?.description || '',
      parentCategoryId: item?.categoryId?._id || item?.subCategoryId?._id ? subcategories.find(s => s._id === item.subCategoryId?._id)?.categoryId._id : '',
      parentSubcategoryId: item?.subCategoryId?._id || '',
      baseAmount: item?.baseAmount || 0,
      discount: item?.discount || 0,
      taxApplicability: item?.taxApplicability ?? false,
      tax: item?.tax || 0,
    },
  });

  const imageFile = watch('image');
  const parentCategoryId = watch('parentCategoryId');
  const parentSubcategoryId = watch('parentSubcategoryId');

  const inheritedTaxInfo = useMemo(() => {
    if (parentType === 'category' && parentCategoryId) {
        return categories.find(c => c._id === parentCategoryId);
    }
    if (parentType === 'subcategory' && parentSubcategoryId) {
        return subcategories.find(s => s._id === parentSubcategoryId);
    }
    return null;
  }, [parentType, parentCategoryId, parentSubcategoryId, categories, subcategories]);

  useEffect(() => {
    if (imageFile && imageFile.length > 0) {
      const file = imageFile[0];
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else if (!item?.image) {
      setImagePreview(null);
    }
  }, [imageFile, item?.image]);
  
  useEffect(() => {
    if (inheritedTaxInfo && !useCustomTax) {
        setValue('taxApplicability', inheritedTaxInfo.taxApplicability);
        setValue('tax', inheritedTaxInfo.tax);
    }
  }, [inheritedTaxInfo, useCustomTax, setValue]);

  useEffect(() => {
    if (parentType === 'category') {
        setValue('parentSubcategoryId', '');
    }
  }, [parentType, setValue])


  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    if (data.image && data.image[0]) {
      formData.append('image', data.image[0]);
    }
    
    if (parentType === 'category') {
        formData.append('categoryId', data.parentCategoryId);
    } else {
        formData.append('subCategoryId', data.parentSubcategoryId);
    }

    formData.append('baseAmount', String(data.baseAmount));
    formData.append('discount', String(data.discount));

    if (useCustomTax) {
        formData.append('taxApplicability', String(data.taxApplicability));
        formData.append('tax', String(data.tax));
    } else if (inheritedTaxInfo) {
        formData.append('taxApplicability', String(inheritedTaxInfo.taxApplicability));
        formData.append('tax', String(inheritedTaxInfo.tax));
    }

    try {
      if (mode === 'edit' && item) {
        await dispatch(updateItem({ id: item._id, itemData: formData })).unwrap();
        showSuccess('Item updated successfully!');
      } else {
        await dispatch(createItem(formData)).unwrap();
        showSuccess('Item created successfully!');
      }
      dispatch(closeItemModal());
    } catch (error) {
      showError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSubcategories = useMemo(() => subcategories.filter(s => s.categoryId._id === parentCategoryId), [subcategories, parentCategoryId]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
      <div className="w-full h-48 border-2 border-dashed border-neutral-300 rounded-lg flex items-center justify-center text-neutral-500 cursor-pointer" onClick={() => document.getElementById('image-upload-item')?.click()}>
        {imagePreview ? <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" /> : <div className="text-center"><ImageUp className="mx-auto h-12 w-12" /><p>Upload an image</p></div>}
        <input id="image-upload-item" type="file" accept="image/*" className="hidden" {...register('image', { required: mode === 'create' ? 'Image is required' : false })}/>
      </div>
      {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>}

      <Input<FormData> label="Item Name" name="name" register={register} error={errors.name} placeholder="e.g., Spaghetti Carbonara" {...register('name', { required: 'Name is required' })}/>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
        <textarea id="description" rows={3} className="w-full px-3 py-2 text-neutral-900 bg-white border-2 border-neutral-300 rounded-lg" placeholder="A brief description of the item" {...register('description')}/>
      </div>
        
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">Assign To</label>
        <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" value="category" checked={parentType === 'category'} onChange={() => setParentType('category')} className="h-4 w-4 text-primary-600" /> Category</label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" value="subcategory" checked={parentType === 'subcategory'} onChange={() => setParentType('subcategory')} className="h-4 w-4 text-primary-600" /> Subcategory</label>
        </div>
      </div>
        
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="parentCategoryId" className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
          <select id="parentCategoryId" className="w-full px-3 py-2 text-neutral-900 bg-white border-2 border-neutral-300 rounded-lg" {...register('parentCategoryId', { required: 'Category is required' })}>
            <option value="">Select a category</option>
            {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
          </select>
          {errors.parentCategoryId && <p className="mt-1 text-sm text-red-600">{errors.parentCategoryId.message}</p>}
        </div>
        {parentType === 'subcategory' && (
            <div>
              <label htmlFor="parentSubcategoryId" className="block text-sm font-medium text-neutral-700 mb-1">Subcategory</label>
              <select id="parentSubcategoryId" disabled={!parentCategoryId || filteredSubcategories.length === 0} className="w-full px-3 py-2 text-neutral-900 bg-white border-2 border-neutral-300 rounded-lg disabled:bg-neutral-100" {...register('parentSubcategoryId', { required: 'Subcategory is required' })}>
                <option value="">Select a subcategory</option>
                {filteredSubcategories.map(sub => <option key={sub._id} value={sub._id}>{sub.name}</option>)}
              </select>
              {errors.parentSubcategoryId && <p className="mt-1 text-sm text-red-600">{errors.parentSubcategoryId.message}</p>}
            </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input<FormData> label="Base Amount" name="baseAmount" type="number" step="0.01" register={register} error={errors.baseAmount} placeholder="e.g., 12.99" {...register('baseAmount', { valueAsNumber: true, required: 'Base amount is required' })}/>
        <Input<FormData> label="Discount (%)" name="discount" type="number" register={register} error={errors.discount} placeholder="e.g., 10" {...register('discount', { valueAsNumber: true, min: 0, max: 100 })}/>
      </div>

      <div className="p-3 bg-neutral-100 rounded-lg">
        {inheritedTaxInfo && !useCustomTax && (
            <div className="flex items-center text-sm text-neutral-600 mb-2">
                <Info className="w-4 h-4 mr-2 text-primary-500" />
                Inheriting Tax: <strong>{inheritedTaxInfo.taxApplicability ? `${inheritedTaxInfo.tax}%` : 'Not Applicable'}</strong> from {inheritedTaxInfo.name}
            </div>
        )}
        <div className="flex items-center space-x-2">
            <input type="checkbox" id="useCustomTax" checked={useCustomTax} onChange={e => setUseCustomTax(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary-600" />
            <label htmlFor="useCustomTax" className="text-sm font-medium text-neutral-700">Set custom tax</label>
        </div>
      </div>
      
       {useCustomTax && (
        <div className="p-4 border border-neutral-200 rounded-lg space-y-4">
            <div className="flex items-center space-x-2">
                <input type="checkbox" id="taxApplicability" className="h-4 w-4 rounded border-gray-300 text-primary-600" {...register('taxApplicability')} />
                <label htmlFor="taxApplicability" className="text-sm font-medium text-neutral-700">Tax is applicable</label>
            </div>
            {watch('taxApplicability') && (
                <Input<FormData> label="Tax Rate (%)" name="tax" type="number" register={register} error={errors.tax} placeholder="e.g., 5" {...register('tax', { valueAsNumber: true, required: 'Tax rate is required' })}/>
            )}
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-200">
        <Button type="button" variant="ghost" onClick={() => dispatch(closeItemModal())}>Cancel</Button>
        <Button type="submit" isLoading={isLoading}>{mode === 'create' ? 'Create Item' : 'Save Changes'}</Button>
      </div>
    </form>
  );
};

export default ItemForm;
