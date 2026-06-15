import React, { ReactNode } from 'react';

type ButtonProps = {
  children: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  href?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
};

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  href,
  type = 'button',
  disabled = false,
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary-focus focus:ring-primary',
    secondary: 'bg-slate-200 text-slate-800 hover:bg-slate-300 focus:ring-slate-400',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  const disabledStyles = 'opacity-50 cursor-not-allowed';

  const classes = [
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    disabled ? disabledStyles : '',
    className,
  ].join(' ');

  const radiusStyle = { borderRadius: 'var(--radius-btn, 6px)' };

  if (href) {
    return (
      <a href={href} className={classes} style={radiusStyle} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={classes} style={radiusStyle} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};

export default Button;
