import { useEffect, useState } from 'react';

function BackendStatus() {
  const [backendStatus, setBackendStatus] = useState('Waking up backend...');
  const [awake, setAwake] = useState(false);
  const [databaseStatus, setDatabaseStatus] = useState('');
  const [visible, setVisible] = useState(true)


  useEffect(() => {
    if (!import.meta.env.PROD) return; // skip in dev

    const checkBackend = () => {
      fetch(`${import.meta.env.VITE_API_URL}/wake`)
        .then(res => res.json())
        .then(data => {
          if (data.awake) {
            setAwake(true);
            setBackendStatus(`Backend awake ✅ (${data.time})`);
            
            // Display database status
            if (data.database) {
              if (data.database.connected) {
                setDatabaseStatus(`Database: ${data.database.message} ✅`);
              } else {
                setDatabaseStatus(`Database: ${data.database.message} ❌`);
              }
            }
            
            // Hide status after 5 seconds if both backend and database are good
            if (data.database?.connected) {
              setTimeout(() => setVisible(false), 5000);
            } else {
              // Keep visible if database is not connected
              setTimeout(() => setVisible(false), 10000);
            }
          } else {
            setBackendStatus('Backend sleeping ❌ Retrying...');
            setDatabaseStatus('');
          }
        })
        .catch(() => {
          setBackendStatus('Backend sleeping ❌ Retrying...');
          setDatabaseStatus('');
        });
    };

    // first check immediately
    checkBackend();

    // keep pinging every 5s until awake
    const interval = setInterval(() => {
      if (!awake) checkBackend();
    }, 5000);

    return () => clearInterval(interval);
  }, [awake]);

  if (!visible) return null

  return (
    <div>
      <p>{backendStatus}</p>
      {databaseStatus && <p>{databaseStatus}</p>}
    </div>
  );
}

export default BackendStatus;
