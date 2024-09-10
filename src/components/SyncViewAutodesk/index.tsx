/* global Autodesk, THREE */
import { useEffect, useRef } from 'react';

const SyncViewAutodesk = () => {
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    const { Autodesk }: any = window;
    // const options = {
    //   env: 'AutodeskProduction2',
    //   api: 'streamingV2', // for models uploaded to EMEA change this option to 'streamingV2_EU'
    //   getAccessToken: function (onTokenReady) {
    //     const token = 'YOUR_ACCESS_TOKEN';
    //     const timeInSeconds = 3600; // Use value provided by APS Authentication (OAuth) API
    //     onTokenReady(token, timeInSeconds);
    //   },
    // };

    // Autodesk.Viewing.Initializer(options, function () {
    //   var htmlDiv = document.getElementById('forgeViewer');
    //   viewerRef.current = new Autodesk.Viewing.GuiViewer3D(htmlDiv);
    //   var startedCode = viewerRef.current.start();
    //   if (startedCode > 0) {
    //     console.error('Failed to create a Viewer: WebGL not supported.');
    //     return;
    //   }

    //   console.log('Initialization complete, loading a model next...');
    // });
  }, []);

  return <div></div>;
};

export default SyncViewAutodesk;
