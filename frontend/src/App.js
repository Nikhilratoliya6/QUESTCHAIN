import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import Profile from './components/Profile';
import { Navbar } from 'rsuite';
import Landing from './components/Landing';
import AdminBroadcast from './pages/AdminBroadcast';

// Helper function to check if user is authenticated
const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!token;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={
                    isAuthenticated() ? <Navigate to="/dashboard" /> : <Login />
                } />
                <Route path="/signup" element={
                    isAuthenticated() ? <Navigate to="/dashboard" /> : <Signup />
                } />
                <Route path="/dashboard" element={
                    <PrivateRoute>
                        <Dashboard />
                    </PrivateRoute>
                } />
                <Route path="/profile" element={
                    <PrivateRoute>
                        <Navbar />
                        <Profile />
                    </PrivateRoute>
                } />
                <Route path="/" element={
                    isAuthenticated() ? <Navigate to="/dashboard" /> : <Landing />
                } />
                <Route path="/admin/broadcast" element={
                    <PrivateRoute adminOnly={true}>
                        <AdminBroadcast />
                    </PrivateRoute>
                } />
            </Routes>
        </Router>
    );
}

export default App;