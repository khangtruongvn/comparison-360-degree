import { Pannellum } from 'pannellum-react';
import { useRef } from 'react';

const SyncViewPannellum = ({ data }) => {
  const viewer1Ref = useRef<any>(null);
  const viewer2Ref = useRef<any>(null);

  const handleOnRender = () => {
    if (!viewer1Ref?.current || !viewer2Ref.current) return;
    const viewer1 = viewer1Ref?.current.getViewer();
    const viewer2 = viewer2Ref?.current.getViewer();

    const pitch = viewer1.getPitch();
    const yaw = viewer1.getYaw();
    const hfov = viewer1.getHfov();

    viewer2.setPitch(pitch).setYaw(yaw).setHfov(hfov);
  };

  return (
    <div className="App">
      <div style={{ display: 'flex', height: 1000 }}>
        <div style={{ width: '50%', height: '100%' }}>
          <Pannellum
            height="100%"
            ref={viewer1Ref}
            image={data?.url}
            autoLoad
            orientationOnByDefault={true}
            draggable
            keyboardZoom
            mouseZoom
            showControls
            showFullscreenCtrl={false}
            showZoomCtrl
            hotspotDebug
            onRender={handleOnRender}
          >
            {data.customHotspots.map((hotSpot, index) => (
              <Pannellum.Hotspot
                key={index}
                type={hotSpot.type}
                pitch={hotSpot.pitch}
                yaw={hotSpot.yaw}
              />
            ))}
          </Pannellum>
        </div>
        <div style={{ width: '50%' }}>
          <Pannellum
            height="100%"
            ref={viewer2Ref}
            image={data?.url}
            autoLoad
            orientationOnByDefault={true}
            draggable
            keyboardZoom
            mouseZoom
            showControls
            showFullscreenCtrl={false}
            showZoomCtrl
            hotspotDebug
          >
            {data.customHotspots.map((hotSpot, index) => (
              <Pannellum.Hotspot
                key={index}
                type={hotSpot.type}
                pitch={hotSpot.pitch}
                yaw={hotSpot.yaw}
              />
            ))}
          </Pannellum>
        </div>
      </div>
    </div>
  );
};

function CustomHotSpot({ icon }) {
  return <div>{icon && <img className="image" width="50" height="50" src={icon} alt="" />}</div>;
}

export default SyncViewPannellum;
