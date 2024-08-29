import { Viewer } from '@photo-sphere-viewer/core';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import { PlanPlugin } from '@photo-sphere-viewer/plan-plugin';
import { App, Row, Space, Typography } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import CreateDefectForm from '../CreateDefectForm';

const SyncView = ({ locked, isCompare, images }) => {
  const { modal } = App.useApp();
  const viewer1Ref = useRef<Viewer | null>(null);
  const viewer2Ref = useRef<Viewer | null>(null);
  const container1Ref = useRef<HTMLDivElement | null>(null);
  const container2Ref = useRef<HTMLDivElement | null>(null);

  const [currentIndexImage] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);
  const [newMarkerId, setNewMarkerId] = useState<string>('');

  const syncViewers = (sourceViewer: Viewer | null, targetViewer: Viewer | null) => {
    if (!locked || !sourceViewer || !targetViewer) return;
    targetViewer.rotate({
      pitch: sourceViewer.getPosition().pitch,
      yaw: sourceViewer.getPosition().yaw,
    });
    targetViewer.zoom(sourceViewer.getZoomLevel());
  };

  const getDefectIcon = useCallback(severity => {
    switch (severity) {
      case 'Safe':
        return '/images/icons/safe.svg';
      case 'Unsafe':
        return '/images/icons/unsafe.svg';
      case 'Require Repair':
        return '/images/icons/require_repair.svg';
      default:
        return '';
    }
  }, []);

  const detectInformation = useCallback((images: any[]) => {
    const nodes: any = [];
    const hotspots: any[] = [];

    const nodeMap = new Map();
    const hotspotMap = new Map();

    images.forEach((image, index) => {
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
            image: getDefectIcon(defect.severity),
            size: { width: 48, height: 48 },
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
        layers: [
          {
            name: 'Floor map',
            urlTemplate: '/images/floor-4.png',
          },
        ],
        buttons: {
          reset: false,
        },
      },
    ],
    [MarkersPlugin],
  ];

  const handleOnOk = (values: any) => {
    if (!viewer1Ref.current) return;
    const viewer = viewer1Ref.current;
    const markersPlugin: any = viewer.getPlugin(MarkersPlugin);

    console.log(values);
    setOpen(false);
    setNewMarkerId('');
    markersPlugin.removeMarker(newMarkerId);
  };

  const handleOnCancel = () => {
    if (!viewer1Ref.current) return;
    const viewer = viewer1Ref.current;
    const markersPlugin: any = viewer.getPlugin(MarkersPlugin);

    setOpen(false);
    setNewMarkerId('');
    markersPlugin.removeMarker(newMarkerId);
  };

  // init viewer 1
  useEffect(() => {
    if (container1Ref.current) {
      const viewer = new Viewer({
        container: container1Ref.current,
        plugins: plugins,
        zoomSpeed: 50,
        panorama: images[currentIndexImage].url,
      });
      const planPlugin: any = viewer.getPlugin(PlanPlugin);
      const markersPlugin: any = viewer.getPlugin(MarkersPlugin);

      const { hotspotMap, nodeMap } = detectInformation(images);

      // configs
      const currentNode = nodeMap.get(`node-${currentIndexImage}`);
      currentNode.markers.forEach(marker => {
        markersPlugin.addMarker(marker);
      });

      // events
      viewer.addEventListener('position-updated', e => {
        syncViewers(viewer1Ref.current, viewer2Ref.current);
      });
      viewer.addEventListener('zoom-updated', e => {
        syncViewers(viewer1Ref.current, viewer2Ref.current);
      });
      viewer.addEventListener('click', ({ data }) => {
        const newDefectId = `new-defect-${Date.now()}`;
        markersPlugin.addMarker({
          id: newDefectId,
          position: { yaw: data.yaw, pitch: data.pitch },
          image: 'https://photo-sphere-viewer-data.netlify.app/assets/pictos/pin-blue.png',
          size: { width: 38, height: 38 },
        });

        setTimeout(() => {
          setOpen(true);
          setNewMarkerId(newDefectId);
        }, 200);
      });
      planPlugin.addEventListener('view-changed', e => {
        console.log('e.view', e.view);
      });
      planPlugin.addEventListener('select-hotspot', ({ hotspotId }) => {
        const selectedHotspot = hotspotMap.get(hotspotId);
        console.log('selectedHotspot', selectedHotspot);
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
  }, [images, locked, currentIndexImage]);

  // init viewer 2
  useEffect(() => {
    if (isCompare) {
      // TODO: copy functions and configs from viewer 1 to viewer 2
      if (container2Ref.current) {
        const viewer = new Viewer({
          container: container2Ref.current,
          panorama: images[currentIndexImage].url,
          plugins: plugins,
          zoomSpeed: 50,
        });
        const markersPlugin: any = viewer.getPlugin(MarkersPlugin);

        const { nodeMap } = detectInformation(images);

        // configs
        const currentNode = nodeMap.get(`node-${currentIndexImage}`);
        currentNode.markers.forEach(marker => {
          markersPlugin.addMarker(marker);
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
  }, [images, locked, isCompare, currentIndexImage]);

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

      <CreateDefectForm open={open} onOk={handleOnOk} onCancel={handleOnCancel} />
    </div>
  );
};

export default SyncView;
