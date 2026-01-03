export interface TrainPosition {
  id?: number;
  train_no: string;
  latitude: number;
  longitude: number;
  speed: number | null;
  direction: number | null;
  destination: string | null;
  delay: number | null;
  timestamp: string;
  created_at?: string;
}

export interface TrainMetadata {
  train_no: string;
  route: string | null;
  destination: string | null;
  train_type: string | null;
  delay: number | null;
  last_seen: string | null;
  updated_at?: string;
}

// Swiss Transport API types (transport.opendata.ch)
export interface SwissStation {
  id: string;
  name: string;
  coordinate: {
    type: string;
    x: number; // latitude
    y: number; // longitude
  };
}

export interface SwissStationboardEntry {
  stop: {
    station: SwissStation;
    departure: string;
    departureTimestamp: number;
    delay: number | null;
    platform: string | null;
    prognosis: {
      departure: string | null;
      platform: string | null;
    };
  };
  name: string;
  category: string; // IC, IR, RE, S, etc.
  number: string;
  operator: string;
  to: string;
}

export interface SwissStationboardResponse {
  station: SwissStation;
  stationboard: SwissStationboardEntry[];
}

// geOps Tracker API types
export interface GeopsTrajectory {
  id: string;
  type: string;
  properties: {
    train_id: string;
    line: string;
    operator: string;
    destination: string;
    delay: number | null;
    timestamp: number;
  };
  geometry: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
}

export interface GeopsTrajectoryCollection {
  type: 'FeatureCollection';
  features: GeopsTrajectory[];
}
