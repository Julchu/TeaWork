import * as React from 'react';
import { ButtonHTMLAttributes, forwardRef } from 'react';

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & {
    className: string;
  }
>(({ children, className, ...props }, ref) => {
  return (
    <button
      {...props}
      ref={ref}
      className={`inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-primary-foreground shadow hover:bg-primary/90 ${className}`}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';