import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const useGalaxy = () => {
  const [planets, setPlanets] = useState([]);
  const [galaxyInfo, setGalaxyInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(null);
  const [error, setError] = useState(null);

  const fetchGalaxy = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/galaxy');
      setPlanets(data.planets);
      setGalaxyInfo({ user: data.user, galaxyName: data.galaxyName, lastSynced: data.lastSynced });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load galaxy');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGalaxy();
  }, [fetchGalaxy]);

  const syncGalaxy = useCallback(async () => {
    setSyncing(true);
    setSyncProgress({ message: 'Initiating sync...', current: 0, total: 0 });

    try {
      const response = await fetch('/api/galaxy/sync', {
        method: 'POST',
        headers: {
          Authorization: axios.defaults.headers.common['Authorization'],
        },
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value).split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.slice(6));
              setSyncProgress(event);
              if (event.type === 'complete') {
                await fetchGalaxy();
                setSyncing(false);
                setSyncProgress(null);
              }
              if (event.type === 'error') {
                setError(event.message);
                setSyncing(false);
                setSyncProgress(null);
              }
            } catch {}
          }
        }
      }
    } catch (err) {
      setError('Sync failed: ' + err.message);
      setSyncing(false);
      setSyncProgress(null);
    }
  }, [fetchGalaxy]);

  return { planets, galaxyInfo, loading, syncing, syncProgress, error, fetchGalaxy, syncGalaxy };
};
