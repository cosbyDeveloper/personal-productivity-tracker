'use client';

import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';

interface DatePickerProps {
	date: Date;
	onDateChange: (date: Date | undefined) => void;
	timerRunning?: boolean;
}

export function DatePicker({
	date,
	onDateChange,
	timerRunning = false,
}: DatePickerProps) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant='outline'
					className={cn(
						'w-[240px] justify-start text-left font-normal',
						!date && 'text-muted-foreground',
						timerRunning && 'border-yellow-400 bg-yellow-50',
					)}>
					<CalendarIcon className='mr-2 h-4 w-4' />
					{date ? format(date, 'PPP') : <span>Pick a date</span>}
					{timerRunning && (
						<span className='ml-2 flex items-center gap-1'>
							<span className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></span>
							<span className='text-xs text-green-600'>Live</span>
						</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className='w-auto p-0' align='start'>
				<Calendar
					mode='single'
					selected={date}
					onSelect={onDateChange}
					initialFocus
					disabled={(date) => date > new Date()}
				/>
			</PopoverContent>
		</Popover>
	);
}
