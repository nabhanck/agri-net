import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, MapPin, Navigation, ZoomIn, ZoomOut } from 'lucide-react';

interface MapPickerProps {
  latitude: number;
  longitude: number;
  locationName: string;
  onCoordinatesChange: (lat: number, lng: number) => void;
}

export const MapPicker: React.FC<MapPickerProps> = ({
  latitude,
  longitude,
  locationName,
  onCoordinatesChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [mapType, setMapType] = useState<'street' | 'satellite'>('street');

  // Custom marker icon HTML
  const customPinIcon = L.divIcon({
    className: 'custom-farm-pin',
    html: `
      <div style="
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        transform: translate(-50%, -100%);
      ">
        <div style="
          width: 38px;
          height: 38px;
          border-radius: 50% 50% 50% 0;
          background: linear-gradient(135deg, #10b981 0%, #047857 100%);
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 20px rgba(0,0,0,0.3), 0 2px 6px rgba(16,185,129,0.5);
          border: 2px solid #ffffff;
        ">
          <span style="transform: rotate(45deg); font-size: 18px;">📍</span>
        </div>
        <div style="
          position: absolute;
          bottom: -4px;
          width: 12px;
          height: 5px;
          background: rgba(0,0,0,0.25);
          border-radius: 50%;
          filter: blur(1.5px);
        "></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize map
      const map = L.map(mapContainerRef.current, {
        center: [latitude, longitude],
        zoom: 14,
        zoomControl: false,
      });

      // Street layer
      const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      });

      streetLayer.addTo(map);

      // Add draggable Marker
      const marker = L.marker([latitude, longitude], {
        icon: customPinIcon,
        draggable: true,
      }).addTo(map);

      marker.bindPopup(`<b>${locationName || 'Farm Location'}</b><br/>Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);

      marker.on('dragend', () => {
        const position = marker.getLatLng();
        onCoordinatesChange(position.lat, position.lng);
      });

      map.on('click', (e: L.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        onCoordinatesChange(e.latlng.lat, e.latlng.lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    } else {
      // Update existing map center & marker
      mapInstanceRef.current.setView([latitude, longitude], mapInstanceRef.current.getZoom());
      if (markerRef.current) {
        markerRef.current.setLatLng([latitude, longitude]);
        markerRef.current.getPopup()?.setContent(`<b>${locationName || 'Farm Location'}</b><br/>Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
      }
    }

    return () => {
      // Clean up on unmount
    };
  }, [latitude, longitude, locationName]);

  // Handle Layer switch (satellite simulated with Esri tiles)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapInstanceRef.current?.removeLayer(layer);
      }
    });

    if (mapType === 'satellite') {
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 18,
      }).addTo(mapInstanceRef.current);
    } else {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);
    }
  }, [mapType]);

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleRecenter = () => {
    mapInstanceRef.current?.flyTo([latitude, longitude], 14, { duration: 1 });
  };

  return (
    <div className="relative w-full h-[280px] sm:h-[320px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
      {/* Map Target Canvas */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Controls */}
      <div className="absolute top-3 right-3 z-[400] flex flex-col gap-1.5 bg-white/90 backdrop-blur-md p-1 rounded-xl shadow-lg border border-slate-200">
        <button
          type="button"
          onClick={handleZoomIn}
          className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleRecenter}
          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
          title="Center on Farm"
        >
          <Navigation className="w-4 h-4" />
        </button>
      </div>

      {/* Toggle View Type */}
      <div className="absolute bottom-3 left-3 z-[400] flex items-center bg-white/90 backdrop-blur-md px-2 py-1 rounded-xl shadow-md border border-slate-200 gap-1 text-xs">
        <button
          type="button"
          onClick={() => setMapType('street')}
          className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
            mapType === 'street'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Street
        </button>
        <button
          type="button"
          onClick={() => setMapType('satellite')}
          className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
            mapType === 'satellite'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🛰️ Satellite
        </button>
      </div>

      {/* Interactive Helper Pill */}
      <div className="absolute top-3 left-3 z-[400] bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-medium px-3 py-1 rounded-full shadow-md pointer-events-none flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>Click anywhere or drag pin to adjust farm location</span>
      </div>
    </div>
  );
};
