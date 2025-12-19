import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import TimeEntry from '@/models/TimeEntry';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
	try {
		await connectDB();
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const month = searchParams.get('month');
		const year = searchParams.get('year');
		const date = searchParams.get('date');

		const query: any = {
			userId: new mongoose.Types.ObjectId(session.user.id),
		};

		if (date) {
			const targetDate = new Date(date);
			const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
			const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

			query.date = {
				$gte: startOfDay,
				$lte: endOfDay,
			};
		} else if (month && year) {
			const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
			const endDate = new Date(
				parseInt(year),
				parseInt(month),
				0,
				23,
				59,
				59,
				999,
			);
			query.date = { $gte: startDate, $lte: endDate };
		}

		const entries = await TimeEntry.find(query).sort({ date: 1 }).lean();

		// Convert to date-keyed object
		const history: Record<string, number> = {};
		entries.forEach((entry: any) => {
			const dateKey = entry.date.toISOString().split('T')[0];
			history[dateKey] = entry.seconds;
		});

		return NextResponse.json({ history });
	} catch (error) {
		console.error('Error fetching time entries:', error);
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		await connectDB();
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { date, seconds, timerState } = await request.json();
		const targetDate = new Date(date);
		const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
		const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

		const entry = await TimeEntry.findOneAndUpdate(
			{
				userId: new mongoose.Types.ObjectId(session.user.id),
				date: {
					$gte: startOfDay,
					$lte: endOfDay,
				},
			},
			{
				userId: new mongoose.Types.ObjectId(session.user.id),
				date: targetDate,
				seconds,
				timerState,
				syncStatus: 'synced',
			},
			{
				upsert: true,
				new: true,
				setDefaultsOnInsert: true,
				runValidators: true,
			},
		);

		return NextResponse.json({
			success: true,
			entry: {
				...entry.toObject(),
				_id: entry._id.toString(),
			},
		});
	} catch (error) {
		console.error('Error saving time entry:', error);
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}
