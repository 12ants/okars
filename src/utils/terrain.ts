import { createNoise2D } from 'simplex-noise';
import { distToSegmentSquared } from './roadNetwork';

export function createTerrainGenerator(seed: number, heightMultiplier: number, roughnessMultiplier: number, waterLevel: number) {
  let seedVal = seed;
  const random = () => {
    const x = Math.sin(seedVal++) * 10000;
    return x - Math.floor(x);
  };
  
  const noise2D = createNoise2D(random);

  const getRawHeight = (x: number, y: number) => {
    // Base elevation (large scale hills and valleys) using 4 octaves
    let e = 0;
    let amplitude = 1;
    let frequency = 0.001 * roughnessMultiplier;
    let maxElevation = 0;

    for (let i = 0; i < 4; i++) {
      e += noise2D(x * frequency, y * frequency) * amplitude;
      maxElevation += amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }
    e = e / maxElevation; // Normalize to -1 to 1

    // Ridged noise for mountains using 3 octaves
    let m = 0;
    amplitude = 1;
    frequency = 0.002 * roughnessMultiplier;
    let maxMountain = 0;
    
    for (let i = 0; i < 3; i++) {
      m += (1 - Math.abs(noise2D(x * frequency + 100, y * frequency + 100))) * amplitude;
      maxMountain += amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }
    m = m / maxMountain; // Normalize to 0 to 1
    m = m * m; // Sharpen ridges

    // Continental mask (determines overall elevation: lakes vs land)
    const continental = noise2D(x * 0.0005 * roughnessMultiplier + 500, y * 0.0005 * roughnessMultiplier + 500);
    
    let h = 0;
    
    if (continental < -0.1) {
      // Deep lakes / valleys
      const depth = (continental + 0.1) * 150 * heightMultiplier; // negative
      h = depth + e * 15 * heightMultiplier;
    } else {
      // Land
      const landBase = (continental + 0.1) * 60 * heightMultiplier;
      
      // Erosion noise (determines where mountains vs plains are)
      const erosion = noise2D(x * 0.001 * roughnessMultiplier + 200, y * 0.001 * roughnessMultiplier + 200);
      const mountainBlend = Math.max(0, Math.min(1, erosion + 0.5)); // 0 to 1
      
      const hills = e * 50 * heightMultiplier;
      const mountains = m * 250 * heightMultiplier;
      
      h = landBase + hills * (1 - mountainBlend) + mountains * mountainBlend;
    }
    
    // Fine detail
    h += noise2D(x * 0.05 * roughnessMultiplier, y * 0.05 * roughnessMultiplier) * 3 * heightMultiplier;
    
    // Flatten the center (world center is 0,0 in world coordinates)
    const distFromCenter = Math.sqrt(x * x + y * y);
    const flattenRadius = 300;
    const blend = Math.max(0, Math.min(1, (distFromCenter - flattenRadius) / 100));
    const smoothBlend = blend * blend * (3 - 2 * blend);
    
    const baseHeight = Math.max(0, waterLevel + 0.5);
    return h * smoothBlend + baseHeight * (1 - smoothBlend);
  };

  const getCarvedHeight = (x: number, z: number, roadSegments: any[]) => {
    let h = getRawHeight(x, z);
    
    if (!roadSegments || roadSegments.length === 0) return h;
    
    let minRoadDistSq = Infinity;
    let roadHeight = h;
    let isBridge = false;
    
    for (const seg of roadSegments) {
      if (x < seg.minX || x > seg.maxX || z < seg.minZ || z > seg.maxZ) {
        continue;
      }
      const distSq = distToSegmentSquared({x, z}, {x: seg.p1.x, z: seg.p1.z}, {x: seg.p2.x, z: seg.p2.z});
      if (distSq < minRoadDistSq) {
        minRoadDistSq = distSq;
        // Interpolate height along segment
        const l2 = (seg.p2.x - seg.p1.x) * (seg.p2.x - seg.p1.x) + (seg.p2.z - seg.p1.z) * (seg.p2.z - seg.p1.z);
        let t = 0;
        if (l2 > 0) {
          t = ((x - seg.p1.x) * (seg.p2.x - seg.p1.x) + (z - seg.p1.z) * (seg.p2.z - seg.p1.z)) / l2;
          t = Math.max(0, Math.min(1, t));
        }
        roadHeight = seg.p1.y + t * (seg.p2.y - seg.p1.y);
        isBridge = seg.type === 'bridge';
      }
    }
    
    const roadWidth = 12;
    const blendWidth = 15;
    const dist = Math.sqrt(minRoadDistSq);
    
    if (!isBridge && dist < roadWidth + blendWidth) {
      if (dist < roadWidth) {
        h = roadHeight;
      } else {
        const b = (dist - roadWidth) / blendWidth;
        const smoothB = b * b * (3 - 2 * b);
        h = roadHeight * (1 - smoothB) + h * smoothB;
      }
    }
    
    return h;
  };

  return { getRawHeight, getCarvedHeight, noise2D };
}
