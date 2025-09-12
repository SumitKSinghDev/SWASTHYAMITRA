import React from 'react';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';

const NetworkQualityIndicator = ({ quality }) => {
  if (!quality) {
    return (
      <div className="flex items-center space-x-1 text-gray-400">
        <WifiOff className="h-4 w-4" />
        <span className="text-xs">Unknown</span>
      </div>
    );
  }

  const getQualityInfo = (quality) => {
    // Agora network quality levels: 0-6
    // 0: Unknown, 1: Excellent, 2: Good, 3: Poor, 4: Bad, 5: Very Bad, 6: Down
    switch (quality) {
      case 1:
        return { 
          color: 'text-green-400', 
          icon: Wifi, 
          label: 'Excellent',
          description: 'Perfect connection'
        };
      case 2:
        return { 
          color: 'text-green-400', 
          icon: Wifi, 
          label: 'Good',
          description: 'Good connection'
        };
      case 3:
        return { 
          color: 'text-yellow-400', 
          icon: Wifi, 
          label: 'Poor',
          description: 'Poor connection'
        };
      case 4:
        return { 
          color: 'text-orange-400', 
          icon: Wifi, 
          label: 'Bad',
          description: 'Bad connection'
        };
      case 5:
        return { 
          color: 'text-red-400', 
          icon: AlertTriangle, 
          label: 'Very Bad',
          description: 'Very bad connection'
        };
      case 6:
        return { 
          color: 'text-red-400', 
          icon: WifiOff, 
          label: 'Down',
          description: 'No connection'
        };
      default:
        return { 
          color: 'text-gray-400', 
          icon: WifiOff, 
          label: 'Unknown',
          description: 'Unknown quality'
        };
    }
  };

  const qualityInfo = getQualityInfo(quality);

  return (
    <div 
      className={`flex items-center space-x-1 ${qualityInfo.color}`}
      title={qualityInfo.description}
    >
      <qualityInfo.icon className="h-4 w-4" />
      <span className="text-xs">{qualityInfo.label}</span>
    </div>
  );
};

export default NetworkQualityIndicator;
