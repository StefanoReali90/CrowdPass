import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Brand } from './components/Brand';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { BookingPage } from './pages/BookingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StaffScanPage } from './pages/StaffScanPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import './App.css';
function InternalLayout() {
 return <><Navbar /><main><Outlet /></main></>;
}
export default function App() {
 return <BrowserRouter><AuthProvider><div className="app-shell"><Routes>
 <Route element={<InternalLayout />}>
 <Route path="/" element={<LoginPage />} /><Route path="/login" element={<LoginPage />} /><Route path="/register" element={<RegisterPage />} />
 <Route path="/staff/scan" element={<ProtectedRoute roles={['ADMIN', 'STAFF']}><StaffScanPage /></ProtectedRoute>} />
 <Route path="/admin/dashboard" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboardPage /></ProtectedRoute>} />
 </Route>
 <Route element={<><header className="topbar"><Brand /></header><main><Outlet /></main></>}>
 <Route path="/prenota" element={<BookingPage />} /><Route path="/check-in" element={<BookingPage />} />
 <Route path="*" element={<div className="form-page"><span className="eyebrow">404</span><h1>Pagina non trovata.</h1><p>Controlla il link che hai ricevuto.</p></div>} />
 </Route>
 </Routes><footer className="site-footer"><span>CrowdPass</span><span>Il tuo evento, dall’inizio all’ingresso.</span></footer></div></AuthProvider></BrowserRouter>;
}
