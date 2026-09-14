import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BackgroundProvider, useBackground } from './context/BackgroundContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { BookingPage } from './pages/BookingPage';
import { LoginPage } from './pages/LoginPage';
import { StaffScanPage } from './pages/StaffScanPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import './App.css';

function AppLayout() {
    const { backgroundImage } = useBackground();

    return (
        <div
            className="app-backdrop"
            style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}
        >
            <div className="app-overlay d-flex flex-column min-vh-100">
                <Navbar />
                <main className="flex-grow-1">
                    <Routes>
                        {/* Rotta Pubblica: Prenotazione Biglietti Cliente */}
                        <Route path="/" element={<BookingPage />} />
                        
                        {/* Rotta Pubblica: Login per Staff e Admin */}
                        <Route path="/login" element={<LoginPage />} />

                        {/* Rotta Protetta: Scanner Ingressi (Accessibile sia a STAFF che ad ADMIN) */}
                        <Route
                            path="/staff/scan"
                            element={
                                <ProtectedRoute roles={['STAFF', 'ADMIN']}>
                                    <StaffScanPage />
                                </ProtectedRoute>
                            }
                        />

                        {/* Rotta Protetta: Dashboard Statistiche Evento (Riservata ad ADMIN) */}
                        <Route
                            path="/admin/dashboard"
                            element={
                                <ProtectedRoute roles={['ADMIN']}>
                                    <AdminDashboardPage />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </main>
            </div>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <BackgroundProvider>
                    <AppLayout />
                </BackgroundProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;