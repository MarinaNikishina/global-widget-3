import { Snackbar } from '@moysklad/uikit'
import PasswordGate from './components/PasswordGate'
import CustomerOrderPage from './pages/CustomerOrderPage'

export default function App() {
  return (
    <PasswordGate>
      <Snackbar>
        <CustomerOrderPage />
      </Snackbar>
    </PasswordGate>
  )
}
