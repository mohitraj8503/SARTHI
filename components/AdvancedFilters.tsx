'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Save, Share, X, ChevronDown, Star, StarOff, Search, Calendar, User, BookOpen } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

interface FilterCriteria {
  field: string;
  operator: string;
  value: any;
}

interface SavedFilter {
  id: string;
  name: string;
  entityType: string;
  filters: FilterCriteria[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  ownerId: string;
  isShared: boolean;
  isDefault: boolean;
  createdAt: string;
}

interface AdvancedFiltersProps {
  entityType: 'students' | 'teachers' | 'courses' | 'enrollments';
  currentFilters: FilterCriteria[];
  onFiltersChange: (filters: FilterCriteria[]) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  totalResults: number;
}

export default function AdvancedFilters({
  entityType,
  currentFilters,
  onFiltersChange,
  sortBy,
  sortOrder,
  onSortChange,
  totalResults
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [isShared, setIsShared] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  // Available filter fields based on entity type
  const getFilterFields = () => {
    switch (entityType) {
      case 'students':
        return [
          { key: 'name', label: 'Name', type: 'text', icon: User },
          { key: 'email', label: 'Email', type: 'text', icon: User },
          { key: 'enrollments', label: 'Enrollments', type: 'number', icon: BookOpen },
          { key: 'createdAt', label: 'Joined Date', type: 'date', icon: Calendar },
          { key: 'role', label: 'Role', type: 'select', options: ['STUDENT', 'INSTRUCTOR', 'ADMIN'] }
        ];
      case 'courses':
        return [
          { key: 'title', label: 'Title', type: 'text', icon: BookOpen },
          { key: 'category', label: 'Category', type: 'text', icon: BookOpen },
          { key: 'price', label: 'Price', type: 'number', icon: BookOpen },
          { key: 'enrollments', label: 'Enrollments', type: 'number', icon: User },
          { key: 'createdAt', label: 'Created Date', type: 'date', icon: Calendar }
        ];
      default:
        return [];
    }
  };

  const operators = {
    text: ['contains', 'equals', 'starts_with', 'ends_with'],
    number: ['equals', 'greater_than', 'less_than', 'between'],
    date: ['equals', 'before', 'after', 'between'],
    select: ['equals', 'not_equals']
  };

  const fetchSavedFilters = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/saved-filters?entityType=${entityType}`);
      if (response.ok) {
        const data = await response.json();
        setSavedFilters(data.filters || []);
      }
    } catch (error) {
      console.error('Failed to fetch saved filters:', error);
    }
  }, [entityType]);

  useEffect(() => {
    fetchSavedFilters();
  }, [entityType, fetchSavedFilters]);


  const addFilter = () => {
    const newFilter: FilterCriteria = {
      field: getFilterFields()[0].key,
      operator: operators.text[0],
      value: ''
    };
    onFiltersChange([...currentFilters, newFilter]);
  };

  const updateFilter = (index: number, updates: Partial<FilterCriteria>) => {
    const newFilters = [...currentFilters];
    newFilters[index] = { ...newFilters[index], ...updates };
    onFiltersChange(newFilters);
  };

  const removeFilter = (index: number) => {
    const newFilters = currentFilters.filter((_, i) => i !== index);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange([]);
  };

  const saveFilter = async () => {
    if (!filterName.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/admin/saved-filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: filterName,
          entityType,
          filters: currentFilters,
          sortBy,
          sortOrder,
          isShared
        })
      });

      if (response.ok) {
        addToast({
          type: 'success',
          title: 'Filter Saved',
          message: `"${filterName}" has been saved successfully`,
          duration: 3000
        });
        setShowSaveDialog(false);
        setFilterName('');
        setIsShared(false);
        fetchSavedFilters();
      } else {
        throw new Error('Failed to save filter');
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: 'Could not save the filter',
        duration: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSavedFilter = (filter: SavedFilter) => {
    onFiltersChange(filter.filters);
    if (filter.sortBy && onSortChange) {
      onSortChange(filter.sortBy, filter.sortOrder || 'asc');
    }
    setIsOpen(false);
    addToast({
      type: 'info',
      title: 'Filter Applied',
      message: `Applied "${filter.name}" filter`,
      duration: 2000
    });
  };

  const toggleFavorite = async (filterId: string, isDefault: boolean) => {
    try {
      const response = await fetch(`/api/admin/saved-filters/${filterId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: !isDefault })
      });

      if (response.ok) {
        setSavedFilters(prev =>
          prev.map(f => f.id === filterId ? { ...f, isDefault: !isDefault } : f)
        );
        addToast({
          type: 'success',
          title: isDefault ? 'Removed from Favorites' : 'Added to Favorites',
          message: isDefault ? 'Filter removed from default view' : 'Filter set as default view',
          duration: 2000
        });
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Could not update filter',
        duration: 3000
      });
    }
  };

  const fields = getFilterFields();

  return (
    <div className="relative">
      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${currentFilters.length > 0
          ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
      >
        <Filter className="w-4 h-4" />
        <span>Filters</span>
        {currentFilters.length > 0 && (
          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
            {currentFilters.length}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Filter Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full mt-2 right-0 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Advanced Filters</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSaveDialog(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    <Save className="w-3 h-3" />
                    Save
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Saved Filters */}
              {savedFilters.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Saved Filters</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {savedFilters.map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => loadSavedFilter(filter)}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {filter.name}
                          </span>
                          {filter.isShared && (
                            <Share className="w-3 h-3 text-blue-500" />
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(filter.id, filter.isDefault);
                          }}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        >
                          {filter.isDefault ? (
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          ) : (
                            <StarOff className="w-3 h-3 text-gray-400" />
                          )}
                        </button>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Filters */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Active Filters ({currentFilters.length})
                  </h4>
                  {currentFilters.length > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {currentFilters.map((filter, index) => {
                  const field = fields.find(f => f.key === filter.field);
                  const Icon = field?.icon || Filter;

                  return (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <Icon className="w-4 h-4 text-gray-500" />
                      <select
                        value={filter.field}
                        onChange={(e) => updateFilter(index, { field: e.target.value, operator: operators[(fields.find(f => f.key === e.target.value)?.type || 'text') as keyof typeof operators][0] })}
                        className="flex-1 px-2 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-600"
                      >
                        {fields.map(field => (
                          <option key={field.key} value={field.key}>{field.label}</option>
                        ))}
                      </select>
                      <select
                        value={filter.operator}
                        onChange={(e) => updateFilter(index, { operator: e.target.value })}
                        className="px-2 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-600"
                      >
                        {operators[(field?.type || 'text') as keyof typeof operators].map((op: string) => (
                          <option key={op} value={op}>
                            {op.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                          </option>
                        ))}
                      </select>
                      <input
                        type={field?.type === 'number' ? 'number' : field?.type === 'date' ? 'date' : 'text'}
                        value={filter.value}
                        onChange={(e) => updateFilter(index, { value: e.target.value })}
                        placeholder="Value"
                        className="flex-1 px-2 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-600"
                      />
                      <button
                        onClick={() => removeFilter(index)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                      >
                        <X className="w-3 h-3 text-red-500" />
                      </button>
                    </div>
                  );
                })}

                <button
                  onClick={addFilter}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-sm font-medium text-gray-600 dark:text-gray-400"
                >
                  <Filter className="w-4 h-4" />
                  Add Filter
                </button>
              </div>

              {/* Results Summary */}
              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                Showing {totalResults.toLocaleString()} results
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Filter Dialog */}
      <AnimatePresence>
        {showSaveDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setShowSaveDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Save Filter</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Filter Name
                  </label>
                  <input
                    type="text"
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    placeholder="My Custom Filter"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                  />
                </div>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isShared}
                    onChange={(e) => setIsShared(e.target.checked)}
                    className="rounded border-gray-300 text-brand-orange focus:ring-brand-orange"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Share with other admins</span>
                </label>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={saveFilter}
                  disabled={!filterName.trim() || loading}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  {loading ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Filter
                </button>
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

