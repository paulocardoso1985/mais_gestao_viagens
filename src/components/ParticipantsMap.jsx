import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { getCoords } from '../services/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Corrigindo ícones do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function ParticipantsMap({ locations, selectedLocation, className = "h-[400px]" }) {
    const center = selectedLocation
        ? getCoords(selectedLocation.city, selectedLocation.uf)
        : [-15.78, -47.93];

    const zoom = selectedLocation ? 8 : 3;

    return (
        <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8 ${className}`}>
            <MapContainer
                center={center}
                zoom={zoom}
                style={{ height: '100%', width: '100%', zIndex: 1 }}
                key={selectedLocation ? selectedLocation.id : 'main-map'}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {locations?.map((loc, idx) => (
                    <Marker key={idx} position={getCoords(loc.Cidade, loc.UF)}>
                        <Popup>{loc.Cidade}: {loc.Qtd}</Popup>
                    </Marker>
                ))}
                {selectedLocation && (
                    <Marker position={center}>
                        <Popup>{selectedLocation.name}<br />{selectedLocation.city} - {selectedLocation.uf}</Popup>
                    </Marker>
                )}
            </MapContainer>
        </div>
    );
}
