import mongoose from 'mongoose';

const DayTargetSchema = new mongoose.Schema({
	weekday: {
		type: Number,
		required: true,
		min: 0,
		max: 6,
	},
	hours: {
		type: Number,
		required: true,
		min: 0,
		max: 24,
	},
	label: {
		type: String,
		required: true,
	},
});

const MonthTargetOverrideSchema = new mongoose.Schema({
	year: {
		type: Number,
		required: true,
	},
	month: {
		type: Number,
		required: true,
		min: 0,
		max: 11,
	},
	dailyTargets: [DayTargetSchema],
});

const TargetSettingsSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			unique: true, // This creates an index
		},
		defaultDailyTargets: {
			type: [DayTargetSchema],
			required: true,
		},
		monthOverrides: {
			type: [MonthTargetOverrideSchema],
			default: [],
		},
		version: {
			type: String,
			default: '1.0',
		},
	},
	{
		timestamps: true,
	},
);

// REMOVE this duplicate index - unique: true already creates it
// TargetSettingsSchema.index({ userId: 1 }, { unique: true });

export default mongoose.models.TargetSettings ||
	mongoose.model('TargetSettings', TargetSettingsSchema);
