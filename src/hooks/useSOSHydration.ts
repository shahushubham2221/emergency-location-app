import { useEffect } from 'react';
import { getActiveSOS } from '../lib/idb';
import { useSOSStore } from '../store/sos.store';
import { useNavigate, useLocation } from 'react-router-dom';

export function useSOSHydration() {
  const { setSession, setPhase, phase } = useSOSStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function hydrate() {
      // If memory already says we have an active SOS, just enforce the route.
      if (phase === 'active') {
        if (location.pathname !== '/app/sos-active') {
          navigate('/app/sos-active', { replace: true });
        }
        return;
      }
      if (phase === 'countdown') {
        return;
      }

      try {
        const activeSession = await getActiveSOS();
        if (activeSession && activeSession.status === 'active') {
          // Restore the session from IndexedDB
          setSession(activeSession);
          setPhase('active');
          
          // Force navigate to active SOS screen if they aren't already on it
          if (location.pathname !== '/app/sos-active') {
            navigate('/app/sos-active', { replace: true });
          }
        }
      } catch (err) {
        console.error('Failed to hydrate SOS session from IDB', err);
      }
    }

    hydrate();
  }, [phase, setPhase, setSession, navigate, location.pathname]);
}
