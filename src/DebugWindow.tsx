import { useEffect, useRef } from 'react';
import { debugData } from './store';

export function DebugWindow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frameId: number;
    let lastTime = performance.now();
    let frames = 0;

    const update = () => {
      frames++;
      const now = performance.now();
      if (now >= lastTime + 1000) {
        debugData.fps = Math.round((frames * 1000) / (now - lastTime));
        frames = 0;
        lastTime = now;
      }

      if (ref.current) {
        ref.current.innerHTML = `
          <div class="font-bold text-sm mb-2 text-emerald-400 uppercase tracking-wider border-b border-zinc-700 pb-2">Telemetry Data</div>
          <div class="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
            <div class="text-zinc-500">FPS</div>
            <div class="text-right text-emerald-400">${debugData.fps}</div>
            
            <div class="text-zinc-500">Speed</div>
            <div class="text-right text-white">${(debugData.speed * 3.6).toFixed(1)} km/h</div>
            
            <div class="text-zinc-500">Position</div>
            <div class="text-right text-zinc-300">
              ${debugData.position[0].toFixed(1)}, 
              ${debugData.position[1].toFixed(1)}, 
              ${debugData.position[2].toFixed(1)}
            </div>
            
            <div class="text-zinc-500">Velocity</div>
            <div class="text-right text-zinc-300">
              ${debugData.velocity[0].toFixed(1)}, 
              ${debugData.velocity[1].toFixed(1)}, 
              ${debugData.velocity[2].toFixed(1)}
            </div>

            <div class="text-zinc-500">Rotation</div>
            <div class="text-right text-zinc-300">
              ${debugData.rotation[0].toFixed(2)}, 
              ${debugData.rotation[1].toFixed(2)}, 
              ${debugData.rotation[2].toFixed(2)}
            </div>

            <div class="text-zinc-500">Angular Vel</div>
            <div class="text-right text-zinc-300">
              ${debugData.angularVelocity[0].toFixed(2)}, 
              ${debugData.angularVelocity[1].toFixed(2)}, 
              ${debugData.angularVelocity[2].toFixed(2)}
            </div>
            
            <div class="text-zinc-500">Engine Force</div>
            <div class="text-right text-zinc-300">${debugData.engineForce.toFixed(0)} N</div>
            
            <div class="text-zinc-500">Steering Angle</div>
            <div class="text-right text-zinc-300">${debugData.steering.toFixed(2)} rad</div>
            <div class="text-zinc-500">Camera Mode</div>
            <div class="text-right text-emerald-400 capitalize">${debugData.cameraMode.replace('-', ' ')}</div>
          </div>
        `;
      }
      frameId = requestAnimationFrame(update);
    };
    update();
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div className="absolute top-4 right-4 z-10 bg-[#0a0a0a]/90 text-white font-mono p-4 rounded-lg border border-zinc-800 backdrop-blur-md w-auto min-w-[320px] pointer-events-none shadow-2xl">
      <div ref={ref}></div>
    </div>
  );
}
