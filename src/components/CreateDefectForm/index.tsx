import { Button, Col, Form, Input, Modal, Row, Select, Space } from 'antd';
import { useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import { COMPONENTS } from '../../constants';

interface ICreateDefectForm {
  open: boolean;
  onOk: (values: any) => void;
  onCancel: () => void;
}

const CreateDefectForm = ({ open, onOk, onCancel }: ICreateDefectForm) => {
  const [form] = Form.useForm();
  const draggleRef = useRef<any>(null);
  const component = Form.useWatch('component', form);
  const subComponent = Form.useWatch('subComponent', form);
  const material = Form.useWatch('material', form);
  const description = Form.useWatch('description', form);
  const type = Form.useWatch('type', form);
  const intensity = Form.useWatch('intensity', form);

  const subComponentOptions = COMPONENTS.find(item => item.label === component)?.subComponent || [];
  const materialOptions =
    subComponentOptions.find(item => item.label === subComponent)?.material || [];
  const descriptionOptions =
    materialOptions.find(item => item.label === material)?.description || [];
  const typeOptions = descriptionOptions.find(item => item.label === description)?.type || [];
  const intensityOptions = typeOptions.find(item => item.label === type)?.intensity || [];
  const extentOptions = intensityOptions.find(item => item.label === intensity)?.extent || [];

  useEffect(() => {
    form.resetFields(['subComponent']);
  }, [component]);

  useEffect(() => {
    form.resetFields(['material']);
  }, [subComponent]);

  useEffect(() => {
    form.resetFields(['description']);
  }, [material]);

  useEffect(() => {
    form.resetFields(['type']);
  }, [description]);

  useEffect(() => {
    form.resetFields(['intensity']);
  }, [type]);

  useEffect(() => {
    form.resetFields(['extent']);
  }, [intensity]);

  return (
    <Modal
      centered
      width={600}
      open={open}
      footer={false}
      destroyOnClose
      title="Create new defect"
      modalRender={modal => (
        <Draggable nodeRef={draggleRef}>
          <div ref={draggleRef}>{modal}</div>
        </Draggable>
      )}
      closeIcon={false}
      maskClosable={false}
    >
      <Form layout="vertical" form={form} onFinish={onOk} initialValues={{}} clearOnDestroy={true}>
        <Row gutter={[24, 0]}>
          <Col xs={12}>
            <Form.Item
              required={true}
              name="component"
              label="Component"
              // rules={[{ required: true }]}
            >
              <Select
                options={COMPONENTS}
                fieldNames={{
                  label: 'label',
                  value: 'label',
                }}
              />
            </Form.Item>
          </Col>

          <Col xs={12}>
            <Form.Item
              required={true}
              name="subComponent"
              label="Sub component"
              // rules={[{ required: true }]}
            >
              <Select
                disabled={!component}
                options={subComponentOptions}
                fieldNames={{
                  label: 'label',
                  value: 'label',
                }}
              />
            </Form.Item>
          </Col>

          <Col xs={12}>
            <Form.Item
              label="Material"
              name="material"
              required={true}
              // rules={[{ required: true }]}
            >
              <Select
                disabled={!subComponent}
                options={materialOptions}
                fieldNames={{
                  label: 'label',
                  value: 'label',
                }}
              />
            </Form.Item>
          </Col>

          <Col xs={12}>
            <Form.Item label="Description" name="description">
              <Select
                disabled={!material}
                options={descriptionOptions}
                fieldNames={{
                  label: 'label',
                  value: 'label',
                }}
              />
            </Form.Item>
          </Col>

          <Col xs={12}>
            <Form.Item label="Type" name="type">
              <Select
                disabled={!description}
                options={typeOptions}
                fieldNames={{
                  label: 'label',
                  value: 'label',
                }}
              />
            </Form.Item>
          </Col>

          <Col xs={12}>
            <Form.Item label="Intensity" name="intensity">
              <Select
                disabled={!type}
                options={intensityOptions}
                fieldNames={{
                  label: 'label',
                  value: 'label',
                }}
              />
            </Form.Item>
          </Col>

          <Col xs={12}>
            <Form.Item label="Extent" name="extent">
              <Select
                disabled={!intensity}
                options={extentOptions}
                fieldNames={{
                  label: 'label',
                  value: 'label',
                }}
              />
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Row gutter={[24, 0]}>
              <Col xs={12}>
                <Form.Item label="Comment" name="comment">
                  <Input.TextArea rows={4} />
                </Form.Item>
              </Col>
              <Col xs={12}>
                <Form.Item label="Resolution" name="resolution">
                  <Input.TextArea rows={4} />
                </Form.Item>
              </Col>
            </Row>
          </Col>

          <Col xs={24}>
            <Row justify="end">
              <Col>
                <Space size="middle">
                  <Button onClick={onCancel}>Cancel</Button>
                  <Button type="primary" htmlType="submit">
                    Save
                  </Button>
                </Space>
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CreateDefectForm;
