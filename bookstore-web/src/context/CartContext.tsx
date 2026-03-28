import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

// Keys for sessionStorage so we don't clash with other sites in the same tab.
const CART_KEY = 'bookstore-cart-v1'
const RETURN_KEY = 'bookstore-return-v1'

export interface CartLine {
  bookId: number
  title: string
  unitPrice: number
  quantity: number
}

export interface BookForCart {
  bookId: number
  title: string
  price: number
}

// Pull cart from the browser session (or start empty if nothing saved / bad data).
function loadCart(): CartLine[] {
  try {
    const raw = sessionStorage.getItem(CART_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (x): x is CartLine =>
        typeof x === 'object' &&
        x !== null &&
        typeof (x as CartLine).bookId === 'number' &&
        typeof (x as CartLine).title === 'string' &&
        typeof (x as CartLine).unitPrice === 'number' &&
        typeof (x as CartLine).quantity === 'number'
    )
  } catch {
    return []
  }
}

// Remember which catalog URL (query string) to go back to for "continue shopping".
function loadReturnSearch(): string {
  try {
    return sessionStorage.getItem(RETURN_KEY) ?? ''
  } catch {
    return ''
  }
}

interface CartContextValue {
  lines: CartLine[]
  returnSearch: string
  itemCount: number
  grandTotal: number
  lineSubtotal: (line: CartLine) => number
  addItem: (book: BookForCart, catalogSearchParams: string) => void
  setQuantity: (bookId: number, quantity: number) => void
  removeLine: (bookId: number) => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(loadCart)
  const [returnSearch, setReturnSearch] = useState<string>(loadReturnSearch)

  // Keep the cart in sync with sessionStorage whenever lines change.
  useEffect(() => {
    try {
      sessionStorage.setItem(CART_KEY, JSON.stringify(lines))
    } catch {
      // Storage might be full or blocked — cart still works until refresh.
    }
  }, [lines])

  useEffect(() => {
    try {
      sessionStorage.setItem(RETURN_KEY, returnSearch)
    } catch {
      // Same idea: don't crash if we can't write.
    }
  }, [returnSearch])

  const lineSubtotal = useCallback((line: CartLine) => line.unitPrice * line.quantity, [])

  const itemCount = useMemo(
    () => lines.reduce((sum, l) => sum + l.quantity, 0),
    [lines]
  )

  const grandTotal = useMemo(
    () => lines.reduce((sum, l) => sum + lineSubtotal(l), 0),
    [lines, lineSubtotal]
  )

  // Bump qty if the book is already in the cart, otherwise add a new line.
  const addItem = useCallback((book: BookForCart, catalogSearchParams: string) => {
    setReturnSearch(catalogSearchParams)
    setLines((prev) => {
      const i = prev.findIndex((l) => l.bookId === book.bookId)
      if (i >= 0) {
        const next = [...prev]
        next[i] = {
          ...next[i],
          quantity: next[i].quantity + 1,
        }
        return next
      }
      return [
        ...prev,
        {
          bookId: book.bookId,
          title: book.title,
          unitPrice: book.price,
          quantity: 1,
        },
      ]
    })
  }, [])

  const setQuantity = useCallback((bookId: number, quantity: number) => {
    const q = Math.max(0, Math.floor(quantity))
    setLines((prev) => {
      if (q === 0) return prev.filter((l) => l.bookId !== bookId)
      return prev.map((l) =>
        l.bookId === bookId ? { ...l, quantity: q } : l
      )
    })
  }, [])

  const removeLine = useCallback((bookId: number) => {
    setLines((prev) => prev.filter((l) => l.bookId !== bookId))
  }, [])

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      returnSearch,
      itemCount,
      grandTotal,
      lineSubtotal,
      addItem,
      setQuantity,
      removeLine,
    }),
    [
      lines,
      returnSearch,
      itemCount,
      grandTotal,
      lineSubtotal,
      addItem,
      setQuantity,
      removeLine,
    ]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
