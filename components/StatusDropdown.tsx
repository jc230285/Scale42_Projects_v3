'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done';

interface StatusDropdownProps {
  value: TaskStatus | '';
  onChange: (value: TaskStatus) => void;
  className?: string;
  placeholder?: string;
}

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'done', label: 'Done' },
];

function StatusDropdown({
  value,
  onChange,
  className = '',
  placeholder = 'Select...',
}: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownMenuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideDropdown = dropdownRef.current?.contains(target);
      const isInsideMenu = dropdownMenuRef.current?.contains(target);
      
      if (!isInsideDropdown && !isInsideMenu) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [isOpen]);

  const handleOptionClick = (optionValue: TaskStatus) => {
    console.log('[StatusDropdown] handleOptionClick called with:', optionValue);
    console.log('[StatusDropdown] Calling onChange...');
    onChange(optionValue);
    setIsOpen(false);
  };

  const getDisplayValue = () => {
    if (!value) return placeholder;
    const selectedOption = statusOptions.find(opt => opt.value === value);
    return selectedOption ? selectedOption.label : placeholder;
  };

  const dropdownMenu = isOpen ? (
    <div
      ref={dropdownMenuRef}
      style={{
        position: 'fixed',
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        width: `${dropdownPosition.width}px`,
        zIndex: 9999
      }}
      className="mt-1 shadow-lg max-h-60 rounded-md py-1 text-xs ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none bg-zinc-800 border border-zinc-700"
    >
      {statusOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleOptionClick(option.value);
          }}
          className={`
            w-full text-left px-2 py-1.5 cursor-pointer font-medium text-white
            ${option.value === 'done' ? 'bg-green-900 hover:bg-green-800 border-l-2 border-green-500' : ''}
            ${option.value === 'in_progress' ? 'bg-blue-900 hover:bg-blue-800 border-l-2 border-blue-500' : ''}
            ${option.value === 'blocked' ? 'bg-orange-900 hover:bg-orange-800 border-l-2 border-orange-500' : ''}
            ${option.value === 'todo' ? 'bg-red-900 hover:bg-red-800 border-l-2 border-red-500' : ''}
            ${value === option.value ? 'ring-1 ring-white' : ''}
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  ) : null;

  return (
    <div ref={dropdownRef} className={`relative inline-block w-full ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('[StatusDropdown] Button clicked, isOpen:', isOpen);
          setIsOpen(!isOpen);
        }}
        className="flex items-center justify-between w-full rounded px-2 py-1 text-xs font-medium text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <span className={`block truncate ${!value ? 'text-zinc-400' : ''}`}>
          {getDisplayValue()}
        </span>
        <ChevronDownIcon
          className={`h-3 w-3 ml-1 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
        />
      </button>

      {typeof document !== 'undefined' && dropdownMenu && createPortal(dropdownMenu, document.body)}
    </div>
  );
}

export default StatusDropdown;
