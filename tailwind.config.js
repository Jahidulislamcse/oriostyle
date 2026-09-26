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
                // Official ORIO STYLE Brand Gold Palette (extracted from logo)
                gold: {
                    50: '#FDFBF5',
                    100: '#FBF5E6',
                    200: '#F5E7C2',
                    300: '#EBD495',
                    400: '#DFC068',
                    500: '#D4AF37', // Satin Metallic Gold
                    600: '#B89226',
                    700: '#926F18',
                    800: '#755615',
                    900: '#5E4413',
                    950: '#382607',
                },
                // Official ORIO STYLE Brand Navy Blue Palette (extracted from logo background)
                navy: {
                    50: '#F0F4F9',
                    100: '#DBE6F3',
                    200: '#BACDE3',
                    300: '#8EB0CF',
                    400: '#5E8CB6',
                    500: '#3B6D9B',
                    600: '#27527E',
                    700: '#1C3E63',
                    800: '#142C49',
                    850: '#10233B',
                    900: '#0E2038', // Logo Midnight Navy
                    950: '#071324', // Deep Canvas Obsidian Navy
                },
                brand: {
                    50: '#FDFBF5',
                    100: '#FBF5E6',
                    200: '#F5E7C2',
                    300: '#EBD495',
                    400: '#DFC068',
                    500: '#D4AF37',
                    600: '#B89226',
                    700: '#926F18',
                    800: '#755615',
                    900: '#5E4413',
                    950: '#382607',
                },
            },
        },
    },
    plugins: [],
};
