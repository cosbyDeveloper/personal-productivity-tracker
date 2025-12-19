import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
	const token = await getToken({ req: request });
	const url = request.nextUrl.clone();
	const searchParams = request.nextUrl.searchParams;

	// Handle tracker page access control
	if (request.nextUrl.pathname === '/tracker') {
		// Check if user is authenticated (has token)
		if (token) {
			// User is logged in, allow access
			return NextResponse.next();
		}

		// Check for localStorage mode via URL parameter
		if (searchParams.get('useLocalStorage') === 'true') {
			// Set a cookie to remember local storage mode for future requests
			const response = NextResponse.next();
			response.cookies.set('local-storage-mode', 'true', {
				maxAge: 60 * 60 * 24 * 30, // 30 days
				path: '/',
			});
			return response;
		}

		// Check for localStorage mode via cookie (previously set)
		const localStorageMode = request.cookies.get('local-storage-mode');
		if (localStorageMode?.value === 'true') {
			// User previously chose local storage mode, allow access
			return NextResponse.next();
		}

		// User is not authenticated AND hasn't chosen local storage mode
		// Redirect to landing page
		console.log('Unauthorized access to /tracker, redirecting to /');
		url.pathname = '/';
		return NextResponse.redirect(url);
	}

	// Handle landing page redirect logic
	if (request.nextUrl.pathname === '/') {
		// Check if user has an active session
		if (token) {
			console.log('User authenticated, redirecting to /tracker');
			url.pathname = '/tracker';
			return NextResponse.redirect(url);
		}

		// Check for localStorage mode parameter (from landing page button)
		if (searchParams.get('useLocalStorage') === 'true') {
			console.log('Local storage mode requested, redirecting to /tracker');
			url.pathname = '/tracker';
			url.searchParams.set('useLocalStorage', 'true');
			return NextResponse.redirect(url);
		}

		// Check for localStorage mode in cookies
		const localStorageMode = request.cookies.get('local-storage-mode');
		if (localStorageMode?.value === 'true') {
			console.log('Local storage mode active, redirecting to /tracker');
			url.pathname = '/tracker';
			return NextResponse.redirect(url);
		}

		// If none of the above, allow access to landing page
		return NextResponse.next();
	}

	// Protect API routes that require authentication
	if (
		request.nextUrl.pathname.startsWith('/api/time-entries') &&
		!request.nextUrl.pathname.startsWith('/api/auth/')
	) {
		// Check for query parameter to allow local storage mode
		if (searchParams.get('useLocalStorage') === 'true') {
			return NextResponse.next();
		}

		if (!token) {
			return new NextResponse(
				JSON.stringify({
					error: 'Authentication required for cloud sync',
					message: 'Use local storage mode or sign in',
				}),
				{ status: 401, headers: { 'content-type': 'application/json' } },
			);
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		// Handle landing page and tracker routing
		'/',
		'/tracker',
		// Protect API routes except auth
		'/api/((?!auth).*)',
	],
};
