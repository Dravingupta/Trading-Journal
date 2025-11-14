// client/src/App.jsx
import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth, onAuthStateChanged,  } from './firebase/firebase';
import './App.css';

// --- Component Imports ---
import LoginPage from './pages/Login.jsx';
import SignupPage from './pages/Signup.jsx';
import AllTrades from './pages/AllTrades.jsx';
import NewTrade from './pages/NewTrade.jsx';
import TradeDetail from './pages/TradeDetail.jsx';
import EditTrade from './pages/EditTrade.jsx';
import Header from './components/Header.jsx';
import AnalyticsPage from './pages/Analytics.jsx';
import Footer from './components/Footer.jsx';   
import AuthHeader from './components/AuthHeader.jsx';   
import AuthFooter from './components/AuthFooter.jsx';  
import LandingPage from "./pages/LandingPage.jsx";
import LandingFooter from "./components/LandingFooter.jsx";


// import Sidebar from './components/Sidebar.jsx'; // use later if needed

// --- Contexts ---
const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

// --- Main App Logic ---
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);



  const authContextValue = {
    user,
    loading,
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        Loading Authentication... ⏳
      </div>
    );
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      <Router>
        <Routes>
          {/* Public Routes */}

          <Route path="/landing" element={
            
            <>
        
      <LandingPage />
        <LandingFooter />

       </>
            
            } />

          
          <Route
  path="/login"
  element={
    user ? (
      <Navigate to="/" />
    ) : (
      <>
        <AuthHeader />
        <LoginPage />
        <AuthFooter />
      </>
    )
  }
/>

<Route
  path="/signup"
  element={
    user ? (
      <Navigate to="/" />
    ) : (
      <>
        <AuthHeader />
        <SignupPage />
        <AuthFooter />
      </>
    )
  }
/>

          

          {/* Private/Protected Routes */}
          <Route
            path="/"
            element={
              user ? (
               <Navigate to="/trades" replace />
              ) : (
                <Navigate to="/landing" replace />
              )
            }
          />
          <Route
            path="/trades"
            element={
              user ? (
                <>
                  <Header />
                  <AllTrades />
                    <Footer />
                </>
              ) : (
                <Navigate to="/landing" replace />
              )
            }
          />

          <Route
            path="/new"
            element={
              user ? (
                <>
                  <Header />
                  <NewTrade />
                    <Footer />
                </>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/:id"
            element={
              user ? (
                <>
                  <Header />
                  <TradeDetail />
                    <Footer />
                </>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/:id/edit"
            element={
              user ? (
                <>
                  <Header />
                  <EditTrade />
                    <Footer />
                </>
              ) : (
                <Navigate to="/login" replace />
              )
            } />

            <Route
  path="/analytics"
  element={
    user ? (
      <>
        <Header />
        <AnalyticsPage />
        <Footer />
      </>
    ) : (
      <Navigate to="/login" replace />
    )
  }
/>

         

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
export { useAuth };
