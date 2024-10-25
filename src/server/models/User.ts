import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  learningPaths: mongoose.Types.ObjectId[];
  progress: {
    pathId: mongoose.Types.ObjectId;
    completedModules: number[];
    feynmanExplanations: {
      moduleId: number;
      explanation: string;
    }[];
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  learningPaths: [{ type: Schema.Types.ObjectId, ref: 'LearningPath' }],
  progress: [{
    pathId: { type: Schema.Types.ObjectId, ref: 'LearningPath' },
    completedModules: [Number],
    feynmanExplanations: [{
      moduleId: Number,
      explanation: String,
    }],
  }],
}, {
  timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);