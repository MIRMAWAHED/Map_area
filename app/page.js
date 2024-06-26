// import React from 'react'
// import Link from 'next/link'
// const page = () => {
//   return (
//     <div>
//       <Link href ='../pages'>Start</Link>
//     </div>
//   )
// }

// export default page
'use client'
import { useState, useRef, useEffect } from "react";
import dynamic from 'next/dynamic';
import Webcam from 'react-webcam'; // Importing webcam component
// import MapComponent from '../components/MapComponent'; // Assuming MapComponent is a default export
import * as turf from '@turf/turf';
// const Webcam = dynamic(() => import('react-webcam'), { ssr: false });
const MapComponent = dynamic(() => import('../components/MapComponent'), { ssr: false });

const toRadians = (degrees) => degrees * (Math.PI / 180);

// Function to calculate area using Shoelace formula
const calculatePolygonArea = (coordinates) => {
  let area = 0;
  const n = coordinates.length;

  // Iterate through the coordinates to apply the Shoelace formula
  for (let i = 0; i < n; i++) {
    const { lat: lat1, lng: lng1 } = coordinates[i];
    const { lat: lat2, lng: lng2 } = coordinates[(i + 1) % n];

    // Convert latitude and longitude to Cartesian coordinates
    const x1 = toRadians(lng1) * Math.cos(toRadians(lat1));
    const y1 = toRadians(lat1);
    const x2 = toRadians(lng2) * Math.cos(toRadians(lat2));
    const y2 = toRadians(lat2);

    area += x1 * y2 - x2 * y1;
  }

  return Math.abs(area / 2);
};

export default function Home() {
  const [data, setData] = useState([]); // State to hold captured images with coordinates
  const [data2, setData2] = useState([
    { lat: 17.4178, lng: 78.389, timeStamp: 1718853667 },
    { lat: 17.42898430455179, lng: 78.37815482814811, timeStamp: 1718543667 },
    { lat: 17.43217649325462, lng: 78.38018027061305, timeStamp: 1718543667 },
    { lat: 17.4205, lng: 78.399, timeStamp: 1718543667 }
  ]);
  const webcamRef = useRef(null); // Reference to access webcam component methods
  const [capturedImage, setCapturedImage] = useState([]); // State to hold captured images
  const [state, setState] = useState(true); // State to control webcam visibility
  const [show, setShow] = useState(false); // State to control showing map
  const [cameraFacingMode, setCameraFacingMode] = useState('user'); // State to control camera facing mode ('user' for front, 'environment' for back)
  const [capturePointIndex, setCapturePointIndex] = useState(0); // Index to track which capture point is active
  const capturePointNames = ['1', '2', '3', '4', '5', '6', '7', '8']; // Capture point names
  const [area, setArea] = useState(null)
  // Effect to toggle camera when cameraFacingMode changes
  useEffect(() => {
    if (data.length > 2) {
      const coordinates = data.map(({ lat, lng }) => [lng, lat]);
      coordinates.push(coordinates[0]); // Closing the polygon by repeating the first coordinate at the end

      const polygon = turf.polygon([coordinates]);
      const calculatedArea = turf.area(polygon);

      setArea(calculatedArea);
    }
  }, [data]);
  // useEffect(() => {
  //   if (webcamRef.current) {
  //     const switchCamera = async () => {
  //       const constraints = {
  //         video: {
  //           facingMode: cameraFacingMode
  //         }
  //       };

  //       const stream = await navigator.mediaDevices.getUserMedia(constraints);

  //       const videoTrack = stream.getVideoTracks()[0];
  //       const videoStream = new MediaStream([videoTrack]);

  //       webcamRef.current.video.srcObject = videoStream;
  //       webcamRef.current.video.play();
  //     };

  //     switchCamera();
  //   }
  // }, [cameraFacingMode]);
  useEffect(() => {
    if (webcamRef.current) {
      const switchCamera = async () => {
        const constraints = {
          video: {
            facingMode: cameraFacingMode
          }
        };

        try {
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          const videoTrack = stream.getVideoTracks()[0];
          const videoStream = new MediaStream([videoTrack]);

          const videoElement = webcamRef.current.video;

          videoElement.srcObject = videoStream;
          videoElement.onloadedmetadata = () => {
            videoElement.play().catch((error) => {
              console.error('Error playing video:', error);
            });
          };
        } catch (error) {
          console.error('Error switching camera:', error);
        }
      };

      switchCamera();
    }
  }, [cameraFacingMode]);
  const onUserMediaError = (error) => {
    console.error('Error accessing user media:', error);
    // Handle the error as needed, e.g., show an error message to the user
  };

  // Function to capture an image from webcam
  const capture = async () => {
    // Retrieve geolocation coordinates
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const imageSrc = webcamRef.current.getScreenshot();

        // Update captured images and their coordinates
        setCapturedImage(prevCapturedImages => [...prevCapturedImages, imageSrc]);
        setData(prevData => [
          ...prevData,
          { lat: latitude, lng: longitude }
        ]);

        // Move to next capture point
        if (capturePointIndex < capturePointNames.length - 1) {
          setCapturePointIndex(prevIndex => prevIndex + 1);
        } else {
          setState(false); // Disable webcam after capturing all points
        }
      },
      (error) => {
        console.error('Error getting geolocation:', error);
        // Handle error getting geolocation
      }
    );
  };

  // Function to toggle between front and back cameras
  const toggleCamera = () => {
    setCameraFacingMode(prevMode => prevMode === 'user' ? 'environment' : 'user');
  };
  const convertToSquareFeet = (squareMeters) => {
    return squareMeters * 10.764;
  };

  return (
    <main style={{ height: '100vh', width: '100%' }}>
      {data.length > 0 && show && (
        <div className="">
          <MapComponent data={data} capturedImage={capturedImage} />
        </div>
      )}
      {area !== null ? (<div className="px-3">
        <p>Area: {area.toFixed(2)} square meters</p>
        <p>Area: {convertToSquareFeet(area).toFixed(2)} square feet</p>
      </div>) : null}
      {data.length > 0 &&          (<div className=" w-screen flex justify-center"> <button onClick={() => setShow(true)} className=" bg-blue-400 rounded-lg p-4 m-2">Show Points</button></div>)
    }
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
        {state ?
          <>
            <Webcam
              onUserMediaError = {onUserMediaError}

              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={640}
              height={480}
              style={{ marginBottom: '20px' }}
            />
            {/* <span>Capture the {capturePointNames[capturePointIndex]}</span> */}
            <button className=" bg-blue-400 rounded-lg p-4 m-2" onClick={capture}>Capture Image {data.length + 1}</button>
            <button className=" bg-blue-400 rounded-lg p-4 m-2" onClick={toggleCamera}>Switch Camera</button>
          </> :
          null}
        <div className="grid grid-cols-2 gap-3">
          {capturedImage.map((data, index) => (
            <div key={index} style={{ marginTop: '20px' }}>
              <img src={data} alt={`Captured ${index}`} style={{ maxWidth: '100%', height: 'auto' }} />
            </div>
          ))}
        </div>
      </div>

    </main>
  );
}
