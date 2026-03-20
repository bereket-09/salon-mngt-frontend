import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Box, alpha, useTheme } from '@mui/material';

const MapComponent = ({ lat, lng, zoom = 12, markers = [], interactive = true, height = "250px" }) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const theme = useTheme();

    useEffect(() => {
        if (map.current) return; // stops map from initializing more than once

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
            center: [lng || 38.7578, lat || 8.9806], // Default to Addis Ababa
            zoom: zoom,
            interactive: interactive,
        });

        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    }, [lat, lng, zoom, interactive]);

    useEffect(() => {
        if (!map.current) return;

        // Clear existing markers if any (a bit complex with vanilla MapLibre, but for simplicity we assume markers stay constant or we'd manage a refs array)

        markers.forEach(marker => {
            if (marker.lng && marker.lat) {
                new maplibregl.Marker({ color: theme.palette.secondary.main })
                    .setLngLat([marker.lng, marker.lat])
                    .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(`<h4>${marker.title}</h4>`))
                    .addTo(map.current);
            }
        });
    }, [markers, theme.palette.secondary.main]);

    useEffect(() => {
        if (map.current && lat && lng) {
            map.current.flyTo({ center: [lng, lat], zoom: zoom });
        }
    }, [lat, lng, zoom]);

    return (
        <Box
            ref={mapContainer}
            sx={{
                height: height,
                width: '100%',
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.1),
                '& .maplibregl-canvas': { outline: 'none' }
            }}
        />
    );
};

export default MapComponent;
