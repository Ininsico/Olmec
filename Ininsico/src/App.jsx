import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home/Home';
import Navbar from '@/components/Navbar';
import Contact from './Contact';
import LoginPage from './pages/loginpage';
import TermsPage from './Home/terms';
import PrivacyPolicy from './Home/privacy';
import SecurityPage from './Home/security';
import ModelEditor from './ModelEditor';
import SignupPage from './pages/Siguppage';
import MainApp from './instasisco/MainApp';
import ProfileSetup from './instasisco/Profilepage';
import UserProfile from './instasisco/loadedprofilepage';
import About from './About';
import Developer from './pages/Developer';
import Dev from './pages/Documentation';
import BrowseModels from './instasisco/Modelsection';
import BrowseTextures from './instasisco/Textures';
import Checkout from './instasisco/checkout';
import Sell from './instasisco/sell';
import Process from './pages/process';
import ProtectedRoute from './ProtectedRoute';
function App() {
  return (
    <Router>
      <Navbar />
      <div className="pt-24"> {/* Add padding top to account for fixed navbar */}
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<MainApp />} />
            <Route path='/userprofile/:username' element={<UserProfile />} />
            <Route path="/profilesetup" element={<ProfileSetup />} />
            <Route path='/browsemodel' element={<BrowseModels />} />
            <Route path='/textures' element={<BrowseTextures />} />
            <Route path='/checkout' element={<Checkout />} />
            <Route path='/sell' element={<Sell />} />
          </Route>
          <Route path="/" element={<Home />} />
          <Route path="/documentation" element={<Developer />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/about" element={<About />} />
          <Route path='/privacy' element={<PrivacyPolicy />} />
          <Route path='security' element={<SecurityPage />} />
          <Route path="/editor" element={<ModelEditor />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path='/developers' element={<Dev />} />
          <Route path='/processexport' element={<Process />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
