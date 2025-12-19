'use client';

interface FooterProps {
	streak: number;
	todayPercentage: number;
	monthlyPercentage: number;
}

export function Footer({
	streak,
	todayPercentage,
	monthlyPercentage,
}: FooterProps) {
	return (
		<footer className='mt-12 pt-8 border-t border-gray-200'>
			<div className='flex flex-col md:flex-row justify-between items-center gap-6'>
				<div className='text-center md:text-left'>
					<div className='flex items-center gap-2 mb-3'>
						<div className='w-3 h-3 bg-linear-to-r from-blue-500 to-purple-600 rounded-full'></div>
						<p className='text-sm text-gray-700 font-medium'>
							Smart Daily Targets
						</p>
					</div>
					<p className='text-xs text-gray-500'>
						Weekdays: 13.5h • Saturday: 3.5h • Sunday: 11h
					</p>
				</div>

				<div className='flex flex-wrap gap-6'>
					<div className='text-center'>
						<p className='text-sm text-gray-600'>Current Streak</p>
						<p className='text-xl font-bold text-gray-900'>{streak} days</p>
					</div>
					<div className='text-center'>
						<p className='text-sm text-gray-600'>Today's Progress</p>
						<p className='text-xl font-bold text-gray-900'>
							{todayPercentage}%
						</p>
					</div>
					<div className='text-center'>
						<p className='text-sm text-gray-600'>Monthly Progress</p>
						<p className='text-xl font-bold text-gray-900'>
							{monthlyPercentage}%
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
}
