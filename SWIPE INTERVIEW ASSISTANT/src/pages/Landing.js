import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Button } from 'antd';
import { setActiveTab } from '../store/interviewSlice';
import './Landing.css';

const Landing = ({ onNavigate }) => {
  const dispatch = useDispatch();
  const [expanded, setExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);

  const goToInterview = () => {
    dispatch(setActiveTab('interviewee'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (typeof onNavigate === 'function') onNavigate('interviewee');
  };

  const goToDashboard = () => {
    dispatch(setActiveTab('interviewer'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (typeof onNavigate === 'function') onNavigate('interviewer');
  };

  const features = [
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 12L11 14L15 10M12 3C13.1819 3 14.3522 3.23279 15.4442 3.68508C16.5361 4.13738 17.5282 4.80031 18.364 5.63604C19.1997 6.47177 19.8626 7.46392 20.3149 8.55585C20.7672 9.64778 21 10.8181 21 12C21 13.1819 20.7672 14.3522 20.3149 15.4442C19.8626 16.5361 19.1997 17.5282 18.364 18.364C17.5282 19.1997 16.5361 19.8626 15.4442 20.3149C14.3522 20.7672 13.1819 21 12 21C10.8181 21 9.64778 20.7672 8.55585 20.3149C7.46392 19.8626 6.47177 19.1997 5.63604 18.364C4.80031 17.5282 4.13738 16.5361 3.68508 15.4442C3.23279 14.3522 3 13.1819 3 12C3 9.61305 3.94821 7.32387 5.63604 5.63604C7.32387 3.94821 9.61305 3 12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: "Adaptive Assessment",
      description: "AI-driven questions that evolve based on candidate responses and skill level"
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: "Real-time Analytics",
      description: "Comprehensive performance metrics and behavioral insights as you interview"
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 17H7C5.89543 17 5 16.1046 5 15V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V15C19 16.1046 18.1046 17 17 17H15M9 17V21L12 18L15 21V17M9 17H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: "Enterprise Integration",
      description: "Seamlessly integrate with your existing HR systems and workflows"
    }
  ];

  return (
    <div className={`landing-wrapper ${mounted ? 'mounted' : ''}`} ref={containerRef}>
      {/* Professional Background */}
      <div className="background-pattern"></div>
      <div className="gradient-overlay"></div>

      <div className="landing-container">
        <div className="landing-card">
          {/* Header */}
          <div className="landing-header">
            <div className="platform-badge">
              <div className="status-indicator"></div>
              ENTERPRISE AI INTERVIEW PLATFORM
            </div>
            <div className="trusted-by">
              Trusted by Fortune 500 companies worldwide
            </div>
          </div>

          {/* Main Hero */}
          <div className="hero-section">
            <div className="hero-content">
              <div className="hero-text">
                <div className="title-section">
                  <h1 className="hero-title">
                    Intelligent Technical
                    <span className="title-accent"> Interviews</span>
                  </h1>
                  <div className="title-divider"></div>
                </div>

                <p className="hero-subtitle">
                  Streamline your technical hiring process with our AI-powered interview platform.
                  Conduct consistent, unbiased assessments while providing candidates with an
                  exceptional interview experience.
                </p>

                {/* Key Metrics */}
                <div className="metrics-grid">
                  <div className="metric-item">
                    <div className="metric-value">94%</div>
                    <div className="metric-label">Accuracy Rate</div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-value">65%</div>
                    <div className="metric-label">Time Saved</div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-value">4.8/5</div>
                    <div className="metric-label">Candidate Rating</div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="cta-section">
                  <button
                    className="cta-btn primary"
                    onClick={goToInterview}
                  >
                    <span className="btn-content">
                      <span className="btn-text">Start Interview</span>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </button>

                  <button
                    className="cta-btn secondary"
                    onClick={goToDashboard}
                  >
                    <span className="btn-content">
                      <span className="btn-text">Access Dashboard</span>
                    </span>
                  </button>
                </div>
              </div>

              {/* Professional Visualization */}
              <div className="visualization-section">
                <div className="dashboard-preview">
                  <div className="preview-header">
                    <div className="window-controls">
                      <div className="control-dot"></div>
                      <div className="control-dot"></div>
                      <div className="control-dot"></div>
                    </div>
                    <div className="preview-title">Live Interview Analytics</div>
                  </div>
                  <div className="preview-content">
                    <div className="analytics-grid">
                      <div className="analytics-item">
                        <div className="analytics-chart chart-1"></div>
                        <div className="analytics-label">Technical Score</div>
                      </div>
                      <div className="analytics-item">
                        <div className="analytics-chart chart-2"></div>
                        <div className="analytics-label">Communication</div>
                      </div>
                      <div className="analytics-item">
                        <div className="analytics-chart chart-3"></div>
                        <div className="analytics-label">Problem Solving</div>
                      </div>
                    </div>
                    <div className="live-indicator">
                      <div className="live-dot"></div>
                      Real-time Analysis
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="features-section">
            <div className="section-header">
              <h2 className="section-title">Enterprise-Grade Features</h2>
              <p className="section-subtitle">Designed for professional technical hiring at scale</p>
            </div>

            <div className="features-grid">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`feature-card ${activeFeature === index ? 'active' : ''}`}
                  onMouseEnter={() => setActiveFeature(index)}
                >
                  <div className="feature-icon-wrapper">
                    {feature.icon}
                  </div>
                  <div className="feature-content">
                    <h3 className="feature-title">{feature.title}</h3>
                    <p className="feature-description">{feature.description}</p>
                  </div>
                  <div className="feature-border"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Expandable Section */}
          <div className="business-section">
            <div className="business-content">
              <div className="business-text">
                <h3 className="business-title">Transform Your Hiring Process</h3>
                <p className="business-description">
                  Our platform helps enterprise teams conduct more effective technical interviews
                  while reducing bias and saving valuable engineering time.
                </p>
              </div>

              <div className="business-actions">
                <button
                  className="expand-toggle"
                  onClick={() => setExpanded(!expanded)}
                >
                  <span className="toggle-text">
                    {expanded ? 'Show Less' : 'Learn More About Our Platform'}
                  </span>
                  <span className={`toggle-icon ${expanded ? 'expanded' : ''}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>

                {expanded && (
                  <div className="expand-content">
                    <div className="content-columns">
                      <div className="content-column">
                        <h4>For Engineering Teams</h4>
                        <ul>
                          <li>Reduce screening time by up to 70%</li>
                          <li>Standardized evaluation criteria</li>
                          <li>Integration with existing ATS</li>
                          <li>Collaborative review tools</li>
                        </ul>
                      </div>
                      <div className="content-column">
                        <h4>For Candidates</h4>
                        <ul>
                          <li>Real-time feedback and scoring</li>
                          <li>Practice with realistic scenarios</li>
                          <li>Flexible scheduling options</li>
                          <li>Detailed performance insights</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;