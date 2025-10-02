import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tabs, Layout, Menu } from 'antd';
import { HomeOutlined, UserOutlined, DashboardOutlined } from '@ant-design/icons';
import IntervieweeTab from './components/IntervieweeTab';
import InterviewerDashboard from './components/InterviewerDashboard';
import Landing from './pages/Landing';
import { setActiveTab } from './store/interviewSlice';
import './App.css';

const { Content } = Layout;

function App() {
  const dispatch = useDispatch();
  const { activeTab } = useSelector(state => state.interview);
  const [showLanding, setShowLanding] = useState(true);

  const tabItems = [
    {
      key: 'interviewee',
      label: <span><UserOutlined />Interviewee</span>,
      children: <IntervieweeTab />
    },
    {
      key: 'interviewer',
      label: <span><DashboardOutlined />Interviewer Dashboard</span>,
      children: <InterviewerDashboard />
    }
  ];

  return (
    <Layout className="app-layout">
      <div className="top-nav">
        <div className="nav-inner">
          <div className="brand">AI Interview Assistant</div>
          <Menu mode="horizontal" selectable={false} className="top-menu">
            <Menu.Item key="home" icon={<HomeOutlined />} onClick={() => { setShowLanding(true); dispatch(setActiveTab('interviewee')); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Home</Menu.Item>
            <Menu.Item key="interview" icon={<UserOutlined />} onClick={() => { setShowLanding(false); dispatch(setActiveTab('interviewee')); }}>Interview</Menu.Item>
            <Menu.Item key="dashboard" icon={<DashboardOutlined />} onClick={() => { setShowLanding(false); dispatch(setActiveTab('interviewer')); }}>Dashboard</Menu.Item>
          </Menu>
        </div>
      </div>
      <Content className="app-content">
        {showLanding ? (
          <Landing onNavigate={() => setShowLanding(false)} />
        ) : (
          <>
            <Tabs
              activeKey={activeTab}
              items={tabItems}
              onChange={(key) => dispatch(setActiveTab(key))}
              size="large"
              centered
            />

            {/* footer Home removed - navigation moved to top nav */}
          </>
        )}
      </Content>
    </Layout>
  );
}

export default App;
