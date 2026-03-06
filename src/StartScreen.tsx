import { useEffect, useRef, useState } from 'react';
import { createNoise2D } from 'simplex-noise';
import { generateRoadNetwork, distToSegmentSquared } from './utils/roadNetwork';
import { createTerrainGenerator } from './utils/terrain';

interface StartScreenProps {
  onStart: () => void;
  worldSeed: number;
  setWorldSeed: (v: number) => void;
  worldHeight: number;
  setWorldHeight: (v: number) => void;
  worldRoughness: number;
  setWorldRoughness: (v: number) => void;
  treeDensity: number;
  setTreeDensity: (v: number) => void;
  rockDensity: number;
  setRockDensity: (v: number) => void;
  roadLayout: 'grid' | 'cross' | 'none' | 'realistic';
  setRoadLayout: (v: 'grid' | 'cross' | 'none' | 'realistic') => void;
  biome: 'forest' | 'desert' | 'winter';
  setBiome: (v: 'forest' | 'desert' | 'winter') => void;
  waterLevel: number;
  setWaterLevel: (v: number) => void;
  carType: string;
  setCarType: (v: any) => void;
  graphicsQuality: 'low' | 'medium' | 'high';
  setGraphicsQuality: (v: 'low' | 'medium' | 'high') => void;
  enableShadows: boolean;
  setEnableShadows: (v: boolean) => void;
  enablePostProcessing: boolean;
  setEnablePostProcessing: (v: boolean) => void;
  enableParticles: boolean;
  setEnableParticles: (v: boolean) => void;
  CAR_CONFIGS: Record<string, { name: string }>;
}

