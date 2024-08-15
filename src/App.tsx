import '@photo-sphere-viewer/markers-plugin/index.css';
import './App.css';
import SyncViewSphere from './SyncViewReact360';

const DUMMY_DATA = {
  url: 'https://appcenter-missions-prod.s3.ap-southeast-1.amazonaws.com/blk-resorts-world-sentosa/rws_internal_inspection_11042024-festive_walk_-_escalator_-_no2_1DQYluEN5jgX2g/rws_II-festive_walk_escalator_no2/app_fi/360/rws_II-festive_walk_escalator_no2_0000.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAYPUGVDNQLX6SNJNQ%2F20240815%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20240815T070435Z&X-Amz-Expires=28000&X-Amz-Signature=04578223e1715431d593687c4f7a884c336faab030f180d8cfdf5197c54a623d&X-Amz-SignedHeaders=host',
  thumbnail:
    's3://appcenter-missions-prod/blk-resorts-world-sentosa/rws_internal_inspection_11042024-festive_walk_-_escalator_-_no2_1DQYluEN5jgX2g/rws_II-festive_walk_escalator_no2/app_fi/thumbnails/rws_II-festive_walk_escalator_no2_0000.jpg',
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
