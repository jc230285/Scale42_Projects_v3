'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { ChevronUpIcon, ChevronDownIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import Dropdown from './Dropdown';

export type SortDirection = 'asc' | 'desc' | null;
export type TableColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

export interface Column<T = any> {
  key: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  filterOptions?: { value: string; label: string }[]; // For dropdown filters
  width?: string;
  hidden?: boolean; // Column visibility
  render?: (value: any, row: T, index: number) => React.ReactNode;
  type?: 'text' | 'number' | 'boolean' | 'date' | 'action' | 'custom' | 'dropdown' | 'multidropdown';
  editable?: boolean;
  footer?: (data: T[]) => React.ReactNode;
  dropdownOptions?: { value: string | number; label: string }[]; // For dropdown cell types
}

export interface TableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  striped?: boolean;
  hoverable?: boolean;
  selectable?: boolean;
  searchable?: boolean;
  color?: TableColor;
  maxHeight?: string;
  defaultSort?: { key: string; direction: SortDirection };
  onSelectionChange?: (selectedRows: T[]) => void;
  onRowClick?: (row: T, index: number) => void;
  onCellEdit?: (row: T, column: Column<T>, newValue: any) => void;
}

function Table<T extends Record<string, any>>({
  data,
  columns,
  striped = true,
  hoverable = true,
  selectable = false,
  searchable = true,
  color = 'default',
  maxHeight = '600px',
  defaultSort,
  onSelectionChange,
  onRowClick,
  onCellEdit,
}: TableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(defaultSort?.key || null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSort?.direction || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [filters, setFilters] = useState<Record<string, string[]>>({}); // Changed to string[] for multi-select
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; columnKey: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState<string | null>(null);
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(() => {
    // Initialize with columns that have hidden: true
    return new Set(columns.filter(col => col.hidden).map(col => col.key));
  });
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  // Get visible columns
  const visibleColumns = useMemo(() => {
    return columns.filter(col => !hiddenColumns.has(col.key));
  }, [columns, hiddenColumns]);

  // Color classes
  const getColorClasses = () => {
    const baseClasses = 'border-collapse w-full text-sm';
    switch (color) {
      case 'primary':
        return `${baseClasses} border-blue-700`;
      case 'secondary':
        return `${baseClasses} border-zinc-600`;
      case 'success':
        return `${baseClasses} border-green-700`;
      case 'warning':
        return `${baseClasses} border-yellow-700`;
      case 'danger':
        return `${baseClasses} border-red-700`;
      default:
        return `${baseClasses} border-zinc-600`;
    }
  };

  // Filter and search data
  const filteredData = useMemo(() => {
    let filtered = data.filter(row => {
      // Search across all columns
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return columns.some(col => {
          const value = row[col.key];
          return value?.toString().toLowerCase().includes(searchLower);
        });
      }
      return true;
    });

    // Apply column filters
    Object.entries(filters).forEach(([key, filterValues]) => {
      if (filterValues && filterValues.length > 0) {
        filtered = filtered.filter(row => {
          const value = row[key]?.toString().toLowerCase();
          return filterValues.some(filterValue =>
            value.includes(filterValue.toLowerCase())
          );
        });
      }
    });

    return filtered;
  }, [data, searchTerm, filters, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection]);

  const handleSort = useCallback((columnKey: string) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column?.sortable) return;

    if (sortColumn === columnKey) {
      setSortDirection(prev =>
        prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'
      );
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  }, [sortColumn, columns]);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(sortedData.map((_, index) => index)));
    } else {
      setSelectedRows(new Set());
    }
  }, [sortedData]);

  const handleSelectRow = useCallback((index: number, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(index);
    } else {
      newSelected.delete(index);
    }
    setSelectedRows(newSelected);
    onSelectionChange?.(Array.from(newSelected).map(i => sortedData[i]));
  }, [selectedRows, sortedData, onSelectionChange]);

  const handleCellEdit = useCallback((rowIndex: number, columnKey: string, value: any, closeEditing = true) => {
    const row = sortedData[rowIndex];
    const column = columns.find(col => col.key === columnKey);
    onCellEdit?.(row, column!, value);
    if (closeEditing) {
      setEditingCell(null);
    }
  }, [sortedData, columns, onCellEdit]);

  const handleFilterChange = useCallback((columnKey: string, selectedValues: string[]) => {
    setFilters(prev => ({
      ...prev,
      [columnKey]: selectedValues
    }));
  }, []);

  const toggleFilterDropdown = useCallback((columnKey: string) => {
    setShowFilterDropdown(prev => prev === columnKey ? null : columnKey);
  }, []);

  const startEditing = useCallback((rowIndex: number, columnKey: string, currentValue: any) => {
    setEditingCell({ rowIndex, columnKey });
    setEditValue(currentValue?.toString() || '');
  }, []);

  const renderCell = (row: T, column: Column<T>, rowIndex: number) => {
    const value = row[column.key];
    const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.columnKey === column.key;

    if (isEditing && column.editable) {
      if (column.type === 'dropdown') {
        return (
          <Dropdown
            options={column.dropdownOptions || []}
            value={value}
            onChange={(newValue) => handleCellEdit(rowIndex, column.key, newValue)}
            placeholder="Select..."
            className="w-full"
          />
        );
      } else if (column.type === 'multidropdown') {
        return (
          <Dropdown
            options={column.dropdownOptions || []}
            value={Array.isArray(value) ? value : []}
            onChange={(newValue) => handleCellEdit(rowIndex, column.key, newValue, false)}
            placeholder="Select..."
            multiple={true}
            className="w-full"
          />
        );
      } else {
        return (
          <input
            type={column.type === 'number' ? 'number' : 'text'}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => handleCellEdit(rowIndex, column.key, editValue)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCellEdit(rowIndex, column.key, editValue);
              } else if (e.key === 'Escape') {
                setEditingCell(null);
              }
            }}
            className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        );
      }
    }

    if (column.render) {
      return column.render(value, row, rowIndex);
    }

    switch (column.type) {
      case 'dropdown':
        const selectedOption = column.dropdownOptions?.find(opt => opt.value === value);
        return (
          <span
            className="cursor-pointer hover:text-blue-400"
            onClick={() => column.editable && startEditing(rowIndex, column.key, value)}
          >
            {selectedOption?.label || value || 'Select...'}
          </span>
        );
      case 'multidropdown':
        const selectedOptions = Array.isArray(value)
          ? column.dropdownOptions?.filter(opt => value.includes(opt.value)) || []
          : [];
        const displayText = selectedOptions.length > 0
          ? selectedOptions.length > 2
            ? `${selectedOptions.length} selected`
            : selectedOptions.map(opt => opt.label).join(', ')
          : 'Select...';
        return (
          <span
            className="cursor-pointer hover:text-blue-400"
            onClick={() => column.editable && startEditing(rowIndex, column.key, value)}
          >
            {displayText}
          </span>
        );
      case 'boolean':
        return (
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => handleCellEdit(rowIndex, column.key, e.target.checked)}
            className="rounded"
          />
        );
      case 'number':
        return <span className="font-mono">{value}</span>;
      default:
        return <span>{value}</span>;
    }
  };

  const renderHeader = () => (
    <thead className="bg-zinc-800 sticky top-0 z-10">
      <tr>
        {selectable && (
          <th className="px-4 py-3 text-left">
            <input
              type="checkbox"
              checked={selectedRows.size === sortedData.length && sortedData.length > 0}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="rounded"
            />
          </th>
        )}
        {visibleColumns.map((column) => (
          <th
            key={column.key}
            className={`px-4 py-3 text-left font-semibold text-zinc-100 ${
              column.sortable ? 'cursor-pointer hover:bg-zinc-700' : ''
            }`}
            style={{ width: column.width }}
            onClick={() => handleSort(column.key)}
          >
            <div className="flex items-center gap-2">
              <span>{column.header}</span>
              {column.sortable && (
                <div className="flex flex-col">
                  <ChevronUpIcon
                    className={`h-3 w-3 ${
                      sortColumn === column.key && sortDirection === 'asc'
                        ? 'text-blue-600'
                        : 'text-gray-400'
                    }`}
                  />
                  <ChevronDownIcon
                    className={`h-3 w-3 -mt-1 ${
                      sortColumn === column.key && sortDirection === 'desc'
                        ? 'text-blue-600'
                        : 'text-gray-400'
                    }`}
                  />
                </div>
              )}
              {column.filterable && (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFilterDropdown(column.key);
                    }}
                    className={`p-1 rounded hover:bg-gray-200 ${
                      filters[column.key]?.length > 0 ? 'text-blue-600 bg-blue-50' : 'text-gray-400'
                    }`}
                  >
                    <FunnelIcon className="h-4 w-4" />
                  </button>

                  {showFilterDropdown === column.key && column.filterOptions && (
                    <div className="absolute top-full left-0 z-20 mt-1 w-48 bg-zinc-800 border border-zinc-600 rounded-md shadow-lg">
                      <div className="p-2 max-h-48 overflow-y-auto">
                        {column.filterOptions.map((option) => {
                          const isSelected = filters[column.key]?.includes(option.value) || false;
                          return (
                            <label key={option.value} className="flex items-center gap-2 px-2 py-1 hover:bg-zinc-700 cursor-pointer text-zinc-100">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  const currentFilters = filters[column.key] || [];
                                  const newFilters = e.target.checked
                                    ? [...currentFilters, option.value]
                                    : currentFilters.filter(v => v !== option.value);
                                  handleFilterChange(column.key, newFilters);
                                }}
                                className="rounded"
                              />
                              <span className="text-sm">{option.label}</span>
                            </label>
                          );
                        })}
                      </div>
                      {filters[column.key]?.length > 0 && (
                        <div className="border-t border-zinc-600 p-2">
                          <button
                            onClick={() => handleFilterChange(column.key, [])}
                            className="w-full text-left text-sm text-red-400 hover:text-red-300"
                          >
                            Clear filters
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );

  const renderBody = () => (
    <tbody>
      {sortedData.map((row, index) => (
        <tr
          key={index}
          className={`
            ${striped ? (index % 2 === 0 ? 'bg-zinc-900' : 'bg-zinc-800') : 'bg-zinc-900'}
            ${hoverable ? 'hover:bg-zinc-700' : ''}
            ${selectedRows.has(index) ? 'bg-blue-900/50' : ''}
            ${onRowClick ? 'cursor-pointer' : ''}
            transition-colors duration-150
          `}
          onClick={() => onRowClick?.(row, index)}
        >
          {selectable && (
            <td className="px-4 py-3">
              <input
                type="checkbox"
                checked={selectedRows.has(index)}
                onChange={(e) => {
                  e.stopPropagation();
                  handleSelectRow(index, e.target.checked);
                }}
                className="rounded"
              />
            </td>
          )}
          {visibleColumns.map((column) => (
            <td
              key={column.key}
              className="px-4 py-3 text-zinc-100 border-t border-zinc-700"
              onClick={(e) => {
                if (column.editable && !editingCell) {
                  e.stopPropagation();
                  startEditing(index, column.key, row[column.key]);
                }
              }}
            >
              {renderCell(row, column, index)}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );

  const renderFooter = () => {
    const hasFooter = visibleColumns.some(col => col.footer);
    if (!hasFooter) return null;

    return (
      <tfoot className="bg-zinc-800">
        <tr>
          {selectable && <td className="px-4 py-3 font-semibold text-zinc-100">Total</td>}
          {visibleColumns.map((column) => (
            <td key={column.key} className="px-4 py-3 font-semibold text-zinc-100">
              {column.footer ? column.footer(sortedData) : ''}
            </td>
          ))}
        </tr>
      </tfoot>
    );
  };

  return (
    <div className="w-full">
      {/* Search and Filters */}
      {searchable && (
        <div className="mb-4 flex gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search all columns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-zinc-600 rounded-lg bg-zinc-800 text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowColumnSelector(!showColumnSelector)}
              className="px-4 py-2 border border-zinc-600 rounded-lg bg-zinc-800 text-zinc-100 hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
            >
              <FunnelIcon className="h-4 w-4" />
              Columns
            </button>
            {showColumnSelector && (
              <div className="absolute right-0 mt-2 w-56 bg-zinc-800 border border-zinc-600 rounded-lg shadow-lg z-20 max-h-96 overflow-auto">
                <div className="p-2">
                  {columns.map((column) => (
                    <label
                      key={column.key}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-zinc-700 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={!hiddenColumns.has(column.key)}
                        onChange={(e) => {
                          const newHidden = new Set(hiddenColumns);
                          if (e.target.checked) {
                            newHidden.delete(column.key);
                          } else {
                            newHidden.add(column.key);
                          }
                          setHiddenColumns(newHidden);
                        }}
                        className="rounded"
                      />
                      <span className="text-sm text-zinc-100">{column.header}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table Container */}
      <div
        className="border border-zinc-600 rounded-lg overflow-auto scrollbar-thin scrollbar-thumb-zinc-500 scrollbar-track-zinc-800 hover:scrollbar-thumb-zinc-400"
        style={{
          maxHeight,
          minHeight: '400px',
          scrollbarWidth: 'thin',
          scrollbarColor: '#9CA3AF #F3F4F6'
        }}
      >
        <table className={`${getColorClasses()} min-w-full`}>
          {renderHeader()}
          {renderBody()}
          {renderFooter()}
        </table>
      </div>

      {/* Selection Info */}
      {selectable && selectedRows.size > 0 && (
        <div className="mt-4 text-sm text-zinc-400">
          {selectedRows.size} of {sortedData.length} rows selected
        </div>
      )}
    </div>
  );
}

export default Table;