import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import useAuthStore from "../../store/authStore";
import { api } from "../../lib/axios";
import { useState } from "react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export const Login = () => {
  const [errorMsg, setErrorMsg] = useState("");
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
      setErrorMsg(error.response?.data?.message || "An unexpected error occurred");
    }
  };

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm font-medium">
          {errorMsg}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input 
          label="Email Address" 
          placeholder="your@email.com" 
          type="email"
          {...register("email")}
          error={errors.email?.message}
        />
        
        <Input 
          label="Password" 
          placeholder="••••••••" 
          type="password"
          {...register("password")}
          error={errors.password?.message}
        />

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
              Forgot your password?
            </a>
          </div>
        </div>

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Sign in
        </Button>
      </form>
      
      <div className="mt-6 text-center text-sm">
        <span className="text-slate-600">Don't have an account? </span>
        <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
          Register here
        </Link>
      </div>
    </div>
  );
};
