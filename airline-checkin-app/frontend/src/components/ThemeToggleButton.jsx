import React from 'react';
import { useTheme } from '../ThemeContext';

const ThemeToggleButton = () => {
  const { theme, toggleTheme } = useTheme();

  const buttonStyle = {
    background: 'none',
    border: '1px solid var(--color-border)',
    padding: '0.5rem',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '1.25rem',
    lineHeight: 0,
  };

  return (
    <button onClick={toggleTheme} style={buttonStyle} aria-label="Toggle theme">
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};

export default ThemeToggleButton;