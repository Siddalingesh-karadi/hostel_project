import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/index.css';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import StudentList from './pages/StudentList';
import RoomList from './pages/RoomList';
import ComplaintList from './pages/ComplaintList';
import FeeList from './pages/FeeList';
import LeaveList from './pages/LeaveList';
import Notices from './pages/Notices';
import Inventory from './pages/Inventory';
import MessMenu from './pages/MessMenu';
import StaffList from './pages/StaffList';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Dashboard Routes */}
        <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
        <Route path="/students" element={<ProtectedRoute><Layout><StudentList /></Layout></ProtectedRoute>} />
        <Route path="/rooms" element={<ProtectedRoute><Layout><RoomList /></Layout></ProtectedRoute>} />
        <Route path="/complaints" element={<ProtectedRoute><Layout><ComplaintList /></Layout></ProtectedRoute>} />
        <Route path="/fees" element={<ProtectedRoute><Layout><FeeList /></Layout></ProtectedRoute>} />
        <Route path="/leaves" element={<ProtectedRoute><Layout><LeaveList /></Layout></ProtectedRoute>} />
        <Route path="/notices" element={<ProtectedRoute><Layout><Notices /></Layout></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute><Layout><Inventory /></Layout></ProtectedRoute>} />
        <Route path="/mess-menu" element={<ProtectedRoute><Layout><MessMenu /></Layout></ProtectedRoute>} />
        <Route path="/staff" element={<ProtectedRoute><Layout><StaffList /></Layout></ProtectedRoute>} />
      </Routes>
    </Router>
  );
};

export default App;
