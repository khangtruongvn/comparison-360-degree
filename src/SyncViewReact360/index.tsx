import { Viewer } from '@photo-sphere-viewer/core';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import { Button } from 'antd';
import React, { memo, useEffect, useRef } from 'react';
import { useToggle } from 'react-use';

const SyncViewSphere = ({ data }) => {
  const [locked, toggleLock] = useToggle(false);

  const handleToggleLock = () => {
    toggleLock();
  };

  return (
    <div style={{ display: 'flex', position: 'relative' }}>
      <SyncView data={data} locked={locked} />

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
  );
};

const SyncView = ({ data, locked }) => {
  const viewer1Ref = useRef<Viewer | null>(null);
  const viewer2Ref = useRef<Viewer | null>(null);
  const container1Ref = useRef<any>(null);
  const container2Ref = useRef<any>(null);

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

  // init viewer 1
  useEffect(() => {
    if (container1Ref.current) {
      const viewer = new Viewer({
        container: container1Ref.current,
        panorama: data.url,
        plugins: plugins,
        zoomSpeed: 50,
      });
      viewer.addEventListener('position-updated', e => {
        syncViewers(viewer1Ref.current, viewer2Ref.current);
      });
      viewer.addEventListener('zoom-updated', e => {
        syncViewers(viewer1Ref.current, viewer2Ref.current);
      });

      viewer1Ref.current = viewer;
    }

    return () => {
      if (viewer1Ref.current) {
        console.log('destroy view1');
        viewer1Ref.current.destroy();
      }
    };
  }, [data.url, locked]);

  // init viewer 2
  useEffect(() => {
    if (container2Ref.current) {
      const viewer = new Viewer({
        container: container2Ref.current,
        panorama: data.url,
        plugins: plugins,
        zoomSpeed: 50,
      });
      viewer.addEventListener('position-updated', e => {
        syncViewers(viewer2Ref.current, viewer1Ref.current);
      });
      viewer.addEventListener('zoom-updated', e => {
        syncViewers(viewer2Ref.current, viewer1Ref.current);
      });

      viewer2Ref.current = viewer;
    }

    return () => {
      if (viewer2Ref.current) {
        console.log('destroy view2');
        viewer2Ref.current.destroy();
      }
    };
  }, [data.url, locked]);

  return (
    <React.Fragment>
      <div ref={container1Ref} style={{ width: '50%', height: '100vh' }} />
      <div ref={container2Ref} style={{ width: '50%', height: '100vh' }} />
    </React.Fragment>
  );
};

export default memo(SyncViewSphere);
