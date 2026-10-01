import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

const appName = import.meta.env.VITE_APP_NAME || 'ORIO E-Commerce';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: async (name) => {
        try {
            return await resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx'));
        } catch (error) {
            console.error(`Failed to load page component [${name}]:`, error);
            // If dynamic import failed (e.g. stale client chunk cache after rebuild), reload window
            if (typeof window !== 'undefined' && (error?.message?.includes('Failed to fetch') || error?.message?.includes('import'))) {
                window.location.reload();
            }
            throw error;
        }
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#D4AF37',
        showSpinner: true,
    },
});
