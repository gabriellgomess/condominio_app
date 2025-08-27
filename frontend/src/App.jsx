import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { StructureProvider } from './contexts/StructureContext';
import Home from './pages/Home';
import Login from './pages/Login';
import UserAreaRouter from './components/UserAreaRouter';
import ProtectedRoute from './components/ProtectedRoute';
import CondominiumsPage from './pages/admin/CondominiumsPage';
import StructureManagementPage from './pages/admin/StructureManagementPage';
import ResidentsManagementPage from './pages/admin/ResidentsManagementPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <StructureProvider>
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
        </StructureProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;