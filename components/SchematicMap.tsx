import React from 'react';
import { DayPlan } from '../types';

interface SchematicMapProps {
  days: DayPlan[];
  selectedDay: number;
}

const SchematicMap: React.FC<SchematicMapProps> = ({ days, selectedDay }) => {
  const currentDay = days.find(d => d.dayNumber === selectedDay);
  
  if (!currentDay) return null;

  const allActivities = [...currentDay.morning, ...currentDay.afternoon, ...currentDay.evening];

  // Helper to scale coordinates (0-100) to SVG viewbox (0-300)
  const scale = (val: number) => (val / 100) * 260 + 20;

  return (
    <div className="bg-slate-900 rounded-2xl p-6 shadow-inner relative overflow-hidden h-[400px]">
      <div className="absolute top-4 left-4 z-10">
        <h4 className="text-white font-bold text-sm tracking-widest uppercase opacity-70">Rota Haritası</h4>
        <p className="text-emerald-400 text-xs">Gün {selectedDay} Optimizasyonu</p>
      </div>

      <svg className="w-full h-full" viewBox="0 0 300 300">
        {/* Grid Background */}
        <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Connection Lines */}
        <path
          d={`M ${allActivities.map(a => `${scale(a.coordinates.x)},${scale(a.coordinates.y)}`).join(' L ')}`}
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
          strokeDasharray="4 4"
          className="animate-pulse"
        />

        {/* Nodes */}
        {allActivities.map((activity, index) => (
          <g key={activity.id} className="group cursor-pointer">
            <circle
              cx={scale(activity.coordinates.x)}
              cy={scale(activity.coordinates.y)}
              r="6"
              fill={activity.isHiddenGem ? '#f59e0b' : '#34d399'}
              stroke="#fff"
              strokeWidth="2"
            />
            {/* Tooltip on Hover in SVG */}
            <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
               <rect
                 x={scale(activity.coordinates.x) - 40}
                 y={scale(activity.coordinates.y) - 35}
                 width="80"
                 height="25"
                 rx="4"
                 fill="white"
               />
               <text
                 x={scale(activity.coordinates.x)}
                 y={scale(activity.coordinates.y) - 20}
                 textAnchor="middle"
                 fill="#1e293b"
                 fontSize="10"
                 fontWeight="bold"
               >
                 {index + 1}. Durak
               </text>
            </g>
            <text
              x={scale(activity.coordinates.x)}
              y={scale(activity.coordinates.y) + 18}
              textAnchor="middle"
              fill="white"
              fontSize="10"
              className="select-none font-medium"
            >
              {activity.name.length > 12 ? activity.name.substring(0,10) + '..' : activity.name}
            </text>
          </g>
        ))}
      </svg>
      
      <div className="absolute bottom-4 right-4 flex gap-3 text-xs">
        <div className="flex items-center gap-1">
           <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
           <span className="text-slate-400">Popüler</span>
        </div>
        <div className="flex items-center gap-1">
           <div className="w-2 h-2 rounded-full bg-amber-500"></div>
           <span className="text-slate-400">Gizli Cevher</span>
        </div>
      </div>
    </div>
  );
};

export default SchematicMap;