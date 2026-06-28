import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LoginPage from "@/pages/Login";
import RegisterPage from "@/pages/Register";
import AuthCallbackPage from "@/pages/AuthCallback";
import DashboardPage from "@/pages/Dashboard";
import FormsPage from "@/pages/Forms";
import FormBuilderPage from "@/pages/FormBuilder";
import PublicFormPage from "@/pages/PublicForm";
import SubmissionsPage from "@/pages/Submissions";
import SettingsPage from "@/pages/Settings";
import UsersPage from "@/pages/Users";
import "@/App.css";

function Protected({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading…</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function Router() {
  const location = useLocation();
  // Handle session_id from Google Auth synchronously during render (avoids race conditions)
  if (location.hash?.includes("session_id=")) {
    return <AuthCallbackPage />;
  }
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/f/:slug" element={<PublicFormPage />} />

      <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />
      <Route path="/forms" element={<Protected><FormsPage /></Protected>} />
      <Route path="/forms/:id/build" element={<Protected><FormBuilderPage /></Protected>} />
      <Route path="/forms/:id/submissions" element={<Protected><SubmissionsPage /></Protected>} />
      <Route path="/settings" element={<Protected roles={["super_admin"]}><SettingsPage /></Protected>} />
      <Route path="/users" element={<Protected roles={["super_admin"]}><UsersPage /></Protected>} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Router />
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}
