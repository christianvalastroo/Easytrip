import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import Footer from './components/Footer/Footer'
import Navbar from './components/Navbar/Navbar'

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <AppRoutes />
      <Footer />
    </BrowserRouter>
  )
}

export default App
