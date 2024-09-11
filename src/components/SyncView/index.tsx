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

const DEFAULT_DATE = '2024-09-08';

const SyncView = ({ locked, isCompare, data, toggleLock }) => {
  const { modal } = App.useApp();
  const [open, setOpen] = useState<boolean>(false);
  const viewer1Ref = useRef<Viewer | null>(null);
  const viewer2Ref = useRef<Viewer | null>(null);
  const container1Ref = useRef<HTMLDivElement | null>(null);
  const container2Ref = useRef<HTMLDivElement | null>(null);

  const [currentDateViewer1, setCurrentDateViewer1] = useState(DEFAULT_DATE);
  const [currentDateViewer2, setCurrentDateViewer2] = useState(DEFAULT_DATE);
  const [newMarkerId, setNewMarkerId] = useState<string>('');

  const { images: viewer1Images } = data[currentDateViewer1];
  const {
    images: viewer2Images,
    floorPlanImageWidth: floorPlanImageWidth2,
    floorPlanImageHeight: floorPlanImageHeight2,
  } = data[currentDateViewer2];

  const floorPlanImage1 = data[currentDateViewer1].floorPlanImage;
  const floorPlanImage2 = data[currentDateViewer2].floorPlanImage;
  const floorPlanImageWidth1 = data[currentDateViewer1].floorPlanImageWidth / 2;
  const floorPlanImageHeight1 = data[currentDateViewer1].floorPlanImageHeight / 2;

  const syncViewers = (sourceViewer: Viewer | null, targetViewer: Viewer | null) => {
    if (!locked || !sourceViewer || !targetViewer) return;
    targetViewer.rotate({
      pitch: sourceViewer.getPosition().pitch,
      yaw: sourceViewer.getPosition().yaw,
    });
    targetViewer.zoom(sourceViewer.getZoomLevel());
  };

  const detectInformation = useCallback(
    (images: any[], height: number) => {
      const nodes: any = [];
      const hotspots: any = []; // hotspots from all images
      const nodeMap = new Map();
      const hotspotsMap = new Map();

      images.forEach((image, imageIndex) => {
        const currentNodeId = `node-${imageIndex}`;
        hotspotsMap.set(currentNodeId, {
          color: '#0587ff47',
          id: currentNodeId,
          coordinates: [image.x / 2, height - image.y / 2], // refactor code with '/2'
        });
        image.defect.forEach((defect, index) => {
          const currentHotspotId = `${currentNodeId}-hotspot-${index}`;
          hotspotsMap.set(currentHotspotId, {
            id: currentHotspotId,
            coordinates: [defect.x_loc / 2, height - defect.y_loc / 2],
            color: defect.color,
            size: 22,
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
    },
    [floorPlanImageHeight1]
  );

  const plugins: any = [
    [
      PlanPlugin,
      {
        position: 'top right',
        buttons: {
          reset: false,
        },
        size: {
          height: floorPlanImageHeight1 + 'px',
          width: floorPlanImageWidth1 + 'px',
        },
        configureLeaflet(map) {
          const imageBounds = [
            [0, 0],
            [floorPlanImageHeight1, floorPlanImageWidth1],
          ];

          map.options.crs = L.CRS.Simple;
          L.imageOverlay(floorPlanImage1, imageBounds).addTo(map);

          map.setMaxZoom(0);
          map.setMinZoom(-1);
          map.fitBounds(imageBounds);
          map.setMaxBounds(imageBounds);
        },
      },
    ],
    [MarkersPlugin],
  ];

  const handleOnOk = (values: any) => {
    try {
      // try {
      //   if (viewer1Ref.current) {
      //     const viewer = viewer1Ref.current;
      //     const markersPlugin: any = viewer.getPlugin(MarkersPlugin);
      //     markersPlugin.removeMarker(newMarkerId);
      //   }
      // } catch (error: any) {
      //   console.log(error);
      // }

      // try {
      //   if (viewer2Ref.current) {
      //     const viewer = viewer2Ref.current;
      //     const markersPlugin: any = viewer.getPlugin(MarkersPlugin);
      //     markersPlugin.removeMarker(newMarkerId);
      //   }
      // } catch (error: any) {
      //   console.log(error);
      // }

      console.log(values);
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

  // init viewer 1
  useEffect(() => {
    if (container1Ref.current) {
      const viewer = new Viewer({
        container: container1Ref.current,
        panorama: viewer1Images[0].url,
        plugins: plugins,
        zoomSpeed: 50,
        navbar: ['zoom'],
      });
      const { nodeMap, hotspots, hotspotsMap } = detectInformation(
        viewer1Images,
        floorPlanImageHeight1
      );
      const markersPlugin: any = viewer.getPlugin(MarkersPlugin);
      const planPlugin: any = viewer.getPlugin(PlanPlugin);

      // first load viewer
      viewer.zoom(0);
      const currentNode = nodeMap.get(`node-${0}`);
      currentNode.markers.forEach(marker => {
        markersPlugin.addMarker(marker);
      });
      planPlugin.setHotspots(hotspots);
      planPlugin.setCoordinates([currentNode.position.x, currentNode.position.y]);

      // events
      viewer.addEventListener('position-updated', e => {
        syncViewers(viewer1Ref.current, viewer2Ref.current);
      });
      viewer.addEventListener('zoom-updated', e => {
        syncViewers(viewer1Ref.current, viewer2Ref.current);
      });
      viewer.addEventListener('dblclick', ({ data }) => {
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
        const selectedHotspot = hotspotsMap.get(hotspotId);
        console.log('selectedHotspot', selectedHotspot);
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
              const nextNode = nodeMap.get(`node-${marker.config.imageIndex + 1}`);
              markersPlugin.clearMarkers();
              viewer.setPanorama(nextNode.panorama);
              nextNode.markers.forEach(marker => {
                markersPlugin.addMarker(marker);
              });
              planPlugin.setCoordinates([nextNode.position.x, nextNode.position.y]);
              return;
            case 'prev':
              if (isLockPrev) return;
              const prevNode = nodeMap.get(`node-${marker.config.imageIndex - 1}`);
              markersPlugin.clearMarkers();
              viewer.setPanorama(prevNode.panorama);
              prevNode.markers.forEach(marker => {
                markersPlugin.addMarker(marker);
              });
              planPlugin.setCoordinates([prevNode.position.x, prevNode.position.y]);
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

      viewer1Ref.current = viewer;
    }

    return () => {
      if (viewer1Ref.current) {
        console.log('destroy view1');
        viewer1Ref.current.destroy();
      }
    };
  }, [viewer1Images, locked]);

  // init viewer 2
  useEffect(() => {
    if (isCompare) {
      // TODO: copy functions and configs from viewer 1 to viewer 2
      if (container2Ref.current) {
        const viewer = new Viewer({
          container: container2Ref.current,
          panorama: viewer2Images[0].url,
          plugins: plugins,
          zoomSpeed: 50,
        });
        const { nodeMap, hotspots } = detectInformation(viewer2Images, floorPlanImageHeight2);
        const markersPlugin: any = viewer.getPlugin(MarkersPlugin);
        const planPlugin: any = viewer.getPlugin(PlanPlugin);
        const map = planPlugin.getLeaflet();
        // configs
        viewer.zoom(0);
        const currentNode = nodeMap.get(`node-${0}`);
        currentNode.markers.forEach(marker => {
          markersPlugin.addMarker(marker);
        });
        planPlugin.setHotspots(hotspots);
        planPlugin.setCoordinates([currentNode.position.x, currentNode.position.y]);

        viewer.addEventListener('position-updated', e => {
          syncViewers(viewer2Ref.current, viewer1Ref.current);
        });
        viewer.addEventListener('zoom-updated', e => {
          syncViewers(viewer2Ref.current, viewer1Ref.current);
        });
        viewer.addEventListener('dblclick', ({ data }) => {
          const newDefectId = `new-defect-${Date.now()}`;
          markersPlugin.addMarker({
            id: newDefectId,
            position: { yaw: data.yaw, pitch: data.pitch },
            image: 'https://photo-sphere-viewer-data.netlify.app/assets/pictos/pin-blue.png',
            size: { width: 38, height: 38 },
          });

          try {
            if (viewer1Ref.current) {
              const markersPlugin2: any = viewer1Ref.current?.getPlugin(MarkersPlugin);
              markersPlugin2.addMarker({
                id: newDefectId,
                position: { yaw: data.yaw, pitch: data.pitch },
                image: 'https://photo-sphere-viewer-data.netlify.app/assets/pictos/pin-blue.png',
                size: { width: 38, height: 38 },
              });
            }
          } catch (error) {
            console.log(error);
          }

          setOpen(true);
          setNewMarkerId(newDefectId);
        });

        markersPlugin.addEventListener('select-marker', e => {
          const { marker } = e;
          const defect = marker.config.data || {};
          if (marker.config.type === 'navigate') {
            const isLockNext = marker.config.imageIndex === viewer2Images.length - 1;
            const isLockPrev = marker.config.imageIndex === 0;
            switch (marker.config.transition) {
              case 'next':
                if (isLockNext) return;
                const nextNode = nodeMap.get(`node-${marker.config.imageIndex + 1}`);
                markersPlugin.clearMarkers();
                viewer.setPanorama(nextNode.panorama);
                nextNode.markers.forEach(marker => {
                  markersPlugin.addMarker(marker);
                });
                return;
              case 'prev':
                if (isLockPrev) return;
                const prevNode = nodeMap.get(`node-${marker.config.imageIndex - 1}`);
                markersPlugin.clearMarkers();
                viewer.setPanorama(prevNode.panorama);
                prevNode.markers.forEach(marker => {
                  markersPlugin.addMarker(marker);
                });
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
