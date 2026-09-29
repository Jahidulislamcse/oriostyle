import axios from 'axios';
import { route } from 'ziggy-js';
import { Ziggy } from './ziggy';

window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Ensure route helper is universally available across all Inertia React components
if (typeof window !== 'undefined') {
    const currentOrigin = window.location.origin;

    if (Ziggy) {
        Ziggy.url = currentOrigin;
        Ziggy.port = window.location.port ? parseInt(window.location.port, 10) : null;
    }

    window.Ziggy = window.Ziggy || Ziggy;
    if (window.Ziggy) {
        window.Ziggy.url = currentOrigin;
    }

    window.route = (name, params, absolute = false, config = window.Ziggy || Ziggy) => {
        if (!name) {
            return {
                current: (pattern, currentParams) => route(undefined, undefined, undefined, { ...config, url: currentOrigin, location: window.location.href }).current(pattern, currentParams),
                has: (routeName) => Boolean((config && config.routes && config.routes[routeName]) || (window.Ziggy && window.Ziggy.routes && window.Ziggy.routes[routeName])),
            };
        }

        try {
            return route(name, params, absolute, {
                ...config,
                url: currentOrigin,
                location: window.location.href,
            });
        } catch (e) {
            const fallbacks = {
                'login.store': '/login',
                'login': '/login',
                'register.store': '/register',
                'register': '/register',
                'logout': '/logout',
                'admin.dashboard': '/admin/dashboard',
                'admin.categories.index': '/admin/categories',
                'admin.categories.store': '/admin/categories',
                'admin.settings.index': '/admin/settings',
                'admin.settings.update': '/admin/settings',
                'admin.settings.clear-cache': '/admin/settings/clear-cache',
            };
            return fallbacks[name] || `/${name.replace(/\./g, '/')}`;
        }
    };
}
