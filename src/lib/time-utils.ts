export const DAILY_TARGET_SECONDS = (13 * 60 + 30) * 60; // 13 hours 30 minutes for weekdays

export function formatTime(seconds: number): string {
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = seconds % 60;
	return `${h}h ${m}m ${s}s`;
}

export function formatShortTime(seconds: number): string {
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	if (h > 0) return `${h}h ${m}m`;
	return `${m}m`;
}

export function getWeekOfMonth(date: Date): number {
	const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
	const firstDayIndex = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
	return Math.ceil((date.getDate() + firstDayIndex) / 7);
}

export function formatDateKey(date: Date): string {
	return date.toISOString().slice(0, 10);
}

export function isSameMonth(date1: Date, date2: Date): boolean {
	return (
		date1.getMonth() === date2.getMonth() &&
		date1.getFullYear() === date2.getFullYear()
	);
}

export function isSameDay(date1: Date, date2: Date): boolean {
	return (
		date1.getDate() === date2.getDate() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getFullYear() === date2.getFullYear()
	);
}

// NEW: Get target seconds based on day of week
export function getTargetSecondsForDate(date: Date): number {
	const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

	switch (dayOfWeek) {
		case 0: // Sunday
			return 11 * 60 * 60; // 11 hours
		case 6: // Saturday
			return 3.5 * 60 * 60; // 3.5 hours
		default: // Monday to Friday
			return DAILY_TARGET_SECONDS; // 13.5 hours
	}
}

// NEW: Calculate estimated weekly target (sum of targets for each day in week)
export function getWeeklyTarget(dateInWeek: Date): number {
	const date = new Date(dateInWeek);
	// Get Monday of the week
	const day = date.getDay();
	const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
	const monday = new Date(date.setDate(diff));

	let weeklyTarget = 0;

	// Calculate targets for each day of the week (Monday to Sunday)
	for (let i = 0; i < 7; i++) {
		const currentDay = new Date(monday);
		currentDay.setDate(monday.getDate() + i);
		weeklyTarget += getTargetSecondsForDate(currentDay);
	}

	return weeklyTarget;
}

// NEW: Calculate estimated monthly target (sum of targets for each day in month)
export function getMonthlyTarget(dateInMonth: Date): number {
	const year = dateInMonth.getFullYear();
	const month = dateInMonth.getMonth();

	// Get first and last day of month
	const firstDay = new Date(year, month, 1);
	const lastDay = new Date(year, month + 1, 0);

	let monthlyTarget = 0;
	const currentDay = new Date(firstDay);

	// Iterate through all days of the month
	while (currentDay <= lastDay) {
		monthlyTarget += getTargetSecondsForDate(currentDay);
		currentDay.setDate(currentDay.getDate() + 1);
	}

	return monthlyTarget;
}

// NEW: Calculate percentage of target achieved
export function calculateTargetPercentage(
	actualSeconds: number,
	targetSeconds: number,
): number {
	if (targetSeconds === 0) return 0;
	return Math.min(100, Math.round((actualSeconds / targetSeconds) * 100));
}
