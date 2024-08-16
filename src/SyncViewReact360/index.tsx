import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import { Button, Spin } from 'antd';
import { forwardRef, memo, useEffect, useRef, useState } from 'react';
import { ReactPhotoSphereViewer } from 'react-photo-sphere-viewer';
import { useToggle } from 'react-use';

const SyncViewSphere = ({ data }) => {
  const [key, setKey] = useState(0);
  const [locked, toggleLock] = useToggle(true);
  const [loading, toggleLoading] = useToggle(false);

  const handleToggleLock = () => {
    toggleLoading();
    setTimeout(() => {
      toggleLock();
      toggleLoading();
      setKey(prev => prev + 1);
    }, 500);
  };

  return (
    <>
      <Spin spinning={loading}>
        <div style={{ display: 'flex', position: 'relative' }}>
          <SyncView data={data} locked={locked} key={key} />

          <Button
            type={locked ? 'primary' : 'default'}
            onClick={handleToggleLock}
            style={{
              left: '50%',
              top: '50%',
              position: 'absolute',
              transform: 'translate(-50%, -50%)',
            }}
          >
            Lock screen
          </Button>
        </div>
      </Spin>
    </>
  );
};

const SyncView = ({ data, locked }) => {
  const viewer1Ref = useRef<any>(null);
  const viewer2Ref = useRef<any>(null);

  const plugins: any = [
    [
      MarkersPlugin,
      {
        markers: [
          ...data.customHotspots.map((marker, index) => ({
            id: `marker-${index}`,
            position: { yaw: marker.yaw, pitch: marker.pitch },
            image: marker.icon,
            size: { width: 60, height: 60 },
            tooltip: {
              content: marker.transition,
              position: 'center',
            },
          })),
        ],
      },
    ],
  ];

  const syncViewers = (sourceViewer, targetViewer) => {
    if (!locked || !sourceViewer || !targetViewer) return;
    targetViewer.rotate({
      pitch: sourceViewer.getPosition().pitch,
      yaw: sourceViewer.getPosition().yaw,
    });
    targetViewer.zoom(sourceViewer.getZoomLevel());
  };

  useEffect(() => {
    return () => {
      viewer1Ref.current?.destroy();
      viewer2Ref.current?.destroy();
    };
  }, []);

  return (
    <>
      <Viewer
        url={data.url}
        ref={viewer1Ref}
        plugins={plugins}
        syncViewers={() => syncViewers(viewer1Ref.current, viewer2Ref.current)}
      />

      <Viewer
        url={data.url}
        ref={viewer2Ref}
        plugins={plugins}
        syncViewers={() => syncViewers(viewer2Ref.current, viewer1Ref.current)}
      />
    </>
  );
};

const Viewer = forwardRef<any, any>(({ url, syncViewers, plugins }, ref) => {
  console.log('ref', ref);
  return (
    <ReactPhotoSphereViewer
      defaultZoomLvl={0}
      zoomSpeed={50}
      ref={ref}
      src={url}
      height={'100vh'}
      width={'50%'}
      plugins={plugins}
      onPositionChange={syncViewers}
      onZoomChange={syncViewers}
    ></ReactPhotoSphereViewer>
  );
});

export default memo(SyncViewSphere);
