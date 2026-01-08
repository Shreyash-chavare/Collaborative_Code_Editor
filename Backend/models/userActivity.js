import mongoose from "mongoose";


const userActivitySchema = mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    activityType: {
      type: String,
      enum: ['login', 'problem_solved', 'collaborative_session'],
      default: 'login'
    }
  });
  
  // Index for efficient querying by user and date range
  
userActivitySchema.index({ userId: 1, date: 1 });
const UserActivity = mongoose.model('UserActivity', userActivitySchema);
export default UserActivity;