import type { HTMLAttributes, ReactNode } from 'react';
import './Card.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
}

export const Card = ({ children, hover = false, className = '', ...props }: CardProps) => {
  return (
    <div className={`card ${hover ? 'card-hover' : ''} ${className}`} {...props}>
      {children}
    </div>
  );
};

