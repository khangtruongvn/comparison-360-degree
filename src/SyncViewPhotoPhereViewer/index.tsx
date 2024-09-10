import { Button, Space, Switch, Typography } from 'antd';
import { useToggle } from 'react-use';
import SyncView from '../components/SyncView';

const SyncViewSphere = ({ data }) => {
  const [locked, toggleLock] = useToggle(false);
  const [isCompare, toggleCompare] = useToggle(false);

  return (
    <>
      <Space>
        <Switch checked={isCompare} onChange={checked => toggleCompare(checked)} />
        <Typography.Text>Compare mode</Typography.Text>
      </Space>
      <div style={{ position: 'relative' }}>
        <SyncView locked={locked} isCompare={isCompare} data={data} toggleLock={toggleLock} />

        {isCompare && (
          <Button
            type={locked ? 'primary' : 'default'}
            onClick={toggleLock}
            style={{
              left: '50%',
              top: '50%',
              position: 'absolute',
              transform: 'translate(-50%, -50%)',
            }}
          >
            Lock screen
          </Button>
        )}
      </div>
    </>
  );
};

export default SyncViewSphere;
