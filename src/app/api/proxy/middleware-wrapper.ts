// src/app/api/proxy/middleware-wrapper.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Same helper function
function getJWTSecret(): string | undefined {
	const secret = process.env.NEXTAUTH_SECRET;
	if (secret && secret.length === 64 && /^[0-9a-fA-F]+$/.test(secret)) {
		return Buffer.from(secret, 'hex').toString('hex');
	}
	return secret;
}

export async function middlewareWrapper(request: NextRequest) {
	let token = null;

	try {
		token = await getToken({
			req: request,
			secret: getJWTSecret(),
		});
	} catch (error) {
		console.error('Middleware token error:', error);
	}

	const searchParams = request.nextUrl.searchParams;

	// Your existing logic or forward to proxy
	const proxyUrl = new URL('/api/proxy', request.url);
	proxyUrl.search = request.nextUrl.search;

	return NextResponse.rewrite(proxyUrl);
}

// Matcher for specific routes
export const config = {
	matcher: ['/', '/tracker', '/api/((?!auth).*)'],
};
