import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	reactCompiler: true,
	trailingSlash: false,

	// Add this for Next.js 15+ proxy support
	experimental: {
		proxyPrefetch: 'strict',
	},

	images: {
		unoptimized: false,
		// Replace domains with remotePatterns
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'lh3.googleusercontent.com',
				pathname: '**',
			},
		],
	},
	serverExternalPackages: ['mongoose'],
};

export default nextConfig;
