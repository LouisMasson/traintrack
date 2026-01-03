'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { TrainPosition } from '@/types/train';

// Train type colors
const TRAIN_COLORS: Record<string, string> = {
  IC: '#EF4444',  // Red
  ICE: '#EF4444', // Red
  IR: '#F59E0B',  // Orange
  RE: '#3B82F6',  // Blue
  S: '#10B981',   // Green
  default: '#6B7280', // Gray
};

function getTrainType(trainNo: string): string {
  if (trainNo.startsWith('ICE')) return 'ICE';
  if (trainNo.startsWith('IC')) return 'IC';
  if (trainNo.startsWith('IR')) return 'IR';
  if (trainNo.startsWith('RE')) return 'RE';
  if (trainNo.startsWith('S')) return 'S';
  return 'default';
}

function getTrainColor(trainNo: string): string {
  const type = getTrainType(trainNo);
  return TRAIN_COLORS[type] || TRAIN_COLORS.default;
}

// Convert trains to GeoJSON FeatureCollection
function trainsToGeoJSON(trains: TrainPosition[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: trains.map((train) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [train.longitude, train.latitude],
      },
      properties: {
        train_no: train.train_no,
        destination: train.destination,
        delay: train.delay,
        timestamp: train.timestamp,
        trainType: getTrainType(train.train_no),
        color: getTrainColor(train.train_no),
      },
    })),
  };
}

interface TrainMapProps {
  trains: TrainPosition[];
  onTrainClick?: (train: TrainPosition) => void;
  selectedTrain?: TrainPosition | null;
}

interface ClusterPopupState {
  coordinates: [number, number]; // [lng, lat] - geographic coordinates
  trains: TrainPosition[];
}

