import { useEffect, useState } from 'react';
import { debugData } from './store';

export function Speedometer() {
  const [speed, setSpeed] = useState(0);
  const [boostFuel, setBoostFuel] = useState(100);
  const [isBoosting, setIsBoosting] = useState(false);

  useEffect(() => {
    let animationFrameId: number;

    const updateUI = () => {
      setSpeed(Math.round(debugData.speed * 3.6)); // Convert m/s to km/h
      setBoostFuel(debugData.boostFuel);
      setIsBoosting(debugData.isBoosting);
      animationFrameId = requestAnimationFrame(updateUI);
    };

    updateUI();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute bottom-6 right-6 z-10 pointer-events-none flex flex-col items-end gap-2">
      {/* Boost Meter */}
      <div className="w-48 bg-zinc-900/80 backdrop-blur border border-zinc-700 rounded-full h-4 overflow-hidden shadow-lg relative">
        <div 
          className={`h-full transition-all duration-75 ${isBoosting ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]' : 'bg-emerald-500'}`}
          style={{ width: `${boostFuel}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-white mix-blend-difference">
          BOOST
        </div>
      </div>

      {/* Speedometer */}
      <div className="bg-zinc-900/80 backdrop-blur border border-zinc-700 rounded-2xl p-4 shadow-lg flex flex-col items-center justify-center min-w-[120px]">
        <div className="text-4xl font-black font-mono text-white tracking-tighter">
          {speed}
        </div>
        <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">
          km/h
        </div>
      </div>
    </div>
  );
}
