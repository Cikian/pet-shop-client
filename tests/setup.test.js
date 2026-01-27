import { describe, it, expect } from 'vitest'

describe('Project Setup', () => {
  it('should have basic test environment working', () => {
    expect(true).toBe(true)
  })
  
  it('should have access to DOM environment', () => {
    expect(typeof document).toBe('object')
    expect(typeof window).toBe('object')
  })
})