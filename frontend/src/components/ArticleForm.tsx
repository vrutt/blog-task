// components/ArticleForm.tsx

import { Form, Input, Button } from "antd";

type ArticleFormProps = {
  initialValues?: { title: string; content: string };
  onSubmit?: (values: { title: string; content: string }) => Promise<void>;
  loading?: boolean;
  submitLabel?: string;
};

const ArticleForm: React.FC<ArticleFormProps> = ({
  initialValues = { title: '', content: '' },
  onSubmit,
  loading = false,
  submitLabel = "Submit",
}) => {
  const [form] = Form.useForm();

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onSubmit}
      initialValues={initialValues}
    >
      <Form.Item
        label="Title"
        name="title"
        rules={[{ required: true, message: 'Please enter the title' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Content"
        name="content"
        rules={[{ required: true, message: 'Please enter the content' }]}
      >
        <Input.TextArea rows={6} />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          {submitLabel}
        </Button>
      </Form.Item>

    </Form>
  );
};

export default ArticleForm;
