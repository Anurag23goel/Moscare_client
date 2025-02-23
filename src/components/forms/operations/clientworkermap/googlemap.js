// components/GoogleMapComponent.js
import React from 'react';
/* import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'; */

const containerStyle = {
    width: '100%',
    height: '500px'
};

const center = {
    lat: -3.745,
    lng: -38.523
};

const GoogleMapComponent = () => {
    return (
        <div>
            Maps
        </div>
        /*       <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
                 <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={10}
                 >
                    <Marker position={center} />
                 </GoogleMap>
              </LoadScript> */
    );
}

export default GoogleMapComponent;
