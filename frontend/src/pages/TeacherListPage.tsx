import { useEffect, useState } from 'react';
import { Table, Button, Tag, Space } from 'antd';
import { fetchTeachers } from '../api/teachers';
import type { Teacher } from '../types/teacher';
import TeacherFormDrawer from '../components/TeacherFormDrawer';

export default function TeacherListPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  async function load(p = page, l = limit) {
    setLoading(true);
    try {
      const res = await fetchTeachers(p, l);
      setTeachers(res.data);
      setTotal(res.total);
      setPage(res.page);
      setLimit(res.limit);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button type="primary" onClick={() => setDrawerOpen(true)}>
          + Tạo mới
        </Button>
      </div>
      <Table
        rowKey="code"
        loading={loading}
        dataSource={teachers}
        locale={{ emptyText: 'Chưa có giáo viên nào' }}
        pagination={{
          current: page,
          pageSize: limit,
          total,
          onChange: (p, l) => load(p, l),
        }}
        columns={[
          { title: 'Mã', dataIndex: 'code' },
          {
            title: 'Giáo viên',
            render: (_: unknown, t: Teacher) => (
              <Space direction="vertical" size={0}>
                <span>{t.name}</span>
                <span style={{ color: '#888' }}>{t.email}</span>
              </Space>
            ),
          },
          {
            title: 'Học vấn (cao nhất)',
            render: (_: unknown, t: Teacher) =>
              t.degrees[0] ? `${t.degrees[0].type} - ${t.degrees[0].school}` : '-',
          },
          {
            title: 'Vị trí công tác',
            render: (_: unknown, t: Teacher) => t.positions.join(', '),
          },
          { title: 'Địa chỉ', dataIndex: 'address' },
          {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            render: (isActive: boolean) => (
              <Tag color={isActive ? 'green' : 'default'}>
                {isActive ? 'Đang công tác' : 'Ngừng công tác'}
              </Tag>
            ),
          },
        ]}
      />
      <TeacherFormDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCreated={() => load(1, limit)}
      />
    </div>
  );
}
