import { cn } from "../../lib/utils";

export const Card = ({ children, className, ...props }) => {
  return (
    <div 
      className={cn(
        "bg-[--surface] rounded-[--radius-md] border border-[--border] overflow-hidden transition-colors duration-200",
        "shadow-[--shadow-sm] hover:shadow-[--shadow-md]",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className }) => (
  <div className={cn("px-6 py-4 border-b border-[--border] flex items-center justify-between", className)}>
    {children}
  </div>
);

export const CardTitle = ({ children, className }) => (
  <h3 className={cn("text-lg font-semibold text-[--text-primary]", className)}>{children}</h3>
);

export const CardContent = ({ children, className }) => (
  <div className={cn("p-6", className)}>
    {children}
  </div>
);
