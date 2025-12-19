'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function LandingPage() {
	return (
		<div className='min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 p-4'>
			<div className='max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8'>
				<div className='text-center'>
					<div className='w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6'>
						<span className='text-3xl'>⏱️</span>
					</div>
					<h1 className='text-3xl font-bold text-gray-900 mb-4'>
						Productivity Time Tracker
					</h1>
					<p className='text-gray-600 mb-8 text-lg'>
						Track your productive hours with smart daily targets. Choose how you
						want to use the app:
					</p>

					<div className='grid md:grid-cols-2 gap-6 mb-8'>
						{/* Cloud Sync Option */}
						<div className='border-2 border-blue-200 rounded-xl p-6 hover:border-blue-400 transition-colors'>
							<div className='w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center mx-auto mb-4'>
								<span className='text-xl'>☁️</span>
							</div>
							<h3 className='text-xl font-bold text-gray-900 mb-3'>
								Cloud Sync
							</h3>
							<ul className='text-gray-600 text-left mb-6 space-y-2'>
								<li className='flex items-center gap-2'>
									<span className='text-green-500'>✓</span> Access from any
									device
								</li>
								<li className='flex items-center gap-2'>
									<span className='text-green-500'>✓</span> Automatic backup
								</li>
								<li className='flex items-center gap-2'>
									<span className='text-green-500'>✓</span> Real-time sync
								</li>
							</ul>
							<button
								onClick={() => {
									document.cookie =
										'local-storage-mode=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
									signIn(undefined, {
										callbackUrl: `${window.location.origin}/tracker`,
									});
								}}
								className='w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors'>
								Sign In / Sign Up
							</button>
							<button
								onClick={() => {
									document.cookie =
										'local-storage-mode=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
									signIn('google', {
										callbackUrl: `${
											window.location.origin
										}/tracker?auth=google&ts=${Date.now()}`,
									});
								}}
								className='w-full mt-3 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-3'>
								<svg className='w-5 h-5' viewBox='0 0 24 24'>
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
							</button>
						</div>

						{/* Local Storage Option */}
						<div className='border-2 border-gray-200 rounded-xl p-6 hover:border-gray-400 transition-colors'>
							<div className='w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4'>
								<span className='text-xl'>💾</span>
							</div>
							<h3 className='text-xl font-bold text-gray-900 mb-3'>
								Local Storage
							</h3>
							<ul className='text-gray-600 text-left mb-6 space-y-2'>
								<li className='flex items-center gap-2'>
									<span className='text-green-500'>✓</span> No account needed
								</li>
								<li className='flex items-center gap-2'>
									<span className='text-green-500'>✓</span> Works offline
								</li>
								<li className='flex items-center gap-2'>
									<span className='text-green-500'>✓</span> Private to this
									device
								</li>
								<li className='flex items-center gap-2'>
									<span className='text-green-500'>✓</span> Data persists
									locally
								</li>
							</ul>
							<Link
								href='/tracker?useLocalStorage=true'
								className='block w-full px-6 py-3 border-2 border-gray-800 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition-colors text-center'>
								Use Local Storage
							</Link>
							<p className='text-xs text-gray-500 mt-3'>
								Your data stays only on this device/browser
							</p>
						</div>
					</div>

					<p className='text-gray-500 text-sm'>
						You can switch between modes anytime. Your local data is always
						preserved.
					</p>
				</div>
			</div>
		</div>
	);
}
