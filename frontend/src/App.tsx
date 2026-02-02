import { Routes, Route, Outlet } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import Home from '@/pages/Home';
import Product from '@/pages/Product';
import Contact from '@/pages/Contact';
import About from '@/pages/About';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import AuthSuccess from '@/pages/AuthSuccess';
import Dashboard from '@/pages/Dashboard';
import Builder from '@/pages/Builder';
import ScrollToTop from '@/components/ScrollToTop';
import './App.css';

const MainLayout = () => {
  return (
    <div className='min-h-screen bg-cream-100 flex flex-col'>
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public Pages with Header & Footer */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/product" element={<Product />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
        </Route>

        {/* Auth Pages (Standalone) */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/auth-success" element={<AuthSuccess />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/builder"
          element={
            <ProtectedRoute>
              <Builder />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
