import '@photo-sphere-viewer/core/index.css';
import '@photo-sphere-viewer/markers-plugin/index.css';
import '@photo-sphere-viewer/plan-plugin/index.css';
import '@photo-sphere-viewer/virtual-tour-plugin/index.css';
import 'leaflet/dist/leaflet.css';
import './App.css';
// import SyncViewPannellum from './SyncViewPannellum';

import SyncViewSphere from './SyncViewPhotoPhereViewer';
import { DUMMY_DATA } from './constants';

function App() {
  return <SyncViewSphere images={DUMMY_DATA.images} />;
}

export default App;
