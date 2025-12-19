'use client';

import { DatePicker } from './date-picker';
import { TargetSettingsPanel } from './target-settings';
import { BackupExport } from './backup-export';

interface HeaderProps {
	selectedDate: Date;
	onDateChange: (date: Date | undefined) => void;
	showCalendar: boolean;
	onToggleCalendar: () => void;
	running?: boolean;
}

export function Header({
	selectedDate,
	onDateChange,
	showCalendar,
	onToggleCalendar,
	running = false,
}: HeaderProps) {
	return (
		<div className='flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center mb-10'>
			<div className='flex items-center gap-4'>
				<div className='p-3 bg-linear-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg'>
					<span className='text-2xl text-white'>⏱️</span>
				</div>
				<div>
					<h1 className='text-3xl md:text-4xl font-bold text-gray-900'>
						Productivity Time Tracker
					</h1>
					<p className='text-gray-600 mt-1'>
						Track your productive hours with smart daily targets
						{running && (
							<span className='ml-2 inline-flex items-center gap-1 text-green-600 font-medium'>
								<span className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></span>
								Timer Running
							</span>
						)}
					</p>
				</div>
			</div>

			<div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full lg:w-auto'>
				<DatePicker
					date={selectedDate}
					onDateChange={onDateChange}
					timerRunning={running}
				/>

				<div className='flex gap-2'>
					<TargetSettingsPanel />
					<BackupExport />

					<button
						onClick={onToggleCalendar}
						className='px-5 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow'>
						<span className='text-gray-700 font-medium'>
							{showCalendar ? 'Hide History' : 'Show History'}
						</span>
					</button>
				</div>
			</div>
		</div>
	);
}
