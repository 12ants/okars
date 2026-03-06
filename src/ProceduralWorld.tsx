import { useMemo, useRef, useEffect } from 'react';
import { useHeightfield } from '@react-three/cannon';
import { Mesh, BufferGeometry, Float32BufferAttribute, Color } from 'three';
import { generateRoadNetwork, distToSegmentSquared } from './utils/roadNetwork';
import { createTerrainGenerator } from './utils/terrain';

export function ProceduralWorld({ size = 128, elementSize = 4, seed = 1337, heightMultiplier = 1, roughnessMultiplier = 1, biome = 'forest', waterLevel = -5, roadLayout = 'grid' }: any) {
  const { heights, geometry } = useMemo(() => {
    const terrainGenerator = createTerrainGenerator(seed, heightMultiplier, roughnessMultiplier, waterLevel);
    const { getRawHeight, noise2D } = terrainGenerator;

    // Generate road network
    let roadSegments: any[] = [];
    if (roadLayout === 'realistic') {
      const network = generateRoadNetwork(seed, heightMultiplier, roughnessMultiplier, waterLevel);
      
      const maxDist = 12 + 15; // roadWidth + blendWidth
      roadSegments = network.segments.map(seg => {
        const minX = Math.min(seg.p1.x, seg.p2.x) - maxDist;
        const maxX = Math.max(seg.p1.x, seg.p2.x) + maxDist;
        const minZ = Math.min(seg.p1.z, seg.p2.z) - maxDist;
        const maxZ = Math.max(seg.p1.z, seg.p2.z) + maxDist;
        return { ...seg, minX, maxX, minZ, maxZ };
      });
    } else {
      const verticalRoads = roadLayout === 'grid' ? [-200, 0, 200] : roadLayout === 'cross' ? [0] : [];
      const horizontalRoads = roadLayout === 'grid' ? [-200, 0, 200] : roadLayout === 'cross' ? [0] : [];
      const maxDist = 12 + 15;
      verticalRoads.forEach(x => {
        roadSegments.push({
          p1: { x, y: 0, z: -2000 },
          p2: { x, y: 0, z: 2000 },
          minX: x - maxDist,
          maxX: x + maxDist,
          minZ: -2000,
          maxZ: 2000,
          type: 'road'
        });
      });
      horizontalRoads.forEach(z => {
        roadSegments.push({
          p1: { x: -2000, y: 0, z },
          p2: { x: 2000, y: 0, z },
          minX: -2000,
          maxX: 2000,
          minZ: z - maxDist,
          maxZ: z + maxDist,
          type: 'road'
        });
      });
    }
    
    const heights: number[][] = [];
    const vertices = [];
    const indices = [];
    const colors = [];
    const color = new Color();
    
    const worldSize = (size - 1) * elementSize;
    const centerX = worldSize / 2;
    const centerY = worldSize / 2;
    
    for (let i = 0; i < size; i++) {
      const row: number[] = [];
      for (let j = 0; j < size; j++) {
        const x = i * elementSize;
        const y = j * elementSize;
        
        const worldX = x - centerX;
        const worldZ = y - centerY;
        
        const h = terrainGenerator.getCarvedHeight(worldX, worldZ, roadSegments);
        
        row.push(h);
        
        // Local space: x = i * elementSize, y = j * elementSize, z = h
        vertices.push(x, y, h);
        
        // Color based on height and slope
        if (biome === 'forest') {
          if (h < waterLevel - 10) color.set('#1e3a8a');
          else if (h < waterLevel) color.set('#2563eb');
          else if (h < waterLevel + 2) color.set('#fde047'); // sand
          else if (h < 20) color.set('#15803d');
          else if (h < 60) color.set('#4d7c0f');
          else if (h < 100) color.set('#78716c');
          else color.set('#f8fafc');
        } else if (biome === 'desert') {
          if (h < waterLevel - 10) color.set('#1e3a8a');
          else if (h < waterLevel) color.set('#2563eb');
          else if (h < waterLevel + 5) color.set('#fcd34d');
          else if (h < 20) color.set('#f59e0b');
          else if (h < 60) color.set('#d97706');
          else if (h < 100) color.set('#b45309');
          else color.set('#78350f');
        } else if (biome === 'winter') {
          if (h < waterLevel - 10) color.set('#1e3a8a');
          else if (h < waterLevel) color.set('#2563eb');
          else if (h < waterLevel + 2) color.set('#e2e8f0');
          else if (h < 20) color.set('#f1f5f9');
          else if (h < 60) color.set('#f8fafc');
          else if (h < 100) color.set('#94a3b8');
          else color.set('#ffffff');
        }
        
        // Add some noise to color
        const colorNoise = noise2D(x * 0.1, y * 0.1) * 0.05;
        color.r = Math.max(0, Math.min(1, color.r + colorNoise));
        color.g = Math.max(0, Math.min(1, color.g + colorNoise));
        color.b = Math.max(0, Math.min(1, color.b + colorNoise));
        
        colors.push(color.r, color.g, color.b);
      }
      heights.push(row);
    }
    
    for (let i = 0; i < size - 1; i++) {
      for (let j = 0; j < size - 1; j++) {
        const a = i * size + j;
        const b = i * size + (j + 1);
        const c = (i + 1) * size + j;
        const d = (i + 1) * size + (j + 1);
        
        indices.push(a, c, d);
        indices.push(a, d, b);
      }
    }
    
    const geo = new BufferGeometry();
    geo.setAttribute('position', new Float32BufferAttribute(vertices, 3));
    geo.setAttribute('color', new Float32BufferAttribute(colors, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    
    return { heights, geometry: geo };
  }, [size, elementSize, seed, heightMultiplier, roughnessMultiplier, biome, waterLevel, roadLayout]);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  const worldSize = (size - 1) * elementSize;

  const [ref] = useHeightfield(
    () => ({
      args: [
        heights,
        {
          elementSize,
        },
      ],
      position: [-worldSize / 2, -0.1, worldSize / 2],
      rotation: [-Math.PI / 2, 0, 0],
    }),
    useRef<Mesh>(null)
  );

  return (
    <mesh ref={ref} receiveShadow geometry={geometry}>
      <meshStandardMaterial vertexColors roughness={0.9} metalness={0.1} />
    </mesh>
  );
}
