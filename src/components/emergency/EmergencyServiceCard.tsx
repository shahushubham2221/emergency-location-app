import React from 'react';
import { Phone, Navigation } from 'lucide-react';
import type { EmergencyService } from '../../lib/overpass';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

// ─── Category metadata ────────────────────────────────────────────────────────

const CATEGORY_META: Record<
  string,
  { label: string; emoji: string; badgeVariant: 'danger' | 'info' | 'warning' | 'success' | 'neutral' }
> = {
  police:       { label: 'Police',      emoji: '🚔', badgeVariant: 'info' },
  hospital:     { label: 'Hospital',    emoji: '🏥', badgeVariant: 'danger' },
  fire_station: { label: 'Fire',        emoji: '🚒', badgeVariant: 'warning' },
  ambulance:    { label: 'Ambulance',   emoji: '🚑', badgeVariant: 'danger' },
  pharmacy:     { label: 'Pharmacy',    emoji: '💊', badgeVariant: 'success' },
};

const getCategoryMeta = (category: string) =>
  CATEGORY_META[category] ?? { label: category, emoji: '📍', badgeVariant: 'neutral' as const };

// ─── Distance formatting ──────────────────────────────────────────────────────

function formatDistance(meters: number | undefined): string {
  if (meters === undefined || meters === null) return 'Unknown distance';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export interface EmergencyServiceCardProps {
  service: EmergencyService;
}

export const EmergencyServiceCard: React.FC<EmergencyServiceCardProps> = ({ service }) => {
  const meta = getCategoryMeta(service.category);

  const handleCall = () => {
    if (service.phone) {
      window.location.href = `tel:${service.phone}`;
    }
  };

  const handleDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${service.latitude},${service.longitude}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="flex flex-col gap-3">
      {/* Header row */}
      <div className="flex items-start gap-3">
        {/* Emoji icon */}
        <div
          className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-xl"
          aria-hidden="true"
        >
          {meta.emoji}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
              {service.name ?? 'Unnamed Service'}
            </h3>
            <Badge variant={meta.badgeVariant}>
              {meta.emoji} {meta.label}
            </Badge>
          </div>

          {/* Address */}
          {service.address && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
              {service.address}
            </p>
          )}

          {/* Distance */}
          <p className="text-xs font-medium text-blue-600 mt-0.5">
            {formatDistance(service.distanceKm)}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 pt-1">
        <Button
          variant="primary"
          size="md"
          onClick={handleCall}
          disabled={!service.phone}
          aria-label={`Call ${service.name ?? meta.label}`}
          className="flex-1"
        >
          <Phone size={16} aria-hidden="true" />
          Call
        </Button>

        <Button
          variant="outline"
          size="md"
          onClick={handleDirections}
          aria-label={`Get directions to ${service.name ?? meta.label}`}
          className="flex-1"
        >
          <Navigation size={16} aria-hidden="true" />
          Directions
        </Button>
      </div>
    </Card>
  );
};
