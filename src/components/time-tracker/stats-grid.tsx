'use client';

import { formatTime, formatShortTime } from '@/lib/time-utils';

interface StatsGridProps {
	weekOfMonth: number;
	weeklySeconds: number;
	weeklyTargetSeconds: number;
	weeklyPercentage: number;
	monthName: string;
	monthlySeconds: number;
	monthlyTargetSeconds: number;
	monthlyPercentage: number;
	streak: number;
	todayTargetSeconds: number;
	todayPercentage: number;
}

export function StatsGrid({
	weekOfMonth,
	weeklySeconds,
	weeklyTargetSeconds,
	weeklyPercentage,
	monthName,
	monthlySeconds,
	monthlyTargetSeconds,
	monthlyPercentage,
	streak,
	todayTargetSeconds,
	todayPercentage,
}: StatsGridProps) {
	return (
		<section className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
			<div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-100'>
				<div className='flex justify-between items-start mb-4'>
					<div>
						<p className='text-gray-600 text-sm font-medium mb-1'>
							Week {weekOfMonth}
						</p>
						<p className='text-2xl font-bold text-gray-900'>
							{formatTime(weeklySeconds)}
						</p>
					</div>
					<div
						className={`px-3 py-1 rounded-full text-sm font-semibold ${
							weeklyPercentage >= 100
								? 'bg-green-100 text-green-800'
								: weeklyPercentage >= 75
								? 'bg-blue-100 text-blue-800'
								: weeklyPercentage >= 50
								? 'bg-yellow-100 text-yellow-800'
								: 'bg-red-100 text-red-800'
						}`}>
						{weeklyPercentage}%
					</div>
				</div>
				<div className='space-y-2'>
					<div className='flex justify-between text-sm'>
						<span className='text-gray-500'>Target:</span>
						<span className='font-medium text-gray-700'>
							{formatTime(weeklyTargetSeconds)}
						</span>
					</div>
					<div className='w-full bg-gray-100 rounded-full h-2'>
						<div
							className={`h-2 rounded-full ${
								weeklyPercentage >= 100
									? 'bg-green-500'
									: weeklyPercentage >= 75
									? 'bg-blue-500'
									: weeklyPercentage >= 50
									? 'bg-yellow-500'
									: 'bg-red-500'
							}`}
							style={{ width: `${Math.min(100, weeklyPercentage)}%` }}
						/>
					</div>
					<p className='text-gray-500 text-sm mt-2'>
						{weeklyPercentage >= 100
							? '🎉 Weekly target achieved!'
							: weeklyPercentage >= 75
							? 'Almost at weekly target!'
							: 'Weekly progress'}
					</p>
				</div>
			</div>

			<div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-100'>
				<div className='flex justify-between items-start mb-4'>
					<div>
						<p className='text-gray-600 text-sm font-medium mb-1'>
							{monthName}
						</p>
						<p className='text-2xl font-bold text-gray-900'>
							{formatTime(monthlySeconds)}
						</p>
					</div>
					<div
						className={`px-3 py-1 rounded-full text-sm font-semibold ${
							monthlyPercentage >= 100
								? 'bg-green-100 text-green-800'
								: monthlyPercentage >= 75
								? 'bg-blue-100 text-blue-800'
								: monthlyPercentage >= 50
								? 'bg-yellow-100 text-yellow-800'
								: 'bg-red-100 text-red-800'
						}`}>
						{monthlyPercentage}%
					</div>
				</div>
				<div className='space-y-2'>
					<div className='flex justify-between text-sm'>
						<span className='text-gray-500'>Target:</span>
						<span className='font-medium text-gray-700'>
							{formatTime(monthlyTargetSeconds)}
						</span>
					</div>
					<div className='w-full bg-gray-100 rounded-full h-2'>
						<div
							className={`h-2 rounded-full ${
								monthlyPercentage >= 100
									? 'bg-green-500'
									: monthlyPercentage >= 75
									? 'bg-blue-500'
									: monthlyPercentage >= 50
									? 'bg-yellow-500'
									: 'bg-red-500'
							}`}
							style={{ width: `${Math.min(100, monthlyPercentage)}%` }}
						/>
					</div>
					<p className='text-gray-500 text-sm mt-2'>
						{monthlyPercentage >= 100
							? '🏆 Monthly target achieved!'
							: monthlyPercentage >= 75
							? 'Great monthly progress!'
							: 'Monthly tracking'}
					</p>
				</div>
			</div>

			<div className='bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-lg border border-blue-100'>
				<p className='text-blue-600 text-sm font-medium mb-2'>Streak</p>
				<div className='flex items-center gap-3 mb-4'>
					<div className='p-2 bg-linear-to-br from-blue-500 to-indigo-600 rounded-lg'>
						<span className='text-white'>🔥</span>
					</div>
					<div>
						<p className='text-3xl font-bold text-gray-900'>{streak} days</p>
						<p className='text-blue-600 text-sm'>Consecutive active days</p>
					</div>
				</div>
				<div className='bg-white/50 rounded-lg p-3'>
					<div className='flex justify-between text-sm mb-1'>
						<span className='text-gray-600'>Today's Target:</span>
						<span className='font-medium text-gray-700'>
							{formatShortTime(todayTargetSeconds)}
						</span>
					</div>
					<div className='flex justify-between text-sm'>
						<span className='text-gray-600'>Today's Progress:</span>
						<span
							className={`font-medium ${
								todayPercentage >= 100
									? 'text-green-600'
									: todayPercentage >= 75
									? 'text-blue-600'
									: todayPercentage >= 50
									? 'text-yellow-600'
									: 'text-red-600'
							}`}>
							{todayPercentage}%
						</span>
					</div>
				</div>
			</div>
		</section>
	);
}
