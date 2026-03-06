import { Vector3, CatmullRomCurve3 } from 'three';
import { createTerrainGenerator } from './terrain';

export interface RoadSegment {
  p1: Vector3;
  p2: Vector3;
  type: 'road' | 'bridge' | 'tunnel';
}

export function generateRoadNetwork(seed: number, heightMultiplier: number, roughnessMultiplier: number, waterLevel: number) {
  const { getRawHeight } = createTerrainGenerator(seed, heightMultiplier, roughnessMultiplier, waterLevel);
  
  const loopPoints: Vector3[] = [];
  const radius = 500;
  
  // Create a seeded random function for the road layout
  let seedVal = seed + 100;
  const random = () => {
    const x = Math.sin(seedVal++) * 10000;
    return x - Math.floor(x);
  };

  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const r = radius + (random() - 0.5) * 400;
    loopPoints.push(new Vector3(Math.cos(angle) * r, 0, Math.sin(angle) * r));
  }
  
  const curve = new CatmullRomCurve3(loopPoints, true);
  const points2D = curve.getPoints(300); // 300 segments
  
  const points3D = points2D.map(p => {
    const h = getRawHeight(p.x, p.z);
    return new Vector3(p.x, h, p.z);
  });
  
  const smoothedPoints: Vector3[] = [];
  const smoothWindow = 15; // Smooth over 30 segments to make it drivable
  for (let i = 0; i < points3D.length; i++) {
    let sumH = 0;
    let count = 0;
    for (let j = -smoothWindow; j <= smoothWindow; j++) {
      const idx = (i + j + points3D.length) % points3D.length;
      sumH += points3D[idx].y;
      count++;
    }
    smoothedPoints.push(new Vector3(points3D[i].x, sumH / count, points3D[i].z));
  }
  
  const segments: RoadSegment[] = [];
  for (let i = 0; i < smoothedPoints.length - 1; i++) {
    const p1 = smoothedPoints[i];
    const p2 = smoothedPoints[i + 1];
    
    const midX = (p1.x + p2.x) / 2;
    const midZ = (p1.z + p2.z) / 2;
    const midH = (p1.y + p2.y) / 2;
    
    const rawH = getRawHeight(midX, midZ);
    
    let type: 'road' | 'bridge' | 'tunnel' = 'road';
    if (midH > rawH + 8 || rawH < waterLevel + 2) {
      type = 'bridge';
    } else if (midH < rawH - 8) {
      type = 'tunnel';
    }
    
    segments.push({ p1, p2, type });
  }
  
  return { segments, smoothedPoints };
}

// Helper to find distance from point to line segment
export function distToSegmentSquared(p: {x: number, z: number}, v: {x: number, z: number}, w: {x: number, z: number}) {
  const l2 = (w.x - v.x) * (w.x - v.x) + (w.z - v.z) * (w.z - v.z);
  if (l2 === 0) return (p.x - v.x) * (p.x - v.x) + (p.z - v.z) * (p.z - v.z);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.z - v.z) * (w.z - v.z)) / l2;
  t = Math.max(0, Math.min(1, t));
  const projX = v.x + t * (w.x - v.x);
  const projZ = v.z + t * (w.z - v.z);
  return (p.x - projX) * (p.x - projX) + (p.z - projZ) * (p.z - projZ);
}
