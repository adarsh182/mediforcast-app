import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import { Toaster } from 'react-hot-toast';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <UserProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              className: '!bg-white/70 dark:!bg-black/60 !backdrop-blur-xl !border !border-th-border/30 !text-th-text !shadow-xl !rounded-2xl',
              style: {
                background: 'transparent',
                boxShadow: 'none',
              },
            }}
          />
          <App />
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);
