'use client';

import { useState } from 'react';
import { Download, Upload, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { loadHistory, saveHistory } from '@/lib/storage';
import { loadTargetSettings, saveTargetSettings } from '@/lib/target-settings';

export function BackupExport() {
	const [showBackup, setShowBackup] = useState(false);

	const exportData = () => {
		const history = loadHistory();
		const settings = loadTargetSettings();

		const data = {
			history,
			settings,
			exportDate: new Date().toISOString(),
			version: '1.0',
		};

		const blob = new Blob([JSON.stringify(data, null, 2)], {
			type: 'application/json',
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `productivity-tracker-backup-${
			new Date().toISOString().split('T')[0]
		}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);

		alert('Data exported successfully!');
	};

	const importData = () => {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json';

		input.onchange = (e: any) => {
			const file = e.target.files[0];
			const reader = new FileReader();

			reader.onload = (event) => {
				try {
					const data = JSON.parse(event.target?.result as string);

					if (data.history && data.settings) {
						if (confirm('This will replace ALL your current data. Continue?')) {
							saveHistory(data.history);
							saveTargetSettings(data.settings);
							alert('Data imported successfully! Page will reload.');
							window.location.reload();
						}
					} else {
						alert('Invalid backup file');
					}
				} catch (error) {
					alert('Error reading backup file');
				}
			};

			reader.readAsText(file);
		};

		input.click();
	};

	return (
		<>
			<Button
				onClick={() => setShowBackup(!showBackup)}
				variant='outline'
				size='sm'
				className='gap-2'>
				<Database size={16} />
				Backup
			</Button>

			{showBackup && (
				<div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
					<div className='bg-white rounded-xl p-6 max-w-md w-full'>
						<h3 className='text-lg font-semibold mb-4'>Backup & Restore</h3>

						<div className='space-y-4'>
							<div className='bg-blue-50 p-4 rounded-lg'>
								<p className='text-sm text-blue-800'>
									⚠️ Data is stored locally in your browser. Export regularly to
									prevent data loss!
								</p>
							</div>

							<div className='flex flex-col gap-3'>
								<Button onClick={exportData} className='gap-2 justify-start'>
									<Download size={16} /> Export All Data
								</Button>

								<Button
									onClick={importData}
									variant='outline'
									className='gap-2 justify-start'>
									<Upload size={16} /> Import Data
								</Button>
							</div>

							<div className='pt-4 border-t border-gray-200'>
								<Button
									onClick={() => setShowBackup(false)}
									variant='ghost'
									className='w-full'>
									Close
								</Button>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
