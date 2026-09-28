import { useState, useRef, useCallback, useEffect } from 'react';
import type { LocationPoint } from '../types/sos';

export type LocationState =
  | 'idle'
  | 'requesting'
  | 'available'
  | 'error'
  | 'denied'
  | 'unavailable';

export interface UseLocationReturn {
  locationState: LocationState;
  currentLocation: LocationPoint | null;
  getCurrentLocation: () => Promise<LocationPoint | null>;
  startWatching: (
    sessionId: string,
    onUpdate: (point: LocationPoint) => void
  ) => void;
  stopWatching: () => void;
}

const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10_000,
  maximumAge: 0,
};

function positionToPoint(
  pos: GeolocationPosition,
  sessionId: string
): LocationPoint {
  return {
    latitude: pos.coords.latitude,
    longitude: pos.coords.longitude,
    accuracy: pos.coords.accuracy,
    timestamp: pos.timestamp,
    sessionId,
    synced: false,
  };
}

function mapGeoError(err: GeolocationPositionError): LocationState {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      return 'denied';
    case err.POSITION_UNAVAILABLE:
      return 'unavailable';
    case err.TIMEOUT:
      return 'error';
    default:
      return 'error';
  }
}

export function useLocation(
  sessionId: string | null,
  intervalMs = 10_000
): UseLocationReturn {
  const [locationState, setLocationState] = useState<LocationState>('idle');
  const [currentLocation, setCurrentLocation] = useState<LocationPoint | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const onUpdateRef = useRef<((point: LocationPoint) => void) | null>(null);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    onUpdateRef.current = null;
    setLocationState((prev) => (prev === 'available' ? 'available' : 'idle'));
  }, []);

  // CRITICAL: stop tracking when sessionId becomes null (SOS ended)
  useEffect(() => {
    if (sessionId === null) {
      stopWatching();
    }
  }, [sessionId, stopWatching]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const getCurrentLocation = useCallback((): Promise<LocationPoint | null> => {
    if (!('geolocation' in navigator)) {
      setLocationState('unavailable');
      return Promise.resolve(null);
    }

    setLocationState('requesting');

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const sid = sessionId ?? 'one-shot';
          const point = positionToPoint(pos, sid);
          setCurrentLocation(point);
          setLocationState('available');
          resolve(point);
        },
        (err) => {
          setLocationState(mapGeoError(err));
          resolve(null);
        },
        GEO_OPTIONS
      );
    });
  }, [sessionId]);

  const startWatching = useCallback(
    (sid: string, onUpdate: (point: LocationPoint) => void) => {
      if (!('geolocation' in navigator)) {
        setLocationState('unavailable');
        return;
      }

      // Stop any existing watcher before starting a new one
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }

      onUpdateRef.current = onUpdate;
      setLocationState('requesting');

      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const point = positionToPoint(pos, sid);
          setCurrentLocation(point);
          setLocationState('available');
          onUpdateRef.current?.(point);
        },
        (err) => {
          setLocationState(mapGeoError(err));
        },
        // watchPosition does not support a minimum interval natively;
        // maximumAge acts as a floor — positions older than intervalMs are
        // discarded by the browser and a fresh fix is requested.
        { ...GEO_OPTIONS, maximumAge: intervalMs }
      );
    },
    [intervalMs]
  );

  return { locationState, currentLocation, getCurrentLocation, startWatching, stopWatching };
}
