import { cn } from "../../lib/utils";

export const Card = ({ children, className, ...props }) => {
  return (
    <div 
      className={cn(
        "bg-[var(--surface)] rounded-[var(--radius-lg)] border border-[var(--border)] overflow-hidden transition-[background-color,border-color,box-shadow] duration-200",
        "shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className }) => (
  <div className={cn("px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-soft)] flex items-center justify-between", className)}>
    {children}
  </div>
);

export const CardTitle = ({ children, className }) => (
  <h3 className={cn("text-base font-bold tracking-tight text-[var(--text-primary)]", className)}>{children}</h3>
);

export const CardContent = ({ children, className }) => (
  <div className={cn("p-6", className)}>
    {children}
  </div>
);
