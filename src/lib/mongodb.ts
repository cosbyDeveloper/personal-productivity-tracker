import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
	throw new Error('Please define the MONGODB_URI environment variable');
}

interface MongooseCache {
	conn: typeof mongoose | null;
	promise: Promise<typeof mongoose> | null;
}

const globalWithMongoose = global as typeof globalThis & {
	mongoose?: MongooseCache;
};

let cached: MongooseCache = globalWithMongoose.mongoose || {
	conn: null,
	promise: null,
};

if (!globalWithMongoose.mongoose) {
	globalWithMongoose.mongoose = cached;
}

async function connectDB() {
	if (cached.conn) {
		return cached.conn;
	}

	if (!cached.promise) {
		const opts = {
			bufferCommands: false,
			maxPoolSize: 10, // Limit connections
			serverSelectionTimeoutMS: 5000, // Timeout after 5s
			socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
		};

		cached.promise = mongoose
			.connect(MONGODB_URI, opts)
			.then((mongoose) => {
				console.log('MongoDB connected successfully');
				return mongoose;
			})
			.catch((error) => {
				console.error('MongoDB connection error:', error);
				cached.promise = null;
				throw error;
			});
	}

	try {
		cached.conn = await cached.promise;
	} catch (error) {
		cached.promise = null;
		throw error;
	}

	return cached.conn;
}

export default connectDB;

export async function getMongoClient() {
	const conn = await connectDB();
	return conn.connection.getClient();
}
