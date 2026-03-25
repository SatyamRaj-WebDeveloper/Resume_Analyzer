import mongoose from 'mongoose';

const AnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  jobTitle: {
    type: String,
    required: true, 
  },
  matchScore: {
    type: Number,
    required: true, 
  },
  missingKeywords: {
    type: [String],
    default: [], 
  },
  aiFeedback: {
    type: String,
    required: true, 
  },
  improvedResumeLatex: {
    type: String,
    default: null, 
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  mismatchAnalysis: [{
    resumeSection: String, 
    issue: String,         
    correction: String     
  }],
});

export default mongoose.models.Analysis || mongoose.model('Analysis', AnalysisSchema);