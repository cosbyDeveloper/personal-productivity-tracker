import { formatDateKey } from './time-utils';

export interface TimeHistory {
	[date: string]: number;
}

export interface TimerState {
	running: boolean;
	startTime: number | null;
	secondsAtStart: number;
	currentDate: string;
}

const STORAGE_KEYS = {
	HISTORY: 'time-track-data',
	TIMER_STATE: 'time-tracker-timer-state',
	TARGET_SETTINGS: 'time-tracker-target-settings',
	SYNC_QUEUE: 'time-tracker-sync-queue',
	SYNC_VERSION: 'time-tracker-sync-version',
	LOCAL_STORAGE_MODE: 'time-tracker-local-storage-mode',
};

const SYNC_VERSION = '1.0';

class StorageService {
	private useFallback = false;
	private isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
	private syncInProgress = false;

	constructor() {
		if (typeof window !== 'undefined') {
			window.addEventListener('online', () => this.handleOnline());
			window.addEventListener('offline', () => this.handleOffline());
		}
	}

	private handleOnline() {
		this.isOnline = true;
		this.syncPendingChanges();
	}

	private handleOffline() {
		this.isOnline = false;
	}

	// Check if we're in local storage mode
	private isLocalStorageMode(): boolean {
		if (typeof window === 'undefined') return false;

		// Check URL parameter first (highest priority)
		const searchParams = new URLSearchParams(window.location.search);
		if (searchParams.get('useLocalStorage') === 'true') {
			// Save this preference for future sessions
			localStorage.setItem(STORAGE_KEYS.LOCAL_STORAGE_MODE, 'true');
			return true;
		}

		// Check if user previously chose local storage mode
		const savedMode = localStorage.getItem(STORAGE_KEYS.LOCAL_STORAGE_MODE);
		if (savedMode === 'true') {
			return true;
		}

		return false;
	}

