import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Carregando...</div>;

  return user ? children : <Navigate to="/login" replace />;
}
