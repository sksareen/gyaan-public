import mongoose, { Schema, Document } from 'mongoose';

export interface ILearningPath extends Document {
  title: string;
  description: string;
  firstPrinciples: string[];
  modules: {
    title: string;
    description: string;
    projectDeliverable: string;
    feynmanExplanation: string;
    resources: string[];
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const LearningPathSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  firstPrinciples: [{ type: String, required: true }],
  modules: [{
    title: { type: String, required: true },
    description: { type: String, required: true },
    projectDeliverable: { type: String, required: true },
    feynmanExplanation: { type: String, required: true },
    resources: [{ type: String }],
  }],
}, {
  timestamps: true
});

export default mongoose.model<ILearningPath>('LearningPath', LearningPathSchema);