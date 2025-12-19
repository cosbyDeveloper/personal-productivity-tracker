import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getMongoClient } from '@/lib/mongodb';

export const authOptions: NextAuthOptions = {
	adapter: MongoDBAdapter(getMongoClient()),
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		}),
		CredentialsProvider({
			name: 'credentials',
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null;
				}

				await connectDB();

				try {
					// Find existing user
					const user = await User.findOne({ email: credentials.email }).select(
						'+password',
					);

					if (user) {
						// Verify password for existing user
						if (user.password) {
							const isValid = await bcrypt.compare(
								credentials.password,
								user.password,
							);
							if (!isValid) return null;
						} else {
							// User exists but doesn't have password (likely OAuth user)
							return null;
						}

						return {
							id: user._id.toString(),
							email: user.email,
							name: user.name,
							image: user.image,
						};
					} else {
						// Auto-create new user
						const hashedPassword = await bcrypt.hash(credentials.password, 10);
						const newUser = await User.create({
							email: credentials.email,
							password: hashedPassword,
							name: credentials.email.split('@')[0],
							emailVerified: new Date(),
						});

						return {
							id: newUser._id.toString(),
							email: newUser.email,
							name: newUser.name,
						};
					}
				} catch (error) {
					console.error('Authorization error:', error);
					return null;
				}
			},
		}),
	],
	session: {
		strategy: 'jwt',
		maxAge: 24 * 60 * 60, // 1 day
	},
	secret: process.env.NEXTAUTH_SECRET,
	debug: process.env.NODE_ENV === 'development',
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id as string;
				session.user.email = token.email as string;
			}
			return session;
		},
	},
	pages: {
		signIn: '/auth/signin',
		signOut: '/auth/signout',
	},
	// Use secure cookies in production
	cookies: {
		sessionToken: {
			name: `next-auth.session-token`,
			options: {
				httpOnly: true,
				sameSite: 'lax',
				path: '/',
				secure: process.env.NODE_ENV === 'production',
			},
		},
	},
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
