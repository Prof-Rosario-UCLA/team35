import { useOnlineStatus } from '../hooks/useOnlineStatus';

export default function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div style={{
      padding: '1rem',
      backgroundColor: '#ef4444',
      color: 'white',
      textAlign: 'center',
      fontWeight: 'bold'
    }}>
      You are currently offline. Any actions you take will be synced when you're back online.
    </div>
  );
}