import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentCandidate: null,
  candidates: [
    {
      id: 'mock-1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 123-4567',
      summary: 'Experienced Frontend Developer with 5+ years in React and JavaScript',
      resumeText: 'Experienced Frontend Developer...',
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
      status: 'completed',
      score: 87,
      finalSummary: 'Excellent technical skills and problem-solving abilities.'
    },
    {
      id: 'mock-2',
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      phone: '+1 (555) 987-6543',
      summary: 'Full Stack Developer specializing in Node.js and Python',
      resumeText: 'Full Stack Developer...',
      timestamp: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
      status: 'completed',
      score: 78,
      finalSummary: 'Good technical foundation with room for growth in system design.'
    },
    {
      id: 'mock-3',
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@email.com',
      phone: '+1 (555) 456-7890',
      summary: 'Senior Software Engineer with expertise in Java and Spring Boot',
      resumeText: 'Senior Software Engineer...',
      timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
      status: 'completed',
      score: 92,
      finalSummary: 'Outstanding performance across all technical areas.'
    },
    {
      id: 'mock-4',
      name: 'David Kim',
      email: 'david.kim@email.com',
      phone: '+1 (555) 321-0987',
      summary: 'DevOps Engineer with AWS and Kubernetes experience',
      resumeText: 'DevOps Engineer...',
      timestamp: new Date().toISOString(),
      status: 'in-progress',
      score: null
    },
    {
      id: 'mock-5',
      name: 'Lisa Wang',
      email: 'lisa.wang@email.com',
      phone: '+1 (555) 654-3210',
      summary: 'Data Scientist with machine learning expertise',
      resumeText: 'Data Scientist...',
      timestamp: new Date().toISOString(),
      status: 'pending',
      score: null
    }
  ],
  activeTab: 'interviewee',
  currentQuestionIndex: 0,
  interviewState: 'idle',
  questions: [],
  answers: [],
  individualScores: [],
  finalScore: 0,
  finalSummary: '',
  timer: 0,
  isTimerRunning: false,
  isProcessing: false
};

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    setCurrentCandidate: (state, action) => {
      state.currentCandidate = action.payload;
    },
    addCandidate: (state, action) => {
      const exists = state.candidates.find(c => c.id === action.payload.id);
      if (!exists) {
        state.candidates.push(action.payload);
      }
    },
    updateCandidate: (state, action) => {
      const index = state.candidates.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.candidates[index] = { ...state.candidates[index], ...action.payload };
      }
    },
    setInterviewState: (state, action) => {
      state.interviewState = action.payload;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    startNewInterview: (state) => {
      state.currentQuestionIndex = 0;
      state.questions = [];
      state.answers = [];
      state.individualScores = [];
      state.timer = 0;
      state.isTimerRunning = false;
      state.isProcessing = false;
      state.interviewState = 'in-progress';
    },
    addQuestionAndAnswer: (state, action) => {
      const { question, answer, score } = action.payload;
      state.questions.push(question);
      state.answers.push(answer);
      state.individualScores.push(score);
      state.currentQuestionIndex += 1;
    },
    setTimer: (state, action) => {
      state.timer = action.payload;
    },
    setTimerRunning: (state, action) => {
      state.isTimerRunning = action.payload;
    },
    setProcessing: (state, action) => {
      state.isProcessing = action.payload;
    },
    completeInterview: (state, action) => {
      state.interviewState = 'completed';
      state.finalScore = action.payload.score;
      state.finalSummary = action.payload.summary;

      // Update current candidate with completion data
      if (state.currentCandidate) {
        const candidateUpdate = {
          ...state.currentCandidate,
          status: 'completed',
          score: action.payload.score,
          finalSummary: action.payload.summary,
          completedAt: new Date().toISOString()
        };

        // Update in candidates array
        const index = state.candidates.findIndex(c => c.id === state.currentCandidate.id);
        if (index !== -1) {
          state.candidates[index] = candidateUpdate;
        }

        // Update current candidate
        state.currentCandidate = candidateUpdate;
      }
    },
    resetInterview: (state) => {
      state.currentCandidate = null;
      state.currentQuestionIndex = 0;
      state.interviewState = 'idle';
      state.questions = [];
      state.answers = [];
      state.individualScores = [];
      state.finalScore = 0;
      state.finalSummary = '';
      state.timer = 0;
      state.isTimerRunning = false;
      state.isProcessing = false;
    }
  }
});

export const {
  setCurrentCandidate,
  addCandidate,
  updateCandidate,
  setInterviewState,
  setActiveTab,
  startNewInterview,
  addQuestionAndAnswer,
  setTimer,
  setTimerRunning,
  setProcessing,
  completeInterview,
  resetInterview
} = interviewSlice.actions;

export default interviewSlice.reducer;
