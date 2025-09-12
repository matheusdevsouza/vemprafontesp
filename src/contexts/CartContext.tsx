'use client'

import React, { createContext, useContext, useReducer, useEffect, useState } from 'react'
import { CartItem, Product } from '@/types'

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number; size?: string; image?: string } }
  | { type: 'REMOVE_ITEM'; payload: { productId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] }

const CartContext = createContext<{
  state: CartState
  addItem: (product: Product, quantity?: number, size?: string, image?: string) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getItemQuantity: (productId: string) => number
  isCartSidebarOpen: boolean
  setIsCartSidebarOpen: (open: boolean) => void
} | null>(null)

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity = 1, size, image } = action.payload
      // Procurar item existente pelo id, tamanho e imagem
      const existingItem = state.items.find(item => item.product.id === product.id && item.size === size && item.image === image)
      let newItems: CartItem[]
      if (existingItem) {
        newItems = state.items.map(item =>
          item.product.id === product.id && item.size === size && item.image === image
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        const newItem: CartItem = {
          id: `${product.id}_${size || 'Único'}_${Date.now()}`,
          product,
          quantity,
          price: product.price,
          size,
          image
        }
        newItems = [...state.items, newItem]
      }
      const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
      return {
        items: newItems,
        total: newTotal,
        itemCount: newItemCount
      }
    }
    
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.product.id !== action.payload.productId)
      const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
      
      return {
        items: newItems,
        total: newTotal,
        itemCount: newItemCount
      }
    }
    
    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload
      
      if (quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: { productId } })
      }
      
      const newItems = state.items.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
      
      const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
      
      return {
        items: newItems,
        total: newTotal,
        itemCount: newItemCount
      }
    }
    
    case 'CLEAR_CART':
      return {
        items: [],
        total: 0,
        itemCount: 0
      }
    
    case 'LOAD_CART': {
      const items = action.payload
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
      
      return {
        items,
        total,
        itemCount
      }
    }
    
    default:
      return state
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0
  })
  
  const [isCartSidebarOpen, setIsCartSidebarOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Verificar se estamos no browser
    if (typeof window !== 'undefined') {
    const savedCart = localStorage.getItem('vemprafonte_cart')
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart)
                  // Verificar se é o formato antigo (apenas items) ou novo (estado completo)
        if (Array.isArray(cartData)) {
          // Formato antigo - apenas items
          try {
            const restoredItems = restoreCartFromStorage(cartData)
            if (restoredItems.length > 0) {
              dispatch({ type: 'LOAD_CART', payload: restoredItems })
            }
          } catch (error) {
            console.error('Erro ao restaurar carrinho:', error)
            localStorage.removeItem('vemprafonte_cart')
          }
        } else if (cartData.items && Array.isArray(cartData.items)) {
          // Formato novo - estado completo
          try {
            const restoredItems = restoreCartFromStorage(cartData.items)
            if (restoredItems.length > 0) {
              dispatch({ type: 'LOAD_CART', payload: restoredItems })
            }
          } catch (error) {
            console.error('Erro ao restaurar carrinho:', error)
            localStorage.removeItem('vemprafonte_cart')
          }
        }
      } catch (error) {
        console.error('Erro ao carregar carrinho:', error)
          // Limpar localStorage corrompido
          localStorage.removeItem('vemprafonte_cart')
        }
      }
      setIsLoaded(true)
    }
  }, [])

  // Função para sanitizar dados do carrinho antes de salvar
  const sanitizeCartForStorage = (cartItems: CartItem[]) => {
    return cartItems.map(item => {
      // Verificar se o item e produto são válidos
      if (!item || !item.product) {
        console.warn('Item inválido encontrado no carrinho:', item)
        return null
      }

      return {
        ...item,
        product: {
          ...item.product,
          createdAt: (() => {
            try {
              if (item.product.createdAt instanceof Date && !isNaN(item.product.createdAt.getTime())) {
                return item.product.createdAt.toISOString()
              } else if (typeof item.product.createdAt === 'string') {
                return item.product.createdAt
              } else {
                return new Date().toISOString()
              }
            } catch (error) {
              console.warn('Erro ao processar createdAt:', error)
              return new Date().toISOString()
            }
          })(),
          updatedAt: (() => {
            try {
              if (item.product.updatedAt instanceof Date && !isNaN(item.product.updatedAt.getTime())) {
                return item.product.updatedAt.toISOString()
              } else if (typeof item.product.updatedAt === 'string') {
                return item.product.updatedAt
              } else {
                return new Date().toISOString()
              }
            } catch (error) {
              console.warn('Erro ao processar updatedAt:', error)
              return new Date().toISOString()
            }
          })()
        }
      }
    }).filter(Boolean) // Remove itens nulos
  }

  // Função para restaurar dados do carrinho do localStorage
  const restoreCartFromStorage = (cartData: any[]): CartItem[] => {
    return cartData.map(item => {
      // Verificar se o item e produto são válidos
      if (!item || !item.product) {
        console.warn('Item inválido encontrado no localStorage:', item)
        return null
      }

      return {
        ...item,
        product: {
          ...item.product,
          createdAt: (() => {
            try {
              const date = new Date(item.product.createdAt)
              return isNaN(date.getTime()) ? new Date() : date
            } catch (error) {
              console.warn('Erro ao restaurar createdAt:', error)
              return new Date()
            }
          })(),
          updatedAt: (() => {
            try {
              const date = new Date(item.product.updatedAt)
              return isNaN(date.getTime()) ? new Date() : date
            } catch (error) {
              console.warn('Erro ao restaurar updatedAt:', error)
              return new Date()
            }
          })()
        }
      }
    }).filter(Boolean) // Remove itens nulos
  }

  useEffect(() => {
    // Salvar estado completo do carrinho apenas se já foi carregado
    if (isLoaded && typeof window !== 'undefined') {
      const sanitizedItems = sanitizeCartForStorage(state.items)
      const cartData = {
        items: sanitizedItems,
        total: state.total,
        itemCount: state.itemCount,
        lastUpdated: new Date().toISOString()
      }
      
      localStorage.setItem('vemprafonte_cart', JSON.stringify(cartData))
    }
  }, [state, isLoaded])

  const addItem = (product: Product, quantity: number = 1, size?: string, image?: string) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity, size, image } })
  }

  const removeItem = (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId } })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
    // Limpar também do localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vemprafonte_cart')
    }
  }

  const getItemQuantity = (productId: string): number => {
    const item = state.items.find(item => item.product.id === productId)
    return item ? item.quantity : 0
  }

  return (
    <CartContext.Provider value={{
      state,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getItemQuantity,
      isCartSidebarOpen,
      setIsCartSidebarOpen
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart deve ser usado dentro de um CartProvider')
  }
  return context
} 