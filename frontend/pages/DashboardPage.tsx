
import React from 'react';
import Card from '../components/common/Card';

const DashboardPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-neutral-800 mb-6 font-display">Dashboard</h1>
      <Card>
        <h2 className="text-xl font-semibold text-neutral-700">Welcome to Menu Manager!</h2>
        <p className="text-neutral-500 mt-2">More content will be added here soon.</p>
      </Card>
    </div>
  );
};

export default DashboardPage;
