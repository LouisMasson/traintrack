'use client';

import { TrainPosition } from '@/types/train';

// Train type colors
const TRAIN_COLORS: Record<string, string> = {
  IC: '#EF4444',
  ICE: '#EF4444',
  IR: '#F59E0B',
  RE: '#3B82F6',
  S: '#10B981',
  default: '#6B7280',
};

const TRAIN_TYPE_NAMES: Record<string, string> = {
  IC: 'InterCity',
  ICE: 'InterCity Express',
  IR: 'InterRegio',
  RE: 'RegioExpress',
  S: 'S-Bahn',
  default: 'Train',
};

function getTrainType(trainNo: string): string {
  if (trainNo.startsWith('ICE')) return 'ICE';
  if (trainNo.startsWith('IC')) return 'IC';
  if (trainNo.startsWith('IR')) return 'IR';
  if (trainNo.startsWith('RE')) return 'RE';
  if (trainNo.startsWith('S')) return 'S';
  return 'default';
}

interface TrainDetailsPanelProps {
  train: TrainPosition | null;
  onClose: () => void;
}

export default function TrainDetailsPanel({ train, onClose }: TrainDetailsPanelProps) {
  if (!train) return null;

  const trainType = getTrainType(train.train_no);
  const color = TRAIN_COLORS[trainType] || TRAIN_COLORS.default;
  const typeName = TRAIN_TYPE_NAMES[trainType] || TRAIN_TYPE_NAMES.default;

  return (
    <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-auto md:top-4 md:w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-10">
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ backgroundColor: color }}
      >
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-lg">{train.train_no}</span>
          <span className="text-white/80 text-sm">({typeName})</span>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:bg-white/20 rounded p-1 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Destination */}
        {train.destination && (
          <div className="flex items-center gap-2 text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div>
              <div className="text-xs text-gray-400">Destination</div>
              <div className="text-sm font-medium">{train.destination}</div>
            </div>
          </div>
        )}

        {/* Delay */}
        <div className="flex items-center gap-2 text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <div className="text-xs text-gray-400">Status</div>
            {train.delay === null || train.delay === 0 ? (
              <div className="text-sm font-medium text-green-600 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                On time
              </div>
            ) : (
              <div className="text-sm font-medium text-red-600 flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                +{train.delay} min delay
              </div>
            )}
          </div>
        </div>

        {/* Last Update */}
        <div className="flex items-center gap-2 text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <div>
            <div className="text-xs text-gray-400">Last Update</div>
            <div className="text-sm font-medium">
              {new Date(train.timestamp).toLocaleTimeString('fr-CH')}
            </div>
          </div>
        </div>

        {/* Position (collapsed) */}
        <div className="flex items-center gap-2 text-gray-400 text-xs">
          <span>Position: {train.latitude.toFixed(4)}, {train.longitude.toFixed(4)}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
        <div className="text-xs text-gray-400 mb-2">Train Types</div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(TRAIN_COLORS).filter(([key]) => key !== 'default').map(([type, c]) => (
            <div key={type} className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: c }}
              />
              <span className="text-xs text-gray-600">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
