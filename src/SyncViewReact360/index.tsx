import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import { useRef } from 'react';
import { ReactPhotoSphereViewer } from 'react-photo-sphere-viewer';

const SyncViewSphere = ({ data }) => {
  const viewer1Ref = useRef<any>(null);
  const viewer2Ref = useRef<any>(null);

  function syncViewers(sourceViewer, targetViewer) {
    targetViewer.rotate({
      pitch: sourceViewer.getPosition().pitch,
      yaw: sourceViewer.getPosition().yaw,
    });
    targetViewer.zoom(sourceViewer.getZoomLevel());
  }

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

  return (
    <div style={{ display: 'flex' }}>
      <ReactPhotoSphereViewer
        defaultZoomLvl={0}
        zoomSpeed={50}
        ref={viewer1Ref}
        src={data.url}
        height={'100vh'}
        width={'50%'}
        plugins={plugins}
        onPositionChange={() => syncViewers(viewer1Ref.current, viewer2Ref.current)}
        onZoomChange={() => syncViewers(viewer1Ref.current, viewer2Ref.current)}
      ></ReactPhotoSphereViewer>
      <ReactPhotoSphereViewer
        defaultZoomLvl={0}
        zoomSpeed={50}
        ref={viewer2Ref}
        src={data.url}
        height={'100vh'}
        width={'50%'}
        plugins={plugins}
        onPositionChange={() => syncViewers(viewer2Ref.current, viewer1Ref.current)}
        onZoomChange={() => syncViewers(viewer2Ref.current, viewer1Ref.current)}
      ></ReactPhotoSphereViewer>
    </div>
  );
};

export default SyncViewSphere;
