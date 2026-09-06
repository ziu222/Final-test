import { Layout, Menu } from 'antd';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import TeacherListPage from './pages/TeacherListPage';
import TeacherPositionListPage from './pages/TeacherPositionListPage';

const { Header, Content } = Layout;

export default function App() {
  const location = useLocation();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ color: '#fff', fontWeight: 600, marginRight: 32 }}>
          School System
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={[
            { key: '/teachers', label: <Link to="/teachers">Giáo viên</Link> },
            { key: '/teacher-positions', label: <Link to="/teacher-positions">Vị trí công tác</Link> },
          ]}
        />
      </Header>
      <Content style={{ padding: 24 }}>
        <Routes>
          <Route path="/" element={<TeacherListPage />} />
          <Route path="/teachers" element={<TeacherListPage />} />
          <Route path="/teacher-positions" element={<TeacherPositionListPage />} />
        </Routes>
      </Content>
    </Layout>
  );
}
