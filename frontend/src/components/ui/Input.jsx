import { forwardRef } from "react";
import { cn } from "../../lib/utils";

export const Input = forwardRef(({ className, error, label, helperText, icon: Icon, ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm font-semibold text-[var(--text-primary)]">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            <Icon size={18} />
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            "flex h-11 w-full rounded-[var(--radius-md)] border bg-[var(--surface)] px-3.5 py-2 text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-primary-500",
            "disabled:cursor-not-allowed disabled:opacity-50",
            Icon && "pl-10",
            error
              ? "border-danger focus:ring-red-200 dark:focus:ring-red-900/30"
              : "border-[var(--border)] hover:border-primary-300 dark:hover:border-primary-600",
            className
          )}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-danger font-medium">{error}</span>}
      {helperText && !error && <span className="text-xs text-[var(--text-muted)]">{helperText}</span>}
    </div>
  );
});
Input.displayName = "Input";
