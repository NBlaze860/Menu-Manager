
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import CategoriesPage from './pages/CategoriesPage';
import SubcategoriesPage from './pages/SubcategoriesPage';
import ItemsPage from './pages/ItemsPage';
import MenuTreePage from './pages/MenuTreePage';
import SearchPage from './pages/SearchPage';

const App: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<CategoriesPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/subcategories" element={<SubcategoriesPage />} />
        <Route path="/items" element={<ItemsPage />} />
        <Route path="/menu-tree" element={<MenuTreePage />} />
        <Route path="/search" element={<SearchPage />} />
      </Routes>
    </Layout>
  );
};

export default App;
