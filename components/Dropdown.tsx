'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';

export type DropdownColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

export interface DropdownOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface DropdownProps {
  options: DropdownOption[];
  value?: string | number | (string | number)[];
  onChange: (value: string | number | (string | number)[]) => void;
  placeholder?: string;
  multiple?: boolean;
  color?: DropdownColor;
  disabled?: boolean;
  className?: string;
}

function Dropdown({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  multiple = false,
  color = 'default',
  disabled = false,
  className = '',
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isOpen && multiple && (event.key === 'Enter' || event.key === 'Escape')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, multiple]);

  const getColorClasses = () => {
    const baseClasses = 'relative inline-block w-full';
    const buttonBase = 'relative w-full bg-zinc-800 border border-zinc-600 rounded-md px-3 py-2 text-left cursor-pointer focus:outline-none focus:ring-2 focus:border-transparent text-zinc-100';

    switch (color) {
      case 'primary':
        return `${baseClasses} ${buttonBase} focus:ring-blue-500`;
      case 'secondary':
        return `${baseClasses} ${buttonBase} focus:ring-zinc-500`;
      case 'success':
        return `${baseClasses} ${buttonBase} focus:ring-green-500`;
      case 'warning':
        return `${baseClasses} ${buttonBase} focus:ring-yellow-500`;
      case 'danger':
        return `${baseClasses} ${buttonBase} focus:ring-red-500`;
      default:
        return `${baseClasses} ${buttonBase} focus:ring-blue-500`;
    }
  };

  const handleOptionClick = (option: DropdownOption) => {
    if (option.disabled) return;

    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const isSelected = currentValues.includes(option.value);

      if (isSelected) {
        onChange(currentValues.filter(v => v !== option.value));
      } else {
        onChange([...currentValues, option.value]);
      }
      // For multi-select, keep dropdown open
    } else {
      onChange(option.value);
      setIsOpen(false);
    }
  };

  const getDisplayValue = () => {
    if (multiple) {
      const selectedValues = Array.isArray(value) ? value : [];
      if (selectedValues.length === 0) return placeholder;

      const selectedLabels = options
        .filter(opt => selectedValues.includes(opt.value))
        .map(opt => opt.label);

      return selectedLabels.length > 2
        ? `${selectedLabels.length} selected`
        : selectedLabels.join(', ');
    } else {
      const selectedOption = options.find(opt => opt.value === value);
      return selectedOption ? selectedOption.label : placeholder;
    }
  };

  const isSelected = (optionValue: string | number) => {
    if (multiple) {
      return Array.isArray(value) && value.includes(optionValue);
    }
    return value === optionValue;
  };

  return (
    <div ref={dropdownRef} className={getColorClasses()}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center justify-between w-full ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className={`block truncate ${!value && !multiple ? 'text-zinc-400' : 'text-zinc-100'}`}>
          {getDisplayValue()}
        </span>
        <ChevronDownIcon
          className={`h-5 w-5 text-zinc-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-zinc-800 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none border border-zinc-600">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleOptionClick(option)}
              disabled={option.disabled}
              className={`
                w-full text-left px-3 py-2 hover:bg-zinc-700 focus:bg-zinc-700 focus:outline-none text-zinc-100
                ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${isSelected(option.value) ? 'bg-zinc-700 text-zinc-100' : ''}
              `}
            >
              <div className="flex items-center justify-between">
                <span className="block truncate">{option.label}</span>
                {isSelected(option.value) && (
                  <CheckIcon className="h-4 w-4 text-zinc-400" />
                )}
              </div>
            </button>
          ))}
          {multiple && (
            <div className="border-t border-zinc-600 mt-1 pt-1">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full text-left px-3 py-2 hover:bg-zinc-700 focus:bg-zinc-700 focus:outline-none text-zinc-100 cursor-pointer text-sm font-medium"
              >
                Done
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Dropdown;