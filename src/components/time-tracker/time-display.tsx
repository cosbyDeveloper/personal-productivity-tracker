'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
	formatTime,
	getTargetSecondsForDate,
	calculateTargetPercentage,
} from '@/lib/time-utils';

interface TimeDisplayProps {
	selectedDate: Date;
	secondsToday: number;
	percent: number;
}

export function TimeDisplay({ selectedDate, secondsToday }: TimeDisplayProps) {
	const isToday = selectedDate.toDateString() === new Date().toDateString();
	const targetSeconds = getTargetSecondsForDate(selectedDate);
	const percent = calculateTargetPercentage(secondsToday, targetSeconds);
	const remainingSeconds = Math.max(0, targetSeconds - secondsToday);

	// Get day type info
	const dayOfWeek = selectedDate.getDay();
	const dayType =
		dayOfWeek === 0 ? 'Sunday' : dayOfWeek === 6 ? 'Saturday' : 'Weekday';
	const targetHours = dayOfWeek === 0 ? 11 : dayOfWeek === 6 ? 3.5 : 13.5;

	// Get progress color based on percentage
	const getProgressColor = () => {
		if (percent >= 100) return 'from-emerald-500 to-green-600';
		if (percent >= 75) return 'from-blue-500 to-indigo-600';
		if (percent >= 50) return 'from-amber-500 to-orange-600';
		return 'from-red-500 to-pink-600';
	};

	const getProgressTextColor = () => {
		if (percent >= 100) return 'text-emerald-700 dark:text-emerald-300';
		if (percent >= 75) return 'text-blue-700 dark:text-blue-300';
		if (percent >= 50) return 'text-amber-700 dark:text-amber-300';
		return 'text-red-700 dark:text-red-300';
	};

	const getProgressMessage = () => {
		if (percent >= 100) return '🎉 Target Achieved!';
		if (percent >= 90) return '🔥 Almost There!';
		if (percent >= 75) return '💪 Great Progress!';
		if (percent >= 50) return '✓ Halfway There!';
		if (percent >= 25) return '🚀 Keep Going!';
		return '✨ Get Started!';
	};

	const getProgressEmoji = () => {
		if (percent >= 100) return '🏆';
		if (percent >= 90) return '🔥';
		if (percent >= 75) return '💪';
		if (percent >= 50) return '✓';
		if (percent >= 25) return '🚀';
		return '✨';
	};

	return (
		<Card className='bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden'>
			{/* Progress bar as header accent */}
			<div className={`h-1 w-full bg-linear-to-r ${getProgressColor()}`} />

			<div className='p-6'>
				<div className='flex justify-between items-start mb-6'>
					<div>
						<p className='text-sm font-medium text-gray-600 dark:text-gray-400 mb-1'>
							{isToday ? '📅 Today' : '📅 Selected Day'}
						</p>
						<p className='text-xl font-bold text-gray-900 dark:text-white'>
							{selectedDate.toLocaleDateString('en-US', {
								weekday: 'long',
								year: 'numeric',
								month: 'long',
								day: 'numeric',
							})}
						</p>
						<p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
							{dayType} target:{' '}
							<span className='font-semibold'>{targetHours}h</span>
						</p>
					</div>
					{isToday && (
						<div className='flex items-center gap-2'>
							<div className='relative'>
								<div className='w-3 h-3 bg-green-500 rounded-full animate-ping' />
								<div className='w-3 h-3 bg-green-600 rounded-full absolute top-0' />
							</div>
							<span className='px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 text-sm font-semibold rounded-full border border-green-200 dark:border-green-800'>
								Live Tracking
							</span>
						</div>
					)}
				</div>

				{/* Main Time Display */}
				<div className='mb-8'>
					<div className='flex items-baseline gap-3 mb-4'>
						<p className='text-5xl font-bold text-gray-900 dark:text-white'>
							{formatTime(secondsToday)}
						</p>
						<div className='flex-1'>
							<p className='text-sm text-gray-600 dark:text-gray-400 mb-1'>
								Daily Target:{' '}
								<span className='font-semibold'>
									{formatTime(targetSeconds)}
								</span>
							</p>
							<div className='flex items-center gap-3'>
								<div className='flex-1'>
									<Progress
										value={percent}
										className={`h-3 bg-gray-100 dark:bg-gray-800`}
									/>
								</div>
								<span className={`text-lg font-bold ${getProgressTextColor()}`}>
									{percent}%
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Stats Grid with better colors */}
				<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
					<div className='bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30'>
						<p className='text-sm font-medium text-blue-700 dark:text-blue-300 mb-1'>
							⏱️ Time Tracked
						</p>
						<p className='text-2xl font-bold text-gray-900 dark:text-white'>
							{formatTime(secondsToday)}
						</p>
						<div className='mt-2 flex items-center'>
							<div className='flex-1 h-2 bg-blue-100 dark:bg-blue-900/30 rounded-full overflow-hidden'>
								<div
									className={`h-full bg-linear-to-r from-blue-500 to-indigo-600`}
									style={{ width: `${Math.min(100, percent)}%` }}
								/>
							</div>
							<span className='ml-2 text-sm font-medium text-blue-700 dark:text-blue-300'>
								{percent}%
							</span>
						</div>
					</div>

					<div className='bg-linear-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/30'>
						<p className='text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-1'>
							✅ Progress
						</p>
						<p className='text-2xl font-bold text-gray-900 dark:text-white'>
							{percent}%
						</p>
						<div className='mt-2 flex items-center'>
							<div className='flex-1 h-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full overflow-hidden'>
								<div
									className={`h-full bg-linear-to-r from-emerald-500 to-green-600`}
									style={{ width: `${Math.min(100, percent)}%` }}
								/>
							</div>
							<span className='ml-2 text-sm font-medium text-emerald-700 dark:text-emerald-300'>
								{getProgressMessage().replace(/[^a-zA-Z\s!]/g, '')}
							</span>
						</div>
					</div>

					<div className='bg-linear-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800/30'>
						<p className='text-sm font-medium text-amber-700 dark:text-amber-300 mb-1'>
							⏳ Time Remaining
						</p>
						<p className='text-2xl font-bold text-gray-900 dark:text-white'>
							{formatTime(remainingSeconds)}
						</p>
						<div className='mt-2 flex items-center'>
							<div className='flex-1 h-2 bg-amber-100 dark:bg-amber-900/30 rounded-full overflow-hidden'>
								<div
									className={`h-full bg-linear-to-r from-amber-500 to-orange-600`}
									style={{ width: `${Math.min(100, 100 - percent)}%` }}
								/>
							</div>
							<span className='ml-2 text-sm font-medium text-amber-700 dark:text-amber-300'>
								{Math.round(100 - percent)}% left
							</span>
						</div>
					</div>
				</div>

				{/* Day target info */}
				<div className='mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl'>
					<p className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
						📊 Day Target Details
					</p>
					<div className='grid grid-cols-2 gap-4'>
						<div>
							<p className='text-xs text-gray-600 dark:text-gray-400'>
								Day Type
							</p>
							<p className='text-lg font-bold text-gray-900 dark:text-white'>
								{dayType}
							</p>
						</div>
						<div>
							<p className='text-xs text-gray-600 dark:text-gray-400'>
								Target Hours
							</p>
							<p className='text-lg font-bold text-gray-900 dark:text-white'>
								{targetHours}h
							</p>
						</div>
						<div>
							<p className='text-xs text-gray-600 dark:text-gray-400'>
								Hours Completed
							</p>
							<p className='text-lg font-bold text-gray-900 dark:text-white'>
								{(secondsToday / 3600).toFixed(1)}h
							</p>
						</div>
						<div>
							<p className='text-xs text-gray-600 dark:text-gray-400'>
								Completion
							</p>
							<p className={`text-lg font-bold ${getProgressTextColor()}`}>
								{percent}%
							</p>
						</div>
					</div>
				</div>
			</div>
		</Card>
	);
}
