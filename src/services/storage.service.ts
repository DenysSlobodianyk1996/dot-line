export const StorageService = {
  // objects are stored as JSON, strings as they are
  setItem(key: string, value: object | string) {
    const saveValue = typeof value === 'object' ? JSON.stringify(value) : value
    localStorage.setItem(key, saveValue)
  },
  getItem(key: string, { applyParse }: { applyParse?: boolean } = {}) {
    const value = localStorage.getItem(key)
    try {
      return applyParse && value ? JSON.parse(value) : value
    } catch {
      return null
    }
  },
  removeItem(key: string) {
    localStorage.removeItem(key)
  },
}
