
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center animate-pulse-subtle">
          <h2 className="text-xl font-bold mb-2">Carregando FinSync...</h2>
          <p className="text-zinc-500">Por favor, aguarde um momento</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  } else {
    return <Navigate to="/login" replace />;
  }
};

export default Index;
