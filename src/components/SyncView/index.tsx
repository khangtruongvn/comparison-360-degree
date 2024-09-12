import { Viewer } from '@photo-sphere-viewer/core';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import { PlanPlugin } from '@photo-sphere-viewer/plan-plugin';
import { App, DatePicker } from 'antd';
import L from 'leaflet';
import { useCallback, useEffect, useRef, useState } from 'react';
import CreateDefectForm from '../CreateDefectForm';
import DefectDetail from '../DefectDetail';

const getDefectIcon = (severity: string) => {
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
};

const getPlugins = (planImage: IPlanImage): any => {
  return [
    [
      PlanPlugin,
      {
        position: 'top right',
        buttons: {
          reset: false,
          close: false,
        },
        size: {
          height: planImage.miniHeight + 'px',
          width: planImage.miniWidth + 'px',
        },
        defaultZoom: 0,
        configureLeaflet(map) {
          const imageBounds = [
            [0, 0],
            [planImage.miniHeight, planImage.miniWidth],
          ];

          map.options.crs = L.CRS.Simple;
          L.imageOverlay(planImage.imageSource, imageBounds).addTo(map);

          map.setMaxZoom(2);
          map.setMinZoom(-1);
          map.fitBounds(imageBounds);
          map.setMaxBounds(imageBounds);
        },
      },
    ],
    [MarkersPlugin],
  ];
};

const DEFAULT_DATE = '2024-09-09';

interface IPlanImage {
  width: number;
  height: number;
  miniWidth: number;
  miniHeight: number;
  imageSource: string;
}

