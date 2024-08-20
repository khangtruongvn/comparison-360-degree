import { Viewer } from '@photo-sphere-viewer/core';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import { PlanPlugin } from '@photo-sphere-viewer/plan-plugin';
import { VirtualTourPlugin } from '@photo-sphere-viewer/virtual-tour-plugin';
import { App, Input, Row, Space, Typography } from 'antd';
import { memo, useCallback, useEffect, useRef } from 'react';

const SyncView = ({ data, locked, isCompare, images }) => {
  const { modal } = App.useApp();
  const viewer1Ref = useRef<Viewer | null>(null);
  const viewer2Ref = useRef<Viewer | null>(null);
  const container1Ref = useRef<HTMLDivElement | null>(null);
  const container2Ref = useRef<HTMLDivElement | null>(null);

  const syncViewers = (sourceViewer: Viewer | null, targetViewer: Viewer | null) => {
    if (!locked || !sourceViewer || !targetViewer) return;
    targetViewer.rotate({
      pitch: sourceViewer.getPosition().pitch,
      yaw: sourceViewer.getPosition().yaw,
    });
    targetViewer.zoom(sourceViewer.getZoomLevel());
  };

  const detectInformation = useCallback((images: any[]) => {
    const nodes: any = [];
    const hotspots: any[] = [];
    const defectMarkers: any[] = [];

    const nodeMap = new Map();
    const hotspotMap = new Map();
    const defectMarkerMap = new Map();

    images.forEach((image, index) => {
      const hotspot = image.customHotspots[0];
      const currentNodeId = `node-${index}`;
      const currentHotspotId = `hotspot-${index}`;

      // next
      const nextIndex = index >= images.length - 1 ? 0 : index + 1;
      const nextImage = images[nextIndex];
      const nextHotspot = nextImage.customHotspots[0];
      const nextNodeId = `node-${nextIndex}`;
      const nextNode = {
        nodeId: nextNodeId,
        position: { yaw: nextHotspot.yaw, pitch: nextHotspot.pitch },
        xyz: nextImage.xyz,
      };

      // NODES
      nodeMap.set(currentNodeId, {
        id: currentNodeId,
        panorama: image.url,
        thumbnail: image.url,
        name: currentNodeId,
        caption: currentNodeId,
        links: [nextNode],
        markers: image.defect.map((defect, index) => {
          const currentMarkerId = `${currentNodeId}-defect-marker-${index}`;
          return {
            ...defect,
            id: currentMarkerId,
            position: { yaw: defect.yaw, pitch: defect.pitch },
            image: 'https://photo-sphere-viewer-data.netlify.app/assets/' + 'pictos/pin-blue.png',
            size: { width: 32, height: 32 },
          };
        }),
      });
      // HOTSPOT
      hotspotMap.set(currentHotspotId, {
        id: currentHotspotId,
        coordinates: image.xyz,
        tooltip: `Hotspot ${index}`,
      });
    });

    hotspotMap.forEach(value => {
      hotspots.push(value);
    });
    nodeMap.forEach(value => {
      nodes.push(value);
    });

    return {
      nodeMap,
      hotspotMap,
      nodes,
      hotspots,
    };
  }, []);

  const plugins: any = [
    [
      PlanPlugin,
      {
        position: 'top right',
        coordinates: images[0].xyz,
        bearing: 180,
        layers: [
          {
            name: 'Floor map',
            urlTemplate: '/images/elevation_diagram.jpg',
          },
        ],
        buttons: {
          reset: false,
        },
      },
    ],
    [MarkersPlugin],
    [
      VirtualTourPlugin,
      {
        positionMode: 'manual',
      },
    ],
  ];

  // init viewer 1
  useEffect(() => {
    if (container1Ref.current) {
      const viewer = new Viewer({
        container: container1Ref.current,
        plugins: plugins,
        zoomSpeed: 50,
        panorama: images[0].url,
      });
      const planPlugin: any = viewer.getPlugin(PlanPlugin);
      const virtualTour: any = viewer.getPlugin(VirtualTourPlugin);
      const markersPlugin: any = viewer.getPlugin(MarkersPlugin);

      const { nodeMap, hotspotMap, nodes, hotspots } = detectInformation(images);

      // configs
      virtualTour.setNodes(nodes);
      planPlugin.setHotspots(hotspots);

      // events
      viewer.addEventListener('position-updated', e => {
        syncViewers(viewer1Ref.current, viewer2Ref.current);
      });
      viewer.addEventListener('zoom-updated', e => {
        syncViewers(viewer1Ref.current, viewer2Ref.current);
      });
      viewer.addEventListener('dblclick', e => {
        modal.confirm({
          title: 'Create new defect?',
          content: (
            <Row>
              <Input placeholder="enter anything" />
            </Row>
          ),
        });
      });
      planPlugin.addEventListener('view-changed', e => {
        console.log('e.view', e.view);
      });
      planPlugin.addEventListener('select-hotspot', ({ hotspotId }) => {
        const selectedHotspot = hotspotMap.get(hotspotId);
        console.log('selectedHotspot', selectedHotspot);
      });
      virtualTour.addEventListener('node-changed', ({ node, data }) => {
        if (data.fromLink) {
          planPlugin.setCoordinates(data.fromLink.xyz);
        }
      });
      markersPlugin.addEventListener('select-marker', ({ marker }) => {
        const defect = marker.config;
        modal.info({
          centered: true,
          title: `Defect ${defect.defect_id_elevation}`,
          content: (
            <Row>
              <Space>
                <Typography.Text strong>Defect severity</Typography.Text>
                <Typography.Text>{defect.severity}</Typography.Text>
              </Space>

              <Space>
                <Typography.Text strong>Component</Typography.Text>
                <Typography.Text>{defect.component}</Typography.Text>
              </Space>
            </Row>
          ),
        });
      });

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
          panorama: images[0].url,
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
  }, [images[0].url, locked, isCompare]);

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

export default memo(SyncView);