export function StartScreen({
  onStart,
  worldSeed, setWorldSeed,
  worldHeight, setWorldHeight,
  worldRoughness, setWorldRoughness,
  treeDensity, setTreeDensity,
  rockDensity, setRockDensity,
  roadLayout, setRoadLayout,
  biome, setBiome,
  waterLevel, setWaterLevel,
  carType, setCarType,
  graphicsQuality, setGraphicsQuality,
  enableShadows, setEnableShadows,
  enablePostProcessing, setEnablePostProcessing,
  enableParticles, setEnableParticles,
  CAR_CONFIGS
}: StartScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTab, setActiveTab] = useState<'world' | 'vehicle' | 'graphics'>('world');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 400;
    canvas.width = size;
    canvas.height = size;

    // Clear
    ctx.fillStyle = '#166534'; // Base grass color
    ctx.fillRect(0, 0, size, size);

    const terrainGenerator = createTerrainGenerator(worldSeed, worldHeight, worldRoughness, waterLevel);
    const { getRawHeight } = terrainGenerator;

    let roadSegments: any[] = [];
    if (roadLayout === 'realistic') {
      const network = generateRoadNetwork(worldSeed, worldHeight, worldRoughness, waterLevel);
      roadSegments = network.segments;
    }

    // Draw Terrain Noise
    const imgData = ctx.createImageData(size, size);
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        // Map canvas 0-400 to world -1024 to 1024
        const worldX = (x / size) * 2048 - 1024;
        const worldY = (y / size) * 2048 - 1024;
        
        let h = getRawHeight(worldX, worldY);

        let isRoad = false;
        if (roadLayout === 'realistic') {
          let minRoadDistSq = Infinity;
          for (const seg of roadSegments) {
            const distSq = distToSegmentSquared({x: worldX, z: worldY}, {x: seg.p1.x, z: seg.p1.z}, {x: seg.p2.x, z: seg.p2.z});
            if (distSq < minRoadDistSq) {
              minRoadDistSq = distSq;
            }
          }
          if (minRoadDistSq < 144) { // 12^2
            isRoad = true;
          }
        }

        const idx = (y * size + x) * 4;
        
        if (isRoad) {
          imgData.data[idx] = 82; imgData.data[idx+1] = 82; imgData.data[idx+2] = 91; imgData.data[idx+3] = 255; // Road color
        } else if (h < waterLevel) {
          imgData.data[idx] = 14; imgData.data[idx+1] = 165; imgData.data[idx+2] = 233; imgData.data[idx+3] = 255; // Water
        } else {
          if (biome === 'forest') {
            if (h < -20) { imgData.data[idx] = 39; imgData.data[idx+1] = 39; imgData.data[idx+2] = 42; imgData.data[idx+3] = 255; }
            else if (h < 2) { imgData.data[idx] = 22; imgData.data[idx+1] = 101; imgData.data[idx+2] = 52; imgData.data[idx+3] = 255; }
            else if (h < 20) { imgData.data[idx] = 21; imgData.data[idx+1] = 128; imgData.data[idx+2] = 61; imgData.data[idx+3] = 255; }
            else if (h < 50) { imgData.data[idx] = 77; imgData.data[idx+1] = 124; imgData.data[idx+2] = 15; imgData.data[idx+3] = 255; }
            else if (h < 80) { imgData.data[idx] = 120; imgData.data[idx+1] = 113; imgData.data[idx+2] = 108; imgData.data[idx+3] = 255; }
            else { imgData.data[idx] = 248; imgData.data[idx+1] = 250; imgData.data[idx+2] = 252; imgData.data[idx+3] = 255; }
          } else if (biome === 'desert') {
            if (h < -20) { imgData.data[idx] = 120; imgData.data[idx+1] = 53; imgData.data[idx+2] = 15; imgData.data[idx+3] = 255; }
            else if (h < 2) { imgData.data[idx] = 217; imgData.data[idx+1] = 119; imgData.data[idx+2] = 6; imgData.data[idx+3] = 255; }
            else if (h < 20) { imgData.data[idx] = 245; imgData.data[idx+1] = 158; imgData.data[idx+2] = 11; imgData.data[idx+3] = 255; }
            else if (h < 50) { imgData.data[idx] = 251; imgData.data[idx+1] = 191; imgData.data[idx+2] = 36; imgData.data[idx+3] = 255; }
            else if (h < 80) { imgData.data[idx] = 180; imgData.data[idx+1] = 83; imgData.data[idx+2] = 9; imgData.data[idx+3] = 255; }
            else { imgData.data[idx] = 120; imgData.data[idx+1] = 53; imgData.data[idx+2] = 15; imgData.data[idx+3] = 255; }
          } else if (biome === 'winter') {
            if (h < -20) { imgData.data[idx] = 51; imgData.data[idx+1] = 65; imgData.data[idx+2] = 85; imgData.data[idx+3] = 255; }
            else if (h < 2) { imgData.data[idx] = 226; imgData.data[idx+1] = 232; imgData.data[idx+2] = 240; imgData.data[idx+3] = 255; }
            else if (h < 20) { imgData.data[idx] = 241; imgData.data[idx+1] = 245; imgData.data[idx+2] = 249; imgData.data[idx+3] = 255; }
            else if (h < 50) { imgData.data[idx] = 248; imgData.data[idx+1] = 250; imgData.data[idx+2] = 252; imgData.data[idx+3] = 255; }
            else if (h < 80) { imgData.data[idx] = 148; imgData.data[idx+1] = 163; imgData.data[idx+2] = 184; imgData.data[idx+3] = 255; }
            else { imgData.data[idx] = 255; imgData.data[idx+1] = 255; imgData.data[idx+2] = 255; imgData.data[idx+3] = 255; }
          }
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Draw Roads
    if (roadLayout !== 'realistic') {
      ctx.fillStyle = '#1a1a1a';
      const roadWidth = 10; // Scaled down for minimap
      const verticalRoads = roadLayout === 'grid' ? [-200, 0, 200] : roadLayout === 'cross' ? [0] : [];
      const horizontalRoads = roadLayout === 'grid' ? [-200, 0, 200] : roadLayout === 'cross' ? [0] : [];

      verticalRoads.forEach(vx => {
        const cx = (vx + 1024) / 2048 * size;
        ctx.fillRect(cx - roadWidth/2, 0, roadWidth, size);
      });
      horizontalRoads.forEach(hz => {
        const cy = (hz + 1024) / 2048 * size;
        ctx.fillRect(0, cy - roadWidth/2, size, roadWidth);
      });
    }

    const isPointOnRoad = (x: number, z: number) => {
      if (roadLayout === 'realistic') {
        let minRoadDistSq = Infinity;
        for (const seg of roadSegments) {
          const distSq = distToSegmentSquared({x, z}, {x: seg.p1.x, z: seg.p1.z}, {x: seg.p2.x, z: seg.p2.z});
          if (distSq < minRoadDistSq) {
            minRoadDistSq = distSq;
          }
        }
        return minRoadDistSq < 400; // 20^2
      }

      const margin = 14;
      for (const vx of (roadLayout === 'grid' ? [-200, 0, 200] : roadLayout === 'cross' ? [0] : [])) {
        if (Math.abs(x - vx) < margin) return true;
      }
      for (const hz of (roadLayout === 'grid' ? [-200, 0, 200] : roadLayout === 'cross' ? [0] : [])) {
        if (Math.abs(z - hz) < margin) return true;
      }
      return false;
    };

    // Draw Trees
    ctx.fillStyle = '#065f46';
    let seedVal = worldSeed;
    const random = () => {
      const x = Math.sin(seedVal++) * 10000;
      return x - Math.floor(x);
    };

    for (let i = 0; i < 300 * treeDensity; i++) {
      const x = (random() - 0.5) * 800;
      const z = (random() - 0.5) * 800;
      if (!isPointOnRoad(x, z) && Math.sqrt(x*x + z*z) > 40) {
        const cx = (x + 400) / 800 * size;
        const cy = (z + 400) / 800 * size;
        ctx.beginPath();
        ctx.arc(cx, cy, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw Rocks
    ctx.fillStyle = '#52525b';
    for (let i = 0; i < 200 * rockDensity; i++) {
      const x = (random() - 0.5) * 800;
      const z = (random() - 0.5) * 800;
      if (!isPointOnRoad(x, z) && Math.sqrt(x*x + z*z) > 30) {
        const cx = (x + 400) / 800 * size;
        const cy = (z + 400) / 800 * size;
        ctx.fillRect(cx - 1, cy - 1, 2, 2);
      }
    }

    // Draw Spawn Point
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(size/2, size/2, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();

  }, [worldSeed, worldHeight, worldRoughness, treeDensity, rockDensity, roadLayout, biome, waterLevel]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950 text-white font-mono p-4">
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col md:flex-row gap-8">
        
        {/* Settings Panel */}
        <div className="flex-1 flex flex-col h-[500px]">
          <div>
            <h1 className="text-3xl font-bold text-emerald-400 tracking-wider mb-2">GAME SETUP</h1>
            <p className="text-zinc-400 text-sm mb-4">Configure your experience before starting the engine.</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-zinc-800 pb-2">
            {(['world', 'vehicle', 'graphics'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-t-lg transition-colors ${
                  activeTab === tab 
                    ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-400/10' 
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
            {activeTab === 'world' && (
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-zinc-300 mb-2 uppercase tracking-wider">Biome</div>
                  <div className="flex gap-2">
                    {(['forest', 'desert', 'winter'] as const).map((b) => (
                      <button
                        key={b}
                        onClick={() => setBiome(b)}
                        className={`flex-1 py-2 px-2 text-sm rounded border transition-colors capitalize ${biome === b ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'}`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm text-zinc-300 mb-2 uppercase tracking-wider">
                    <span>Water Level</span>
                    <span className="text-emerald-400">{waterLevel}m</span>
                  </div>
                  <input 
                    type="range" min="-20" max="50" step="1" 
                    value={waterLevel} 
                    onChange={(e) => setWaterLevel(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-zinc-300 uppercase tracking-wider">World Seed</span>
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        value={worldSeed} 
                        onChange={(e) => setWorldSeed(parseInt(e.target.value) || 0)}
                        className="w-24 bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-sm text-white focus:border-emerald-500 outline-none"
                      />
                      <button 
                        onClick={() => setWorldSeed(Math.floor(Math.random() * 10000))}
                        className="px-3 py-1 text-xs rounded border bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                      >
                        Random
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm text-zinc-300 mb-2 uppercase tracking-wider">
                    <span>Mountain Height</span>
                    <span className="text-emerald-400">{worldHeight.toFixed(1)}x</span>
                  </div>
                  <input 
                    type="range" min="0" max="3" step="0.1" 
                    value={worldHeight} 
                    onChange={(e) => setWorldHeight(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm text-zinc-300 mb-2 uppercase tracking-wider">
                    <span>Terrain Roughness</span>
                    <span className="text-emerald-400">{worldRoughness.toFixed(1)}x</span>
                  </div>
                  <input 
                    type="range" min="0" max="3" step="0.1" 
                    value={worldRoughness} 
                    onChange={(e) => setWorldRoughness(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm text-zinc-300 mb-2 uppercase tracking-wider">
                    <span>Tree Density</span>
                    <span className="text-emerald-400">{treeDensity.toFixed(1)}x</span>
                  </div>
                  <input 
                    type="range" min="0" max="3" step="0.1" 
                    value={treeDensity} 
                    onChange={(e) => setTreeDensity(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm text-zinc-300 mb-2 uppercase tracking-wider">
                    <span>Rock Density</span>
                    <span className="text-emerald-400">{rockDensity.toFixed(1)}x</span>
                  </div>
                  <input 
                    type="range" min="0" max="3" step="0.1" 
                    value={rockDensity} 
                    onChange={(e) => setRockDensity(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div>
                  <div className="text-sm text-zinc-300 mb-2 uppercase tracking-wider">Road Layout</div>
                  <div className="flex gap-2">
                    {(['grid', 'cross', 'none', 'realistic'] as const).map((layout) => (
                      <button
                        key={layout}
                        onClick={() => setRoadLayout(layout)}
                        className={`flex-1 py-2 px-2 text-sm rounded border transition-colors capitalize ${roadLayout === layout ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'}`}
                      >
                        {layout}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'vehicle' && (
              <div className="space-y-6">
                <div>
                  <div className="text-sm text-zinc-300 mb-4 uppercase tracking-wider">Select Vehicle</div>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(CAR_CONFIGS).map(([key, c]) => (
                      <button
                        key={key}
                        onClick={() => setCarType(key)}
                        className={`py-4 px-3 text-sm rounded-lg border transition-all ${
                          carType === key 
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                            : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:border-zinc-500'
                        }`}
                      >
                        <div className="font-bold mb-1">{c.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'graphics' && (
              <div className="space-y-6">
                <div>
                  <div className="text-sm text-zinc-300 mb-3 uppercase tracking-wider">Graphics Quality</div>
                  <div className="flex gap-2">
                    {(['low', 'medium', 'high'] as const).map((q) => (
                      <button
                        key={q}
                        onClick={() => setGraphicsQuality(q)}
                        className={`flex-1 py-3 px-2 text-sm rounded border transition-colors capitalize ${
                          graphicsQuality === q 
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                            : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-zinc-500 mt-2">Adjusts resolution scaling and detail level.</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded border border-zinc-800">
                    <div>
                      <div className="text-sm text-zinc-300 uppercase tracking-wider">Shadows</div>
                      <div className="text-xs text-zinc-500">Enable dynamic sun shadows</div>
                    </div>
                    <button 
                      onClick={() => setEnableShadows(!enableShadows)}
                      className={`px-4 py-2 text-sm font-bold rounded border transition-colors ${
                        enableShadows 
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                          : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      {enableShadows ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded border border-zinc-800">
                    <div>
                      <div className="text-sm text-zinc-300 uppercase tracking-wider">Post-Processing</div>
                      <div className="text-xs text-zinc-500">Bloom, Vignette, Ambient Occlusion</div>
                    </div>
                    <button 
                      onClick={() => setEnablePostProcessing(!enablePostProcessing)}
                      className={`px-4 py-2 text-sm font-bold rounded border transition-colors ${
                        enablePostProcessing 
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                          : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      {enablePostProcessing ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded border border-zinc-800">
                    <div>
                      <div className="text-sm text-zinc-300 uppercase tracking-wider">Particle Effects</div>
                      <div className="text-xs text-zinc-500">Smoke, sparks, and skid marks</div>
                    </div>
                    <button 
                      onClick={() => setEnableParticles(!enableParticles)}
                      className={`px-4 py-2 text-sm font-bold rounded border transition-colors ${
                        enableParticles 
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                          : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      {enableParticles ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={onStart}
            className="w-full py-4 mt-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-lg tracking-widest transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] shrink-0"
          >
            START GAME
          </button>
        </div>

        {/* Minimap Preview */}
        <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950 rounded-xl border border-zinc-800 p-4">
          <div className="text-sm text-zinc-400 mb-4 uppercase tracking-wider w-full text-center">Minimap Preview</div>
          <div className="relative rounded-lg overflow-hidden border-2 border-zinc-700 shadow-2xl">
            <canvas 
              ref={canvasRef} 
              className="w-full max-w-[400px] aspect-square bg-zinc-900"
            />
            <div className="absolute bottom-2 right-2 flex items-center gap-2 bg-black/60 px-2 py-1 rounded text-xs backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-red-500 border border-white"></div>
              <span>Spawn Point</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
