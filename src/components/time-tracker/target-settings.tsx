'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Save, Plus, Trash2 } from 'lucide-react';
import {
	TargetSettings,
	DayTarget,
	MonthTargetOverride,
	loadTargetSettings,
	saveTargetSettings,
	DEFAULT_TARGETS,
} from '@/lib/target-settings';

interface TargetSettingsProps {
	onSettingsChange?: () => void;
}

export function TargetSettingsPanel({ onSettingsChange }: TargetSettingsProps) {
	const [settings, setSettings] = useState<TargetSettings>(DEFAULT_TARGETS);
	const [showSettings, setShowSettings] = useState(false);
	const [activeMonth, setActiveMonth] = useState<{
		year: number;
		month: number;
	} | null>(null);
	const [newOverride, setNewOverride] = useState<{
		year: number;
		month: number;
	}>({
		year: new Date().getFullYear(),
		month: new Date().getMonth(),
	});

	useEffect(() => {
		setSettings(loadTargetSettings());
	}, []);

	const handleDefaultTargetChange = (weekday: number, hours: number) => {
		const updated = settings.defaultDailyTargets.map((target) =>
			target.weekday === weekday ? { ...target, hours } : target,
		);
		setSettings({ ...settings, defaultDailyTargets: updated });
	};

	const handleMonthTargetChange = (weekday: number, hours: number) => {
		if (!activeMonth) return;

		const overrideIndex = settings.monthOverrides.findIndex(
			(o) => o.year === activeMonth.year && o.month === activeMonth.month,
		);

		let updatedOverrides = [...settings.monthOverrides];

		if (overrideIndex === -1) {
			// Create new override
			updatedOverrides.push({
				year: activeMonth.year,
				month: activeMonth.month,
				dailyTargets: DEFAULT_TARGETS.defaultDailyTargets.map((d) => ({
					...d,
					hours: d.weekday === weekday ? hours : d.hours,
				})),
			});
		} else {
			// Update existing override
			updatedOverrides[overrideIndex] = {
				...updatedOverrides[overrideIndex],
				dailyTargets: updatedOverrides[overrideIndex].dailyTargets.map((d) =>
					d.weekday === weekday ? { ...d, hours } : d,
				),
			};
		}

		setSettings({ ...settings, monthOverrides: updatedOverrides });
	};

	const handleAddMonthOverride = () => {
		if (!newOverride.year || !newOverride.month) return;

		const exists = settings.monthOverrides.some(
			(o) => o.year === newOverride.year && o.month === newOverride.month,
		);

		if (!exists) {
			const updated = [
				...settings.monthOverrides,
				{
					year: newOverride.year,
					month: newOverride.month,
					dailyTargets: [...settings.defaultDailyTargets],
				},
			];
			setSettings({ ...settings, monthOverrides: updated });
		}
	};

	const handleRemoveMonthOverride = (year: number, month: number) => {
		const updated = settings.monthOverrides.filter(
			(o) => !(o.year === year && o.month === month),
		);
		setSettings({ ...settings, monthOverrides: updated });
	};

	const handleSave = () => {
		saveTargetSettings(settings);
		onSettingsChange?.();
		setShowSettings(false);
	};

	const getActiveMonthOverride = () => {
		if (!activeMonth) return null;
		return settings.monthOverrides.find(
			(o) => o.year === activeMonth.year && o.month === activeMonth.month,
		);
	};

	const getMonthName = (month: number) => {
		return new Date(0, month).toLocaleString('default', { month: 'long' });
	};

	return (
		<>
			<Button
				onClick={() => setShowSettings(!showSettings)}
				variant='outline'
				size='sm'
				className='gap-2'>
				<Settings size={16} />
				Target Settings
			</Button>

			{showSettings && (
				<div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
					<Card className='w-full max-w-4xl max-h-[90vh] overflow-auto'>
						<CardHeader>
							<CardTitle className='flex justify-between items-center'>
								<span>Target Settings</span>
								<div className='flex gap-2'>
									<Button onClick={handleSave} className='gap-2'>
										<Save size={16} /> Save Settings
									</Button>
									<Button
										onClick={() => setShowSettings(false)}
										variant='outline'>
										Close
									</Button>
								</div>
							</CardTitle>
						</CardHeader>
						<CardContent>
							{/* Default Targets */}
							<div className='mb-8'>
								<h3 className='text-lg font-semibold mb-4'>
									Default Daily Targets
								</h3>
								<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4'>
									{settings.defaultDailyTargets.map((target) => (
										<div key={target.weekday} className='space-y-2'>
											<Label>{target.label}</Label>
											<Input
												type='number'
												step='0.5'
												min='0'
												max='24'
												value={target.hours}
												onChange={(e) =>
													handleDefaultTargetChange(
														target.weekday,
														parseFloat(e.target.value),
													)
												}
											/>
										</div>
									))}
								</div>
							</div>

							{/* Month Overrides */}
							<div className='mb-8'>
								<div className='flex justify-between items-center mb-4'>
									<h3 className='text-lg font-semibold'>Month Overrides</h3>
									<div className='flex gap-2'>
										<Input
											type='number'
											placeholder='Year'
											value={newOverride.year}
											onChange={(e) =>
												setNewOverride({
													...newOverride,
													year: parseInt(e.target.value),
												})
											}
											className='w-24'
										/>
										<select
											value={newOverride.month}
											onChange={(e) =>
												setNewOverride({
													...newOverride,
													month: parseInt(e.target.value),
												})
											}
											className='border rounded px-3 py-2'>
											{Array.from({ length: 12 }, (_, i) => (
												<option key={i} value={i}>
													{getMonthName(i)}
												</option>
											))}
										</select>
										<Button onClick={handleAddMonthOverride} className='gap-2'>
											<Plus size={16} /> Add Override
										</Button>
									</div>
								</div>

								{settings.monthOverrides.length > 0 ? (
									<div className='space-y-4'>
										{settings.monthOverrides.map((override) => (
											<Card key={`${override.year}-${override.month}`}>
												<CardContent className='p-4'>
													<div className='flex justify-between items-center mb-4'>
														<h4 className='font-medium'>
															{getMonthName(override.month)} {override.year}
														</h4>
														<div className='flex gap-2'>
															<Button
																onClick={() =>
																	setActiveMonth({
																		year: override.year,
																		month: override.month,
																	})
																}
																variant={
																	activeMonth?.year === override.year &&
																	activeMonth?.month === override.month
																		? 'default'
																		: 'outline'
																}
																size='sm'>
																Edit
															</Button>
															<Button
																onClick={() =>
																	handleRemoveMonthOverride(
																		override.year,
																		override.month,
																	)
																}
																variant='destructive'
																size='sm'>
																<Trash2 size={16} />
															</Button>
														</div>
													</div>

													{activeMonth?.year === override.year &&
														activeMonth?.month === override.month && (
															<div className='grid grid-cols-7 gap-2'>
																{override.dailyTargets.map((target) => (
																	<div
																		key={target.weekday}
																		className='space-y-1'>
																		<Label className='text-xs'>
																			{target.label}
																		</Label>
																		<Input
																			type='number'
																			step='0.5'
																			value={target.hours}
																			onChange={(e) =>
																				handleMonthTargetChange(
																					target.weekday,
																					parseFloat(e.target.value),
																				)
																			}
																			className='h-8 text-sm'
																		/>
																	</div>
																))}
															</div>
														)}
												</CardContent>
											</Card>
										))}
									</div>
								) : (
									<p className='text-gray-500 text-center py-4'>
										No month overrides added. Add one to customize targets for
										specific months.
									</p>
								)}
							</div>

							<div className='flex justify-end gap-4'>
								<Button
									onClick={() => setSettings(DEFAULT_TARGETS)}
									variant='outline'>
									Reset to Defaults
								</Button>
								<Button onClick={handleSave} className='gap-2'>
									<Save size={16} /> Save Settings
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			)}
		</>
	);
}
