import React, { useState, useEffect } from 'react';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string | number;
  onChange: (val: string) => void;
  icon?: React.ReactNode;
}

export default function CurrencyInput({ value, onChange, icon, className, ...props }: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState('');

  // Format value to Indonesian Rupiah (dots as thousand separators)
  const formatIDR = (val: string | number) => {
    if (val === null || val === undefined) return '';
    const numericVal = typeof val === 'string' ? val.replace(/\D/g, '') : val.toString();
    if (!numericVal) return '';
    
    return new Intl.NumberFormat('id-ID', {
      maximumFractionDigits: 0,
      useGrouping: true,
    }).format(parseInt(numericVal, 10));
  };

  useEffect(() => {
    setDisplayValue(formatIDR(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, ''); // strip non-numeric
    setDisplayValue(formatIDR(rawVal));
    onChange(rawVal);
  };

  return (
    <div className="relative w-full">
      {icon && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold z-10 pointer-events-none">
          {icon}
        </span>
      )}
      <input
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        className={className}
        {...props}
      />
    </div>
  );
}
