import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
	const token = await getToken({
		req: request,
		secret: process.env.NEXTAUTH_SECRET,
	});
	const url = request.nextUrl.clone();
	const searchParams = request.nextUrl.searchParams;

	// Debug logging
	console.log('Middleware triggered for:', request.nextUrl.pathname);
	console.log('Token exists:', !!token);
	console.log('useLocalStorage param:', searchParams.get('useLocalStorage'));
	console.log(
		'Cookies:',
		request.cookies
			.getAll()
			.map((c) => `${c.name}=${c.value}`)
			.join(', '),
	);

	// Check for explicit sign-out or mode change
	const isExplicitSignOut = searchParams.get('signout') === 'true';
	const isClearLocalStorage = searchParams.get('clearLocalStorage') === 'true';

	// Handle landing page access
	if (request.nextUrl.pathname === '/') {
		// If user explicitly wants to sign out or clear local storage
		if (isExplicitSignOut || isClearLocalStorage) {
			console.log('Explicit sign out requested, clearing cookies');
			const response = NextResponse.next();
			// Clear the local storage mode cookie
			response.cookies.delete('local-storage-mode');
			// Also delete from request headers to prevent immediate redirect
			response.headers.set('x-clear-local-storage', 'true');
			return response;
		}

		// Check if user is authenticated (has token)
		if (token) {
			console.log('User authenticated, redirecting to /tracker');
			url.pathname = '/tracker';
			return NextResponse.redirect(url);
		}

		// Check for localStorage mode via URL parameter (user clicked "Use Local Storage")
		if (searchParams.get('useLocalStorage') === 'true') {
			console.log('Local storage mode requested, redirecting to /tracker');
			url.pathname = '/tracker';
			url.searchParams.set('useLocalStorage', 'true');
			return NextResponse.redirect(url);
		}

		// Check for localStorage mode via cookie - BUT allow access to landing page
		// so user can see the landing page even if they previously used local storage
		const localStorageMode = request.cookies.get('local-storage-mode');
		if (localStorageMode?.value === 'true') {
			console.log(
				'Local storage mode active, but allowing landing page access',
			);
			// User can still see the landing page to choose options
			return NextResponse.next();
		}

		// Allow access to landing page
		console.log('Showing landing page');
		return NextResponse.next();
	}

	// Handle tracker page access control
	if (request.nextUrl.pathname === '/tracker') {
		// Check for localStorage mode via URL parameter (highest priority)
		if (searchParams.get('useLocalStorage') === 'true') {
			console.log('Local storage mode via URL param, allowing access');
			// Set a cookie to remember local storage mode
			const response = NextResponse.next();
			response.cookies.set('local-storage-mode', 'true', {
				maxAge: 60 * 60 * 24 * 30, // 30 days
				path: '/',
				httpOnly: true,
			});
			return response;
		}

		// Check for localStorage mode via cookie
		const localStorageMode = request.cookies.get('local-storage-mode');
		if (localStorageMode?.value === 'true') {
			console.log('Local storage mode via cookie, allowing access');
			return NextResponse.next();
		}

		// Check if user is authenticated (has token)
		if (token) {
			console.log('User authenticated, allowing access');
			return NextResponse.next();
		}

		// User is not authenticated AND hasn't chosen local storage mode
		console.log('Unauthorized access to /tracker, redirecting to /');
		url.pathname = '/';
		// Clear any stale cookies
		const response = NextResponse.redirect(url);
		response.cookies.delete('local-storage-mode');
		return response;
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
