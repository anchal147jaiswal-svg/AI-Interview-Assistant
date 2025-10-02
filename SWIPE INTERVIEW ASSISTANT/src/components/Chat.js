// src/components/Chat.js
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Input, Button, Progress, Typography, Space, Avatar, Result, Spin, Row, Col } from 'antd';
import { UserOutlined, SendOutlined, ClockCircleOutlined, PlayCircleOutlined, PauseCircleOutlined, BulbOutlined, CheckCircleOutlined, ThunderboltOutlined } from '@ant-design/icons';
import './Chat.css';
import WelcomeBackModal from './WelcomeBackModal';

import {
  startNewInterview,
  addQuestionAndAnswer,
  setTimer,
  setTimerRunning,
  setProcessing,
  completeInterview,
  updateCandidate,
  resetInterview,
  setActiveTab
} from '../store/interviewSlice';
import { generateQuestion, evaluateAnswer, clearInterviewData } from '../utils/aiService';

const { TextArea } = Input;
const { Title, Text } = Typography;

const Chat = () => {
  const dispatch = useDispatch();
  const {
    currentCandidate,
    currentQuestionIndex,
    questions,
    answers,
    individualScores,
    timer,
    isTimerRunning,
    interviewState,
    isProcessing,
    finalScore,
    finalSummary
  } = useSelector(state => state.interview);

  const [currentAnswer, setCurrentAnswer] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [showWelcomeBackModal, setShowWelcomeBackModal] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasNavigatedAway, setHasNavigatedAway] = useState(false);
  const timerRef = useRef(null);
  const chatEndRef = useRef(null);

  const TOTAL_QUESTIONS = 6;
  const questionSettings = [
    { difficulty: 'Easy', time: 20 },
    { difficulty: 'Easy', time: 20 },
    { difficulty: 'Medium', time: 60 },
    { difficulty: 'Medium', time: 60 },
    { difficulty: 'Hard', time: 120 },
    { difficulty: 'Hard', time: 120 }
  ];

  useEffect(() => {
    if (interviewState === 'ready') {
      clearInterviewData();
      initializeInterview();
    }
  }, [interviewState]);

  useEffect(() => {
    if (interviewState === 'in-progress' && currentQuestionIndex < TOTAL_QUESTIONS && questions.length === currentQuestionIndex) {
      askQuestion();
    } else if (currentQuestionIndex >= TOTAL_QUESTIONS && answers.length === TOTAL_QUESTIONS) {
      finalizeInterview();
    }
  }, [currentQuestionIndex, interviewState]);

  useEffect(() => {
    if (isTimerRunning && timer > 0) {
      timerRef.current = setInterval(() => {
        dispatch(setTimer(timer - 1));
      }, 1000);
    } else if (timer === 0 && isTimerRunning) {
      handleTimeUp();
    }
    return () => clearInterval(timerRef.current);
  }, [timer, isTimerRunning]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Track page visibility to detect when user navigates away during pause
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isPaused) {
        setHasNavigatedAway(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPaused]);

  const handlePauseInterview = () => {
    dispatch(setTimerRunning(false));
    setIsPaused(true);
    setHasNavigatedAway(false);

    const pauseMessage = {
      type: 'bot',
      content: 'Interview paused. Click "Resume" to continue or switch tabs for a "Welcome Back" experience.',
      timestamp: new Date().toISOString(),
      isPause: true
    };
    setChatMessages(prev => [...prev, pauseMessage]);
  };

  const handleResumeInterview = () => {
    if (isPaused && hasNavigatedAway) {
      setShowWelcomeBackModal(true);
    } else if (isPaused) {
      dispatch(setTimerRunning(true));
      setIsPaused(false);

      const resumeMessage = {
        type: 'bot',
        content: 'Interview resumed! Let\'s continue with your responses.',
        timestamp: new Date().toISOString(),
        isResume: true
      };
      setChatMessages(prev => [...prev, resumeMessage]);
    }
  };

  const handleWelcomeBackClose = () => {
    setShowWelcomeBackModal(false);
    setIsPaused(false);
    setHasNavigatedAway(false);
    dispatch(setTimerRunning(true));

    const welcomeBackMessage = {
      type: 'bot',
      content: 'Welcome back! Your interview session has been resumed.',
      timestamp: new Date().toISOString(),
      isWelcomeBack: true
    };
    setChatMessages(prev => [...prev, welcomeBackMessage]);
  };

  const initializeInterview = () => {
    dispatch(startNewInterview());
    const welcomeMessage = {
      type: 'bot',
      content: `Hello ${currentCandidate.name}! Welcome to your AI-powered Full Stack Developer interview. You'll face ${TOTAL_QUESTIONS} carefully crafted questions that adapt to your skill level. Let's discover your potential!`,
      timestamp: new Date().toISOString(),
      isWelcome: true
    };
    setChatMessages([welcomeMessage]);
  };

  const askQuestion = async () => {
    dispatch(setProcessing(true));

    try {
      const setting = questionSettings[currentQuestionIndex];
      const questionData = await generateQuestion(setting.difficulty, currentCandidate.resumeText);

      const minutes = Math.floor(setting.time / 60);
      const minuteLabel = `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
      const questionMessage = {
        type: 'bot',
        content: questionData.question,
        timestamp: new Date().toISOString(),
        difficulty: setting.difficulty,
        timeLimit: setting.time,
        questionNumber: currentQuestionIndex + 1,
        totalQuestions: TOTAL_QUESTIONS
      };

      setChatMessages(prev => [...prev, questionMessage]);
      dispatch(setTimer(setting.time));
      dispatch(setTimerRunning(true));
    } catch (error) {
      console.error('Error generating question:', error);
    }

    dispatch(setProcessing(false));
  };

  const handleSubmitAnswer = async () => {
    dispatch(setTimerRunning(false));
    clearInterval(timerRef.current);

    const answerText = currentAnswer.trim() || 'No answer provided';
    const answerMessage = {
      type: 'user',
      content: answerText,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, answerMessage]);
    setCurrentAnswer('');
    dispatch(setProcessing(true));

    const acknowledgmentMessage = {
      type: 'bot',
      content: `Answer received. ${currentQuestionIndex < TOTAL_QUESTIONS - 1 ? "Preparing next question..." : "Finalizing your assessment..."}`,
      timestamp: new Date().toISOString(),
      isAcknowledgment: true
    };

    setChatMessages(prev => [...prev, acknowledgmentMessage]);

    try {
      const currentQ = questions[currentQuestionIndex];
      const evaluation = await evaluateAnswer(currentQ?.question || '', answerText, questionSettings[currentQuestionIndex].difficulty);

      dispatch(addQuestionAndAnswer({
        question: { question: currentQ?.question || '', difficulty: questionSettings[currentQuestionIndex].difficulty },
        answer: answerText,
        score: evaluation.score
      }));

    } catch (error) {
      console.error('Error evaluating answer:', error);
      dispatch(addQuestionAndAnswer({
        question: { question: questions[currentQuestionIndex]?.question || '', difficulty: questionSettings[currentQuestionIndex].difficulty },
        answer: answerText,
        score: 0
      }));
    }

    dispatch(setProcessing(false));
  };

  const handleTimeUp = () => {
    const timeUpMessage = {
      type: 'bot',
      content: 'Time elapsed! Moving forward with your current progress.',
      timestamp: new Date().toISOString(),
      isTimeUp: true
    };
    setChatMessages(prev => [...prev, timeUpMessage]);
    handleSubmitAnswer();
  };

  const finalizeInterview = async () => {
    const completionMessage = {
      type: 'bot',
      content: 'Interview complete! Analyzing your responses and generating comprehensive results...',
      timestamp: new Date().toISOString(),
      isCompletion: true
    };
    setChatMessages(prev => [...prev, completionMessage]);

    setTimeout(() => {
      const totalScore = individualScores.reduce((acc, score) => acc + score, 0);
      const finalPercentage = Math.round((totalScore / (TOTAL_QUESTIONS * 10)) * 100);

      const strongAreas = individualScores.filter(s => s >= 7).length;
      const weakAreas = individualScores.filter(s => s < 5).length;

      const summary = `Your performance analysis shows ${finalPercentage}% overall proficiency with ${strongAreas} strong areas and ${weakAreas} areas for development.`;

      dispatch(completeInterview({ score: finalPercentage, summary }));

      const updatedCandidate = {
        ...currentCandidate,
        score: finalPercentage,
        summary,
        status: 'completed',
        completedAt: new Date().toISOString(),
        questions: questions.map(q => q.question),
        answers: answers,
        individualScores
      };
      dispatch(updateCandidate(updatedCandidate));

      const finalMessage = {
        type: 'bot',
        content: `🏆 Final Assessment: ${finalPercentage}/100\n\nYour detailed performance breakdown is ready. You demonstrated strong technical understanding with room for growth in specific areas.`,
        timestamp: new Date().toISOString(),
        isFinal: true
      };
      setChatMessages(prev => [...prev, finalMessage]);
    }, 3000);
  };

  if (interviewState === 'completed') {
    return (
      <div className="interview-completed-container">
        <Card className="completion-card">
          <div className="completion-content">
            <div className="completion-icon">
              <ThunderboltOutlined />
            </div>
            <Title level={2} className="completion-title">
              Interview Complete!
            </Title>
            <div className="score-display">
              <div className="score-circle">
                <span className="score-value">{finalScore}</span>
                <span className="score-label">/100</span>
              </div>
            </div>
            <Text className="completion-subtitle">
              {finalSummary}
            </Text>
            <Space size="middle" className="completion-actions">
              <Button
                type="primary"
                size="large"
                onClick={() => dispatch(setActiveTab('interviewer'))}
                className="dashboard-button"
              >
                View Detailed Analytics
              </Button>
              <Button
                size="large"
                onClick={() => dispatch(resetInterview())}
                className="new-interview-button"
              >
                Start New Session
              </Button>
            </Space>
          </div>
        </Card>
      </div>
    );
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return '#52c41a';
      case 'Medium': return '#faad14';
      case 'Hard': return '#ff4d4f';
      default: return '#3498db';
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return '🟢';
      case 'Medium': return '🟡';
      case 'Hard': return '🔴';
      default: return '🔵';
    }
  };

  return (
    <div className="ai-interview-container">
      <div className="interview-layout">

        {/* Header Section */}
        <div className="interview-header">
          <div className="header-content">
            <div className="header-title-section">
              <ThunderboltOutlined className="ai-icon" />
              <div>
                <Title level={3} className="interview-title">
                  AI Interview Session
                </Title>
                <Text className="candidate-name">
                  with {currentCandidate.name}
                </Text>
              </div>
            </div>

            <div className="progress-section">
              <div className="progress-info">
                <Text className="progress-text">
                  Question {Math.min(currentQuestionIndex + 1, TOTAL_QUESTIONS)} of {TOTAL_QUESTIONS}
                </Text>
                <div className="progress-bar-container">
                  <Progress
                    percent={Math.round((currentQuestionIndex / TOTAL_QUESTIONS) * 100)}
                    strokeColor={{
                      '0%': '#28a745',
                      '100%': '#20c997',
                    }}
                    trailColor="#e9ecef"
                    strokeWidth={8}
                    showInfo={false}
                  />
                </div>
              </div>

              {(isTimerRunning || isPaused) && (
                <div className="timer-section">
                  <div className={`timer-display ${timer <= 30 ? 'warning' : ''} ${timer <= 10 ? 'critical' : ''}`}>
                    <ClockCircleOutlined className="timer-icon" />
                    <span className="timer-text">
                      {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div className="timer-controls">
                    {isTimerRunning && !isPaused ? (
                      <Button
                        type="default"
                        size="small"
                        icon={<PauseCircleOutlined />}
                        onClick={handlePauseInterview}
                        className="pause-btn"
                      >
                        Pause
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        size="small"
                        icon={<PlayCircleOutlined />}
                        onClick={handleResumeInterview}
                        className="resume-btn"
                      >
                        {isPaused && hasNavigatedAway ? 'Welcome Back' : 'Resume'}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Messages Section */}
        <div className="chat-interface">
          <div className="messages-container">
            {chatMessages.map((message, index) => (
              <div
                key={`${index}-${message.timestamp}`}
                className={`message-wrapper ${message.type}-wrapper`}
              >
                <div className="message-avatar">
                  <Avatar
                    size={40}
                    icon={message.type === 'bot' ?
                      (message.questionNumber ? <BulbOutlined /> :
                        message.isAcknowledgment ? <CheckCircleOutlined /> :
                          <ThunderboltOutlined />) :
                      <UserOutlined />}
                    className={`avatar ${message.type}-avatar`}
                  />
                </div>

                <div className="message-content">
                  <div
                    className={`message-bubble ${message.type === 'bot' ? 'ai-message' : 'user-message'
                      } ${message.isWelcome ? 'welcome-message' :
                        message.isAcknowledgment ? 'ack-message' :
                          message.isTimeUp ? 'timeup-message' :
                            message.isCompletion ? 'completion-message' :
                              message.isFinal ? 'final-message' :
                                message.isPause ? 'pause-message' :
                                  message.isResume ? 'resume-message' :
                                    message.isWelcomeBack ? 'welcome-back-message' : ''
                      }`}
                  >
                    {message.questionNumber && (
                      <div className="question-header">
                        <div className="question-meta">
                          <span className="question-number">
                            Q{message.questionNumber}
                          </span>
                          <span
                            className="difficulty-badge"
                            style={{ color: getDifficultyColor(message.difficulty) }}
                          >
                            {getDifficultyIcon(message.difficulty)} {message.difficulty}
                          </span>
                          <span className="time-badge">
                            {Math.floor(message.timeLimit / 60)}min
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="message-text">
                      {message.content.split('\n').map((line, i) => (
                        <p key={i} className="message-line">{line}</p>
                      ))}
                    </div>

                    <div className="message-timestamp">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="message-wrapper bot-wrapper">
                <div className="message-avatar">
                  <Avatar
                    size={40}
                    icon={<ThunderboltOutlined />}
                    className="avatar bot-avatar processing-avatar"
                  />
                </div>
                <div className="message-content">
                  <div className="message-bubble ai-message processing-message">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <div className="processing-text">
                      Analyzing your response...
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} className="scroll-anchor" />
          </div>
        </div>

        {/* Input Section */}
        {interviewState === 'in-progress' && currentQuestionIndex < TOTAL_QUESTIONS && !isProcessing && (
          <div className="input-section">
            <div className="input-container">
              <TextArea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Type your response..."
                rows={1}
                disabled={isProcessing}
                className="answer-input"
                onPressEnter={(e) => {
                  if (e.shiftKey) return;
                  e.preventDefault();
                  if (currentAnswer.trim()) handleSubmitAnswer();
                }}
                autoSize={{ minRows: 1, maxRows: 4 }}
              />
              <Button
                type="primary"
                size="large"
                icon={<SendOutlined />}
                onClick={handleSubmitAnswer}
                disabled={!currentAnswer.trim() || isProcessing}
                className="submit-answer-btn"
              />
            </div>
          </div>
        )}
      </div>

      <WelcomeBackModal
        visible={showWelcomeBackModal}
        onClose={handleWelcomeBackClose}
      />
    </div>
  );
};

export default Chat;