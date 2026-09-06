import { useEffect, useState } from 'react';
import { Table, Button, Tag } from 'antd';
import { fetchTeacherPositions } from '../api/teacherPositions';
import type { TeacherPosition } from '../types/teacherPosition';
import PositionFormDrawer from '../components/PositionFormDrawer';

export default function TeacherPositionListPage() {
  const [positions, setPositions] = useState<TeacherPosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetchTeacherPositions();
      setPositions(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button type="primary" onClick={() => setDrawerOpen(true)}>
          + Tạo
        </Button>
      </div>
      <Table
        rowKey="_id"
        loading={loading}
        dataSource={positions}
        pagination={false}
        locale={{ emptyText: 'Chưa có vị trí công tác nào' }}
        columns={[
          { title: 'Mã', dataIndex: 'code' },
          { title: 'Tên', dataIndex: 'name' },
          { title: 'Mô tả', dataIndex: 'des' },
          {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            render: (isActive: boolean) => (
              <Tag color={isActive ? 'green' : 'default'}>
                {isActive ? 'Hoạt động' : 'Ngừng'}
              </Tag>
            ),
          },
        ]}
      />
      <PositionFormDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCreated={load}
      />
    </div>
  );
}
