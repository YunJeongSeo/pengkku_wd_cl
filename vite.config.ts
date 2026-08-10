import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const GS_ID = 'AKfycbzsWf6AO0JX8j-xvDLws9Md5fAnsLtUTtlo-Mimtgwa50k2GCsnWSQlofin_eP2cz_s';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		proxy: {
			'/api/gs': {
				target: `https://script.google.com/macros/s/${GS_ID}`,
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api\/gs/, ''),
			}
		}
	}
});
