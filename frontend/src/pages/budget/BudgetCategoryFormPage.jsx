import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import PageHeader from '../../components/PageHeader'
import { useCreateCategory, useUpdateCategory } from '../../hooks/useBudget'
import { getCategory } from '../../api/budget'
import { useQuery } from '@tanstack/react-query'

const schema = z.object({
  category: z.string().min(1, 'Category name is required'),
  estimated_amount: z.coerce.number().min(0, 'Must be positive'),
  notes: z.string().optional(),
})

export default function BudgetCategoryFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const { data: category } = useQuery({
    queryKey: ['budget', 'categories', id],
    queryFn: () => getCategory(id),
    enabled: !!id,
  })

  const create = useCreateCategory()
  const update = useUpdateCategory()

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (category) reset(category)
  }, [category, reset])

  const onSubmit = (data) => {
    const payload = { ...data, notes: data.notes || null }
    if (isEdit) {
      update.mutate({ id, data: payload }, { onSuccess: () => navigate('/budget') })
    } else {
      create.mutate(payload, { onSuccess: () => navigate('/budget') })
    }
  }

  const saving = create.isPending || update.isPending
  const error = create.error || update.error

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Category' : 'New Budget Category'}
        backTo="/budget"
        action={
          <button form="cat-form" type="submit" disabled={saving} className="px-4 py-1.5 rounded-full bg-primary-600 text-white text-sm font-medium disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
        }
      />

      <form id="cat-form" onSubmit={handleSubmit(onSubmit)} className="px-4 md:px-6 lg:px-8 py-4 space-y-4 max-w-2xl">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">
            {error?.response?.data?.detail || 'Something went wrong'}
          </p>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Category Name *</label>
          <input {...register('category')} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="e.g. Photography & Videography" />
          {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Estimated Amount *</label>
          <input {...register('estimated_amount')} type="number" step="0.01" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="300000" />
          {errors.estimated_amount && <p className="text-xs text-red-500 mt-1">{errors.estimated_amount.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
          <textarea {...register('notes')} rows={2} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
        </div>
      </form>
    </div>
  )
}
