import { useState } from 'react';
import { Drawer, Form, Input, Switch, Button, message } from 'antd';
import { createTeacherPosition } from '../api/teacherPositions';
import type { CreateTeacherPositionPayload } from '../types/teacherPosition';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function PositionFormDrawer({ open, onClose, onCreated }: Props) {
  const [form] = Form.useForm<CreateTeacherPositionPayload>();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(values: CreateTeacherPositionPayload) {
    setSubmitting(true);
    try {
      await createTeacherPosition({ ...values, isActive: values.isActive ?? true });
      message.success('Tạo vị trí công tác thành công');
      form.resetFields();
      onCreated();
      onClose();
    } catch (err: any) {
      message.error(err?.response?.data?.message ?? 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Drawer title="Vị trí công tác" open={open} onClose={onClose} width={420}>
      <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ isActive: true }}>
        <Form.Item name="code" label="Mã" rules={[{ required: true, message: 'Bắt buộc' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="name" label="Tên" rules={[{ required: true, message: 'Bắt buộc' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="des" label="Mô tả" rules={[{ required: true, message: 'Bắt buộc' }]}>
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
          <Switch checkedChildren="Hoạt động" unCheckedChildren="Ngừng" />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={submitting}>
          Lưu
        </Button>
      </Form>
    </Drawer>
  );
}
