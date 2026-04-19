import { useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

const POLL_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * Polls the server every 5 minutes for updated planet data.
 * If a planet's commitCount has changed since last poll,
 * calls onPlanetUpdated(updatedPlanet) so the canvas can re-render.
 *
 * This gives a "live galaxy" feel without requiring a manual sync.
 */
const useCommitActivity = ({ planets, onPlanetUpdated, enabled = true }) => {
  const timerRef = useRef(null);
  const prevCountsRef = useRef({});

  // Seed initial counts
  useEffect(() => {
    planets.forEach(p => {
      prevCountsRef.current[p._id] = p.commitCount || 0;
    });
  }, [planets]);

  const checkForUpdates = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/galaxy');
      const fresh = data.planets || [];

      fresh.forEach(planet => {
        const prev = prevCountsRef.current[planet._id];
        const curr = planet.commitCount || 0;
        if (prev !== undefined && curr > prev) {
          console.log(`🌍 ${planet.name}: ${prev} → ${curr} commits`);
          onPlanetUpdated?.(planet);
          prevCountsRef.current[planet._id] = curr;
        }
      });
    } catch {
      // Silently fail — polling is non-critical
    }
  }, [onPlanetUpdated]);

  useEffect(() => {
    if (!enabled || planets.length === 0) return;

    timerRef.current = setInterval(checkForUpdates, POLL_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [enabled, planets.length, checkForUpdates]);
};

export default useCommitActivity;
