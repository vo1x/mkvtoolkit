import React from 'react';

type ButtonProps = {
  variant: 'primary' | 'secondary';
  children: any;
  onClick?: () => void;
  disabled?: boolean | null;
};

export const Button: React.FC<ButtonProps> = ({ variant, children, onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || false}
      className={` flex items-center  gap-2 text-sm ${disabled && 'bg-opacity-50'} font-semibold ${
        variant === 'primary' ? 'bg-[#00d0aa] text-[#000]' : 'bg-[#343A46]'
      } text-center p-2 rounded-md w-max disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
};