export default function TrainMap({ trains, onTrainClick, selectedTrain }: TrainMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [clusterPopup, setClusterPopup] = useState<ClusterPopupState | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);
  const [popupFlipped, setPopupFlipped] = useState(false); // Track if popup is below cluster
  const trainsRef = useRef<TrainPosition[]>(trains);

  // Keep trains ref updated
  useEffect(() => {
    trainsRef.current = trains;
  }, [trains]);

  // Close popup
  const closePopup = useCallback(() => {
    setClusterPopup(null);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [8.2, 46.8], // Switzerland center
      zoom: 7,
      maxBounds: [[5.9, 45.8], [10.5, 47.8]], // Switzerland bounds
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      const mapInstance = map.current!;

      // Add train data source with clustering
      mapInstance.addSource('trains', {
        type: 'geojson',
        data: trainsToGeoJSON([]),
        cluster: true,
        clusterMaxZoom: 24, // Always show clusters, never individual trains
        clusterRadius: 50,
      });

      // Find the first symbol layer to insert clusters above background layers
      const layers = mapInstance.getStyle().layers;
      let firstSymbolId;
      for (const layer of layers) {
        if (layer.type === 'symbol') {
          firstSymbolId = layer.id;
          break;
        }
      }

      // Cluster circles layer - add above background layers but below labels
      mapInstance.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'trains',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#51bbd6', // < 10 trains
            10,
            '#f1f075', // 10-30 trains
            30,
            '#f28cb1', // > 30 trains
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20, // < 10 trains
            10,
            25, // 10-30 trains
            30,
            30, // > 30 trains
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      }, firstSymbolId);

      // Cluster count label
      mapInstance.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'trains',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 14,
        },
        paint: {
          'text-color': '#333',
        },
      });

      // Universal click handler for clusters
      // TODO: Fix cluster detection - queryRenderedFeatures doesn't find cluster layers
      mapInstance.on('click', (e) => {
        // Query with larger bbox for better hit detection
        const bbox: [mapboxgl.PointLike, mapboxgl.PointLike] = [
          [e.point.x - 10, e.point.y - 10],
          [e.point.x + 10, e.point.y + 10]
        ];

        const features = mapInstance.queryRenderedFeatures(bbox, {
          layers: ['clusters']
        });

        // Find cluster feature
        const clusterFeature = features.find(f => f.properties?.cluster === true);

        if (!clusterFeature) return;

        const clusterId = clusterFeature.properties?.cluster_id;
        const source = mapInstance.getSource('trains') as mapboxgl.GeoJSONSource;
        const coordinates = (clusterFeature.geometry as GeoJSON.Point).coordinates as [number, number];

        // Get cluster leaves (individual trains)
        source.getClusterLeaves(clusterId, 100, 0, (err, leaves) => {
          if (err || !leaves) {
            console.error('Error getting cluster leaves:', err);
            return;
          }

          const clusterTrains = leaves
            .map((leaf) => {
              const props = leaf.properties;
              return trainsRef.current.find((t) => t.train_no === props?.train_no);
            })
            .filter((t): t is TrainPosition => t !== undefined);

          if (clusterTrains.length > 0) {
            setClusterPopup({
              coordinates: coordinates,
              trains: clusterTrains,
            });
          }
        });
      });

      // Change cursor on hover
      mapInstance.on('mouseenter', 'clusters', () => {
        mapInstance.getCanvas().style.cursor = 'pointer';
      });
      mapInstance.on('mouseleave', 'clusters', () => {
        mapInstance.getCanvas().style.cursor = '';
      });

      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [onTrainClick]);

  // Update data when trains change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const source = map.current.getSource('trains') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData(trainsToGeoJSON(trains));
    }
  }, [trains, mapLoaded]);

  // Highlight selected train (only pan if popup is not open)
  useEffect(() => {
    if (!map.current || !mapLoaded || !selectedTrain) return;

    // Don't pan if popup is open (user is comparing trains from the list)
    if (clusterPopup) return;

    // Pan to selected train
    map.current.easeTo({
      center: [selectedTrain.longitude, selectedTrain.latitude],
      zoom: Math.max(map.current.getZoom(), 10),
    });
  }, [selectedTrain, mapLoaded, clusterPopup]);

  // Update popup pixel position when map moves or cluster changes
  useEffect(() => {
    if (!map.current || !mapLoaded || !clusterPopup) {
      setPopupPosition(null);
      setPopupFlipped(false);
      return;
    }

    const updatePosition = () => {
      if (!map.current || !clusterPopup) return;

      const point = map.current.project(clusterPopup.coordinates);

      // Estimate popup height: header (40px) + max content (250px) + spacing (10px) = ~300px
      const estimatedPopupHeight = 310;

      // Check if popup would overflow top of screen
      const wouldOverflowTop = point.y - estimatedPopupHeight < 0;

      setPopupPosition({ x: point.x, y: point.y });
      setPopupFlipped(wouldOverflowTop);
    };

    // Initial position
    updatePosition();

    // Update on map move/zoom
    map.current.on('move', updatePosition);
    map.current.on('zoom', updatePosition);

    return () => {
      if (map.current) {
        map.current.off('move', updatePosition);
        map.current.off('zoom', updatePosition);
      }
    };
  }, [clusterPopup, mapLoaded]);

  // Handle train selection from popup
  const handleTrainSelect = (train: TrainPosition) => {
    // Keep popup open so user can check other trains
    onTrainClick?.(train);
  };

  return (
    <div ref={mapContainer} className="w-full h-full relative">
      {/* Cluster Popup List */}
      {clusterPopup && popupPosition && (
        <div
          className="absolute z-50 bg-amber-500 rounded-lg shadow-xl overflow-hidden"
          style={{
            left: popupPosition.x,
            top: popupPosition.y,
            transform: popupFlipped
              ? 'translate(-50%, 0%) translateY(10px)' // Below cluster
              : 'translate(-50%, -100%) translateY(-10px)', // Above cluster
            maxHeight: '300px',
            minWidth: '280px',
            pointerEvents: 'auto',
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-amber-600 px-3 py-2 flex justify-between items-center">
            <span className="text-white font-semibold text-sm">
              {clusterPopup.trains.length} trains
            </span>
            <button
              onClick={closePopup}
              className="text-white hover:text-amber-200 text-lg font-bold"
            >
              &times;
            </button>
          </div>

          {/* Train list */}
          <div className="overflow-y-auto max-h-[250px]">
            {clusterPopup.trains.map((train, index) => {
              const trainType = getTrainType(train.train_no);
              const isOnTime = train.delay === null || train.delay === 0;

              return (
                <div
                  key={train.train_no}
                  onClick={() => handleTrainSelect(train)}
                  className={`px-3 py-2 cursor-pointer hover:bg-white/20 transition-colors border-b border-amber-700/30 last:border-b-0 ${
                    index % 2 === 0 ? 'bg-amber-600' : 'bg-amber-600/95'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold text-sm">
                          {index + 1}. Destination: {train.destination || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                            isOnTime ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {isOnTime ? 'On-time' : `+${train.delay} min`}
                        </span>
                        <span className="text-white/90 text-xs">
                          Train: {train.train_no} - {trainType}
                        </span>
                      </div>
                    </div>
                    <div
                      className="w-5 h-5 rounded-full ml-2 border-2 border-white/50"
                      style={{ backgroundColor: getTrainColor(train.train_no) }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend - Train Types */}
      <div className="absolute bottom-4 left-4 z-40 bg-white rounded-lg shadow-lg p-3">
        <div className="text-xs font-semibold text-gray-700 mb-2">Train Types</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: TRAIN_COLORS.IC }} />
            <span className="text-xs text-gray-600">IC / ICE - InterCity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: TRAIN_COLORS.IR }} />
            <span className="text-xs text-gray-600">IR - InterRegio</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: TRAIN_COLORS.RE }} />
            <span className="text-xs text-gray-600">RE - RegioExpress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: TRAIN_COLORS.S }} />
            <span className="text-xs text-gray-600">S - S-Bahn</span>
          </div>
        </div>
      </div>
    </div>
  );
}
