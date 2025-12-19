import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import TargetSettings from '@/models/TargetSettings';
import mongoose from 'mongoose';

export async function GET() {
	try {
		await connectDB();
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const settings = await TargetSettings.findOne({
			userId: new mongoose.Types.ObjectId(session.user.id),
		}).lean();

		return NextResponse.json({
			settings: settings || null,
		});
	} catch (error) {
		console.error('Error fetching target settings:', error);
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

		const body = await request.json();

		const settings = await TargetSettings.findOneAndUpdate(
			{
				userId: new mongoose.Types.ObjectId(session.user.id),
			},
			{
				userId: new mongoose.Types.ObjectId(session.user.id),
				defaultDailyTargets: body.defaultDailyTargets,
				monthOverrides: body.monthOverrides || [],
				version: '1.0',
			},
			{
				upsert: true,
				new: true,
				runValidators: true,
			},
		);

		return NextResponse.json({
			success: true,
			settings: {
				...settings.toObject(),
				_id: settings._id.toString(),
			},
		});
	} catch (error) {
		console.error('Error saving target settings:', error);
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}
