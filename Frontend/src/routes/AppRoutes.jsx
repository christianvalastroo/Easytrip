import { Route, Routes } from 'react-router-dom'

import Dashboard from '../pages/Dashboard/Dashboard'
import CreateTrip from '../pages/CreateTrip/CreateTrip'
import Home from '../pages/Home/Home'
import Login from '../pages/Login/Login'
import NotFound from '../pages/NotFound/NotFound'
import Register from '../pages/Register/Register'
import TripDetails from '../pages/TripDetails/TripDetails'
import Trips from '../pages/Trips/Trips'
import PrivateRoutes from './PrivateRoutes'
import Profile from '../pages/Profile/Profile'
import Settings from '../pages/Settings/Settings'
import ForgotPassword from '../pages/ForgotPassword/ForgotPassword'
import ResetPassword from '../pages/ResetPassword/ResetPassword'

const AppRoutes = () => {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route path='/forgot-password' element={<ForgotPassword />} />
      <Route path='/reset-password' element={<ResetPassword />} />

      <Route element={<PrivateRoutes />}>
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/trips' element={<Trips />} />
        <Route path='/trips/new' element={<CreateTrip />} />
        <Route path='/trips/:id' element={<TripDetails />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/settings' element={<Settings />} />
      </Route>

      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}

export default AppRoutes
