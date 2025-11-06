
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, List, Folder, Box, GitMerge, Search } from 'lucide-react';

const navItems = [
  { to: '/categories', icon: List, label: 'Categories' },
  { to: '/subcategories', icon: Folder, label: 'Subcategories' },
  { to: '/items', icon: Box, label: 'Items' },
  { to: '/menu-tree', icon: GitMerge, label: 'Menu Tree' },
];

const Sidebar: React.FC = () => {
  const baseLinkClasses = "flex items-center px-4 py-3 text-neutral-600 transition-colors duration-200 transform rounded-lg";
  const activeLinkClasses = "bg-primary-500 text-white";
  const hoverLinkClasses = "hover:bg-neutral-200 hover:text-neutral-800";

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-neutral-200">
      <div className="flex items-center justify-center h-16 border-b border-neutral-200">
        <h2 className="text-2xl font-bold text-primary-500 font-display">Menu Manager</h2>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map(item => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) => `${baseLinkClasses} ${isActive ? activeLinkClasses : hoverLinkClasses}`}
          >
            <item.icon className="w-5 h-5" />
            <span className="mx-4 font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
