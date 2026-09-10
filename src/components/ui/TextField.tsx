import { forwardRef, type InputHTMLAttributes } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    const inputId = id ?? props.name;

    return (
      <div className="mb-5">
        <label htmlFor={inputId} className="mb-2 block text-sm text-text-secondary">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`w-full rounded-lg border bg-bg px-4 py-3 text-[15px] text-text-primary
            placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40
            ${error ? 'border-danger' : 'border-border focus:border-accent'} ${className}`}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-xs text-danger">
            {error}
          </p>
        )}
      </div>
    );
  }
);

TextField.displayName = 'TextField';