const SyncView = ({ locked, isCompare, data, toggleLock }) => {
  const { modal } = App.useApp();
  const [open, setOpen] = useState<boolean>(false);
  const viewer1Ref = useRef<Viewer | null>(null);
  const viewer2Ref = useRef<Viewer | null>(null);
  const container1Ref = useRef<HTMLDivElement | null>(null);
  const container2Ref = useRef<HTMLDivElement | null>(null);

  const [newMarkerId, setNewMarkerId] = useState<string>('');
  const [currentIndexNodeViewer1, setCurrentIndexNodeViewer1] = useState<number>(0);
  const [currentIndexNodeViewer2, setCurrentIndexNodeViewer2] = useState<number>(0);
  const [currentDateViewer1, setCurrentDateViewer1] = useState(DEFAULT_DATE);
  const [currentDateViewer2, setCurrentDateViewer2] = useState(DEFAULT_DATE);

  const { images: viewer1Images } = data[currentDateViewer1];
  const planImageViewer1: IPlanImage = {
    imageSource: data[currentDateViewer1].floorPlanImage,
    width: data[currentDateViewer1].floorPlanImageWidth,
    height: data[currentDateViewer1].floorPlanImageHeight,
    miniWidth: data[currentDateViewer1].floorPlanImageWidth / 2,
    miniHeight: data[currentDateViewer1].floorPlanImageHeight / 2,
  };

  const { images: viewer2Images } = data[currentDateViewer2];
  const planImageViewer2: IPlanImage = {
    imageSource: data[currentDateViewer2].floorPlanImage,
    width: data[currentDateViewer2].floorPlanImageWidth,
    height: data[currentDateViewer2].floorPlanImageHeight,
    miniWidth: data[currentDateViewer2].floorPlanImageWidth / 2,
    miniHeight: data[currentDateViewer2].floorPlanImageHeight / 2,
  };

  const handleOnOk = (values: any) => {
    try {
      const currentNodeId = `node-${currentIndexNodeViewer1}`;
      const { nodeMap, hotspots } = detectInformation(viewer1Images, planImageViewer1.miniHeight);
      const currentNode = nodeMap.get(currentNodeId);
      const randomPositionForPlan = {
        x: currentNode.position.x + Math.floor(Math.random() * 60 - 30),
        y: currentNode.position.y + Math.floor(Math.random() * 60 - 30),
      };
      const image = viewer1Images[currentIndexNodeViewer1];
      try {
        const planPlugin: any = viewer1Ref.current?.getPlugin(PlanPlugin);
        planPlugin.setHotspots(
          hotspots.concat({
            color: 'blue',
            id: `${currentNodeId}-new-hotspot-${Date.now()}`,
            nodeId: currentNodeId,
            coordinates: [randomPositionForPlan.x, randomPositionForPlan.y],
            positionImage: { x: image.x / 2, y: planImageViewer1.height - image.y / 2 },
          })
        );
      } catch (error) {
        console.log('error', error);
      }

      try {
        const planPlugin: any = viewer2Ref.current?.getPlugin(PlanPlugin);
        const { hotspots } = detectInformation(viewer2Images, planImageViewer2.miniHeight);

        planPlugin.setHotspots(
          hotspots.concat({
            color: 'blue',
            id: `${currentNodeId}-new-hotspot-${Date.now()}`,
            nodeId: currentNodeId,
            coordinates: [randomPositionForPlan.x, randomPositionForPlan.y],
            positionImage: { x: image.x / 2, y: planImageViewer2.height - image.y / 2 },
          })
        );
      } catch (error) {
        console.log('error', error);
      }

      setOpen(false);
      setNewMarkerId('');
    } catch (error) {
      console.log('error', error);
    }
  };

  const handleOnCancel = () => {
    try {
      try {
        if (viewer1Ref.current) {
          const viewer = viewer1Ref.current;
          const markersPlugin: any = viewer.getPlugin(MarkersPlugin);
          markersPlugin.removeMarker(newMarkerId);
        }
      } catch (error: any) {
        console.log(error);
      }

      try {
        if (viewer2Ref.current) {
          const viewer = viewer2Ref.current;
          const markersPlugin: any = viewer.getPlugin(MarkersPlugin);
          markersPlugin.removeMarker(newMarkerId);
        }
      } catch (error: any) {
        console.log(error);
      }
      setOpen(false);
      setNewMarkerId('');
    } catch (error) {
      console.log(error);
    }
  };

  const syncViewers = (sourceViewer: Viewer | null, targetViewer: Viewer | null) => {
    if (!locked || !sourceViewer || !targetViewer) return;
    try {
      targetViewer.rotate({
        pitch: sourceViewer.getPosition().pitch,
        yaw: sourceViewer.getPosition().yaw,
      });
      targetViewer.zoom(sourceViewer.getZoomLevel());
    } catch (error) {
      console.log('error', error);
    }
  };

  const detectInformation = useCallback((images: any[], height: number) => {
    const nodes: any = [];
    const hotspots: any = [];
    const nodeMap = new Map();
    const hotspotsMap = new Map();

    images.forEach((image, imageIndex) => {
      const currentNodeId = `node-${imageIndex}`;

      // HOTSPOTS
      hotspotsMap.set(currentNodeId, {
        color: '#0587ff47',
        id: currentNodeId,
        nodeId: currentNodeId,
        coordinates: [image.x / 2, height - image.y / 2],
        positionImage: { x: image.x / 2, y: height - image.y / 2 },
      });
      image.defect.forEach((defect, index) => {
        const currentHotspotId = `${currentNodeId}-hotspot-${index}`;
        hotspotsMap.set(currentHotspotId, {
          id: currentHotspotId,
          nodeId: currentNodeId,
          coordinates: [defect.x_loc / 2, height - defect.y_loc / 2],
          color: defect.color,
          size: 22,
          positionImage: { x: image.x / 2, y: height - image.y / 2 },
        });
      });
      // NODES
      nodeMap.set(currentNodeId, {
        id: currentNodeId,
        panorama: image.url,
        thumbnail: image.url,
        name: currentNodeId,
        caption: image.image_name,
        markers: [
          ...image.defect.map((defect, index) => {
            const currentMarkerId = `${currentNodeId}-defect-marker-${index}`;
            return {
              data: defect,
              id: currentMarkerId,
              position: { yaw: defect.yaw + 'deg', pitch: defect.pitch + 'deg' },
              image: getDefectIcon(defect.severity),
              size: { width: 48, height: 48 },
            };
          }),
          ...image.customHotspots.map((hotspot, index) => {
            const currentHotspotId = `${currentNodeId}-hotspot-marker-${index}`;
            return {
              imageIndex: imageIndex,
              id: currentHotspotId,
              image: hotspot.icon,
              type: 'navigate',
              transition: index === 0 ? 'next' : 'prev',
              position: { yaw: hotspot.yaw + 'deg', pitch: hotspot.pitch + 'deg' },
              size: { width: 48, height: 48 },
            };
          }),
        ],
        position: { x: image.x / 2, y: height - image.y / 2 },
      });
    });

    nodeMap.forEach(value => {
      nodes.push(value);
    });
    hotspotsMap.forEach(value => {
      hotspots.push(value);
    });

    return {
      nodes,
      hotspots,
      nodeMap,
      hotspotsMap,
    };
  }, []);

  const firstLoadViewer = useCallback(
    (viewer: any, images, planImageView: IPlanImage, currentIndexNode: number) => {
      const { nodeMap, hotspots } = detectInformation(images, planImageView.miniHeight);
      const markersPlugin: any = viewer.getPlugin(MarkersPlugin);
      const planPlugin: any = viewer.getPlugin(PlanPlugin);
      viewer.zoom(0);
      const currentNode = nodeMap.get(`node-${currentIndexNode}`);
      console.log(currentNode);
      currentNode.markers.forEach(marker => {
        markersPlugin.addMarker(marker);
      });
      planPlugin.setHotspots(hotspots);
      planPlugin.setCoordinates([currentNode.position.x, currentNode.position.y]);
    },
    []
  );

  const initialEvents = (
    viewer: any,
    images,
    planImageView: IPlanImage,
    positionViewer: number
  ) => {
    const { nodeMap, hotspotsMap } = detectInformation(images, planImageView.miniHeight);
    const markersPlugin: any = viewer.getPlugin(MarkersPlugin);
    const planPlugin: any = viewer.getPlugin(PlanPlugin);
    // events
    viewer.addEventListener('position-updated', e => {
      if (positionViewer === 0) {
        syncViewers(viewer1Ref.current, viewer2Ref.current);
      } else {
        syncViewers(viewer2Ref.current, viewer1Ref.current);
      }
    });
    viewer.addEventListener('zoom-updated', e => {
      if (positionViewer === 0) {
        syncViewers(viewer1Ref.current, viewer2Ref.current);
      } else {
        syncViewers(viewer2Ref.current, viewer1Ref.current);
      }
    });
    viewer.addEventListener('dblclick', e => {
      const { data } = e;
      const newDefectId = `new-defect-${Date.now()}`;
      markersPlugin.addMarker({
        id: newDefectId,
        position: { yaw: data.yaw, pitch: data.pitch },
        image: '/images/icons/new-defect.svg',
        size: { width: 38, height: 38 },
      });

      try {
        if (viewer2Ref.current) {
          const markersPlugin2: any = viewer2Ref.current?.getPlugin(MarkersPlugin);
          markersPlugin2.addMarker({
            id: newDefectId,
            position: { yaw: data.yaw, pitch: data.pitch },
            image: '/images/icons/new-defect.svg',
            size: { width: 38, height: 38 },
          });
        }
      } catch (error) {
        console.log(error);
      }

      setOpen(true);
      setNewMarkerId(newDefectId);
    });

    planPlugin.addEventListener('select-hotspot', ({ hotspotId }) => {
      try {
        const selectedHotspot = hotspotsMap.get(hotspotId);
        const nextNode = nodeMap.get(selectedHotspot.nodeId);
        markersPlugin.clearMarkers();
        viewer.setPanorama(nextNode.panorama);
        nextNode.markers.forEach(marker => {
          markersPlugin.addMarker(marker);
        });
        planPlugin.setCoordinates([
          selectedHotspot.positionImage.x,
          selectedHotspot.positionImage.y,
        ]);
        if (positionViewer === 0) {
          toggleLock(false);
          setCurrentIndexNodeViewer1(selectedHotspot.nodeId.split('-')[1]);
        } else {
          toggleLock(false);
          setCurrentIndexNodeViewer2(selectedHotspot.nodeId.split('-')[1]);
        }
      } catch (error) {
        console.log('error', error);
      }
    });

    markersPlugin.addEventListener('select-marker', e => {
      const { marker } = e;
      const defect = marker.config.data || {};
      if (marker.config.type === 'navigate') {
        const isLockNext = marker.config.imageIndex === viewer1Images.length - 1;
        const isLockPrev = marker.config.imageIndex === 0;
        switch (marker.config.transition) {
          case 'next':
            if (isLockNext) return;
            const nextIndex = marker.config.imageIndex + 1;
            const nextNode = nodeMap.get(`node-${nextIndex}`);
            markersPlugin.clearMarkers();
            viewer.setPanorama(nextNode.panorama);
            nextNode.markers.forEach(marker => {
              markersPlugin.addMarker(marker);
            });
            planPlugin.setCoordinates([nextNode.position.x, nextNode.position.y]);
            if (positionViewer === 0) {
              setCurrentIndexNodeViewer1(nextIndex);
            } else {
              setCurrentIndexNodeViewer2(nextIndex);
            }
            toggleLock(false);
            return;
          case 'prev':
            if (isLockPrev) return;
            const prevIndex = marker.config.imageIndex - 1;
            const prevNode = nodeMap.get(`node-${prevIndex}`);
            markersPlugin.clearMarkers();
            viewer.setPanorama(prevNode.panorama);
            prevNode.markers.forEach(marker => {
              markersPlugin.addMarker(marker);
            });
            planPlugin.setCoordinates([prevNode.position.x, prevNode.position.y]);
            if (positionViewer === 0) {
              setCurrentIndexNodeViewer1(prevIndex);
            } else {
              setCurrentIndexNodeViewer2(prevIndex);
            }
            toggleLock(false);
            return;
        }
      } else {
        modal.info({
          width: 800,
          centered: true,
          title: `Defect ${defect.defect_id_elevation}`,
          content: <DefectDetail defect={defect} />,
        });
      }
    });
  };

  useEffect(() => {
    if (container1Ref.current) {
      const viewer = new Viewer({
        container: container1Ref.current,
        panorama: viewer1Images[currentIndexNodeViewer1].url,
        plugins: getPlugins(planImageViewer1),
        zoomSpeed: 50,
        navbar: ['zoom'],
      });

      firstLoadViewer(viewer, viewer1Images, planImageViewer1, currentIndexNodeViewer1);
      initialEvents(viewer, viewer1Images, planImageViewer1, 0);

      viewer1Ref.current = viewer;
    }

    return () => {
      if (viewer1Ref.current) {
        console.log('destroy view1');
        viewer1Ref.current.destroy();
      }
    };
  }, [viewer1Images, locked]);

  useEffect(() => {
    if (isCompare) {
      if (container2Ref.current) {
        const viewer = new Viewer({
          container: container2Ref.current,
          panorama: viewer2Images[currentIndexNodeViewer2].url,
          plugins: getPlugins(planImageViewer2),
          zoomSpeed: 50,
          navbar: ['zoom'],
        });

        firstLoadViewer(viewer, viewer2Images, planImageViewer2, currentIndexNodeViewer2);
        initialEvents(viewer, viewer2Images, planImageViewer2, 1);
        viewer2Ref.current = viewer;
      }

      return () => {
        if (viewer2Ref.current?.destroy) {
          console.log('destroy view2');
          viewer2Ref.current.destroy();
        }
      };
    }
  }, [viewer2Images, locked, isCompare]);

  return (
    <div style={{ display: 'flex' }}>
      <div
        ref={container1Ref}
        style={{
          position: 'relative',
          width: isCompare ? '50%' : '100%',
          height: '80vh',
          objectFit: 'contain',
        }}
      >
        <DatePicker
          style={{ position: 'absolute', zIndex: 999, bottom: 4, left: '50%' }}
          onChange={(_, dateString) => setCurrentDateViewer1(dateString.toString())}
        />
      </div>
      <div
        ref={container2Ref}
        style={{
          width: isCompare ? '50%' : '0%',
          height: '80vh',
          objectFit: 'contain',
          position: 'relative',
        }}
      >
        <DatePicker
          style={{
            bottom: 4,
            zIndex: 999,
            left: '50%',
            position: 'absolute',
            display: isCompare ? 'block' : 'none',
          }}
          onChange={(_, dateString) => setCurrentDateViewer2(dateString.toString())}
        />
      </div>

      <CreateDefectForm open={open} onOk={handleOnOk} onCancel={handleOnCancel} />
    </div>
  );
};

export default SyncView;
