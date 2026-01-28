import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    className = "",
    ...props
}: ButtonProps) {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

    const variants = {
        primary: "bg-black text-white hover:bg-gray-800 shadow-sm",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
        outline: "bg-transparent border border-gray-200 text-gray-900 hover:bg-gray-50",
        ghost: "bg-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900",
    };

    const sizes = {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-5 text-sm",
        lg: "h-12 px-8 text-base",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
