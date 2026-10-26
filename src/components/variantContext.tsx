import { createContext, useContext, useState, type ReactNode } from 'react'

export const VARIANT_EMPTY_PICK = '1.1'
export const VARIANT_CATEGORIES = '1.2'
export const VARIANT_EMPTY = '1.3'
export const VARIANT_FEW = '2.1'
export const VARIANT_FEW_SCROLL = '2.1.1'
export const VARIANT_FEW_PLAIN = '2.2'

type VariantContextValue = {
  variant: string | null
  setVariant: (id: string | null) => void
}

const VariantContext = createContext<VariantContextValue | null>(null)

export function VariantProvider({ children }: { children: ReactNode }) {
  const [variant, setVariant] = useState<string | null>(VARIANT_EMPTY_PICK)
  return (
    <VariantContext.Provider value={{ variant, setVariant }}>{children}</VariantContext.Provider>
  )
}

export function useVariant() {
  const ctx = useContext(VariantContext)
  if (!ctx) throw new Error('useVariant must be used within VariantProvider')
  return ctx
}
