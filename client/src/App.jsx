import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import About from './pages/About'
import Contact from './pages/Contact'
import CustomTrip from './pages/CustomTrip'
import Destinations from './pages/Destinations'
import Domestic from './pages/Domestic'
import Home from './pages/Home'
import International from './pages/International'
import NotFound from './pages/NotFound'
import PackageDetails from './pages/PackageDetails'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  return (
    <Routes>
      <Route path="admin/login" element={<AdminLogin />} />
      <Route path="admin" element={<AdminDashboard />} />
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="domestic" element={<Domestic />} />
        <Route path="international" element={<International />} />
        <Route path="destinations" element={<Destinations />} />
        <Route path="package/:identifier" element={<PackageDetails />} />
        <Route path="packages/:identifier" element={<PackageDetails />} />
        <Route path="custom-trip" element={<CustomTrip />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
