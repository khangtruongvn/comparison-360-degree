import { Image, Space, Typography } from 'antd';

const DefectDetail = ({ defect }) => {
  return (
    <table style={{ width: '100%' }}>
      <tr>
        <td>
          <Typography.Text strong>ID</Typography.Text>
        </td>
        <td>
          <Typography.Text>{defect.defect_id_elevation}</Typography.Text>
        </td>
      </tr>

      <tr>
        <td>
          <Typography.Text strong>Component</Typography.Text>
        </td>
        <td>
          <Typography.Text>{defect.component}</Typography.Text>
        </td>
      </tr>
      <tr>
        <td>
          <Typography.Text strong>Sub component</Typography.Text>
        </td>
        <td>
          <Typography.Text>{defect.subcomponent}</Typography.Text>
        </td>
      </tr>
      <tr>
        <td>
          <Typography.Text strong>Description</Typography.Text>
        </td>
        <td>
          <Typography.Text>{defect.description}</Typography.Text>
        </td>
      </tr>
      <tr>
        <td>
          <Typography.Text strong>Extent</Typography.Text>
        </td>
        <td>
          <Typography.Text>{defect.extent}</Typography.Text>
        </td>
      </tr>
      <tr>
        <td>
          <Typography.Text strong>Intensity</Typography.Text>
        </td>
        <td>
          <Typography.Text>{defect.intensity}</Typography.Text>
        </td>
      </tr>

      <tr>
        <td>
          <Typography.Text strong>Severity</Typography.Text>
        </td>
        <td>
          <Typography.Text>{defect.severity}</Typography.Text>
        </td>
      </tr>

      <tr>
        <td>
          <Typography.Text strong>Solution</Typography.Text>
        </td>
        <td>
          <Typography.Text>{defect.solution}</Typography.Text>
        </td>
      </tr>

      <tr>
        <td>
          <Typography.Text strong>Image</Typography.Text>
        </td>
        <td>
          <Image src={defect.imageUrl} />
        </td>
      </tr>
    </table>
  );

  return (
    <Space direction="vertical" size="small" style={{ width: '100%' }}>
      <Space>
        <Typography.Text strong>ID</Typography.Text>
        <Typography.Text>121212</Typography.Text>
      </Space>

      <Space>
        <Typography.Text strong>Component</Typography.Text>
        <Typography.Text>121212</Typography.Text>
      </Space>

      <Space>
        <Typography.Text strong>Component</Typography.Text>
        <Typography.Text>121212</Typography.Text>
      </Space>

      <Space>
        <Typography.Text strong>Component</Typography.Text>
        <Typography.Text>121212</Typography.Text>
      </Space>

      <Space>
        <Typography.Text strong>Component</Typography.Text>
        <Typography.Text>121212</Typography.Text>
      </Space>

      <Space>
        <Typography.Text strong>Component</Typography.Text>
        <Typography.Text>121212</Typography.Text>
      </Space>

      <Space>
        <Typography.Text strong>Component</Typography.Text>
        <Typography.Text>121212</Typography.Text>
      </Space>

      <Space>
        <Typography.Text strong>Component</Typography.Text>
        <Typography.Text>121212</Typography.Text>
      </Space>

      <Space>
        <Typography.Text strong>Component</Typography.Text>
        <Typography.Text>121212</Typography.Text>
      </Space>
    </Space>
  );
};

export default DefectDetail;
