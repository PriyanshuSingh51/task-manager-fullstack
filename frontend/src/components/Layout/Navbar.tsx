import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 dark:border-gray-700 dark:bg-gray-900">
      <Link to="/dashboard" className="text-lg font-bold">
        📋 Task Manager
      </Link>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="rounded px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        {user && (
          <>
            <span className="text-sm text-gray-500">Hi, {user.name}</span>
            <button
              onClick={handleLogout}
              className="rounded bg-gray-100 px-3 py-1.5 text-sm font-medium hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
};
