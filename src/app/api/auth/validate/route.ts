import { getServerSession } from 'next-auth';
import { authOptions } from '../[...nextauth]/route';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	try {
		const session = await getServerSession(authOptions);

		if (session?.user) {
			return NextResponse.json({
				valid: true,
				user: session.user,
			});
		}

		return NextResponse.json({
			valid: false,
		});
	} catch (error) {
		console.error('Session validation error:', error);
		return NextResponse.json(
			{
				valid: false,
				error: 'Validation failed',
			},
			{ status: 500 },
		);
	}
}
