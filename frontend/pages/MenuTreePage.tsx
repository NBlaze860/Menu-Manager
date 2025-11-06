import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchCategories } from '../store/categoriesSlice';
import { fetchSubcategories } from '../store/subcategoriesSlice';
import { fetchItems } from '../store/itemsSlice';
import { buildMenuTree } from '../utils/treeTransform';
import TreeNode from '../components/visualizers/TreeNode';
import DetailPanel from '../components/visualizers/DetailPanel';
import Card from '../components/common/Card';
import { GitMerge } from 'lucide-react';
import Skeleton from '../components/common/Skeleton';

const MenuTreePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: categories, loading: catLoading } = useSelector((state: RootState) => state.categories);
  const { data: subcategories, loading: subLoading } = useSelector((state: RootState) => state.subcategories);
  const { data: items, loading: itemLoading } = useSelector((state: RootState) => state.items);
  
  const isLoading = catLoading || subLoading || itemLoading;

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchSubcategories());
    dispatch(fetchItems());
  }, [dispatch]);

  const menuTree = useMemo(() => {
    if (isLoading) return [];
    return buildMenuTree(categories, subcategories, items);
  }, [categories, subcategories, items, isLoading]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <div className="pl-6"><Skeleton className="h-10 w-11/12" /></div>
            <Skeleton className="h-12 w-full" />
        </div>
      );
    }
    
    if (menuTree.length === 0) {
      return (
        <div className="text-center py-16">
            <GitMerge className="mx-auto h-16 w-16 text-neutral-400" />
            <h3 className="text-xl font-semibold text-neutral-700 mt-4">Your Menu Tree is Empty</h3>
            <p className="text-neutral-500 mt-2">Add some categories, subcategories, and items to see your menu structure here.</p>
        </div>
      )
    }

    return (
      <div className="space-y-1">
        {menuTree.map(node => (
          <TreeNode key={node.id} node={node} level={0} />
        ))}
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-neutral-800 mb-6 font-display">Menu Tree</h1>
      <Card>
        {renderContent()}
      </Card>
      <DetailPanel />
    </div>
  );
};

export default MenuTreePage;