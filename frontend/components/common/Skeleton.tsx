
import React from 'react';

const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return <div className={`animate-pulse bg-neutral-200 rounded-md ${className}`} />;
};

export const CategoryCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <Skeleton className="w-full h-40 mb-4" />
      <Skeleton className="w-3/4 h-6 mb-2" />
      <Skeleton className="w-full h-4 mb-4" />
      <Skeleton className="w-1/2 h-4" />
    </div>
  );
};

export default Skeleton;
