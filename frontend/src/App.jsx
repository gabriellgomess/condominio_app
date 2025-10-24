import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { StructureProvider } from './contexts/StructureContext';
import { ResidentsProvider } from './contexts/ResidentsContext';
import Home from './pages/Home';
import Login from './pages/Login';
import UserAreaRouter from './components/UserAreaRouter';
import ProtectedRoute from './components/ProtectedRoute';
import CondominiumsPage from './pages/admin/CondominiumsPage';
import StructureManagementPage from './pages/admin/StructureManagementPage';
import ResidentsManagementPage from './pages/admin/ResidentsManagementPage';
import SuppliersPage from './pages/admin/SuppliersPage';
import ReservationManagementPage from './pages/admin/ReservationManagementPage';
import ReservationsPage from './pages/admin/ReservationsPage';
import AnnouncementsPage from './pages/admin/AnnouncementsPage';
import IncidentsPage from './pages/admin/IncidentsPage';
import SubaccountsPage from './pages/admin/SubaccountsPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import RevenuesPage from './pages/admin/RevenuesPage';
import ExpensesPage from './pages/admin/ExpensesPage';
import MonthlyFeesPage from './pages/admin/MonthlyFeesPage';
import UnitBillingsPage from './pages/admin/UnitBillingsPage';
import DeliveriesPage from './pages/admin/DeliveriesPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <StructureProvider>
          <ResidentsProvider>
            <Router>
        <div className="App">
          <Routes>
            {/* Rota pública - Página inicial */}
            <Route path="/" element={<Home />} />
            
            {/* Rota pública - Login */}
            <Route path="/login" element={<Login />} />
            
            {/* Rotas protegidas - Áreas específicas dos usuários */}
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute allowedAccessLevels={['administrador']}>
                  <Routes>
                    <Route path="dashboard" element={<UserAreaRouter />} />
                    <Route path="condominiums" element={<CondominiumsPage />} />
                    <Route path="structure" element={<StructureManagementPage />} />
                    <Route path="residents" element={<ResidentsManagementPage />} />
                    <Route path="suppliers" element={<SuppliersPage />} />
                    <Route path="reservations" element={<ReservationManagementPage />} />
                    <Route path="bookings" element={<ReservationsPage />} />
                    <Route path="announcements" element={<AnnouncementsPage />} />
                    <Route path="incidents" element={<IncidentsPage />} />
                    <Route path="finance/subaccounts" element={<SubaccountsPage />} />
                    <Route path="finance/categories" element={<CategoriesPage />} />
                    <Route path="finance/revenues" element={<RevenuesPage />} />
                    <Route path="finance/expenses" element={<ExpensesPage />} />
                    <Route path="billing/monthly-fees" element={<MonthlyFeesPage />} />
                    <Route path="billing/unit-billings" element={<UnitBillingsPage />} />
                    <Route path="gate/deliveries" element={<DeliveriesPage />} />
                    <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                  </Routes>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/syndic/*" 
              element={
                <ProtectedRoute allowedAccessLevels={['sindico']}>
                  <UserAreaRouter />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/resident/*" 
              element={
                <ProtectedRoute allowedAccessLevels={['morador']}>
                  <UserAreaRouter />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/employee/*" 
              element={
                <ProtectedRoute allowedAccessLevels={['funcionario']}>
                  <UserAreaRouter />
                </ProtectedRoute>
              } 
            />
            
            {/* Rota padrão para usuários logados - redireciona para área apropriada */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <UserAreaRouter />
                </ProtectedRoute>
              } 
            />
            
            {/* Rota para redirecionamento automático após login */}
            <Route 
              path="/auth-redirect" 
              element={
                <ProtectedRoute>
                  <UserAreaRouter />
                </ProtectedRoute>
              } 
            />
            
            {/* Rota de fallback - redireciona para home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
            </Router>
          </ResidentsProvider>
        </StructureProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;