import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";

export const Button = ({ children, variant = "primary", size = "md", className, isLoading, disabled, ...props }) => {
  const base = "inline-flex items-center justify-center font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm hover:shadow-md",
    secondary: "border-2 border-[--border] bg-[--surface] text-[--text-primary] hover:bg-[--surface-soft] hover:border-primary-300 dark:hover:border-primary-600",
    ghost: "bg-transparent text-[--text-secondary] hover:bg-[--surface-soft] hover:text-[--text-primary]",
    danger: "bg-danger text-white hover:bg-red-600 active:bg-red-700 shadow-sm",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
    md: "h-10 px-4 text-sm rounded-[--radius-sm] gap-2",
    lg: "h-12 px-6 text-base rounded-[--radius-md] gap-2.5",
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <Loader2 size={16} className="animate-spin" />}
      {isLoading ? "Loading..." : children}
    </button>
  );
};
