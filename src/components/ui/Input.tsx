import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import './Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, required, className = '', ...props }, ref) => {
    const id = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={`input-wrapper ${className}`}>
        {label && (
          <label htmlFor={id} className="input-label">
            {label}
            {required && <span className="input-required">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`input ${error ? 'input-error' : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          {...props}
        />
        {error && (
          <span id={`${id}-error`} className="input-error-text" role="alert">
            {error}
          </span>
        )}
        {helperText && !error && (
          <span id={`${id}-helper`} className="input-helper-text">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

