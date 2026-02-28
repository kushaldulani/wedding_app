import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as budgetApi from '../api/budget'

// Budget Categories
export function useBudgetCategories() {
  return useQuery({
    queryKey: ['budget', 'categories'],
    queryFn: budgetApi.getCategories,
  })
}

export function useBudgetOverview() {
  return useQuery({
    queryKey: ['budget', 'overview'],
    queryFn: budgetApi.getBudgetOverview,
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: budgetApi.createCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budget'] }),
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => budgetApi.updateCategory(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budget'] }),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: budgetApi.deleteCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budget'] }),
  })
}

// Expenses
export function useExpenses(params) {
  return useQuery({
    queryKey: ['budget', 'expenses', params],
    queryFn: () => budgetApi.getExpenses(params),
  })
}

export function useCreateExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: budgetApi.createExpense,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budget'] }),
  })
}

export function useUpdateExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => budgetApi.updateExpense(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budget'] }),
  })
}

export function useDeleteExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: budgetApi.deleteExpense,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budget'] }),
  })
}
