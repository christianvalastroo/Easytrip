import { Route, Routes } from 'react-router-dom'

import Dashboard from '../pages/Dashboard/Dashboard'
import CreateTrip from '../pages/CreateTrip/CreateTrip'
import Home from '../pages/Home/Home'
import Login from '../pages/Login/Login'
import NotFound from '../pages/NotFound/NotFound'
import Register from '../pages/Register/Register'
import Trips from '../pages/Trips/Trips'

const AppRoutes = () => {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route path='/dashboard' element={<Dashboard />} />
      <Route path='/trips' element={<Trips />} />
      <Route path='/trips/new' element={<CreateTrip />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}

export default AppRoutes
