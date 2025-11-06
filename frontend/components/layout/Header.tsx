
import React from 'react';
import { Search } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between p-4 bg-white border-b border-neutral-200">
      <h1 className="text-xl font-bold text-neutral-800 font-display">Dashboard</h1>
      <div className="relative">
        {/* Search bar will be implemented later */}
      </div>
    </header>
  );
};

export default Header;
