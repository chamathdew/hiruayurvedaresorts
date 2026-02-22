import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Guests from './pages/Guests';
import Arrivals from './pages/Arrivals';
import Departures from './pages/Departures';
import Layout from './components/Layout';

import PropTypes from 'prop-types';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; // Or to an unauthorized page
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string)
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="guests" element={<Guests />} />
            <Route path="arrivals" element={<Arrivals />} />
            <Route path="departures" element={<Departures />} />
            {/* Add more routes for Rooms, Reports, Settings here */}
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
