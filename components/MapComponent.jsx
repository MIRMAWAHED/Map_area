import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState, useRef } from 'react';

// Fix for default marker icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const redDotIcon = L.divIcon({
    className: 'custom-red-dot', // class name for styling in CSS
    iconSize: [10, 10], // size of the icon
    iconAnchor: [5, 5], // point of the icon which will correspond to marker's location
});
const customIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    iconSize: [25, 41], // size of the icon
    iconAnchor: [12, 41], // point of the icon which will correspond to marker's location
    popupAnchor: [1, -34], // point from which the popup should open relative to the iconAnchor
    shadowSize: [41, 41], // size of the shadow
    shadowAnchor: [13, 20], // point of the shadow which will correspond to marker's location
});

const LeafletMap = ({ data }) => {
    const [mapCenter, setMapCenter] = useState([0, 0]);
    const [zoom, setZoom] = useState(13);
    const name = ['1', '2', '3', '4', '5', '6', '7', '8']; // Capture point names

    // const map = useMap();
    const mapRef = useRef(null); // Reference to the MapContainer

    useEffect(() => {

        if (data.length > 0) {
            // Step 1: Convert lat/lon to radians
            const radians = data.map(item => ({
                lat: (item.lat * Math.PI) / 180,
                lng: (item.lng * Math.PI) / 180
            }));

            // Step 2: Convert to Cartesian coordinates
            const cartesian = radians.map(({ lat, lng }) => ({
                x: Math.cos(lat) * Math.cos(lng),
                y: Math.cos(lat) * Math.sin(lng),
                z: Math.sin(lat)
            }));

            // Step 3: Compute average Cartesian coordinates
            const avgCartesian = cartesian.reduce((acc, { x, y, z }) => {
                acc.x += x;
                acc.y += y;
                acc.z += z;
                return acc;
            }, { x: 0, y: 0, z: 0 });

            avgCartesian.x /= cartesian.length;
            avgCartesian.y /= cartesian.length;
            avgCartesian.z /= cartesian.length;

            // Step 4: Convert average Cartesian coordinates to lat/lon
            const avgLng = Math.atan2(avgCartesian.y, avgCartesian.x);
            const hyp = Math.sqrt(avgCartesian.x * avgCartesian.x + avgCartesian.y * avgCartesian.y);
            const avgLat = Math.atan2(avgCartesian.z, hyp);

            // Convert radians back to degrees
            const centerLat = (avgLat * 180) / Math.PI;
            const centerLng = (avgLng * 180) / Math.PI;

            setMapCenter([centerLat, centerLng]);
            // console.log(centerLat, centerLng, "avgs");
        }
    }, [data]);

    const UpdateMapCenter = ({ center }) => {
        const map = useMap(); // Access map instance
        const bounds = L.latLngBounds(data.map(item => [item.lat, item.lng])); // Calculate bounds for markers
        const newZoom = map.getBoundsZoom(bounds); // Calculate zoom level based on bounds
        map.setView(center, newZoom - 1); // Set map center and zoom
        return null;
    };
    const handleMarkerClick = (lat, lng) => {
        console.log("khv", mapRef)
        // const map = mapRef.current; // Access map instance from ref
        // const newZoom = 30; // Get current map zoom level
        // setZoom(newZoom)
        mapRef.current.flyTo([lat, lng], 18, {
            duration: .4, // Duration of the animation in seconds
        });
        // map.setView([lat, lng], newZoom);
    };

    return (
        // <MapContainer center={mapCenter} zoom={zoom} style={{ height: '67vh', width: '100%' }} ref={mapRef}>
        //     <UpdateMapCenter center={mapCenter} />
        //     <TileLayer
        //         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        //         attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        //     />
        //     {data.map((item,index) => {
        //         // Check if lat and lng are defined
        //         if (typeof item.lat !== 'undefined' && typeof item.lng !== 'undefined') {
        //            console.log('bee')
        //             return (
        //                 <Marker key={item.id} position={[item.lat, item.lng]}  icon={customIcon}  eventHandlers={{ click: () => handleMarkerClick(item.lat, item.lng) }}>
        //                     <Popup>
        //                         {name[index]}
        //                     </Popup>
        //                 </Marker>
        //             );
        //         } else {
        //             console.warn(`Invalid LatLng object: (${item.lat}, ${item.lng})`);
        //             return null; // or handle the case of undefined lat or lng
        //         }
        //     })}
        // </MapContainer>
        <MapContainer center={mapCenter} zoom={zoom} style={{ height: '67vh', width: '100%' }} ref={mapRef}>
            <UpdateMapCenter center={mapCenter} />
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {data.map((item, index) => {
                // Check if lat and lng are defined
                if (typeof item.lat !== 'undefined' && typeof item.lng !== 'undefined') {
                    return (
                        <Marker key={index} position={[item.lat, item.lng]} icon={customIcon} eventHandlers={{ click: () => handleMarkerClick(item.lat, item.lng) }}>
                            <Popup>
                                {name[index]}
                            </Popup>
                        </Marker>
                    );
                } else {
                    console.warn(`Invalid LatLng object: (${item.lat}, ${item.lng})`);
                    return null; // or handle the case of undefined lat or lng
                }
            })}
        </MapContainer>

    );
};

export default LeafletMap;
// components/MapComponent.js
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import L from 'leaflet';

// // Fix for default marker icon issue in leaflet with React
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
//   iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
//   shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
// });

// const MapComponent = ({ points }) => {
//   return (
//     <MapContainer center={[39.8283, -98.5795]} zoom={4} style={{ height: '100vh', width: '100%' }}>
//       <TileLayer
//         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//       />
//       {points.map((point, index) => (
//         <Marker key={index} position={[point.lat, point.lng]}>
//           <Popup>{point.popup}</Popup>
//         </Marker>
//       ))}
//     </MapContainer>
//   );
// };

// export default MapComponent;
