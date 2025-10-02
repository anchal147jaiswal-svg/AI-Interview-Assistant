import React from 'react';
import { Modal, Button, Typography, Space } from 'antd';
import { RobotOutlined, PlayCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { resetInterview } from '../store/interviewSlice';

const { Title, Text } = Typography;

const WelcomeBackModal = ({ visible, onClose }) => {
  const dispatch = useDispatch();

  const handleContinue = () => {
    onClose(); // Just close the modal, the state is already correct
  };

  const handleStartOver = () => {
    dispatch(resetInterview());
    onClose();
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      width={520}
      className="welcome-back-modal"
      maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
    >
      <div className="welcome-back-container">
        <div className="welcome-back-header">
          <div className="welcome-back-icon">
            <RobotOutlined />
          </div>
          <Title level={2} className="welcome-back-title">
            Welcome Back!
          </Title>
        </div>

        <div className="welcome-back-content">
          <div className="session-status">
            <div className="status-indicator"></div>
            <Text className="status-text">Your session was restored!</Text>
          </div>

          <Text className="welcome-back-description">
            You can continue where you left off or start a new interview.
          </Text>
        </div>

        <div className="welcome-back-actions">
          <Button
            size="large"
            onClick={handleStartOver}
            className="start-over-btn"
            icon={<PlusCircleOutlined />}
          >
            Start New Interview
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<PlayCircleOutlined />}
            onClick={handleContinue}
            className="continue-btn"
          >
            Continue Interview
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default WelcomeBackModal;
