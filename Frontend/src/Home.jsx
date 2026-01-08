import '../polyfills.js';
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './pages/Home/App.jsx'
// import { checkLogin } from './pages/Home/components/login.jsx'
// import { CheckLogin } from './pages/Home/components/login.jsx'
// import { AuthProvider } from './authprov.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
