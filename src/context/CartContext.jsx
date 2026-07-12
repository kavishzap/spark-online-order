import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { validateRefillGiftCard } from '../config/giftCards'
import {
  BOTTLE_FREE_DELIVERY_MESSAGE,
  GIFT_REFILL_DELIVERY_FEE,
  buildCartLineId,
  calculateDeliveryFee,
  countBottles,
  giftRefillLineId,
  shouldShowBottleDeliveryNote,
  isGiftRefillLineId,
  isRefillProduct,
} from '../config/products'
import { productHasColors } from '../utils/colors'

const STORAGE_KEY = 'sodamax-cart'

const CartContext = createContext(null)

function stripCartItemForStorage({ image_base64, ...item }) {
  return item
}

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return {
        items: [],
        refillGiftCardCode: '',
      }
    }
    const parsed = JSON.parse(raw)
    const items = Array.isArray(parsed.items)
      ? parsed.items.map(stripCartItemForStorage)
      : []
    return {
      items,
      refillGiftCardCode: parsed.refillGiftCardCode ?? '',
    }
  } catch {
    return {
      items: [],
      refillGiftCardCode: '',
    }
  }
}

function saveCart({ items, refillGiftCardCode }) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        items: items.map(stripCartItemForStorage),
        refillGiftCardCode,
      }),
    )
  } catch {
    // Images must not be persisted — cart still works in memory for this session.
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => loadCart().items)
  const [refillGiftCardCode, setRefillGiftCardCode] = useState(
    () => loadCart().refillGiftCardCode,
  )
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [refillBannerMessage, setRefillBannerMessage] = useState(null)
  const [cartToast, setCartToast] = useState(null)
  const cartToastTimerRef = useRef(null)

  const dismissCartToast = useCallback(() => {
    if (cartToastTimerRef.current) {
      clearTimeout(cartToastTimerRef.current)
      cartToastTimerRef.current = null
    }
    setCartToast(null)
  }, [])

  const showCartToast = useCallback(
    (productName) => {
      if (cartToastTimerRef.current) {
        clearTimeout(cartToastTimerRef.current)
      }
      setCartToast({ productName })
      cartToastTimerRef.current = setTimeout(() => {
        setCartToast(null)
        cartToastTimerRef.current = null
      }, 2000)
    },
    [],
  )

  useEffect(
    () => () => {
      if (cartToastTimerRef.current) {
        clearTimeout(cartToastTimerRef.current)
      }
    },
    [],
  )

  const hasGiftRefill = useMemo(
    () => items.some((item) => item.isGiftRefill),
    [items],
  )

  const hasPaidRefill = useMemo(
    () => items.some((item) => !item.isGiftRefill && isRefillProduct(item)),
    [items],
  )

  useEffect(() => {
    saveCart({ items, refillGiftCardCode })
  }, [items, refillGiftCardCode])

  const addToCart = useCallback(
    (product, selectedColor = null) => {
      if (isRefillProduct(product) && hasGiftRefill) {
        setRefillBannerMessage({
          type: 'error',
          text: 'You already have a gift-card refill in your cart. Remove it first to order a paid refill.',
        })
        return false
      }

      if (productHasColors(product) && !selectedColor) {
        return false
      }

      const lineId = buildCartLineId(product.id, { color: selectedColor })

      setItems((prev) => {
        const existing = prev.find((item) => item.id === lineId && !item.isGiftRefill)
        if (existing) {
          return prev.map((item) =>
            item.id === lineId && !item.isGiftRefill
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          )
        }
        return [
          ...prev,
          {
            id: lineId,
            productId: product.id,
            name: product.name,
            price: Number(product.price),
            quantity: 1,
            isGiftRefill: false,
            color: selectedColor,
          },
        ]
      })
      showCartToast(product.name)
      return true
    },
    [hasGiftRefill, showCartToast],
  )

  const redeemGiftRefill = useCallback(
    (product, code) => {
      const result = validateRefillGiftCard(code)

      if (!result.valid) {
        setRefillBannerMessage({
          type: 'error',
          text: 'Invalid gift card code. Please check and try again.',
        })
        return false
      }

      if (hasPaidRefill) {
        setRefillBannerMessage({
          type: 'error',
          text: 'Remove the paid refill from your cart before redeeming a gift-card refill.',
        })
        return false
      }

      const lineId = giftRefillLineId(product.id)
      const alreadyInCart = items.some((item) => item.id === lineId)

      if (alreadyInCart) {
        setRefillBannerMessage({
          type: 'error',
          text: 'Your free gift-card refill is already in the cart (limit 1 per order).',
        })
        return false
      }

      setItems((prev) => [
        ...prev,
        {
          id: lineId,
          productId: product.id,
          name: `${product.name} (Gift Card)`,
          price: 0,
          quantity: 1,
          isGiftRefill: true,
        },
      ])

      setRefillGiftCardCode(result.code)
      setRefillBannerMessage({
        type: 'success',
        text: `${result.label} added! Delivery fee ${GIFT_REFILL_DELIVERY_FEE} applies at checkout.`,
      })
      return true
    },
    [hasPaidRefill, items],
  )

  const removeFromCart = useCallback((lineId) => {
    setItems((prev) => {
      const next = prev.filter((item) => item.id !== lineId)
      if (isGiftRefillLineId(lineId)) {
        setRefillGiftCardCode('')
        setRefillBannerMessage(null)
      }
      return next
    })
  }, [])

  const updateQuantity = useCallback((lineId, quantity) => {
    if (quantity < 1) return
    if (isGiftRefillLineId(lineId)) return

    setItems((prev) =>
      prev.map((item) =>
        item.id === lineId ? { ...item, quantity } : item,
      ),
    )
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    setRefillGiftCardCode('')
    setRefillBannerMessage(null)
  }, [])

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  )

  const deliveryFee = useMemo(
    () => calculateDeliveryFee(items, hasGiftRefill),
    [items, hasGiftRefill],
  )

  const bottleCount = useMemo(() => countBottles(items), [items])

  const showBottleDeliveryNote = useMemo(
    () => shouldShowBottleDeliveryNote(items),
    [items],
  )

  const total = useMemo(
    () => subtotal + deliveryFee,
    [subtotal, deliveryFee],
  )

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  )

  const openCart = useCallback(() => setIsCartOpen(true), [])
  const closeCart = useCallback(() => setIsCartOpen(false), [])

  const value = {
    items,
    itemCount,
    subtotal,
    deliveryFee,
    bottleCount,
    showBottleDeliveryNote,
    bottleFreeDeliveryMessage: BOTTLE_FREE_DELIVERY_MESSAGE,
    total,
    hasGiftRefill,
    refillGiftCardCode,
    refillBannerMessage,
    isCartOpen,
    cartToast,
    dismissCartToast,
    addToCart,
    redeemGiftRefill,
    removeFromCart,
    updateQuantity,
    clearCart,
    openCart,
    closeCart,
    setRefillBannerMessage,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
