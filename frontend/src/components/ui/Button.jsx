import { cn } from "../../lib/utils";

export const Button = ({ children, variant = "primary", className, isLoading, disabled, ...props }) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-600",
    outline: "border border-slate-200 bg-transparent hover:bg-slate-50 text-slate-900 focus:ring-slate-200",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-200",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
  };
  
  return (
    <button 
      className={cn(baseStyles, variants[variant], "px-4 py-2", className)} 
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? "Loading..." : children}
    </button>
  );
};
