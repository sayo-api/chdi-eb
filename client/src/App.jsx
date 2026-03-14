import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import PushPermissionBanner from './components/PushPermissionBanner';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Player from './pages/Player';
import VideoPlayer from './pages/VideoPlayer';
import CategoryPage from './pages/CategoryPage';
import PdfViewer from './pages/PdfViewer';
import AppLogin from './pages/AppLogin';
import Schedule from './pages/Schedule';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminCategories from './pages/admin/AdminCategories';
import AdminSongs from './pages/admin/AdminSongs';
import AdminVideos from './pages/admin/AdminVideos';
import AdminPdfs from './pages/admin/AdminPdfs';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSchedule from './pages/admin/AdminSchedule';
import AdminContent from './pages/admin/AdminContent';

function ProtectedAdmin({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="page-loader">
      <div className="spinner" />
      <p>Verificando acesso...</p>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/app-login" element={<AppLogin />} />
        <Route path="/escala" element={<Schedule />} />
        <Route path="/modulo/:id" element={<CategoryPage />} />
        <Route path="/play/:id" element={<Player />} />
        <Route path="/video/:id" element={<VideoPlayer />} />
        <Route path="/pdf/:id" element={<PdfViewer />} />
        <Route path="/admin" element={<ProtectedAdmin><AdminLayout /></ProtectedAdmin>}>
          <Route index element={<Dashboard />} />
          <Route path="usuarios-app" element={<AdminUsers />} />
          <Route path="escala" element={<AdminSchedule />} />
          <Route path="conteudos" element={<AdminContent />} />
          <Route path="categorias" element={<AdminCategories />} />
          <Route path="musicas" element={<AdminSongs />} />
          <Route path="videos" element={<AdminVideos />} />
          <Route path="pdfs" element={<AdminPdfs />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <PushPermissionBanner />
    </>
  );
}