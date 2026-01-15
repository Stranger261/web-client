import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { formatLiveDateTime } from '../../utils/FormatTime';

const LiveClock = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-xl dark:bg-gray-800">
      <Clock className="h-5 w-5 text-primary" />
      <div className="leading-tight">
        <p className="text-xs text-gray-500 dark:text-gray-400">Current Time</p>
        <p className="text-sm font-semibold tabular-nums">
          {formatLiveDateTime(now)}
        </p>
      </div>
    </div>
  );
};

export default LiveClock;
