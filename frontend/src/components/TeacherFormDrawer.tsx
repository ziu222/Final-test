import { useEffect, useState } from 'react';
import { Drawer, Form, Input, DatePicker, Select, Button, message, Divider, InputNumber } from 'antd';
import dayjs from 'dayjs';
import { createTeacher } from '../api/teachers';
import { fetchTeacherPositions } from '../api/teacherPositions';
import type { TeacherPosition } from '../types/teacherPosition';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

interface FormValues {
  name: string;
  email: string;
  phoneNumber: string;
  identity: string;
  address: string;
  dob: dayjs.Dayjs;
  startDate: dayjs.Dayjs;
  teacherPositions: string[];
  degreeType: string;
  degreeSchool: string;
  degreeMajor: string;
  degreeYear: number;
}

export default function TeacherFormDrawer({ open, onClose, onCreated }: Props) {
  const [form] = Form.useForm<FormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [positions, setPositions] = useState<TeacherPosition[]>([]);

  useEffect(() => {
    if (open) {
      fetchTeacherPositions().then((res) => setPositions(res.data));
    }
  }, [open]);

  async function handleSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      await createTeacher({
        name: values.name,
        email: values.email,
        phoneNumber: values.phoneNumber,
        identity: values.identity,
        address: values.address,
        dob: values.dob.toISOString(),
        startDate: values.startDate.toISOString(),
        teacherPositions: values.teacherPositions,
        degrees: [
          {
            type: values.degreeType,
            school: values.degreeSchool,
            major: values.degreeMajor,
            year: values.degreeYear,
            isGraduated: true,
          },
        ],
      });
      message.success('Tạo giáo viên thành công');
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
    <Drawer title="Tạo thông tin giáo viên" open={open} onClose={onClose} width={480}>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="name" label="Họ và tên" rules={[{ required: true, message: 'Bắt buộc' }]}>
          <Input placeholder="VD: Nguyễn Văn A" />
        </Form.Item>
        <Form.Item name="dob" label="Ngày sinh" rules={[{ required: true, message: 'Bắt buộc' }]}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="phoneNumber" label="Số điện thoại" rules={[{ required: true, message: 'Bắt buộc' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}>
          <Input placeholder="example@school.edu.vn" />
        </Form.Item>
        <Form.Item name="identity" label="Số CCCD" rules={[{ required: true, message: 'Bắt buộc' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="address" label="Địa chỉ" rules={[{ required: true, message: 'Bắt buộc' }]}>
          <Input />
        </Form.Item>

        <Divider>Thông tin công tác</Divider>
        <Form.Item name="teacherPositions" label="Vị trí công tác" rules={[{ required: true, message: 'Bắt buộc' }]}>
          <Select
            mode="multiple"
            options={positions.map((p) => ({ label: p.name, value: p._id }))}
          />
        </Form.Item>
        <Form.Item name="startDate" label="Ngày bắt đầu công tác" rules={[{ required: true, message: 'Bắt buộc' }]}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Divider>Học vị</Divider>
        <Form.Item name="degreeType" label="Bậc" rules={[{ required: true, message: 'Bắt buộc' }]}>
          <Input placeholder="VD: Cử nhân, Thạc sĩ" />
        </Form.Item>
        <Form.Item name="degreeSchool" label="Trường" rules={[{ required: true, message: 'Bắt buộc' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="degreeMajor" label="Chuyên ngành" rules={[{ required: true, message: 'Bắt buộc' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="degreeYear" label="Năm tốt nghiệp" rules={[{ required: true, message: 'Bắt buộc' }]}>
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={submitting}>
          Lưu
        </Button>
      </Form>
    </Drawer>
  );
}
