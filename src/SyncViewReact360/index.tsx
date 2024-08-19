import { Viewer } from '@photo-sphere-viewer/core';
import { PlanPlugin } from '@photo-sphere-viewer/plan-plugin';
import { VirtualTourPlugin } from '@photo-sphere-viewer/virtual-tour-plugin';
import { Button, Space, Switch, Typography } from 'antd';
import { memo, useEffect, useRef } from 'react';
import { useToggle } from 'react-use';

const SyncViewSphere = ({ data, images }) => {
  const [locked, toggleLock] = useToggle(false);
  const [isCompare, toggleCompare] = useToggle(false);

  return (
    <>
      <Space>
        <Switch checked={isCompare} onChange={checked => toggleCompare(checked)} />
        <Typography.Text>Compare mode</Typography.Text>
      </Space>
      <div style={{ position: 'relative' }}>
        <SyncView data={data} locked={locked} isCompare={isCompare} images={images} />

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

const SyncView = ({ data, locked, isCompare, images }) => {
  const viewer1Ref = useRef<Viewer | null>(null);
  const viewer2Ref = useRef<Viewer | null>(null);
  const container1Ref = useRef<HTMLDivElement | null>(null);
  const container2Ref = useRef<HTMLDivElement | null>(null);

  const plugins: any = [
    [
      PlanPlugin,
      {
        defaultZoom: 14,
        coordinates: [694, 50],
        bearing: '-90deg',
        size: {
          width: '180px',
          height: '260px',
        },
        layers: [
          {
            name: 'Floor map',
            urlTemplate:
              'https://appcenter-missions-dev.s3.ap-southeast-1.amazonaws.com/blk-resorts-world-sentosa/rws_internal_inspection_11042024-festive_walk_-_escalator_-_no2_ZuQyrmZX9vSW/floorplan/elevation_diagram.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAYPUGVDNQLX6SNJNQ%2F20240819%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20240819T085854Z&X-Amz-Expires=28000&X-Amz-Signature=abb98a03b247625ac4cc251e5aab6a87989ae548914535185aeffff5e1258f21&X-Amz-SignedHeaders=host',
          },
        ],
      },
    ],
    [
      VirtualTourPlugin,
      {
        positionMode: 'manual',
      },
    ],
  ];

  const syncViewers = (sourceViewer: Viewer | null, targetViewer: Viewer | null) => {
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
        plugins: plugins,
        zoomSpeed: 50,
      });
      // const planPlugin = viewer.getPlugin(PlanPlugin);
      const virtualTour: any = viewer.getPlugin(VirtualTourPlugin);
      const nodes = images.map((image, index) => {
        const hotspot = image.customHotspots[0];
        const currentNodeId = `image-${index}`;
        const nextNodeId = index >= images.length - 1 ? `image-0` : `image-${index + 1}`;

        return {
          id: currentNodeId,
          panorama: image.url,
          thumbnail: image.url,
          name: currentNodeId,
          caption: currentNodeId,
          links: [
            {
              nodeId: nextNodeId,
              position: { yaw: hotspot.yaw, pitch: hotspot.pitch },
            },
          ],
        };
      });

      virtualTour.setNodes(nodes);

      // events
      viewer.addEventListener('position-updated', e => {
        syncViewers(viewer1Ref.current, viewer2Ref.current);
      });
      viewer.addEventListener('zoom-updated', e => {
        syncViewers(viewer1Ref.current, viewer2Ref.current);
      });
      // planPlugin.addEventListener('view-changed', e => {
      //   console.log(e);
      // });
      // planPlugin.addEventListener('select-hotspot', ({ hotspotId }) => {
      //   console.log('hotspotId', hotspotId);
      // });

      viewer1Ref.current = viewer;
    }

    return () => {
      if (viewer1Ref.current) {
        console.log('destroy view1');
        viewer1Ref.current.destroy();
      }
    };
  }, [images, locked]);

  // init viewer 2
  useEffect(() => {
    if (isCompare) {
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
        if (viewer2Ref.current?.destroy) {
          console.log('destroy view2');
          viewer2Ref.current.destroy();
        }
      };
    }
  }, [data.url, locked, isCompare]);

  return (
    <div style={{ display: 'flex' }}>
      <div
        ref={container1Ref}
        style={{
          width: isCompare ? '50%' : '100%',
          height: '80vh',
          objectFit: 'contain',
        }}
      />
      <div
        ref={container2Ref}
        style={{ width: isCompare ? '50%' : '0%', height: '80vh', objectFit: 'contain' }}
      />
    </div>
  );
};

export default memo(SyncViewSphere);
