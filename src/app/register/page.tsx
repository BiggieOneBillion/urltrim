"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/authContext";
import { Alert } from "@/app/component/ui";
import { ModernButton } from "@/app/component/ui/ModernButton";
import { ModernInput } from "@/app/component/ui/ModernInput";
import { X, ArrowLeft } from "lucide-react";

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const { register, error, loading, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await register(name, email, password);
    } catch (err) {}
  };

  const navigateTo = (path: string) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden">
      <div className="bg-mesh" />
      
      {/* Back to Home */}
      <button 
        onClick={() => navigateTo("/")}
        className="fixed top-8 left-8 glass p-3 rounded-xl text-gray-400 hover:text-white transition-all duration-200 z-50 flex items-center gap-2 text-sm font-medium"
      >
        <ArrowLeft size={18} />
        Back to Home
      </button>

      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-tighter text-white emblema-one-regular mb-2">URLTRIM</h1>
          <p className="text-gray-400">Join the future of link management.</p>
        </div>

        <div className="glass rounded-[2rem] p-8 md:p-10">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Create Account</h2>
          
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex justify-between items-center">
              <span>{error}</span>
              <button onClick={clearError}><X size={14} /></button>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <ModernInput 
              label="Full Name"
              type="text" 
              required 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="John Doe"
            />
            
            <ModernInput 
              label="Email Address"
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="name@company.com"
            />

            <ModernInput 
              label="Password"
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
            />

            <ModernButton type="submit" isLoading={loading} className="w-full py-4 text-lg mt-4">
              Create Account
            </ModernButton>
          </form>

          <div className="relative flex items-center my-10">
            <div className="flex-grow border-t border-white/10" />
            <span className="mx-4 text-xs font-semibold text-gray-500 uppercase tracking-widest">Or</span>
            <div className="flex-grow border-t border-white/10" />
          </div>

          <button className="w-full glass glass-hover py-4 rounded-xl flex items-center justify-center gap-3 text-sm font-medium text-white">
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" />
            </svg>
            Sign up with Google
          </button>

          <p className="mt-8 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <button 
              onClick={() => navigateTo("/login")} 
              className="text-blue-400 font-bold hover:text-blue-300 underline underline-offset-4 transition-all"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
