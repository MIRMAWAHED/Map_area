// 'use client'
// import { useState, useRef, useEffect } from "react";
// import dynamic from 'next/dynamic';
// import Webcam from 'react-webcam'; // Importing webcam component
// // import MapComponent from '../components/MapComponent'; // Assuming MapComponent is a default export
// import { useGeolocated } from 'react-geolocated';
// import * as turf from '@turf/turf';
// import Link from "next/link";
// // const Webcam = dynamic(() => import('react-webcam'), { ssr: false });
// const MapComponent = dynamic(() => import('../../components/MapComponent'), { ssr: false });

// export default function Home() {
//   const {
//     coords,
//     isGeolocationAvailable,
//     isGeolocationEnabled,
//   } = useGeolocated({
//     positionOptions: {
//       enableHighAccuracy: true,
//     },
//     userDecisionTimeout: 5000,
//     maximumAge: 0

//   });

  

//   return (
//     <main style={{ height: '100vh', width: '100%' }}>
//       {data.length > 0 && show && (
//         <div className="">
//           <MapComponent data={data}/>
//         </div>
//       )}
//       <button>Start</button>
//       <Link href={'/'}>back</Link>
//     </main>
//   );
// }
'use client'
import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import { useGeolocated } from 'react-geolocated';
import Link from "next/link";

const MapComponent = dynamic(() => import('../../components/MapComponent'), { ssr: false });

export default function Home() {
  const {
    coords,
    isGeolocationAvailable,
    isGeolocationEnabled,
  } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
    },
    userDecisionTimeout: 10000,
    maximumAge: 0
  });

  const [tracking, setTracking] = useState(false);
  const [data, setData] = useState([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    let watchId;
    if (tracking) {
      if (isGeolocationEnabled && coords) {
        const newLocation = { lat: coords.latitude, lng: coords.longitude };
      
        setData([ newLocation]);
        setShow(true);
      }
      
      watchId = navigator.geolocation.watchPosition(
        position => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setData([newLocation]);
        },
        error => console.error(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [tracking, isGeolocationEnabled, coords]);
// useEffect(() => {
//     let watchId;

//     if (tracking) {
//       if (navigator.geolocation) {
//         watchId = navigator.geolocation.watchPosition(
//           position => {
//             const { latitude, longitude, accuracy } = position.coords;
//             console.log(`Position received: Lat: ${latitude}, Lon: ${longitude}, Accuracy: ${accuracy}m`);

//             // Filter out less accurate readings
//             if (accuracy < 10) { // Adjust the threshold as needed
//               const newLocation = { lat: latitude, lng: longitude };
//               setData([newLocation]);
//             }
//           },
//           error => console.error(error),
//           {
//             enableHighAccuracy: true,
//             timeout: 3000, // Increase the timeout for better accuracy
//             maximumAge: 0
//           }
//         );

//         setShow(true);
//       } else {
//         console.error('Geolocation is not supported by this browser.');
//       }
//     }

//     return () => {
//       if (watchId) {
//         navigator.geolocation.clearWatch(watchId);
//       }
//     };
//   }, [tracking]);
  const handleStartTracking = () => {
    setTracking(true);
  };

  return (
    <main style={{ height: '100vh', width: '100%' }}>
      {data.length > 0 && show && (
        <div>
          <MapComponent data={data}/>
        </div>
      )}
      <button onClick={handleStartTracking} className=" m-10">Start</button>
      <Link href={'/'}>back</Link>
    </main>
  );
}
