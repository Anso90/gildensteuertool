import { useAuth } from "./AuthProvider";
import Login from "./Login";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-white p-10">🔐 Sitzung wird geladen...</div>;
  if (!user) return <Login />;
  return children;
}
