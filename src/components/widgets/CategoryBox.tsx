"use client";

import {ReactNode} from 'react';
import {DivideIcon as LucideIcon} from 'lucide-react';

interface CategoryBoxProps {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}

export default function CategoryBox({ title, icon: Icon, children }: CategoryBoxProps) {
  return (
    <div className="relative p-[1px] rounded-xl group shadow hover:shadow-lg transition-all duration-300 z-0">
      {/* Gradient Border */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl opacity-50 group-hover:opacity-100 transition-opacity z-0" />
      
      {/* Inner Content */}
      <div className="relative glass dark:glass-dark rounded-xl p-6 bg-white dark:bg-gray-900/95">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg  group-hover:from-purple-500/20 group-hover:to-pink-500/20 transition-colors">
            <Icon className="h-5 w-5 item-center text-purple-600 dark:text-purple-400" />
          </div>
          <div className="font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {title}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}