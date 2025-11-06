import { Category, Subcategory, Item, TreeNodeData } from '../types';

export const buildMenuTree = (
  categories: Category[],
  subcategories: Subcategory[],
  items: Item[]
): TreeNodeData[] => {
  const tree: TreeNodeData[] = [];

  const categoryMap = new Map<string, TreeNodeData>();

  // Initialize categories as top-level nodes
  categories.forEach(cat => {
    const categoryNode: TreeNodeData = {
      id: cat._id,
      type: 'category',
      name: cat.name,
      data: cat,
      children: [],
      subCategoryCount: 0,
      itemCount: 0,
    };
    categoryMap.set(cat._id, categoryNode);
    tree.push(categoryNode);
  });

  const subcategoryMap = new Map<string, TreeNodeData>();
  
  // Place subcategories under their parent categories
  subcategories.forEach(sub => {
    const parentCategory = categoryMap.get(sub.categoryId._id);
    if (parentCategory) {
      const subcategoryNode: TreeNodeData = {
        id: sub._id,
        type: 'subcategory',
        name: sub.name,
        data: sub,
        children: [],
        itemCount: 0,
      };
      parentCategory.children.push(subcategoryNode);
      parentCategory.subCategoryCount! += 1;
      subcategoryMap.set(sub._id, subcategoryNode);
    }
  });

  // Place items under their parent category or subcategory
  items.forEach(item => {
    let parentNode: TreeNodeData | undefined;
    if (item.subCategoryId) {
      parentNode = subcategoryMap.get(item.subCategoryId._id);
    } else if (item.categoryId) {
      parentNode = categoryMap.get(item.categoryId._id);
    }

    if (parentNode) {
      const itemNode: TreeNodeData = {
        id: item._id,
        type: 'item',
        name: item.name,
        data: item,
        children: [],
      };
      parentNode.children.push(itemNode);
      parentNode.itemCount! += 1;

      // If item is in a subcategory, also increment the main category's item count
      if(parentNode.type === 'subcategory') {
          const mainCategory = categoryMap.get((parentNode.data as Subcategory).categoryId._id);
          if (mainCategory) {
              mainCategory.itemCount! += 1;
          }
      }
    }
  });

  return tree;
};