import React, { ReactNode } from 'react';
import { Navbar } from './Navbar';

export const AppLayout: React.FC<{ children: ReactNode }> = ({ children }) => (
  <div className="flex min-h-screen flex-col">
    <Navbar />
    <main className="flex-1 p-6">{children}</main>
  </div>
);
