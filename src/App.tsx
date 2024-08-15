import '@photo-sphere-viewer/markers-plugin/index.css';
import './App.css';
import SyncViewSphere from './SyncViewReact360';

const DUMMY_DATA = {
  url: '',
  thumbnail: '',
  image_name: 'rws_II-festive_walk_escalator_no2_0000.jpg',
  camera_model: 'Non-drone',
  exif_image_width: 6144,
  exif_image_height: 3072,
  xyz: [-0.016882436566339906, 0.003362761535854401, 0.0033461152103873293],
  quats: [0.000474272227, -0.00829381263, 0.00156226332, 0.999964273],
  hfov: 360,
  datetime: 'Thu Jan 01 1970 00:00:00  GMT+0000 (Coordinated Universal Time)',
  x: 848.711852006689,
  y: 855.180172413793,
  defect: [],
  customHotspots: [
    {
      pitch: 100,
      yaw: 100,
      transition: 'rws_II-festive_walk_escalator_no2_0064',
      type: 'custom',
      icon: '/images/icons/exist.svg',
    },
    {
      pitch: -53.29305528794916,
      yaw: -14.889460147824451,
      transition: 'rws_II-festive_walk_escalator_no2_0000',
      type: 'custom',
      icon: '/images/icons/exist-back.svg',
    },
  ],
};

function App() {
  const currentScence = DUMMY_DATA;

  return <SyncViewSphere data={currentScence} />;
}

export default App;
