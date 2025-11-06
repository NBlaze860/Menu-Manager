import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { closeSidePanel, openCategoryModal, openSubcategoryModal, openItemModal } from '../../store/uiSlice';
import { deleteCategory } from '../../store/categoriesSlice';
import { deleteSubcategory } from '../../store/subcategoriesSlice';
import { deleteItem } from '../../store/itemsSlice';
import Button from '../common/Button';
import { X, Edit, Trash2 } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { Category, Subcategory, Item } from '../../types';


const DetailPanel: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { isOpen, data: node } = useSelector((state: RootState) => state.ui.sidePanel);
    const { showSuccess, showError } = useToast();

    if (!node) return null;

    const data = node.data;

    const handleDelete = () => {
        if (!window.confirm(`Are you sure you want to delete this ${node.type}?`)) return;

        let deleteAction;
        if (node.type === 'category') deleteAction = deleteCategory(node.id);
        else if (node.type === 'subcategory') deleteAction = deleteSubcategory(node.id);
        else if (node.type === 'item') deleteAction = deleteItem(node.id);

        if (deleteAction) {
            dispatch(deleteAction).unwrap()
                .then(() => {
                    showSuccess(`${node.type.charAt(0).toUpperCase() + node.type.slice(1)} deleted successfully.`);
                    dispatch(closeSidePanel());
                })
                .catch(err => showError(err.message || 'Failed to delete'));
        }
    };

    const handleEdit = () => {
        if (node.type === 'category') dispatch(openCategoryModal({ mode: 'edit', data: data as Category }));
        if (node.type === 'subcategory') dispatch(openSubcategoryModal({ mode: 'edit', data: data as Subcategory }));
        if (node.type === 'item') dispatch(openItemModal({ mode: 'edit', data: data as Item }));
    };

    const renderContent = () => {
        switch (node.type) {
            case 'category': {
                const cat = data as Category;
                return (
                    <>
                        <h3 className="text-xl font-bold text-neutral-800">{cat.name}</h3>
                        <p className="text-neutral-600 mt-2">{cat.description}</p>
                        <div className="mt-4 pt-4 border-t border-neutral-200">
                             <span className={`px-2 py-1 text-sm font-semibold rounded-full ${cat.taxApplicability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                Tax: {cat.taxApplicability ? `${cat.tax}${cat.taxType === 'percentage' ? '%' : ' Fixed'}` : 'N/A'}
                             </span>
                        </div>
                    </>
                );
            }
            case 'subcategory': {
                 const sub = data as Subcategory;
                 return (
                    <>
                        <span className="text-sm font-semibold text-primary-600">{sub.categoryId?.name}</span>
                        <h3 className="text-xl font-bold text-neutral-800">{sub.name}</h3>
                        <p className="text-neutral-600 mt-2">{sub.description}</p>
                         <div className="mt-4 pt-4 border-t border-neutral-200">
                             <span className={`px-2 py-1 text-sm font-semibold rounded-full ${sub.taxApplicability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                Tax: {sub.taxApplicability ? `${sub.tax}%` : 'Inherited/N/A'}
                             </span>
                        </div>
                    </>
                );
            }
            case 'item': {
                const item = data as Item;
                return (
                    <>
                        <div className="flex justify-between items-start">
                             <h3 className="text-xl font-bold text-neutral-800">{item.name}</h3>
                             <span className="text-xl font-bold text-neutral-800">${item.totalAmount.toFixed(2)}</span>
                        </div>
                        <p className="text-neutral-600 mt-2">{item.description}</p>
                        <div className="mt-4 pt-4 border-t border-neutral-200 grid grid-cols-2 gap-4 text-sm">
                            <div><span className="font-semibold">Base:</span> ${item.baseAmount.toFixed(2)}</div>
                            <div><span className="font-semibold">Discount:</span> {item.discount}%</div>
                             <div>
                                <span className={`px-2 py-1 font-semibold rounded-full ${item.taxApplicability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    Tax: {item.taxApplicability ? `${item.tax}%` : 'Inherited/N/A'}
                                </span>
                            </div>
                        </div> 
                    </>
                );
            }
            default:
                return null;
        }
    };

    return (
       <>
         <div 
            className={`fixed inset-0 bg-black bg-opacity-25 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => dispatch(closeSidePanel())}
          />
         <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-neutral-200 flex-shrink-0">
                    <h2 className="text-lg font-bold text-neutral-800 font-display capitalize">{node.type} Details</h2>
                     <button
                        onClick={() => dispatch(closeSidePanel())}
                        className="p-1 rounded-full text-neutral-500 hover:bg-neutral-200 hover:text-neutral-800"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                {/* Content */}
                <div className="flex-grow p-6 overflow-y-auto">
                    {'image' in data && <img src={data.image} alt={data.name} className="w-full h-48 object-cover rounded-lg mb-4" />}
                    {renderContent()}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-neutral-200 flex-shrink-0 flex justify-end space-x-3">
                     <Button variant="danger" onClick={handleDelete}>
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </Button>
                     <Button variant="primary" onClick={handleEdit}>
                        <Edit className="w-4 h-4 mr-2" /> Edit
                    </Button>
                </div>
            </div>
        </div>
       </>
    );
};

export default DetailPanel;