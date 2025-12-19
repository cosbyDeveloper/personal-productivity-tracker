import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
	const token = await getToken({
		req: request,
		secret: process.env.NEXTAUTH_SECRET,
	});

	const url = request.nextUrl.clone();
	const searchParams = request.nextUrl.searchParams;

	// Debug logging - enhanced
	console.log('=== MIDDLEWARE LOG ===');
	console.log('Path:', request.nextUrl.pathname);
	console.log('Has Auth Token:', !!token);
	console.log('useLocalStorage param:', searchParams.get('useLocalStorage'));
	console.log(
		'All Cookies:',
		request.cookies.getAll().map((c) => c.name),
	);
	console.log('======================');

	// Handle landing page access - CHECK AUTH FIRST!
	if (request.nextUrl.pathname === '/') {
		// 1. FIRST: Check if user is authenticated (highest priority)
		if (token) {
			console.log('User authenticated, redirecting to /tracker');
			url.pathname = '/tracker';
			return NextResponse.redirect(url);
		}

		// 2. Check for localStorage mode via URL parameter
		if (searchParams.get('useLocalStorage') === 'true') {
			console.log('Local storage mode requested, redirecting to /tracker');
			url.pathname = '/tracker';
			url.searchParams.set('useLocalStorage', 'true');
			return NextResponse.redirect(url);
		}

		// 3. Check for localStorage mode via cookie (lowest priority)
		const localStorageMode = request.cookies.get('local-storage-mode');
		if (localStorageMode?.value === 'true') {
			console.log(
				'Local storage mode cookie exists, but user is not authenticated',
			);
			// We could clear it here if we want
			const response = NextResponse.next();
			response.cookies.delete('local-storage-mode');
			return response;
		}

		// Allow access to landing page
		console.log('No auth or localStorage mode - showing landing page');
		return NextResponse.next();
	}

	// Handle tracker page access control
	if (request.nextUrl.pathname === '/tracker') {
		// 1. Check for localStorage mode via URL parameter (highest priority)
		if (searchParams.get('useLocalStorage') === 'true') {
			console.log('Local storage mode via URL param, allowing access');
			const response = NextResponse.next();
			response.cookies.set('local-storage-mode', 'true', {
				maxAge: 60 * 60 * 24 * 30,
				path: '/',
				httpOnly: true,
			});
			return response;
		}

		// 2. Check if user is authenticated
		if (token) {
			console.log('User authenticated, allowing access');
			return NextResponse.next();
		}

		// 3. Check for localStorage mode via cookie (lowest priority)
		const localStorageMode = request.cookies.get('local-storage-mode');
		if (localStorageMode?.value === 'true') {
			console.log('Local storage mode via cookie, allowing access');
			return NextResponse.next();
		}

		// User is not authenticated AND hasn't chosen local storage mode
		console.log('Unauthorized access to /tracker, redirecting to /');
		url.pathname = '/';
		return NextResponse.redirect(url);
	}

	// Protect API routes that require authentication
	if (
		request.nextUrl.pathname.startsWith('/api/time-entries') &&
		!request.nextUrl.pathname.startsWith('/api/auth/')
	) {
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
	matcher: ['/', '/tracker', '/api/((?!auth).*)'],
};
