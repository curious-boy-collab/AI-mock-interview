
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Interview from './pages/Interview';
import Result from './pages/Result';
import ResumeUpload from './pages/ResumeUpload';
import CustomSyllabus from './pages/CustomSyllabus';


// Protected Route — token nahi hai toh login pe bhejo
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/custom-syllabus" element={<ProtectedRoute><CustomSyllabus /></ProtectedRoute>} />
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/interview" element={
          <ProtectedRoute><Interview /></ProtectedRoute>
        } />
        <Route path="/result" element={
          <ProtectedRoute><Result /></ProtectedRoute>
        } />
        <Route path="/resume" element={
  <ProtectedRoute><ResumeUpload /></ProtectedRoute>
} />

      </Routes>
    </BrowserRouter>
  );
}


export default App;