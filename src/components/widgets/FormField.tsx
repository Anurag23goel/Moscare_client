"use client";

import {ReactNode} from 'react';
import {Info} from 'lucide-react';

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
  required?: boolean;
}

export default function FormField({ label, error, children, required }: FormFieldProps) {
  return (
    <div className="relative space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <Info className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
}