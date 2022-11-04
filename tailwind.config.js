/** @type {import('tailwindcss/tailwind-config').TailwindConfig} */
module.exports = {
	content: [
    './node_modules/flowbite-react/**/*.js',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
	darkMode: 'class',
	theme: {
		extend: {},
	},
	plugins: [
    require('flowbite/plugin')
  ],
}
