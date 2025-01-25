
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminDashboard from './component/AdminDashboard';
import DoctorDashboard from './component/DoctorDashboard';
import UserDashboard from './component/UserDashboard';
import PrivateRoute from './component/PrivateRoute';
import DoctorSchedule from './component/schedule';
import Login from './component/Login';
import Register from './component/RegisterForm'; 
import ChatPopup from './component/ChatPopup';
import ErrorBoundary from './component/ErrorBoundary';
import Assessment from './component/Assessment';
import Profile from './component/Profile';
import Reservationuser from './component/Reservationuser';
import DepressionInfo from './component/DepressionInfo';
import '@fortawesome/fontawesome-free/css/all.min.css';
import AssessmentUI from './component/AssessmentUI';
import About from './component/About';
import TestManagement from './component/TestManagement';
import UserManagement from './component/UserManagement';
import ProfileAD from './component/ProfileAD';



function App() {
  return (
    <Router>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin-dashboard" element={
            <PrivateRoute allowedRoles={['admin']} element={<AdminDashboard />} />
          } />
          <Route path="/doctor-dashboard" element={
            <PrivateRoute allowedRoles={['doctor']} element={<DoctorDashboard />} />
          } />
          <Route path="/user-dashboard" element={
            <PrivateRoute allowedRoles={['user']} element={<UserDashboard />} />
          } />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/reservation" element={<Reservationuser />} />
          <Route path="/doctor-schedule" element={<DoctorSchedule />} />
          <Route path="/chat/:appointmentId" element={<ChatPopup />} />
        <Route path="/depression-info" element={<DepressionInfo />} />
        <Route path="/AssessmentUI" element={<AssessmentUI />} />
        <Route path="/about-us" element={<About />} />
        <Route path="/test" element={<TestManagement />} />
        <Route path="/Management" element={<UserManagement />} />
        <Route path="/profileAD" element={<ProfileAD />} />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
