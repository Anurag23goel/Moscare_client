// import React from "react";
// import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";

// // Custom source marker icon (red)
// const sourceIcon = L.icon({
//   iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
//   shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
//   iconSize: [25, 41], // size of the icon
//   iconAnchor: [12, 41], // point of the icon which will correspond to marker's location
//   popupAnchor: [1, -34], // point from which the popup should open relative to the iconAnchor
//   iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
//   className: "source-marker",
// });

// // Custom destination marker icon (green)
// const destinationIcon = L.icon({
//   iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-green.png", // Replace with green icon URL
//   shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
//   popupAnchor: [1, -34],
//   iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x-green.png", // Retina URL for green icon
//   className: "destination-marker",
// });

// const TimeSheetMap = ({
//   workerLat,
//   workerLon,
//   timestamp,
//   destinationLat,
//   destinationLon,
//   distance,
// }) => {
//   // Ensure coordinates are provided
//   if (!workerLat || !workerLon || !destinationLat || !destinationLon) {
//     return <div>Coordinates not available to render the map.</div>;
//   }

//   const workerPosition = [workerLat, workerLon];
//   const destinationPosition = [destinationLat, destinationLon];

//   // Polyline positions (source to destination)
//   const polylinePositions = [workerPosition, destinationPosition];

//   return (
//     <div style={{ height: "500px", width: "100%" }}>
//       {/* Leaflet Map */}
//       <MapContainer
//         center={workerPosition}
//         zoom={13}
//         scrollWheelZoom={false}
//         style={{ height: "100%", width: "100%" }}
//       >
//         <TileLayer
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//           attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//         />
//         {/* Worker Marker with Red Icon */}
//         <Marker position={workerPosition} icon={sourceIcon}>
//           <Popup>
//             Worker Position: <br />
//             Latitude: {workerLat} <br />
//             Longitude: {workerLon} <br />
//             Timestamp: {new Date(timestamp).toLocaleString()}
//           </Popup>
//         </Marker>
//         {/* Destination Marker with Green Icon */}
//         <Marker position={destinationPosition} icon={destinationIcon}>
//           <Popup>
//             Destination Position: <br />
//             Latitude: {destinationLat} <br />
//             Longitude: {destinationLon}
//           </Popup>
//         </Marker>
//         {/* Polyline */}
//         <Polyline
//           positions={polylinePositions}
//           color="blue"
//           weight={1}
//         />
//       </MapContainer>
//       <div style={{ marginTop: "10px", textAlign: "center" , }}>
//         <h4>Distance from Worker to Destination: {distance}</h4>
//         <p>{distance} km</p>
//       </div>
//     </div>
//   );
// };

// export default TimeSheetMap;


// import React from "react";
// import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
// import L from "leaflet";

// import "leaflet/dist/leaflet.css";

// // Custom marker icons
// const sourceIcon = L.icon({
//   iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
//   shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
//   popupAnchor: [1, -34],
// });

// const destinationIcon = L.icon({
//   iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x-green.png",
//   shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
//   popupAnchor: [1, -34],
// });

// const TimeSheetMap = ({ workerLat, workerLon, timestamp, distance }) => {
//   // Ensure coordinates and distance are valid
//   if (!workerLat || !workerLon || !distance) {
//     return <div>Coordinates or distance not available to render the map.</div>;
//   }

//   // Calculate destination using geolib
//   // const destination = computeDestinationPoint(
//   //   { latitude: workerLat, longitude: workerLon }, // Start point
//   //   distance * 1000, // Distance in meters
//   //   45 // Bearing in degrees (45° = northeast)
//   // );

//   const workerPosition = [workerLat, workerLon];
//   const destinationPosition = [destination.latitude, destination.longitude];
//   const polylinePositions = [workerPosition, destinationPosition];

//   return (
//     <div style={{ height: "500px", width: "100%" }}>
//       <MapContainer
//         center={workerPosition}
//         zoom={13}
//         scrollWheelZoom={false}
//         style={{ height: "100%", width: "100%" }}
//       >
//         <TileLayer
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//           attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//         />
//         <Marker position={workerPosition} icon={sourceIcon}>
//           <Popup>
//             <strong>Worker Position</strong>
//             <br />
//             Latitude: {workerLat}
//             <br />
//             Longitude: {workerLon}
//             <br />
//             Timestamp: {new Date(timestamp).toLocaleString()}
//           </Popup>
//         </Marker>
//         <Marker position={destinationPosition} icon={destinationIcon}>
//           <Popup>
//             <strong>Destination</strong>
//             <br />
//             Latitude: {destination.latitude}
//             <br />
//             Longitude: {destination.longitude}
//             <br />
//             Distance: {distance} km
//           </Popup>
//         </Marker>
//         <Polyline positions={polylinePositions} color="blue" weight={2} />
//       </MapContainer>
//       <div style={{ marginTop: "10px", textAlign: "center" }}>
//         <h4>Distance from Worker to Destination</h4>
//         <p><strong>{distance} km</strong></p>
//       </div>
//     </div>
//   );
// };

// export default TimeSheetMap;

