import { Snackbar } from '@moysklad/uikit'
import PasswordGate from './components/PasswordGate'
import { VariantPanel } from './components/VariantPanel'
import CustomerOrderPage from './pages/CustomerOrderPage'

export default function App() {
  return (
    <PasswordGate>
      <Snackbar>
        <CustomerOrderPage />
        <VariantPanel />
      </Snackbar>
    </PasswordGate>
  )
}
