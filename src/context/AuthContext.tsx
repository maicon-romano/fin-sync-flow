import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { toast } from "@/components/ui/sonner";

type User = {
  id: string;
  name: string;
  email: string;
  plan: "free" | "premium" | "business";
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isPremium: () => boolean;
  loginWithGoogle: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const userRef = doc(db, "users", firebaseUser.uid);
      const docSnap = await getDoc(userRef);

      let userData: User;

      if (!docSnap.exists()) {
        // Criação do novo usuário no Firestore
        userData = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email!.split("@")[0],
          email: firebaseUser.email!,
          plan: "free",
        };
        await setDoc(userRef, userData);
      } else {
        // Usuário já existia, apenas resgata os dados
        userData = docSnap.data() as User;
      }

      // 🔥 Aqui está o ponto chave: armazenar o usuário logado no contexto
      setUser(userData);

      toast.success("Login com Google realizado!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao logar com Google.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const docRef = doc(db, "users", firebaseUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data() as User;
          setUser({
            id: firebaseUser.uid,
            name: userData.name,
            email: userData.email,
            plan: userData.plan || "free",
          });
        }
      } else {
        setUser(null);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;

      const docRef = doc(db, "users", firebaseUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data() as User;
        setUser({
          id: firebaseUser.uid,
          name: userData.name,
          email: userData.email,
          plan: userData.plan || "free",
        });
        toast.success("Login realizado com sucesso!");
      } else {
        toast.error("Usuário não encontrado no banco de dados.");
      }
    } catch (error) {
      toast.error("Erro ao fazer login. Verifique os dados.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = result.user;

      const userData: User = {
        id: firebaseUser.uid,
        name,
        email,
        plan: "free",
      };

      await setDoc(doc(db, "users", firebaseUser.uid), userData);

      setUser(userData);
      toast.success("Conta criada com sucesso!");
    } catch (error) {
      toast.error("Erro ao criar conta.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    toast.info("Sessão encerrada.");
  };

  const isPremium = () => {
    return user?.plan === "premium" || user?.plan === "business";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        isPremium,
        loginWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
