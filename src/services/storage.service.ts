export const StorageService = {
  setItem(key: string, value: Object) {
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
