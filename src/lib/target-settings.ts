export interface DayTarget {
	weekday: number; // 0-6 (Sunday-Saturday)
	hours: number;
	label: string;
}

export interface MonthTargetOverride {
	year: number;
	month: number; // 0-11
	dailyTargets: DayTarget[];
}

export interface TargetSettings {
	defaultDailyTargets: DayTarget[];
	monthOverrides: MonthTargetOverride[];
}

const STORAGE_KEY = 'time-tracker-target-settings';

// Default targets (your current setup)
export const DEFAULT_TARGETS: TargetSettings = {
	defaultDailyTargets: [
		{ weekday: 0, hours: 11, label: 'Sunday' }, // Sunday
		{ weekday: 1, hours: 13.5, label: 'Monday' }, // Monday
		{ weekday: 2, hours: 13.5, label: 'Tuesday' }, // Tuesday
		{ weekday: 3, hours: 13.5, label: 'Wednesday' }, // Wednesday
		{ weekday: 4, hours: 13.5, label: 'Thursday' }, // Thursday
		{ weekday: 5, hours: 13.5, label: 'Friday' }, // Friday
		{ weekday: 6, hours: 3.5, label: 'Saturday' }, // Saturday
	],
	monthOverrides: [],
};

// Load settings
export function loadTargetSettings(): TargetSettings {
	if (typeof window === 'undefined') return DEFAULT_TARGETS;

	const saved = localStorage.getItem(STORAGE_KEY);
	return saved ? JSON.parse(saved) : DEFAULT_TARGETS;
}

// Save settings
export function saveTargetSettings(settings: TargetSettings): void {
	if (typeof window === 'undefined') return;

	localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

// Get target for specific date
export function getTargetForDate(date: Date, settings: TargetSettings): number {
	const year = date.getFullYear();
	const month = date.getMonth();
	const weekday = date.getDay();

	// Check for month override first
	const monthOverride = settings.monthOverrides.find(
		(o) => o.year === year && o.month === month,
	);

	if (monthOverride) {
		const dayTarget = monthOverride.dailyTargets.find(
			(d) => d.weekday === weekday,
		);
		if (dayTarget) return dayTarget.hours * 60 * 60;
	}

	// Use default targets
	const defaultTarget = settings.defaultDailyTargets.find(
		(d) => d.weekday === weekday,
	);
	return defaultTarget ? defaultTarget.hours * 60 * 60 : 13.5 * 60 * 60;
}

// Update time-utils.ts to use settings
export function getTargetSecondsForDate(
	date: Date,
	settings?: TargetSettings,
): number {
	const targetSettings = settings || loadTargetSettings();
	return getTargetForDate(date, targetSettings);
}
