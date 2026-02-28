import api from './client'

// Each lookup type has its own top-level endpoint (no /lookups prefix)
export const getLookup = (tableName) =>
  api.get(`/${tableName}`).then((r) => r.data)

export const createLookup = (tableName, data) =>
  api.post(`/${tableName}`, data).then((r) => r.data)

export const updateLookup = (tableName, id, data) =>
  api.put(`/${tableName}/${id}`, data).then((r) => r.data)

export const deleteLookup = (tableName, id) =>
  api.delete(`/${tableName}/${id}`).then((r) => r.data)

// Convenience aliases
export const getEventTypes = () => getLookup('event-types')
export const getVendorCategories = () => getLookup('vendor-categories')
export const getDietaryPreferences = () => getLookup('dietary-preferences')
export const getGiftTypes = () => getLookup('gift-types')
export const getRelationTypes = () => getLookup('relation-types')
export const getFamilyGroups = () => getLookup('family-groups')
