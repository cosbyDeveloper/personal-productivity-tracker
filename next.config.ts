import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	reactCompiler: true,
	trailingSlash: false,
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
