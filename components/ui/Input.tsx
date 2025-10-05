
import React from 'react';
import { cn } from '../../utils';
import { R } from '../../constants';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ type = "text", placeholder, rightIcon, className = "", ...rest }) => {
    return (
        <div className={cn("w-full", className)}>
            <div className={cn("flex items-center border bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600", R.md)}>
                <input
                    type={type}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 outline-none bg-transparent text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                    {...rest}
                />
                {rightIcon && <div className="px-3 text-gray-400">{rightIcon}</div>}
            </div>
        </div>
    );
};

interface CheckboxProps {
    label: string;
    checked: boolean;
    onChange?: (checked: boolean) => void;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange }) => {
    return (
        <label className="inline-flex items-center gap-2 select-none">
            <input
                type="checkbox"
                checked={checked}
                onChange={e => onChange && onChange(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700 dark:text-gray-300 text-sm">{label}</span>
        </label>
    );
};
