'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SignOutPage() {
	const router = useRouter();

	useEffect(() => {
		const performSignOut = async () => {
			try {
				// Clear ALL local storage first
				if (typeof window !== 'undefined') {
					// Clear all localStorage items that start with 'next-auth.'
					Object.keys(localStorage).forEach((key) => {
						if (key.startsWith('next-auth.')) {
							localStorage.removeItem(key);
						}
					});

					// Clear your app's local storage
					localStorage.removeItem('time-track-data');
					localStorage.removeItem('time-tracker-timer-state');
					localStorage.removeItem('time-tracker-target-settings');
					localStorage.removeItem('time-tracker-sync-queue');
				}

				// Sign out from NextAuth with proper redirect
				await signOut({
					redirect: true, // Let NextAuth handle the redirect
					callbackUrl: '/',
				});

				// NextAuth will handle the redirect, but just in case:
				setTimeout(() => {
					window.location.href = '/';
				}, 1000);
			} catch (error) {
				console.error('Sign out error:', error);
				// Force hard refresh as fallback
				window.location.href = '/';
			}
		};

		performSignOut();
	}, [router]);

	return (
		<div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'>
			<div className='max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center'>
				<div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6'>
					<span className='text-2xl'>👋</span>
				</div>
				<h1 className='text-2xl font-bold text-gray-900 mb-4'>
					Signing Out...
				</h1>
				<p className='text-gray-600 mb-6'>
					You are being signed out. Redirecting to home page...
				</p>
				<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
			</div>
		</div>
	);
}
