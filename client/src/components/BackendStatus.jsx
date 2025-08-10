import { useEffect, useState } from 'react';

function BackendStatus() {
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [awake, setAwake] = useState(false);
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
            setTimeout(() => setVisible(false), 2000)
          } else {
            setBackendStatus('Backend sleeping ❌ Retrying...');
          }
        })
        .catch(() => {
          setBackendStatus('Backend sleeping ❌ Retrying...');
        });
    };

    // first check immediately
    checkBackend();

    // keep checking every 5s until awake
    const interval = setInterval(() => {
      if (!awake) checkBackend();
    }, 5000);

    return () => clearInterval(interval);
  }, [awake]);

  if (!visible) return null

  return <p>{backendStatus}</p>;
}

export default BackendStatus;
