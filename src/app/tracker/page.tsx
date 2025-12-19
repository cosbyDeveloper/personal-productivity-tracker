'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { TimeDisplay } from '@/components/time-tracker/time-display';
import { Header } from '@/components/time-tracker/header';
import { StatsGrid } from '@/components/time-tracker/stats-grid';
import { ControlsSection } from '@/components/time-tracker/controls-section';
import { HistoryCalendar } from '@/components/time-tracker/history-calendar';
import { Footer } from '@/components/time-tracker/footer';
import {
	getWeekOfMonth,
	formatDateKey,
	isSameMonth,
	getTargetSecondsForDate,
	getWeeklyTarget,
	getMonthlyTarget,
	calculateTargetPercentage,
} from '@/lib/time-utils';
import {
	storageService,
	loadTimerState,
	saveTimerState,
	clearTimerState,
	TimeHistory,
	TimerState,
} from '@/lib/storage';

export default function TrackerPage() {
	const { data: session, status } = useSession();
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [running, setRunning] = useState(false);
	const [secondsToday, setSecondsToday] = useState(0);
	const [history, setHistory] = useState<TimeHistory>({});
	const [showCalendar, setShowCalendar] = useState(false);
	const [timerState, setTimerState] = useState<TimerState | null>(null);
	const [toast, setToast] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [useLocalStorageMode, setUseLocalStorageMode] = useState(false);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	const todayKey = formatDateKey(selectedDate);

	useEffect(() => {
		// Check if user wants to use local storage only
		const searchParams = new URLSearchParams(window.location.search);
		if (searchParams.get('useLocalStorage') === 'true') {
			setUseLocalStorageMode(true);
			window.history.replaceState({}, '', '/tracker?useLocalStorage=true');
		}

		// Check if we need to clear session
		if (searchParams.get('clearSession') === 'true') {
			window.history.replaceState({}, '', '/');
		}
	}, []);

	// Load initial data
	useEffect(() => {
		const loadInitialData = async () => {
			console.log('Loading initial data...');
			setIsLoading(true);

			try {
				// Load timer state first (synchronous)
				const savedTimerState = loadTimerState();

				// Load history asynchronously but don't wait too long
				const loadHistoryPromise = storageService.loadHistory();
				const timeoutPromise = new Promise<TimeHistory>((resolve) =>
					setTimeout(() => {
						console.log('History load timeout, using empty');
						resolve({});
					}, 3000),
				);

				const savedHistory = await Promise.race([
					loadHistoryPromise,
					timeoutPromise,
				]);

				setHistory(savedHistory);

				if (savedTimerState && savedTimerState.running) {
					const elapsedSeconds = Math.floor(
						(Date.now() - savedTimerState.startTime!) / 1000,
					);
					const totalSeconds = savedTimerState.secondsAtStart + elapsedSeconds;

					if (savedTimerState.currentDate === todayKey) {
						setRunning(true);
						setSecondsToday(totalSeconds);
						setTimerState(savedTimerState);

						intervalRef.current = setInterval(() => {
							setSecondsToday((s) => s + 1);
						}, 1000);
					} else {
						clearTimerState();
						setSecondsToday(savedHistory[todayKey] || 0);
					}
				} else {
					setSecondsToday(savedHistory[todayKey] || 0);
				}
			} catch (error) {
				console.error('Error loading initial data:', error);
				setHistory({});
				setSecondsToday(0);
			} finally {
				console.log('Initial data loaded');
				setIsLoading(false);
			}
		};

		loadInitialData();
	}, []); // Empty dependency array - only run once on mount

	// Save data when it changes
	useEffect(() => {
		if (!isLoading) {
			const saveData = async () => {
				try {
					await storageService.saveHistory(
						{ ...history, [todayKey]: secondsToday },
						timerState || undefined,
					);
				} catch (error) {
					console.error('Error saving data:', error);
				}
			};

			saveData();
		}
	}, [secondsToday, history, todayKey, timerState, isLoading]);

	// Timer functions
	const start = () => {
		if (running) return;

		const newTimerState: TimerState = {
			running: true,
			startTime: Date.now(),
			secondsAtStart: secondsToday,
			currentDate: todayKey,
		};

		setRunning(true);
		setTimerState(newTimerState);
		saveTimerState(newTimerState);

		intervalRef.current = setInterval(() => {
			setSecondsToday((s) => s + 1);
		}, 1000);
	};

	const pause = () => {
		setRunning(false);
		setTimerState(null);
		clearTimerState();

		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
	};

	// Calculate stats
	const targetSeconds = getTargetSecondsForDate(selectedDate);
	const percent = calculateTargetPercentage(secondsToday, targetSeconds);
	const weekOfMonth = getWeekOfMonth(selectedDate);
	const today = new Date();
	const isCurrentMonth = isSameMonth(selectedDate, today);
	const historyWithoutToday = { ...history };
	delete historyWithoutToday[todayKey];

	const weeklySeconds = Object.entries(historyWithoutToday)
		.filter(([dateKey, sec]) => {
			const d = new Date(dateKey);
			return getWeekOfMonth(d) === weekOfMonth && isSameMonth(d, selectedDate);
		})
		.reduce((sum, [_, sec]) => sum + sec, 0);

	const monthlySeconds = Object.entries(historyWithoutToday)
		.filter(([dateKey, sec]) => {
			const d = new Date(dateKey);
			return isSameMonth(d, selectedDate);
		})
		.reduce((sum, [_, sec]) => sum + sec, 0);

	const isCurrentWeek =
		isCurrentMonth && getWeekOfMonth(selectedDate) === weekOfMonth;
	const finalWeeklySeconds = weeklySeconds + (isCurrentWeek ? secondsToday : 0);
	const finalMonthlySeconds =
		monthlySeconds + (isCurrentMonth ? secondsToday : 0);
	const weeklyTargetSeconds = getWeeklyTarget(selectedDate);
	const monthlyTargetSeconds = getMonthlyTarget(selectedDate);
	const weeklyPercentage = calculateTargetPercentage(
		finalWeeklySeconds,
		weeklyTargetSeconds,
	);
	const monthlyPercentage = calculateTargetPercentage(
		finalMonthlySeconds,
		monthlyTargetSeconds,
	);

	const calculateStreak = () => {
		let streak = 0;
		let cursor = new Date(selectedDate);

		while (true) {
			const key = formatDateKey(cursor);
			const daySeconds = key === todayKey ? secondsToday : history[key] || 0;
			if (daySeconds > 0) {
				streak++;
				cursor.setDate(cursor.getDate() - 1);
			} else {
				break;
			}
		}
		return streak;
	};

	const streak = calculateStreak();

	const monthEntries = Object.entries(history)
		.map(([date, sec]) => ({ date: new Date(date), sec }))
		.filter((d) => isSameMonth(d.date, selectedDate))
		.sort((a, b) => a.date.getTime() - b.date.getTime());

	const weeks = monthEntries.reduce<Record<number, typeof monthEntries>>(
		(acc, item) => {
			const week = getWeekOfMonth(item.date);
			if (!acc[week]) acc[week] = [];
			acc[week].push(item);
			return acc;
		},
		{},
	);

	// Loading state
	if (status === 'loading' || isLoading) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
					<p className='text-gray-600'>Loading your productivity data...</p>
					<p className='text-sm text-gray-500 mt-2'>
						{status === 'loading'
							? 'Checking authentication...'
							: 'Loading your data...'}
					</p>
				</div>
			</div>
		);
	}

	// // Show auth page only if NOT in local storage mode AND no session
	// const shouldShowAuthPage = !useLocalStorageMode && !session;

	// if (shouldShowAuthPage) {
	// 	return <LandingPage />;
	// }

	// Main app UI - shown for both authenticated users AND local storage users
	return (
		<main className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8'>
			<div className='max-w-7xl mx-auto'>
				{/* Toast Notification */}
				{toast && (
					<div className='fixed top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in z-50'>
						{toast}
					</div>
				)}

				{/* User info - Only show if authenticated */}
				{session && (
					<div className='mb-6 p-4 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm flex items-center justify-between'>
						<div className='flex items-center gap-3'>
							{session.user?.image ? (
								<img
									src={session.user.image}
									alt={session.user.name || 'User'}
									className='w-10 h-10 rounded-full'
								/>
							) : (
								<div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg'>
									{session.user?.name?.[0] || session.user?.email?.[0] || 'U'}
								</div>
							)}
							<div>
								<p className='font-semibold text-gray-900'>
									{session.user?.name || session.user?.email}
								</p>
								<p className='text-xs text-gray-600 flex items-center gap-1'>
									<span className='w-2 h-2 bg-green-500 rounded-full'></span>
									Cloud sync enabled
								</p>
							</div>
						</div>
						<button
							onClick={() => {
								signOut({
									callbackUrl: '/',
									redirect: true,
								});
							}}
							className='text-sm text-gray-600 hover:text-gray-900 font-medium px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors'>
							Sign out
						</button>
					</div>
				)}

				{/* Local storage mode indicator */}
				{useLocalStorageMode && (
					<div className='mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl shadow-sm flex items-center justify-between'>
						<div className='flex items-center gap-3'>
							<div className='w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center'>
								<span className='text-xl text-yellow-800'>💾</span>
							</div>
							<div>
								<p className='font-semibold text-gray-900'>
									Local Storage Mode
								</p>
								<p className='text-xs text-gray-600'>
									Your data is stored only on this device.
									<span
										className='ml-1 text-blue-600 hover:text-blue-800 cursor-pointer'
										onClick={() =>
											signIn(undefined, { callbackUrl: '/tracker' })
										}>
										Sign in to enable cloud sync
									</span>
								</p>
							</div>
						</div>
						<button
							onClick={() => signIn(undefined, { callbackUrl: '/tracker' })}
							className='text-sm text-gray-600 hover:text-gray-900 font-medium px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors'>
							Switch to Cloud Mode
						</button>
					</div>
				)}

				<Header
					selectedDate={selectedDate}
					onDateChange={(date) => date && setSelectedDate(date)}
					showCalendar={showCalendar}
					onToggleCalendar={() => setShowCalendar(!showCalendar)}
					running={running}
				/>

				<StatsGrid
					weekOfMonth={weekOfMonth}
					weeklySeconds={finalWeeklySeconds}
					weeklyTargetSeconds={weeklyTargetSeconds}
					weeklyPercentage={weeklyPercentage}
					monthName={selectedDate.toLocaleString('default', { month: 'long' })}
					monthlySeconds={finalMonthlySeconds}
					monthlyTargetSeconds={monthlyTargetSeconds}
					monthlyPercentage={monthlyPercentage}
					streak={streak}
					todayTargetSeconds={targetSeconds}
					todayPercentage={percent}
				/>

				<div className='mb-8'>
					<TimeDisplay
						selectedDate={selectedDate}
						secondsToday={secondsToday}
						percent={percent}
					/>
				</div>

				<ControlsSection
					running={running}
					onStart={start}
					onPause={pause}
					onResetDay={() => {
						pause();
						if (
							window.confirm('Reset this selected day? This cannot be undone.')
						) {
							setHistory((prev) => ({ ...prev, [todayKey]: 0 }));
							setSecondsToday(0);
						}
					}}
					onResetMonth={() => {
						pause();
						const monthLabel = selectedDate.toLocaleString('default', {
							month: 'long',
							year: 'numeric',
						});
						if (
							window.confirm(
								`Reset all days in ${monthLabel}? This cannot be undone.`,
							)
						) {
							setHistory((prev) => {
								const updated = { ...prev };
								Object.keys(updated).forEach((key) => {
									const d = new Date(key);
									if (isSameMonth(d, selectedDate)) {
										delete updated[key];
									}
								});
								return updated;
							});
							if (isSameMonth(selectedDate, new Date())) {
								setSecondsToday(0);
							}
						}
					}}
					onMasterReset={() => {
						pause();
						const confirmed = window.prompt(
							'Type RESET EVERYTHING to confirm master reset',
						);
						if (confirmed === 'RESET EVERYTHING') {
							storageService.resetHistory();
							setHistory({});
							setSecondsToday(0);
						}
					}}
				/>

				{showCalendar && (
					<HistoryCalendar
						selectedDate={selectedDate}
						monthEntries={monthEntries}
						weeks={weeks}
						monthlySeconds={finalMonthlySeconds}
						monthlyTargetSeconds={monthlyTargetSeconds}
					/>
				)}

				<Footer
					streak={streak}
					todayPercentage={percent}
					monthlyPercentage={monthlyPercentage}
				/>
			</div>
		</main>
	);
}
