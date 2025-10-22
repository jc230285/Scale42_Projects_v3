'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Button } from '@/components';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

export interface User {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface UserSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (users: User[]) => void;
  selectedUserIds?: string[];
  multiple?: boolean;
  title?: string;
}

function UserSelectorModal({
  isOpen,
  onClose,
  onSelect,
  selectedUserIds = [],
  multiple = false,
  title = 'Select User',
}: UserSelectorModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(selectedUserIds));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      setSelectedIds(new Set(selectedUserIds));
    }
  }, [isOpen, selectedUserIds]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.email.toLowerCase().includes(searchLower) ||
      user.display_name?.toLowerCase().includes(searchLower)
    );
  });

  const handleToggleUser = (userId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      if (multiple) {
        newSelected.add(userId);
      } else {
        newSelected.clear();
        newSelected.add(userId);
      }
    }
    setSelectedIds(newSelected);
  };

  const handleConfirm = () => {
    const selectedUsers = users.filter(u => selectedIds.has(u.id));
    onSelect(selectedUsers);
    onClose();
  };

  const handleClear = () => {
    setSelectedIds(new Set());
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>

        {/* Selected Count */}
        {multiple && selectedIds.size > 0 && (
          <div className="flex items-center justify-between px-3 py-2 bg-blue-900/20 border border-blue-800 rounded-lg">
            <span className="text-sm text-zinc-300">
              {selectedIds.size} user{selectedIds.size !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={handleClear}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Clear all
            </button>
          </div>
        )}

        {/* User List */}
        <div className="max-h-96 overflow-y-auto border border-zinc-700 rounded-lg">
          {loading ? (
            <div className="p-8 text-center text-zinc-400">
              Loading users...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-400">
              {error}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-zinc-400">
              No users found
            </div>
          ) : (
            <div className="divide-y divide-zinc-700">
              {filteredUsers.map((user) => {
                const isSelected = selectedIds.has(user.id);
                return (
                  <button
                    key={user.id}
                    onClick={() => handleToggleUser(user.id)}
                    className={`
                      w-full px-4 py-3 flex items-center gap-3 hover:bg-zinc-800 transition-colors
                      ${isSelected ? 'bg-blue-900/30' : ''}
                    `}
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.display_name || user.email}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-zinc-300 font-medium">
                          {(user.display_name || user.email).charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 text-left">
                      <div className="font-medium text-zinc-100">
                        {user.display_name || 'Unnamed User'}
                      </div>
                      <div className="text-sm text-zinc-400">{user.email}</div>
                    </div>

                    {/* Checkbox/Radio */}
                    <div className="flex-shrink-0">
                      {multiple ? (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-5 h-5 rounded border-zinc-600 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <input
                          type="radio"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-5 h-5 border-zinc-600 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button onClick={handleConfirm} className="flex-1" disabled={selectedIds.size === 0}>
            Confirm {selectedIds.size > 0 && `(${selectedIds.size})`}
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default UserSelectorModal;
