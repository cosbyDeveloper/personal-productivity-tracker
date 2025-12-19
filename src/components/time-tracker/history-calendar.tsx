'use client';

import { Card, CardContent } from '@/components/ui/card';
import {
	formatTime,
	formatShortTime,
	getTargetSecondsForDate,
} from '@/lib/time-utils';

interface HistoryEntry {
	date: Date;
	sec: number;
}

interface HistoryCalendarProps {
	selectedDate: Date;
	monthEntries: HistoryEntry[];
	weeks: Record<number, HistoryEntry[]>;
	monthlySeconds: number;
	monthlyTargetSeconds: number;
}

export function HistoryCalendar({
	selectedDate,
	monthEntries,
	weeks,
	monthlySeconds,
	monthlyTargetSeconds,
}: HistoryCalendarProps) {
	const monthName = selectedDate.toLocaleString('default', {
		month: 'long',
		year: 'numeric',
	});

	return (
		<section className='bg-white rounded-2xl p-6 shadow-lg border border-gray-100'>
			<div className='flex justify-between items-center mb-8'>
				<div>
					<h2 className='text-2xl font-bold text-gray-900'>{monthName}</h2>
					<p className='text-gray-600 mt-1'>
						Tracked activity over {monthEntries.length} days
					</p>
				</div>
				<div className='px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium'>
					{formatTime(monthlySeconds)} of{' '}
					{formatShortTime(monthlyTargetSeconds)}
				</div>
			</div>

			{Object.keys(weeks).length > 0 ? (
				<div className='space-y-8'>
					{Object.entries(weeks).map(([week, days]) => {
						const weekTotal = days.reduce((sum, d) => sum + d.sec, 0);
						const weekTarget = days.reduce(
							(sum, d) => sum + getTargetSecondsForDate(d.date),
							0,
						);
						const weekPercent = Math.round((weekTotal / weekTarget) * 100);

						return (
							<div key={week} className='bg-gray-50 rounded-2xl p-6'>
								<div className='flex justify-between items-center mb-6'>
									<div>
										<h3 className='text-xl font-bold text-gray-900'>
											Week {week}
										</h3>
										<p className='text-gray-600'>
											{formatTime(weekTotal)} of {formatShortTime(weekTarget)}
										</p>
									</div>
									<div
										className={`px-3 py-1 rounded-full text-sm font-medium ${
											weekPercent >= 100
												? 'bg-green-100 text-green-800'
												: weekPercent >= 75
												? 'bg-blue-100 text-blue-800'
												: 'bg-yellow-100 text-yellow-800'
										}`}>
										{weekPercent}% achieved
									</div>
								</div>

								<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
									{days.map((d) => {
										const dayTarget = getTargetSecondsForDate(d.date);
										const dayPercent = Math.round((d.sec / dayTarget) * 100);
										return (
											<div
												key={d.date.toISOString()}
												className='bg-white border border-gray-200 p-4 rounded-xl hover:shadow-md transition-shadow'>
												<div className='flex justify-between items-start mb-3'>
													<div>
														<p className='font-semibold text-gray-900'>
															{d.date.toLocaleDateString('en-US', {
																weekday: 'short',
																day: 'numeric',
															})}
														</p>
														<p className='text-sm text-gray-500'>
															{d.date.toLocaleDateString('en-US', {
																month: 'short',
															})}
														</p>
													</div>
													<span
														className={`px-2 py-1 rounded text-xs font-medium ${
															dayPercent >= 100
																? 'bg-green-100 text-green-800'
																: dayPercent >= 50
																? 'bg-blue-100 text-blue-800'
																: 'bg-yellow-100 text-yellow-800'
														}`}>
														{dayPercent}%
													</span>
												</div>
												<p className='text-xl font-bold text-gray-900 mb-3'>
													{formatTime(d.sec)}
												</p>
												<p className='text-xs text-gray-500 mb-2'>
													Target: {formatShortTime(dayTarget)}
												</p>
												<div className='w-full bg-gray-100 rounded-full h-2'>
													<div
														className={`h-2 rounded-full ${
															dayPercent >= 100
																? 'bg-green-500'
																: dayPercent >= 50
																? 'bg-blue-500'
																: 'bg-yellow-500'
														}`}
														style={{
															width: `${Math.min(100, dayPercent)}%`,
														}}
													/>
												</div>
											</div>
										);
									})}
								</div>
							</div>
						);
					})}
				</div>
			) : (
				<div className='text-center py-12'>
					<div className='text-5xl mb-6 text-gray-300'>📊</div>
					<p className='text-xl text-gray-600 mb-4'>
						No tracking history for this month
					</p>
					<p className='text-gray-500 max-w-md mx-auto'>
						Start the timer to begin tracking your productive hours. Your
						progress will appear here.
					</p>
				</div>
			)}
		</section>
	);
}
