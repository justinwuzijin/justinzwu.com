'use client'

import { useState, useCallback, useEffect } from 'react'

export interface SelectionState {
  selectedIds: Set<string>
  isMultiSelect: boolean
}

export function useCollageSelection() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  
  const select = useCallback((id: string, addToSelection = false) => {
    setSelectedIds(prev => {
      if (addToSelection) {
        const next = new Set(prev)
        if (next.has(id)) {
          next.delete(id)
        } else {
          next.add(id)
        }
        return next
      }
      return new Set([id])
    })
  }, [])

  const selectMultiple = useCallback((ids: string[], addToSelection = false) => {
    setSelectedIds(prev => {
      if (addToSelection) {
        const next = new Set(prev)
        ids.forEach(id => next.add(id))
        return next
      }
      return new Set(ids)
    })
  }, [])

  const selectAll = useCallback((allIds: string[]) => {
    setSelectedIds(new Set(allIds))
  }, [])

  const deselect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const isSelected = useCallback((id: string) => {
    return selectedIds.has(id)
  }, [selectedIds])

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const deleteSelected = useCallback(() => {
    const idsToDelete = Array.from(selectedIds)
    setSelectedIds(new Set())
    return idsToDelete
  }, [selectedIds])

  return {
    selectedIds,
    selectedCount: selectedIds.size,
    hasSelection: selectedIds.size > 0,
    isMultiSelection: selectedIds.size > 1,
    select,
    selectMultiple,
    selectAll,
    deselect,
    deselectAll,
    isSelected,
    toggleSelection,
    deleteSelected,
  }
}