	// Sync with cloud
	private async syncToCloud(
		date: string,
		seconds: number,
		timerState?: TimerState,
	) {
		try {
			// Don't sync if in local storage mode
			if (this.isLocalStorageMode()) {
				return;
			}

			const response = await fetch('/api/time-entries', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					date,
					seconds,
					timerState,
				}),
			});

			if (!response.ok) {
				throw new Error('Sync failed');
			}
		} catch (error) {
			console.warn('Cloud sync failed, queuing for later:', error);
			// Only queue for sync if not in local storage mode
			if (!this.isLocalStorageMode()) {
				this.addToSyncQueue(date, seconds, timerState);
			}
		}
	}

	// Queue management
	private getSyncQueue(): Array<{
		date: string;
		seconds: number;
		timerState?: TimerState;
	}> {
		if (typeof window === 'undefined') return [];
		// Don't use sync queue in local storage mode
		if (this.isLocalStorageMode()) {
			return [];
		}
		const queue = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
		return queue ? JSON.parse(queue) : [];
	}

	private addToSyncQueue(
		date: string,
		seconds: number,
		timerState?: TimerState,
	) {
		// Don't add to sync queue in local storage mode
		if (this.isLocalStorageMode()) {
			return;
		}
		const queue = this.getSyncQueue();
		queue.push({ date, seconds, timerState });
		localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
	}

	private clearSyncQueue() {
		localStorage.removeItem(STORAGE_KEYS.SYNC_QUEUE);
	}

	// Sync pending changes
	private async syncPendingChanges() {
		// Don't sync if in local storage mode
		if (this.isLocalStorageMode()) return;
		if (this.syncInProgress) return;

		const queue = this.getSyncQueue();
		if (queue.length === 0) return;

		this.syncInProgress = true;

		try {
			for (const item of queue) {
				await this.syncToCloud(item.date, item.seconds, item.timerState);
			}
			this.clearSyncQueue();
		} catch (error) {
			console.warn('Failed to sync pending changes:', error);
		} finally {
			this.syncInProgress = false;
		}
	}

	// Load from cloud (async)
	async loadCloudHistory(): Promise<TimeHistory> {
		// Don't load from cloud if in local storage mode
		if (this.isLocalStorageMode()) {
			return {};
		}

		try {
			const response = await fetch('/api/time-entries');
			if (response.ok) {
				const data = await response.json();
				return data.history || {};
			}
		} catch (error) {
			console.warn('Cloud load failed:', error);
		}
		return {};
	}

	// Load from localStorage (sync - for backward compatibility)
	loadLocalHistory(): TimeHistory {
		if (typeof window === 'undefined') return {};
		const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
		return saved ? JSON.parse(saved) : {};
	}

	// Save to localStorage only (sync - for backward compatibility)
	saveLocalHistory(history: TimeHistory, timerState?: TimerState): void {
		if (typeof window === 'undefined') return;

		localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));

		if (timerState) {
			localStorage.setItem(
				STORAGE_KEYS.TIMER_STATE,
				JSON.stringify(timerState),
			);
		}
	}

	// Timer state functions (sync)
	loadTimerState(): TimerState | null {
		if (typeof window === 'undefined') return null;
		const saved = localStorage.getItem(STORAGE_KEYS.TIMER_STATE);
		return saved ? JSON.parse(saved) : null;
	}

	saveTimerState(state: TimerState): void {
		if (typeof window === 'undefined') return;
		localStorage.setItem(STORAGE_KEYS.TIMER_STATE, JSON.stringify(state));
	}

	clearTimerState(): void {
		if (typeof window === 'undefined') return;
		localStorage.removeItem(STORAGE_KEYS.TIMER_STATE);
	}

	// Reset functions
	resetHistory(): void {
		if (typeof window === 'undefined') return;
		localStorage.removeItem(STORAGE_KEYS.HISTORY);
		this.clearTimerState();
		this.clearSyncQueue();
		// Also clear local storage mode preference
		localStorage.removeItem(STORAGE_KEYS.LOCAL_STORAGE_MODE);
	}

	// Migration function
	async migrateToCloud() {
		// Don't migrate if in local storage mode
		if (this.isLocalStorageMode()) {
			console.log('Skipping migration - local storage mode active');
			return;
		}

		const localHistory = this.loadLocalHistory();

		for (const [date, seconds] of Object.entries(localHistory)) {
			await this.syncToCloud(date, seconds);
		}
	}

	// Check if user is authenticated by trying to fetch cloud data
	async isAuthenticated(): Promise<boolean> {
		// If in local storage mode, return false to prevent cloud operations
		if (this.isLocalStorageMode()) {
			return false;
		}

		// For client-side, check if there's a session
		if (typeof window === 'undefined') return false;

		try {
			// Try to get session from NextAuth
			const response = await fetch('/api/auth/session');
			if (response.ok) {
				const session = await response.json();
				return !!session?.user;
			}
			return false;
		} catch (error) {
			// If fetch fails (offline or not authenticated), return false
			return false;
		}
	}

	// Should we use cloud sync?
	private async shouldUseCloudSync(): Promise<boolean> {
		// Never use cloud sync in local storage mode
		if (this.isLocalStorageMode()) {
			return false;
		}

		// Only use cloud sync if authenticated AND online
		const isAuth = await this.isAuthenticated();
		return isAuth && this.isOnline;
	}

	// Smart load: try cloud first (if authenticated), fallback to local
	async loadHistory(): Promise<TimeHistory> {
		const shouldUseCloud = await this.shouldUseCloudSync();

		if (shouldUseCloud) {
			try {
				const cloudHistory = await this.loadCloudHistory();
				if (cloudHistory && Object.keys(cloudHistory).length > 0) {
					// Save cloud data locally for offline access
					this.saveLocalHistory(cloudHistory);
					return cloudHistory;
				}
			} catch (error) {
				console.log('Cloud load failed, using local:', error);
			}
		}

		// Fallback to local storage
		return this.loadLocalHistory();
	}

	// Smart save: save locally, try to sync if authenticated
	async saveHistory(
		history: TimeHistory,
		timerState?: TimerState,
	): Promise<void> {
		// Always save locally first
		this.saveLocalHistory(history, timerState);

		// Try to sync if we should use cloud sync
		const shouldUseCloud = await this.shouldUseCloudSync();
		if (shouldUseCloud) {
			const todayKey = formatDateKey(new Date());
			const todaySeconds = history[todayKey] || 0;
			await this.syncToCloud(todayKey, todaySeconds, timerState);
		}
	}

	// Set local storage mode
	setLocalStorageMode(enabled: boolean): void {
		if (typeof window === 'undefined') return;

		if (enabled) {
			localStorage.setItem(STORAGE_KEYS.LOCAL_STORAGE_MODE, 'true');
		} else {
			localStorage.removeItem(STORAGE_KEYS.LOCAL_STORAGE_MODE);
		}
	}

	// Get current storage mode
	getStorageMode(): 'local' | 'cloud' {
		if (this.isLocalStorageMode()) {
			return 'local';
		}
		return 'cloud';
	}

	// Switch from local to cloud mode
	async switchToCloudMode(): Promise<void> {
		if (typeof window === 'undefined') return;

		// Clear local storage mode preference
		localStorage.removeItem(STORAGE_KEYS.LOCAL_STORAGE_MODE);

		// Try to migrate existing data to cloud
		try {
			await this.migrateToCloud();
		} catch (error) {
			console.error('Failed to migrate data to cloud:', error);
		}
	}

	// Switch from cloud to local mode
	switchToLocalMode(): void {
		if (typeof window === 'undefined') return;

		// Set local storage mode preference
		localStorage.setItem(STORAGE_KEYS.LOCAL_STORAGE_MODE, 'true');

		// Clear any pending sync queue
		this.clearSyncQueue();
	}
}

// Export singleton instance
export const storageService = new StorageService();

// For backward compatibility - maintain sync API but call async internally
export const loadHistory = (): TimeHistory => {
	console.warn(
		'loadHistory() called synchronously. For async loading, use storageService.loadHistory()',
	);
	return storageService.loadLocalHistory();
};

export const saveHistory = (
	history: TimeHistory,
	timerState?: TimerState,
): void => {
	storageService.saveLocalHistory(history, timerState);
	// Fire and forget async cloud sync
	storageService.saveHistory(history, timerState).catch(console.error);
};

export const resetHistory = () => storageService.resetHistory();
export const loadTimerState = () => storageService.loadTimerState();
export const saveTimerState = (state: TimerState) =>
	storageService.saveTimerState(state);
export const clearTimerState = () => storageService.clearTimerState();
export const migrateToCloud = () => storageService.migrateToCloud();

// New exports for storage mode management
export const setLocalStorageMode = (enabled: boolean) =>
	storageService.setLocalStorageMode(enabled);
export const getStorageMode = () => storageService.getStorageMode();
export const switchToCloudMode = () => storageService.switchToCloudMode();
export const switchToLocalMode = () => storageService.switchToLocalMode();
