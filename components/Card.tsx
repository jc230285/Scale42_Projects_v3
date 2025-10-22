'use client';

import React from 'react';

export interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

function Card({ title, children, className = '', headerAction }: CardProps) {
  return (
    <div className={`bg-zinc-900 rounded-lg shadow border border-zinc-700 ${className}`}>
      {(title || headerAction) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-700">
          {title && <h3 className="text-lg font-medium text-zinc-100">{title}</h3>}
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

export default Card;