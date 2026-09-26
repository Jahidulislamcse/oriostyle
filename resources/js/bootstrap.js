import axios from 'axios';
import { route } from 'ziggy-js';
import { Ziggy } from './ziggy';

window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Ensure route helper is universally available across all Inertia React components
if (typeof window !== 'undefined') {
    window.Ziggy = window.Ziggy || Ziggy;
    window.route = (name, params, absolute, config = window.Ziggy) => {
        return route(name, params, absolute, config);
    };
}
