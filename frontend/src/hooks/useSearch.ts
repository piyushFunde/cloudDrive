import { useQuery } from '@tanstack/react-query'
import { searchService } from '../services/searchService'
import { useState, useEffect } from 'react'

export function useSearch(initialQuery = '', type?: string) {
  const [query, setQuery] = useState(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query)
    }, 400) // 400ms debounce
    return () => clearTimeout(handler)
  }, [query])

  const searchQuery = useQuery({
    queryKey: ['search', debouncedQuery, type],
    queryFn: () => searchService.search(debouncedQuery, type),
    enabled: debouncedQuery.trim().length >= 2,
  })

  return {
    query,
    setQuery,
    results: searchQuery.data || { files: [], folders: [] },
    isSearching: searchQuery.isLoading,
    error: searchQuery.error,
  }
}
