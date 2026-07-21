import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import Footer from './components/Footer/Footer'
import Navbar from './components/Navbar/Navbar'

const App = () => {
  return (
    <BrowserRouter>
      <div translate='no' className='notranslate'>
        <Navbar />
        <AppRoutes />
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
