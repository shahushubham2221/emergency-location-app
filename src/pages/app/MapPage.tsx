import React, { useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { MapView } from '../../components/location/MapView';
import { useLocation as useGeoLocation } from '../../hooks/useLocation';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';

export default function MapPage() {
  const { locationState, currentLocation, getCurrentLocation } = useGeoLocation(null);

  useEffect(() => {
    getCurrentLocation().catch(console.error);
  }, [getCurrentLocation]);

  const handleRefresh = async () => {
    try {
      await getCurrentLocation();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4FF] dark:bg-slate-950 transition-colors flex flex-col">
      <Header 
        title="Map" 
        showBack={false}
        rightAction={
          <button 
            onClick={handleRefresh}
            className="p-2 bg-white dark:bg-slate-900 transition-colors rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 text-blue-600 shadow-sm border border-gray-100 dark:border-slate-800"
            aria-label="Refresh location"
          >
            <RefreshCw size={18} />
          </button>
        }
      />
      
      <main className="flex-1 relative pb-20">
        {currentLocation ? (
          <div className="absolute inset-0">
            <MapView 
              center={[currentLocation.latitude, currentLocation.longitude]} 
              zoom={15} 
              accuracy={locationState === 'available' ? currentLocation.accuracy : undefined}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full px-6 text-center">
            {locationState === 'requesting' ? (
              <>
                <Loader2 size={40} className="text-blue-500 animate-spin mb-4" />
                <p className="text-gray-600 font-medium">Acquiring GPS signal...</p>
              </>
            ) : (
              <>
                <AlertTriangle size={48} className="text-amber-500 mb-4" />
                <h3 className="text-lg font-bold text-gray-800 mb-2">Location Unavailable</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Please enable GPS to view your current location on the map.
                </p>
                <button 
                  onClick={handleRefresh}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-md"
                >
                  Retry
                </button>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
