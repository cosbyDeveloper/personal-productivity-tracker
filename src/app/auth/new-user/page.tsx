'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewUserPage() {
	const router = useRouter();

	useEffect(() => {
		// Redirect to home page after 2 seconds
		const timer = setTimeout(() => {
			router.push('/');
		}, 2000);

		return () => clearTimeout(timer);
	}, [router]);

	return (
		<div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'>
			<div className='max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center'>
				<div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6'>
					<span className='text-2xl text-green-600'>✓</span>
				</div>
				<h1 className='text-2xl font-bold text-gray-900 mb-4'>
					Welcome! Account Created
				</h1>
				<p className='text-gray-600 mb-6'>
					Your account has been successfully created. Redirecting you to the
					app...
				</p>
				<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
			</div>
		</div>
	);
}
