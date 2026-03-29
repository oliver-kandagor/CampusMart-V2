import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, Phone, User as UserIcon, Building2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLoginUser, useRegisterUser } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, setToken } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");

  // Login State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register State
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regCampus, setRegCampus] = useState("University of Nairobi");

  const loginMutation = useLoginUser();
  const registerMutation = useRegisterUser();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await loginMutation.mutateAsync({
        data: { emailOrPhone: loginEmail, password: loginPassword }
      });
      setToken(res.token);
      closeAuthModal();
    } catch (error) {
      console.error(error);
    }
  };

  const getErrorMessage = (error: unknown, fallback: string): string => {
    if (error && typeof error === "object") {
      const e = error as Record<string, unknown>;
      if (e.data && typeof e.data === "object") {
        const d = e.data as Record<string, unknown>;
        if (typeof d.message === "string" && d.message) return d.message;
        if (typeof d.error === "string" && d.error) return d.error;
      }
      if (typeof e.message === "string" && e.message) return e.message;
    }
    return fallback;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await registerMutation.mutateAsync({
        data: {
          email: regEmail,
          phone: regPhone,
          username: regUsername,
          password: regPassword,
          campus: regCampus,
        }
      });
      setToken(res.token);
      closeAuthModal();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAuthModal}
            className="fixed inset-0 z-[100] bg-primary/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className="fixed inset-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-[101] w-full sm:w-[440px] h-full sm:h-auto bg-card sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <h2 className="text-2xl font-display font-bold text-primary">
                {mode === "login" ? "Welcome back" : "Join CampusMart"}
              </h2>
              <button
                onClick={closeAuthModal}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="flex p-1 bg-muted/50 mx-6 mt-6 rounded-xl">
              <button
                onClick={() => setMode("login")}
                className={cn(
                  "flex-1 py-2 rounded-lg text-sm font-semibold transition-all",
                  mode === "login" ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-primary"
                )}
              >
                Sign In
              </button>
              <button
                onClick={() => setMode("register")}
                className={cn(
                  "flex-1 py-2 rounded-lg text-sm font-semibold transition-all",
                  mode === "register" ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-primary"
                )}
              >
                Sign Up
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 hide-scrollbar">
              <AnimatePresence mode="wait">
                {mode === "login" ? (
                  <motion.form
                    key="login"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onSubmit={handleLogin}
                    className="flex flex-col gap-4"
                  >
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-foreground ml-1">Email or Phone</label>
                      <div className="relative">
                        <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="text"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border-2 border-border focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none transition-all"
                          placeholder="student@campus.ac.ke"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-foreground ml-1">Password</label>
                      <div className="relative">
                        <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border-2 border-border focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none transition-all"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loginMutation.isPending}
                      className="mt-4 w-full py-3.5 rounded-xl bg-gradient-to-r from-secondary to-[#14603A] text-white font-bold text-lg shadow-lg shadow-secondary/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
                    >
                      {loginMutation.isPending ? "Signing in..." : "Sign In"}
                    </button>
                    {loginMutation.isError && (
                      <p className="text-accent text-sm text-center">
                        {getErrorMessage(loginMutation.error, "Invalid credentials. Please try again.")}
                      </p>
                    )}
                  </motion.form>
                ) : (
                  <motion.form
                    key="register"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleRegister}
                    className="flex flex-col gap-4"
                  >
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-foreground ml-1">Username</label>
                      <div className="relative">
                        <UserIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="text"
                          value={regUsername}
                          onChange={(e) => setRegUsername(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border-2 border-border focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none transition-all"
                          placeholder="johndoe"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-foreground ml-1">Email</label>
                      <div className="relative">
                        <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border-2 border-border focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none transition-all"
                          placeholder="student@campus.ac.ke"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-foreground ml-1">Phone (Optional)</label>
                      <div className="relative">
                        <Phone className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="tel"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border-2 border-border focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none transition-all"
                          placeholder="07XX XXX XXX"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-foreground ml-1">Campus</label>
                      <div className="relative">
                        <Building2 className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <select
                          value={regCampus}
                          onChange={(e) => setRegCampus(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border-2 border-border focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none transition-all appearance-none"
                        >
                          <option>University of Nairobi</option>
                          <option>Kenyatta University</option>
                          <option>JKUAT</option>
                          <option>Strathmore University</option>
                          <option>Moi University</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-foreground ml-1">Password</label>
                      <div className="relative">
                        <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="password"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border-2 border-border focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none transition-all"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={registerMutation.isPending}
                      className="mt-4 w-full py-3.5 rounded-xl bg-gradient-to-r from-secondary to-[#14603A] text-white font-bold text-lg shadow-lg shadow-secondary/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
                    >
                      {registerMutation.isPending ? "Creating account..." : "Create Account"}
                    </button>
                    {registerMutation.isError && (
                      <p className="text-accent text-sm text-center">
                        {getErrorMessage(registerMutation.error, "Registration failed. Try again.")}
                      </p>
                    )}
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
