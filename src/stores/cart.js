import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    isVisible: false
  }),
  
  getters: {
    totalCount: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: (state) => state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    selectedItems: (state) => state.items.filter(item => item.selected)
  },
  
  actions: {
    addItem(product, quantity = 1) {
      const existingItem = this.items.find(item => item.product.id === product.id)
      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        this.items.push({
          product,
          quantity,
          selected: true
        })
      }
      this.saveToLocalStorage()
    },
    
    removeItem(productId) {
      const index = this.items.findIndex(item => item.product.id === productId)
      if (index > -1) {
        this.items.splice(index, 1)
        this.saveToLocalStorage()
      }
    },
    
    updateQuantity(productId, quantity) {
      const item = this.items.find(item => item.product.id === productId)
      if (item) {
        item.quantity = quantity
        if (quantity <= 0) {
          this.removeItem(productId)
        } else {
          this.saveToLocalStorage()
        }
      }
    },
    
    clearCart() {
      this.items = []
      this.saveToLocalStorage()
    },
    
    toggleItemSelection(productId) {
      const item = this.items.find(item => item.product.id === productId)
      if (item) {
        item.selected = !item.selected
        this.saveToLocalStorage()
      }
    },
    
    saveToLocalStorage() {
      localStorage.setItem('cart', JSON.stringify(this.items))
    },
    
    loadFromLocalStorage() {
      const saved = localStorage.getItem('cart')
      if (saved) {
        this.items = JSON.parse(saved)
      }
    }
  }
})