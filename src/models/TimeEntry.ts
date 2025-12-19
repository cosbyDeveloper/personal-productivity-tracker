import mongoose from 'mongoose';

const TimeEntrySchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		date: {
			type: Date,
			required: true,
		},
		seconds: {
			type: Number,
			required: true,
			default: 0,
		},
		timerState: {
			running: Boolean,
			startTime: Number,
			secondsAtStart: Number,
			lastSync: Date,
		},
		notes: {
			type: String,
			default: '',
		},
		tags: [
			{
				type: String,
			},
		],
		syncStatus: {
			type: String,
			enum: ['synced', 'pending', 'error'],
			default: 'synced',
		},
	},
	{
		timestamps: true,
	},
);

// Keep only ONE compound index (remove separate userId index if exists)
TimeEntrySchema.index({ userId: 1, date: 1 }, { unique: true });
// Remove this if it exists: TimeEntrySchema.index({ userId: 1 });

export default mongoose.models.TimeEntry ||
	mongoose.model('TimeEntry', TimeEntrySchema);
