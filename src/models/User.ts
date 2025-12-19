import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true, // This creates an index automatically
			lowercase: true,
			trim: true,
		},
		emailVerified: {
			type: Date,
			default: null,
		},
		image: {
			type: String,
			default: null,
		},
		// For credentials provider
		password: {
			type: String,
			select: false,
		},
		// Custom fields
		timeZone: {
			type: String,
			default: 'UTC',
		},
		preferences: {
			theme: {
				type: String,
				enum: ['light', 'dark', 'system'],
				default: 'system',
			},
			notifications: {
				type: Boolean,
				default: true,
			},
		},
	},
	{
		timestamps: true,
	},
);

// REMOVE this duplicate index - the "unique: true" on email field already creates it
// UserSchema.index({ email: 1 }, { unique: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
