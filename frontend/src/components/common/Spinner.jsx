import React from 'react';

const Spinner = ({ size = 'large', className = '' }) => {
    const spinnerSizes = {
        small: 'w-6 h-6',
        medium: 'w-10 h-10',
        large: 'w-16 h-16'
    };

    return (
        <div className="flex justify-center items-center h-full w-full">
            <div
                className={`
          ${spinnerSizes[size]} 
          border-4 border-primary-500 border-t-transparent 
          rounded-full animate-spin 
          ${className}
        `}
            />
        </div>
    );
};

export default Spinner;