'use client';

import { useState, useEffect } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';

export default function SignInPage() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	useEffect(() => {
		// Store callback URL from query params (passed by NextAuth)
		const searchParams = new URLSearchParams(window.location.search);
		const callbackUrl = searchParams.get('callbackUrl');

		if (callbackUrl) {
			sessionStorage.setItem('auth-callback-url', callbackUrl);
		}

		getSession().then((session) => {
			if (session) {
				// Redirect to callback URL or default to /tracker
				const callbackUrl =
					sessionStorage.getItem('auth-callback-url') || '/tracker';
				sessionStorage.removeItem('auth-callback-url');
				router.push(callbackUrl);
			}
		});
	}, [router]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const result = await signIn('credentials', {
				email,
				password,
				redirect: false,
			});

			if (result?.error) {
				alert('Invalid credentials. Please try again.');
			} else {
				// Clear local storage mode
				document.cookie =
					'local-storage-mode=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

				// Get callback URL from sessionStorage or use default
				const callbackUrl =
					sessionStorage.getItem('auth-callback-url') || '/tracker';
				sessionStorage.removeItem('auth-callback-url');

				// Add cache-busting parameter
				const finalUrl =
					callbackUrl +
					(callbackUrl.includes('?') ? '&' : '?') +
					'auth=email&ts=' +
					Date.now();

				// Redirect to the callback URL
				router.push(finalUrl);
				router.refresh();
			}
		} catch (error) {
			console.error('Login error:', error);
			alert('An error occurred. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	const handleGoogleSignIn = () => {
		// Get callback URL from sessionStorage or use default
		const callbackUrl =
			sessionStorage.getItem('auth-callback-url') ||
			`${window.location.origin}/tracker`;
		sessionStorage.removeItem('auth-callback-url');

		// Clear local storage mode
		document.cookie =
			'local-storage-mode=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

		signIn('google', {
			callbackUrl:
				callbackUrl +
				(callbackUrl.includes('?') ? '&' : '?') +
				'auth=google&ts=' +
				Date.now(),
		});
	};

	return (
		<div className='min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 p-4'>
			<Card className='w-full max-w-md shadow-xl'>
				<CardHeader className='space-y-1'>
					<CardTitle className='text-2xl font-bold text-center'>
						Welcome to Productivity Tracker
					</CardTitle>
					<CardDescription className='text-center'>
						Sign in to sync your data across devices
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='email'>Email</Label>
							<Input
								id='email'
								type='email'
								placeholder='you@example.com'
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								disabled={isLoading}
							/>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='password'>Password</Label>
							<Input
								id='password'
								type='password'
								placeholder='••••••••'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								disabled={isLoading}
							/>
						</div>

						<Button type='submit' className='w-full' disabled={isLoading}>
							{isLoading ? 'Signing in...' : 'Sign In / Sign Up'}
						</Button>
					</form>

					<div className='mt-6'>
						<div className='relative'>
							<div className='absolute inset-0 flex items-center'>
								<div className='w-full border-t border-gray-300'></div>
							</div>
							<div className='relative flex justify-center text-sm'>
								<span className='px-2 bg-white text-gray-500'>
									Or continue with
								</span>
							</div>
						</div>

						<div className='mt-6'>
							<Button
								onClick={handleGoogleSignIn}
								variant='outline'
								className='w-full'
								disabled={isLoading}>
								<svg className='w-5 h-5 mr-2' viewBox='0 0 24 24'>
									<path
										fill='#4285F4'
										d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
									/>
									<path
										fill='#34A853'
										d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
									/>
									<path
										fill='#FBBC05'
										d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
									/>
									<path
										fill='#EA4335'
										d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
									/>
								</svg>
								Continue with Google
							</Button>
						</div>
					</div>

					<div className='mt-6 text-center text-sm text-gray-600'>
						<p>Your data will sync across all your devices</p>
						<p className='mt-2 text-xs text-gray-500'>
							New users will be automatically created on first sign in
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
