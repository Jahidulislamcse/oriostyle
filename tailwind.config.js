/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./resources/**/*.blade.php",
        "./resources/**/*.js",
        "./resources/**/*.jsx",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
            },
            colors: {
                brand: {
                    50: '#fbf9f2',
                    100: '#f6f1df',
                    200: '#ece1be',
                    300: '#deca94',
                    400: '#d1b369',
                    500: '#C8A844', // User specified exact color #C8A844
                    600: '#b29134',
                    700: '#8e7127',
                    800: '#755b23',
                    900: '#634d21',
                    950: '#392a0f',
                },
            },
        },
    },
    plugins: [],
};
