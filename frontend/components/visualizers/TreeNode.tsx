import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { openSidePanel } from '../../store/uiSlice';
import { TreeNodeData } from '../../types';
import { ChevronRight, ChevronDown, List, Folder, Box } from 'lucide-react';

interface TreeNodeProps {
  node: TreeNodeData;
  level: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, level }) => {
  const dispatch = useDispatch();
  const [isExpanded, setIsExpanded] = useState(level === 0); // Expand categories by default
  const hasChildren = node.children && node.children.length > 0;

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening side panel when clicking chevron
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };
  
  const handleNodeClick = () => {
    dispatch(openSidePanel(node));
  };

  const nodeStyles = {
    category: {
      icon: List,
      color: 'text-blue-600',
      bgColor: 'hover:bg-blue-50',
    },
    subcategory: {
      icon: Folder,
      color: 'text-teal-600',
      bgColor: 'hover:bg-teal-50',
    },
    item: {
      icon: Box,
      color: 'text-amber-600',
      bgColor: 'hover:bg-amber-50',
    },
  };

  const style = nodeStyles[node.type];
  const IconComponent = style.icon;

  return (
    <div className="relative">
        <div style={{ paddingLeft: `${level * 1.5}rem` }} className="flex items-center group">
             {/* Connecting line */}
            {level > 0 && <div className="absolute left-0 top-0 w-px h-full bg-neutral-200" style={{ left: `${(level - 1) * 1.5 + 0.75}rem` }} />}
            {level > 0 && <div className="absolute top-1/2 -mt-px w-4 h-px bg-neutral-200" style={{ left: `${(level - 1) * 1.5 + 0.75}rem` }}/>}
        
            <div
                className={`flex items-center w-full py-2 px-3 rounded-lg cursor-pointer transition-colors ${style.bgColor} z-10`}
                onClick={handleNodeClick}
            >
                <div onClick={handleToggleExpand} className={`p-1 rounded-md ${hasChildren ? 'bg-neutral-300 cursor-pointer hover:bg-neutral-400' : 'cursor-default opacity-0'}`}>
                    {hasChildren ? (isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />) : <ChevronRight size={16} />}
                </div>

                <IconComponent className={`mr-3 ml-1 h-5 w-5 flex-shrink-0 ${style.color}`} />
                <span className="font-medium text-neutral-800 truncate">{node.name}</span>
                <div className="flex-grow" />
                
                {node.type === 'category' && (
                    <>
                        <span className="text-xs font-semibold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full mr-2">{node.subCategoryCount} Sub</span>
                        <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">{node.itemCount} Items</span>
                    </>
                )}
                {node.type === 'subcategory' && (
                    <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">{node.itemCount} Items</span>
                )}
            </div>
      </div>
      {isExpanded && hasChildren && (
        <div className="mt-1">
          {node.children.map(childNode => (
            <TreeNode key={childNode.id} node={childNode} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeNode;