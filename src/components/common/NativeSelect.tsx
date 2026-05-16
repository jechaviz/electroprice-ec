import React from 'react';

type NativeSelectSize = 'xs' | 'sm' | 'md';

interface NativeSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  size?: NativeSelectSize;
  wrapperClassName?: string;
}

const SIZE_CLASSES: Record<NativeSelectSize, string> = {
  xs: 'min-h-8 rounded-lg py-1 pl-3 pr-8 text-xs',
  sm: 'min-h-10 rounded-xl py-2 pl-4 pr-10 text-sm',
  md: 'min-h-12 rounded-xl py-3 pl-4 pr-10 text-base',
};

const NativeSelect: React.FC<NativeSelectProps> = ({
  size = 'md',
  className = '',
  wrapperClassName = '',
  children,
  ...props
}) => {
  return (
    <div className={`relative ${wrapperClassName}`.trim()}>
      <select
        {...props}
        className={`w-full appearance-none border border-base-content/10 bg-base-300/50 font-medium text-base-content shadow-sm transition-colors focus:border-primary/50 focus:bg-base-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${SIZE_CLASSES[size]} ${className}`.trim()}
      >
        {children}
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-base-content/40" aria-hidden="true">
        <i className="fa-solid fa-chevron-down text-[10px]"></i>
      </span>
    </div>
  );
};

export default NativeSelect;
