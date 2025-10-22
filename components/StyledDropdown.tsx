'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Option {
  value: string;
  label: string;
}

interface StyledDropdownProps {
  value: string | null;
  options: Option[];
  onChange: (value: string) => void;
  placeholder?: string;
  color?: 'blue' | 'purple' | 'zinc';
  searchable?: boolean;
}

function StyledDropdown({
  value,
  options,
  onChange,
  placeholder = 'Select...',
  color = 'zinc',
  searchable = false,
}: StyledDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideDropdown = dropdownRef.current?.contains(target);
      const isInsideMenu = dropdownMenuRef.current?.contains(target);
      
      if (!isInsideDropdown && !isInsideMenu) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleSelect = (optionValue: string) => {
    console.log('[StyledDropdown] handleSelect called with:', optionValue);
    console.log('[StyledDropdown] Calling onChange...');
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  // Filter options based on search term
  const filteredOptions = searchable && searchTerm
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Color mappings for Tailwind
  const colorClasses = {
    blue: {
      bg: 'bg-blue-900',
      hover: 'hover:bg-blue-800',
      border: 'border-blue-800',
    },
    purple: {
      bg: 'bg-purple-900',
      hover: 'hover:bg-purple-800',
      border: 'border-purple-800',
    },
    zinc: {
      bg: 'bg-zinc-800',
      hover: 'hover:bg-zinc-700',
      border: 'border-zinc-700',
    },
  };

  const colors = colorClasses[color];

  const dropdownMenu = isOpen ? (
    <div
      ref={dropdownMenuRef}
      className="fixed bg-zinc-800 border border-zinc-700 rounded-lg shadow-2xl max-h-60 overflow-hidden flex flex-col"
      style={{
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        width: `${dropdownPosition.width}px`,
        zIndex: 9999,
      }}
    >
      {searchable && (
        <div className="p-2 border-b border-zinc-700 bg-zinc-800">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full pl-8 pr-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-sm text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
      <div className="overflow-y-auto max-h-52 bg-zinc-800">
        {filteredOptions.length > 0 ? (
          filteredOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('[StyledDropdown] Option clicked:', option.value);
                handleSelect(option.value);
              }}
              className={`
                w-full px-3 py-2 text-left text-sm
                hover:bg-zinc-700 transition-colors
                ${value === option.value ? 'bg-zinc-700 text-white font-medium' : 'text-zinc-300'}
              `}
            >
              {option.label}
            </button>
          ))
        ) : (
          <div className="px-3 py-2 text-sm text-zinc-500 text-center">
            No options found
          </div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('[StyledDropdown] Button clicked, isOpen:', isOpen);
          setIsOpen(!isOpen);
        }}
        className={`
          w-full px-3 py-1.5 rounded-lg text-sm font-medium
          ${colors.bg} ${colors.hover} border ${colors.border}
          text-zinc-100 flex items-center justify-between gap-2
          transition-colors duration-150
        `}
      >
        <span className="truncate">{selectedOption?.label || placeholder}</span>
        <ChevronDownIcon
          className={`w-4 h-4 flex-shrink-0 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {typeof document !== 'undefined' && dropdownMenu && createPortal(dropdownMenu, document.body)}
    </div>
  );
}

export default StyledDropdown;
