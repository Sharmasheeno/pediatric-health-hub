import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { api } from "../../lib/axios";
import { useState } from "react";
import { Eye, EyeOff, ArrowRight, Loader2, AlertCircle, Lock, Mail } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required")
});

export const Login = () => {
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    try {
      setErrorMsg("");
      const response = await api.post("/auth/login", data);
      const { user, token } = response.data.data;
      setAuth(user, token);
      navigate("/dashboard");
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {errorMsg && (
        <div className="flex items-start gap-3 p-4 bg-danger/10 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-[--radius-sm] text-sm">
          <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
          <span className="text-danger dark:text-red-300 font-medium">{errorMsg}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-[--text-primary]">Email Address</label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[--text-muted]">
              <Mail size={18} />
            </div>
            <input
              type="email"
              placeholder="you@example.com"
              className={`w-full h-11 pl-10 pr-4 rounded-[--radius-sm] border bg-[--surface] text-[--text-primary] placeholder:text-[--text-muted] font-medium text-sm transition-all duration-200 outline-none focus:ring-2 focus:ring-[--ring]
                ${errors.email ? 'border-danger' : 'border-[--border] hover:border-primary-300 focus:border-primary-500'}`}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-danger font-medium flex items-center gap-1.5">
              <AlertCircle size={12} /> {errors.email.message}
            </p>
          )}
        </div>
        
        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-[--text-primary]">Password</label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[--text-muted]">
              <Lock size={18} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className={`w-full h-11 pl-10 pr-12 rounded-[--radius-sm] border bg-[--surface] text-[--text-primary] placeholder:text-[--text-muted] font-medium text-sm transition-all duration-200 outline-none focus:ring-2 focus:ring-[--ring]
                ${errors.password ? 'border-danger' : 'border-[--border] hover:border-primary-300 focus:border-primary-500'}`}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[--text-muted] hover:text-[--text-secondary] transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-danger font-medium flex items-center gap-1.5">
              <AlertCircle size={12} /> {errors.password.message}
            </p>
          )}
        </div>

        {/* Forgot password */}
        <div className="flex items-center justify-end">
          <Link to="/forgot-password" className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
            Forgot password?
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-semibold text-sm rounded-[--radius-sm] shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        >
          {isSubmitting ? (
            <><Loader2 size={18} className="animate-spin" /> Signing in...</>
          ) : (
            <>Sign in <ArrowRight size={16} strokeWidth={2.5} /></>
          )}
        </button>
      </form>
      
      <p className="text-center text-xs text-[--text-muted] font-medium">
        🔒 Secured with 256-bit encryption
      </p>
    </div>
  );
};
