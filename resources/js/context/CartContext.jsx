import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import { adaptCartItem } from '../services/adapters'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const applyCartPayload = useCallback((payload) => {
    const data = payload?.data ?? {}
    setItems((data.items ?? []).map(adaptCartItem))
  }, [])

  const refresh = useCallback(async () => {
    try {
      const res = await api.cart()
      applyCartPayload(res)
    } catch {
      setItems([])
    }
  }, [applyCartPayload])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const addItem = useCallback(
    async ({ productId, variantId, quantity = 1 }) => {
      const res = await api.addToCart({
        product_id: productId,
        variant_id: variantId ?? null,
        quantity,
      })
      applyCartPayload(res)
      return res
    },
    [applyCartPayload]
  )

  const updateItem = useCallback(
    async (id, quantity) => {
      const res = await api.updateCartItem(id, quantity)
      applyCartPayload(res)
      return res
    },
    [applyCartPayload]
  )

  const removeItem = useCallback(
    async (id) => {
      const res = await api.removeCartItem(id)
      applyCartPayload(res)
      return res
    },
    [applyCartPayload]
  )

  const clear = useCallback(async () => {
    await api.clearCart()
    setItems([])
  }, [])

  const count = useMemo(() => items.reduce((sum, it) => sum + it.quantity, 0), [items])
  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + it.price * it.quantity, 0),
    [items]
  )

  const value = useMemo(
    () => ({ items, loading, count, subtotal, addItem, updateItem, removeItem, clear, refresh }),
    [items, loading, count, subtotal, addItem, updateItem, removeItem, clear, refresh]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
