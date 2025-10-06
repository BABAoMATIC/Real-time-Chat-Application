import './App.css'
import Auth from './components/Auth'
import Chat from './components/Chat'
import { useAuth } from './store/auth'

function App() {
  const { user } = useAuth()
  return (
    <>
      {!user && <Auth />}
      {user && <Chat />}
    </>
  )
}

export default App
