'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';

export default function SignOutPage() {
	useEffect(() => {
		const performSignOut = async () => {
			try {
				// Force a hard sign out with no caching
				await signOut({
					redirect: true,
					callbackUrl: '/?signout=true&hard=' + Date.now(),
				});
			} catch (error) {
				console.error('Sign out error:', error);
				// Force hard refresh as fallback
				window.location.href = '/?signout=true&error=' + Date.now();
			}
		};

		performSignOut();
	}, []);

	return (
		<div className='min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50'>
			<div className='max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center'>
				<div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6'>
					<span className='text-2xl'>👋</span>
				</div>
				<h1 className='text-2xl font-bold text-gray-900 mb-4'>
					Signing Out...
				</h1>
				<p className='text-gray-600 mb-6'>
					Please wait while we securely sign you out.
				</p>
				<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
			</div>
		</div>
	);
}
