import { useState, useCallback } from 'react';
import type { SearchResult } from '../types';
import { apiService } from '../services/api.service';

interface UseSearchReturn {
  searchResult: SearchResult | null;
  loading: boolean;
  error: string | null;
  search: (problem: string, stores: string[], maxPrice: string, location: string) => Promise<void>;
  clearResults: () => void;
  clearError: () => void;
}

/**
 * Custom hook for managing search state and operations
 */
export function useSearch(): UseSearchReturn {
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (
    problem: string,
    stores: string[],
    maxPrice: string,
    location: string
  ) => {
    if (!problem.trim()) {
      setError('Problem description is required');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await apiService.findSolutions(problem, stores, maxPrice, location);
      setSearchResult(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      setSearchResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setSearchResult(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    searchResult,
    loading,
    error,
    search,
    clearResults,
    clearError
  };
}

export default useSearch; 