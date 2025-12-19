import './bootstrap';
import React from 'react';
import ReactDOM from 'react-dom/client';
import Dashboard from './components/Dashboard';

if (document.getElementById('app')) {
    const root = ReactDOM.createRoot(document.getElementById('app'));
    root.render(
        <React.StrictMode>
            <Dashboard />
        </React.StrictMode>
    );
}
