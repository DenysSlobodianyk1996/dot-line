import { afterEach } from 'vitest'
import { enableAutoUnmount } from '@vue/test-utils'

// each test starts with an empty localStorage and nothing left mounted
enableAutoUnmount(afterEach)

afterEach(() => {
  localStorage.clear()
})
