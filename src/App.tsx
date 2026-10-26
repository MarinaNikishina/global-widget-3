import { Snackbar } from '@moysklad/uikit'
import PasswordGate from './components/PasswordGate'
import { VariantPanel } from './components/VariantPanel'
import { VariantProvider } from './components/variantContext'
import CustomerOrderPage from './pages/CustomerOrderPage'

export default function App() {
  return (
    <PasswordGate>
      <Snackbar>
        <VariantProvider>
          <CustomerOrderPage />
          <VariantPanel />
        </VariantProvider>
      </Snackbar>
    </PasswordGate>
  )
}
