import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export function Input({ label, error, className = "", ...props }: InputProps) {
    return (
        <div className="space-y-2 w-full">
            {label && (
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {label}
                </label>
            )
            }
            <input
                className={`w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-gray-900/5 focus:border-gray-900 placeholder:text-gray-400 ${className}`}
                {...props}
            />
            {error && (
                <p className="text-xs text-red-500 font-medium">{error}</p>
            )}
        </div>
    );
}
