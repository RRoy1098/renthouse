import { Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar.jsx';
import Footer from './components/common/Footer.jsx';
import Home from './pages/home/Home.jsx';
import Listings from './pages/listings/Listings.jsx';
import ListingDetail from './pages/listing/ListingDetail.jsx';
import Auth from './pages/auth/Auth.jsx';
import Profile from './pages/profile/Profile.jsx';
import NotFound from './pages/notfound/NotFound.jsx';

const App = () => {
  return (
    <div className="min-h-screen bg-background text-text">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/listing/:id" element={<ListingDetail />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;