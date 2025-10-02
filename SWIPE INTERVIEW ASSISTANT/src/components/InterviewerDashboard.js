import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Table, Card, Input, Select, Button, Space, Typography, Tag, Modal, Progress, Statistic } from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  TrophyOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  FilterOutlined,
  StarFilled,
  CrownFilled,
  RiseOutlined,
  MailOutlined,
  PhoneOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import './InterviewerDashboard.css'
const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const InterviewerDashboard = () => {
  const { candidates } = useSelector(state => state.interview);
  const safeCandidates = Array.isArray(candidates) ? candidates : [];

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Dashboard Metrics
  const dashboardMetrics = useMemo(() => {
    const completedCandidates = safeCandidates.filter(c => c.status === 'completed');
    const inProgressCandidates = safeCandidates.filter(c => c.status === 'in-progress');
    const pendingCandidates = safeCandidates.filter(c => c.status === 'pending');

    const scores = completedCandidates.map(c => c.score).filter(s => s !== undefined);
    const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const highPerformers = completedCandidates.filter(c => c.score >= 80).length;
    const completionRate = safeCandidates.length > 0 ? Math.round((completedCandidates.length / safeCandidates.length) * 100) : 0;

    return {
      totalCandidates: safeCandidates.length,
      completed: completedCandidates.length,
      inProgress: inProgressCandidates.length,
      pending: pendingCandidates.length,
      averageScore,
      highPerformers,
      completionRate
    };
  }, [safeCandidates]);

  const filteredCandidates = safeCandidates.filter(candidate => {
    const matchesSearch = candidate.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      candidate.email?.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    const colors = {
      pending: 'default',
      ready: 'blue',
      'in-progress': 'orange',
      completed: 'green'
    };
    return colors[status] || 'default';
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#52c41a';
    if (score >= 60) return '#faad14';
    return '#ff4d4f';
  };

  const columns = [
    {
      title: 'CANDIDATE',
      key: 'candidate',
      width: 250,
      render: (record) => (
        <div className="candidate-cell">
          <div className="candidate-avatar">
            <UserOutlined />
          </div>
          <div className="candidate-info">
            <div className="candidate-name">{record.name || 'Unknown'}</div>
            <div className="candidate-email">{record.email}</div>
          </div>
        </div>
      )
    },
    {
      title: 'SCORE',
      dataIndex: 'score',
      key: 'score',
      width: 120,
      render: (score, record) => (
        <div className="score-cell">
          {score !== null && score !== undefined ? (
            <div className="score-display">
              <div
                className="score-value"
                style={{ color: getScoreColor(score) }}
              >
                {Math.round(score)}
              </div>
              <div className="score-max">/100</div>
            </div>
          ) : record.status === 'completed' ? (
            <Text type="secondary">Pending</Text>
          ) : (
            <Text type="secondary">-</Text>
          )}
        </div>
      )
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status) => (
        <Tag
          color={getStatusColor(status)}
          className="status-tag"
        >
          {status?.replace('-', ' ').toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'DATE',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 150,
      render: (timestamp) => (
        <div className="date-cell">
          <CalendarOutlined className="date-icon" />
          {dayjs(timestamp).format('MMM DD, YYYY')}
        </div>
      )
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      width: 120,
      render: (record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedCandidate(record);
            setDetailModalVisible(true);
          }}
          className="view-details-btn"
        >
          View
        </Button>
      )
    }
  ];

  return (
    <div className="interview-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-title">
            <div className="title-container">
              <div className="icon-wrapper">
                <TrophyOutlined className="title-icon" />
              </div>
              <div className="title-text">
                <Title level={2} className="dashboard-title">
                  <span className="title-interview">Interview</span>
                  <span className="title-dashboard">Dashboard</span>
                </Title>
                <Text className="dashboard-subtitle">
                  Manage and review candidate interviews
                </Text>
              </div>
            </div>
          </div>
          <div className="header-actions">
            <Space size="middle">
              <Search
                placeholder="Search candidates..."
                allowClear
                onChange={(e) => setSearchText(e.target.value)}
                className="search-input"
                prefix={<SearchOutlined />}
                style={{ width: 280 }}
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                className="status-filter"
                suffixIcon={<FilterOutlined />}
                style={{ width: 160 }}
              >
                <Option value="all">All Status</Option>
                <Option value="pending">Pending</Option>
                <Option value="ready">Ready</Option>
                <Option value="in-progress">In Progress</Option>
                <Option value="completed">Completed</Option>
              </Select>
            </Space>
          </div>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="metrics-section">
        <div className="metrics-grid">
          <Card className="metric-card" bordered={false}>
            <div className="metric-content">
              <div className="metric-icon total">
                <UserOutlined />
              </div>
              <div className="metric-data">
                <div className="metric-value">{dashboardMetrics.totalCandidates}</div>
                <div className="metric-label">Total Candidates</div>
              </div>
            </div>
          </Card>

          <Card className="metric-card" bordered={false}>
            <div className="metric-content">
              <div className="metric-icon completed">
                <CheckCircleOutlined />
              </div>
              <div className="metric-data">
                <div className="metric-value">{dashboardMetrics.completed}</div>
                <div className="metric-label">Completed</div>
              </div>
            </div>
          </Card>

          <Card className="metric-card" bordered={false}>
            <div className="metric-content">
              <div className="metric-icon progress">
                <ClockCircleOutlined />
              </div>
              <div className="metric-data">
                <div className="metric-value">{dashboardMetrics.inProgress}</div>
                <div className="metric-label">In Progress</div>
              </div>
            </div>
          </Card>

          <Card className="metric-card" bordered={false}>
            <div className="metric-content">
              <div className="metric-icon score">
                <TrophyOutlined />
              </div>
              <div className="metric-data">
                <div className="metric-value">{dashboardMetrics.averageScore}</div>
                <div className="metric-label">Average Score</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="content-section">
        <Card
          className="data-card"
          bordered={false}
          title={
            <div className="card-title">
              <Title level={4} style={{ margin: 0 }}>Candidate Interviews</Title>
              <Text type="secondary">
                {filteredCandidates.length} candidates found
              </Text>
            </div>
          }
        >
          <Table
            columns={columns}
            dataSource={filteredCandidates}
            rowKey="id"
            pagination={{
              total: filteredCandidates.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`
            }}
            className="candidates-table"
            scroll={{ x: 800 }}
          />
        </Card>
      </div>

      {/* Candidate Detail Modal */}
      <Modal
        title="Candidate Details"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={700}
        footer={null}
        className="candidate-modal"
      >
        {selectedCandidate && (
          <div className="candidate-details">
            {console.log('🔍 Selected candidate data:', selectedCandidate)}
            {console.log('📝 Selected candidate summary:', selectedCandidate.summary)}
            {/* Profile Section */}
            <div className="detail-section">
              <Title level={5} className="section-title">Profile Information</Title>
              <div className="profile-grid">
                <div className="profile-item">
                  <UserOutlined className="profile-icon" />
                  <div className="profile-content">
                    <div className="profile-label">Name</div>
                    <div className="profile-value">{selectedCandidate.name}</div>
                  </div>
                </div>
                <div className="profile-item">
                  <MailOutlined className="profile-icon" />
                  <div className="profile-content">
                    <div className="profile-label">Email</div>
                    <div className="profile-value">{selectedCandidate.email}</div>
                  </div>
                </div>
                <div className="profile-item">
                  <PhoneOutlined className="profile-icon" />
                  <div className="profile-content">
                    <div className="profile-label">Phone</div>
                    <div className="profile-value">{selectedCandidate.phone || 'Not provided'}</div>
                  </div>
                </div>
                <div className="profile-item">
                  <CalendarOutlined className="profile-icon" />
                  <div className="profile-content">
                    <div className="profile-label">Interview Date</div>
                    <div className="profile-value">
                      {dayjs(selectedCandidate.timestamp).format('MMMM DD, YYYY [at] HH:mm')}
                    </div>
                  </div>
                </div>
                {selectedCandidate.summary && (
                  <div className="profile-item summary-item">
                    <UserOutlined className="profile-icon" />
                    <div className="profile-content">
                      <div className="profile-label">Professional Summary</div>
                      <div className="profile-value summary-text">{selectedCandidate.summary}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status & Score Section */}
            <div className="detail-section">
              <Title level={5} className="section-title">Interview Results</Title>
              <div className="results-grid">
                <div className="result-item">
                  <div className="result-label">Status</div>
                  <Tag
                    color={getStatusColor(selectedCandidate.status)}
                    className="status-tag-large"
                  >
                    {selectedCandidate.status?.replace('-', ' ').toUpperCase()}
                  </Tag>
                </div>
                {selectedCandidate.score && (
                  <div className="result-item">
                    <div className="result-label">Final Score</div>
                    <div
                      className="final-score"
                      style={{ color: getScoreColor(selectedCandidate.score) }}
                    >
                      {selectedCandidate.score}/100
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Questions & Answers */}
            {selectedCandidate.questions && (
              <div className="detail-section">
                <Title level={5} className="section-title">Questions & Answers</Title>
                <div className="questions-list">
                  {selectedCandidate.questions.map((question, index) => {
                    const cleaned = String(question || '').replace(/^Question\s*\d+\/?\d*\s*[:\-–—]*\s*/i, '');
                    const answerText = selectedCandidate.answers?.[index] || 'No answer provided';
                    const scoreValue = selectedCandidate.individualScores?.[index] ?? 0;

                    return (
                      <div key={index} className="question-item">
                        <div className="question-header">
                          <div className="question-number">Q{index + 1}</div>
                          <div className="question-score">{scoreValue}/10</div>
                        </div>
                        <div className="question-text">{cleaned}</div>
                        <div className="answer-section">
                          <div className="answer-text">{answerText}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InterviewerDashboard;