
import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center p-8">
      <span className="loading loading-spinner loading-lg text-primary"></span>
    </div>
  );
};

export default Spinner;
