'use client';

interface ControlsSectionProps {
	running: boolean;
	onStart: () => void;
	onPause: () => void;
	onResetDay: () => void;
	onResetMonth: () => void;
	onMasterReset: () => void;
}

export function ControlsSection({
	running,
	onStart,
	onPause,
	onResetDay,
	onResetMonth,
	onMasterReset,
}: ControlsSectionProps) {
	return (
		<div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8'>
			<div className='flex flex-col gap-6'>
				{/* Main timer controls */}
				<div className='flex flex-wrap gap-4'>
					{!running ? (
						<button
							onClick={onStart}
							className='px-8 py-3.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold flex items-center gap-3 transition-all duration-200 shadow-lg hover:shadow-xl'>
							<span className='text-lg'>▶</span> Start Timer
						</button>
					) : (
						<button
							onClick={onPause}
							className='px-8 py-3.5 bg-linear-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl font-semibold flex items-center gap-3 transition-all duration-200 shadow-lg hover:shadow-xl'>
							<span className='text-lg'>⏸</span> Pause Timer
						</button>
					)}

					<button
						onClick={onResetDay}
						className='px-6 py-3.5 bg-white border border-red-300 text-red-600 hover:bg-red-50 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 shadow hover:shadow-md'>
						<span>↺</span> Reset Day
					</button>
				</div>

				{/* Advanced controls */}
				<div className='border-t border-gray-200 pt-6'>
					<div className='flex flex-wrap gap-4 justify-between items-center'>
						<div>
							<p className='text-sm text-gray-600 mb-2'>Advanced controls</p>
							<div className='flex flex-wrap gap-3'>
								{/* Month reset button */}
								<button
									onClick={onResetMonth}
									className='px-5 py-2.5 border border-orange-300 text-orange-600 hover:bg-orange-50 rounded-lg font-medium transition-colors'>
									Reset Month
								</button>
							</div>
						</div>

						{/* Master reset button - with warning styling */}
						<div className='flex flex-col items-end'>
							<button
								onClick={onMasterReset}
								className='px-5 py-2.5 border border-red-400 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg font-medium transition-colors mb-1'>
								Master Reset
							</button>
							<p className='text-xs text-gray-500'>
								⚠️ This will delete ALL data
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
