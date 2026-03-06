import { useBox, useCylinder, useCompoundBody, useSphere } from '@react-three/cannon';
import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { createTerrainGenerator } from './utils/terrain';
import { generateRoadNetwork, distToSegmentSquared } from './utils/roadNetwork';
import { Mesh, Group, CanvasTexture, RepeatWrapping, InstancedMesh, Object3D, Euler, Color, Vector3 } from 'three';
import { createNoise2D } from 'simplex-noise';

export function Ramp({ position, rotation, args = [10, 2, 10], color = '#444' }: any) {
  const [ref] = useBox(
    () => ({
      type: 'Static',
      position,
      rotation,
      args,
    }),
    useRef<Mesh>(null)
  );

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

export function SpeedBump({ position, width = 8, radius = 0.3 }: any) {
  const [ref] = useCylinder(
    () => ({
      type: 'Static',
      position,
      rotation: [0, 0, Math.PI / 2],
      args: [radius, radius, width, 16],
    }),
    useRef<Mesh>(null)
  );

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <cylinderGeometry args={[radius, radius, width, 16]} />
      <meshStandardMaterial color="#eab308" />
    </mesh>
  );
}

export function Platform({ position, args = [10, 2, 10], color = '#333' }: any) {
  const [ref] = useBox(
    () => ({
      type: 'Static',
      position,
      args,
    }),
    useRef<Mesh>(null)
  );

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

export function Tunnel({ position = [0, 0, 0], rotation = [0, 0, 0], length = 20, width = 8, height = 4, color = '#3f3f46' }: any) {
  const wallThickness = 1;
  const roofThickness = 1;

  const [ref] = useCompoundBody(
    () => ({
      type: 'Static',
      position,
      rotation,
      shapes: [
        { type: 'Box', position: [-width / 2 - wallThickness / 2, height / 2, 0], args: [wallThickness, height, length] },
        { type: 'Box', position: [width / 2 + wallThickness / 2, height / 2, 0], args: [wallThickness, height, length] },
        { type: 'Box', position: [0, height + roofThickness / 2, 0], args: [width + wallThickness * 2, roofThickness, length] },
      ],
    }),
    useRef<Group>(null)
  );

  return (
    <group ref={ref as any}>
      <mesh position={[-width / 2 - wallThickness / 2, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[wallThickness, height, length]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[width / 2 + wallThickness / 2, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[wallThickness, height, length]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, height + roofThickness / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width + wallThickness * 2, roofThickness, length]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

export function Bridge({ position = [0, 0, 0], rotation = [0, 0, 0], length = 30, width = 10, height = 5, color = '#52525b' }: any) {
  const deckThickness = 0.5;
  const railHeight = 1;
  const railThickness = 0.5;

  const [ref] = useCompoundBody(
    () => ({
      type: 'Static',
      position,
      rotation,
      shapes: [
        { type: 'Box', position: [0, height, 0], args: [width, deckThickness, length] },
        { type: 'Box', position: [-width / 2 + railThickness / 2, height + railHeight / 2 + deckThickness / 2, 0], args: [railThickness, railHeight, length] },
        { type: 'Box', position: [width / 2 - railThickness / 2, height + railHeight / 2 + deckThickness / 2, 0], args: [railThickness, railHeight, length] },
      ],
    }),
    useRef<Group>(null)
  );

  return (
    <group ref={ref as any}>
      <mesh position={[0, height, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, deckThickness, length]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-width / 2 + railThickness / 2, height + railHeight / 2 + deckThickness / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[railThickness, railHeight, length]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <mesh position={[width / 2 - railThickness / 2, height + railHeight / 2 + deckThickness / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[railThickness, railHeight, length]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <mesh position={[-width / 2 + 1, height / 2, length / 3]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.5, height]} />
        <meshStandardMaterial color="#3f3f46" />
      </mesh>
      <mesh position={[width / 2 - 1, height / 2, length / 3]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.5, height]} />
        <meshStandardMaterial color="#3f3f46" />
      </mesh>
      <mesh position={[-width / 2 + 1, height / 2, -length / 3]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.5, height]} />
        <meshStandardMaterial color="#3f3f46" />
      </mesh>
      <mesh position={[width / 2 - 1, height / 2, -length / 3]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.5, height]} />
        <meshStandardMaterial color="#3f3f46" />
      </mesh>
    </group>
  );
}

export function Grandstand({ position, rotation = [0, 0, 0] }: any) {
  const [ref] = useCompoundBody(
    () => ({
      type: 'Static',
      position,
      rotation,
      shapes: [
        // Base
        { type: 'Box', position: [0, 2, 0], args: [40, 4, 10] },
        // Steps/Seats
        { type: 'Box', position: [0, 4.5, -1], args: [40, 1, 8] },
        { type: 'Box', position: [0, 5.5, -2], args: [40, 1, 6] },
        { type: 'Box', position: [0, 6.5, -3], args: [40, 1, 4] },
        { type: 'Box', position: [0, 7.5, -4], args: [40, 1, 2] },
        // Roof
        { type: 'Box', position: [0, 12, -2], args: [42, 0.5, 12] },
        // Pillars
        { type: 'Box', position: [-19, 8, -4], args: [1, 8, 1] },
        { type: 'Box', position: [19, 8, -4], args: [1, 8, 1] },
      ],
    }),
    useRef<Group>(null)
  );

  return (
    <group ref={ref as any}>
      <mesh position={[0, 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[40, 4, 10]} />
        <meshStandardMaterial color="#3f3f46" />
      </mesh>
      <mesh position={[0, 4.5, -1]} castShadow receiveShadow>
        <boxGeometry args={[40, 1, 8]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <mesh position={[0, 5.5, -2]} castShadow receiveShadow>
        <boxGeometry args={[40, 1, 6]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      <mesh position={[0, 6.5, -3]} castShadow receiveShadow>
        <boxGeometry args={[40, 1, 4]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <mesh position={[0, 7.5, -4]} castShadow receiveShadow>
        <boxGeometry args={[40, 1, 2]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      <mesh position={[0, 12, -2]} castShadow receiveShadow>
        <boxGeometry args={[42, 0.5, 12]} />
        <meshStandardMaterial color="#f4f4f5" />
      </mesh>
      <mesh position={[-19, 8, -4]} castShadow receiveShadow>
        <boxGeometry args={[1, 8, 1]} />
        <meshStandardMaterial color="#71717a" />
      </mesh>
      <mesh position={[19, 8, -4]} castShadow receiveShadow>
        <boxGeometry args={[1, 8, 1]} />
        <meshStandardMaterial color="#71717a" />
      </mesh>
    </group>
  );
}

export function PitBuilding({ position, rotation = [0, 0, 0] }: any) {
  const [ref] = useCompoundBody(
    () => ({
      type: 'Static',
      position,
      rotation,
      shapes: [
        // Main building
        { type: 'Box', position: [0, 4, 0], args: [60, 8, 15] },
        // Overhang
        { type: 'Box', position: [0, 8, 5], args: [60, 1, 10] },
      ],
    }),
    useRef<Group>(null)
  );

  return (
    <group ref={ref as any}>
      <mesh position={[0, 4, 0]} castShadow receiveShadow>
        <boxGeometry args={[60, 8, 15]} />
        <meshStandardMaterial color="#e4e4e7" />
      </mesh>
      <mesh position={[0, 8, 5]} castShadow receiveShadow>
        <boxGeometry args={[60, 1, 10]} />
        <meshStandardMaterial color="#3f3f46" />
      </mesh>
      {/* Garage doors */}
      {[...Array(5)].map((_, i) => (
        <mesh key={i} position={[-20 + i * 10, 2, 7.51]} castShadow receiveShadow>
          <planeGeometry args={[8, 4]} />
          <meshStandardMaterial color="#18181b" />
        </mesh>
      ))}
    </group>
  );
}

export function InstancedHills({ hills }: any) {
  const ref = useRef<InstancedMesh>(null);

  useSphere(index => {
    if (!hills[index]) return { type: 'Static', position: [0, -1000, 0], args: [1] };
    return {
      type: 'Static',
      position: hills[index].position,
      args: [hills[index].radius]
    };
  });

  useEffect(() => {
    if (!ref.current) return;
    const dummy = new Object3D();
    const color = new Color();
    hills.forEach((hill: any, i: number) => {
      dummy.position.set(hill.position[0], hill.position[1], hill.position[2]);
      dummy.scale.set(hill.radius, hill.radius, hill.radius);
      dummy.updateMatrix();
      ref.current!.setMatrixAt(i, dummy.matrix);
      color.set(hill.color);
      ref.current!.setColorAt(i, color);
    });
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
  }, [hills]);

  if (hills.length === 0) return null;

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, hills.length]} receiveShadow castShadow>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial roughness={0.9} />
    </instancedMesh>
  );
}

export function Barrier({ position, rotation = [0, 0, 0], length = 100 }: any) {
  const [ref] = useBox(
    () => ({
      type: 'Static',
      position,
      rotation,
      args: [1, 2, length],
    }),
    useRef<Mesh>(null)
  );

  return (
    <mesh ref={ref} receiveShadow castShadow>
      <boxGeometry args={[1, 2, length]} />
      <meshStandardMaterial color="#ef4444" />
      {/* Add some white stripes */}
      <mesh position={[0.51, 0, 0]}>
        <planeGeometry args={[length, 0.5]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.51, 0, 0]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[length, 0.5]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </mesh>
  );
}

export function StartFinishLine({ position, rotation = [0, 0, 0], width = 24 }: any) {
  const tex = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, 512, 128);
      context.fillStyle = '#000000';
      for (let i = 0; i < 8; i++) {
        context.fillRect(i * 64, 0, 32, 64);
        context.fillRect(i * 64 + 32, 64, 32, 64);
      }
    }
    const t = new CanvasTexture(canvas);
    t.wrapS = RepeatWrapping;
    t.wrapT = RepeatWrapping;
    t.repeat.set(width / 4, 1);
    return t;
  }, [width]);

  return (
    <mesh position={position} rotation={rotation} receiveShadow>
      <planeGeometry args={[width, 4]} />
      <meshStandardMaterial map={tex} roughness={0.8} transparent opacity={0.9} />
    </mesh>
  );
}

export function InstancedTrees({ trees, biome = 'forest' }: any) {
  const leafColor = biome === 'winter' ? '#f8fafc' : biome === 'desert' ? '#a3e635' : '#065f46';
  const trunkColor = biome === 'winter' ? '#475569' : '#78350f';

  const trunkRef = useRef<InstancedMesh>(null);
  const leavesRef = useRef<InstancedMesh>(null);

  // Physics for trunks (we don't attach the ref to the mesh because we manage scale manually)
  useCylinder(index => {
    if (!trees[index]) return { type: 'Static', position: [0, -1000, 0], args: [0.2, 0.2, 2, 8] };
    return {
      type: 'Static',
      position: [trees[index].position[0], trees[index].position[1] + 1 * trees[index].scale, trees[index].position[2]],
      args: [0.2 * trees[index].scale, 0.2 * trees[index].scale, 2 * trees[index].scale, 8]
    };
  });

  useEffect(() => {
    if (!trunkRef.current || !leavesRef.current) return;
    const dummy = new Object3D();
    trees.forEach((tree: any, i: number) => {
      // Trunk
      dummy.position.set(tree.position[0], tree.position[1] + 1 * tree.scale, tree.position[2]);
      dummy.scale.set(tree.scale, tree.scale, tree.scale);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      trunkRef.current!.setMatrixAt(i, dummy.matrix);

      // Leaves
      dummy.position.set(tree.position[0], tree.position[1] + 2.5 * tree.scale, tree.position[2]);
      dummy.updateMatrix();
      leavesRef.current!.setMatrixAt(i, dummy.matrix);
    });
    trunkRef.current.instanceMatrix.needsUpdate = true;
    leavesRef.current.instanceMatrix.needsUpdate = true;
  }, [trees]);

  if (trees.length === 0) return null;

  return (
    <group>
      <instancedMesh ref={trunkRef} args={[undefined, undefined, trees.length]} castShadow receiveShadow frustumCulled>
        <cylinderGeometry args={[0.2, 0.2, 2, 8]} />
        <meshStandardMaterial color={trunkColor} />
      </instancedMesh>
      <instancedMesh ref={leavesRef} args={[undefined, undefined, trees.length]} castShadow receiveShadow frustumCulled>
        <sphereGeometry args={[1.5, 12, 12]} />
        <meshStandardMaterial color={leafColor} roughness={0.8} />
      </instancedMesh>
    </group>
  );
}

export function InstancedPineTrees({ trees, biome = 'forest' }: any) {
  const leafColor = biome === 'winter' ? '#f8fafc' : biome === 'desert' ? '#65a30d' : '#064e3b';
  const trunkColor = biome === 'winter' ? '#475569' : '#451a03';

  const trunkRef = useRef<InstancedMesh>(null);
  const leavesRef = useRef<InstancedMesh>(null);

  useCylinder(index => {
    if (!trees[index]) return { type: 'Static', position: [0, -1000, 0], args: [0.2, 0.2, 2, 8] };
    return {
      type: 'Static',
      position: [trees[index].position[0], trees[index].position[1] + 1 * trees[index].scale, trees[index].position[2]],
      args: [0.2 * trees[index].scale, 0.2 * trees[index].scale, 2 * trees[index].scale, 8]
    };
  });

  useEffect(() => {
    if (!trunkRef.current || !leavesRef.current) return;
    const dummy = new Object3D();
    trees.forEach((tree: any, i: number) => {
      dummy.position.set(tree.position[0], tree.position[1] + 1 * tree.scale, tree.position[2]);
      dummy.scale.set(tree.scale, tree.scale, tree.scale);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      trunkRef.current!.setMatrixAt(i, dummy.matrix);

      dummy.position.set(tree.position[0], tree.position[1] + 3 * tree.scale, tree.position[2]);
      dummy.scale.set(tree.scale, tree.scale, tree.scale);
      dummy.updateMatrix();
      leavesRef.current!.setMatrixAt(i, dummy.matrix);
    });
    trunkRef.current.instanceMatrix.needsUpdate = true;
    leavesRef.current.instanceMatrix.needsUpdate = true;
  }, [trees]);

  if (trees.length === 0) return null;

  return (
    <group>
      <instancedMesh ref={trunkRef} args={[undefined, undefined, trees.length]} castShadow receiveShadow frustumCulled>
        <cylinderGeometry args={[0.2, 0.2, 2, 8]} />
        <meshStandardMaterial color={trunkColor} />
      </instancedMesh>
      <instancedMesh ref={leavesRef} args={[undefined, undefined, trees.length]} castShadow receiveShadow frustumCulled>
        <coneGeometry args={[1.5, 4, 8]} />
        <meshStandardMaterial color={leafColor} roughness={0.9} />
      </instancedMesh>
    </group>
  );
}

export function InstancedDeadTrees({ trees, biome = 'forest' }: any) {
  const trunkColor = biome === 'winter' ? '#64748b' : biome === 'desert' ? '#78350f' : '#451a03';

  const trunkRef = useRef<InstancedMesh>(null);
  const branchRef1 = useRef<InstancedMesh>(null);
  const branchRef2 = useRef<InstancedMesh>(null);

  useCylinder(index => {
    if (!trees[index]) return { type: 'Static', position: [0, -1000, 0], args: [0.15, 0.2, 3, 8] };
    return {
      type: 'Static',
      position: [trees[index].position[0], trees[index].position[1] + 1.5 * trees[index].scale, trees[index].position[2]],
      args: [0.15 * trees[index].scale, 0.2 * trees[index].scale, 3 * trees[index].scale, 8]
    };
  });

  useEffect(() => {
    if (!trunkRef.current || !branchRef1.current || !branchRef2.current) return;
    const dummy = new Object3D();
    const euler = new Euler();
    trees.forEach((tree: any, i: number) => {
      dummy.position.set(tree.position[0], tree.position[1] + 1.5 * tree.scale, tree.position[2]);
      dummy.scale.set(tree.scale, tree.scale, tree.scale);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      trunkRef.current!.setMatrixAt(i, dummy.matrix);

      dummy.position.set(tree.position[0] + 0.5 * tree.scale, tree.position[1] + 2 * tree.scale, tree.position[2]);
      euler.set(0, 0, -Math.PI / 4);
      dummy.quaternion.setFromEuler(euler);
      dummy.updateMatrix();
      branchRef1.current!.setMatrixAt(i, dummy.matrix);

      dummy.position.set(tree.position[0] - 0.3 * tree.scale, tree.position[1] + 2.5 * tree.scale, tree.position[2] + 0.3 * tree.scale);
      euler.set(Math.PI / 4, Math.PI / 4, Math.PI / 4);
      dummy.quaternion.setFromEuler(euler);
      dummy.updateMatrix();
      branchRef2.current!.setMatrixAt(i, dummy.matrix);
    });
    trunkRef.current.instanceMatrix.needsUpdate = true;
    branchRef1.current.instanceMatrix.needsUpdate = true;
    branchRef2.current.instanceMatrix.needsUpdate = true;
  }, [trees]);

  if (trees.length === 0) return null;

  return (
    <group>
      <instancedMesh ref={trunkRef} args={[undefined, undefined, trees.length]} castShadow receiveShadow frustumCulled>
        <cylinderGeometry args={[0.1, 0.2, 3, 8]} />
        <meshStandardMaterial color={trunkColor} roughness={1} />
      </instancedMesh>
      <instancedMesh ref={branchRef1} args={[undefined, undefined, trees.length]} castShadow receiveShadow frustumCulled>
        <cylinderGeometry args={[0.05, 0.1, 1.5, 8]} />
        <meshStandardMaterial color={trunkColor} roughness={1} />
      </instancedMesh>
      <instancedMesh ref={branchRef2} args={[undefined, undefined, trees.length]} castShadow receiveShadow frustumCulled>
        <cylinderGeometry args={[0.05, 0.08, 1, 8]} />
        <meshStandardMaterial color={trunkColor} roughness={1} />
      </instancedMesh>
    </group>
  );
}

export function InstancedGrass({ grass, biome = 'forest' }: any) {
  const color = biome === 'winter' ? '#f1f5f9' : biome === 'desert' ? '#d97706' : '#15803d';

  const ref1 = useRef<InstancedMesh>(null);
  const ref2 = useRef<InstancedMesh>(null);

  useEffect(() => {
    if (!ref1.current || !ref2.current) return;
    const dummy = new Object3D();
    const euler = new Euler();
    grass.forEach((g: any, i: number) => {
      dummy.position.set(g.position[0], g.position[1] + 0.25 * g.scale, g.position[2]);
      dummy.scale.set(g.scale, g.scale, g.scale);
      euler.set(0, g.rotation[1], 0);
      dummy.quaternion.setFromEuler(euler);
      dummy.updateMatrix();
      ref1.current!.setMatrixAt(i, dummy.matrix);

      euler.set(0, g.rotation[1] + Math.PI / 2, 0);
      dummy.quaternion.setFromEuler(euler);
      dummy.updateMatrix();
      ref2.current!.setMatrixAt(i, dummy.matrix);
    });
    ref1.current.instanceMatrix.needsUpdate = true;
    ref2.current.instanceMatrix.needsUpdate = true;
  }, [grass]);

  if (grass.length === 0) return null;

  return (
    <group>
      <instancedMesh ref={ref1} args={[undefined, undefined, grass.length]} frustumCulled>
        <planeGeometry args={[0.5, 0.5]} />
        <meshStandardMaterial color={color} side={2} alphaTest={0.5} roughness={1} />
      </instancedMesh>
      <instancedMesh ref={ref2} args={[undefined, undefined, grass.length]} frustumCulled>
        <planeGeometry args={[0.5, 0.5]} />
        <meshStandardMaterial color={color} side={2} alphaTest={0.5} roughness={1} />
      </instancedMesh>
    </group>
  );
}

export function InstancedBushes({ bushes, biome = 'forest' }: any) {
  const color = biome === 'winter' ? '#e2e8f0' : biome === 'desert' ? '#d97706' : '#064e3b';

  const ref1 = useRef<InstancedMesh>(null);
  const ref2 = useRef<InstancedMesh>(null);
  const ref3 = useRef<InstancedMesh>(null);

  // No physics for bushes to save performance

  useEffect(() => {
    if (!ref1.current || !ref2.current || !ref3.current) return;
    const dummy = new Object3D();
    bushes.forEach((bush: any, i: number) => {
      const { position, scale } = bush;
      
      dummy.position.set(position[0], position[1] + 0.5 * scale, position[2]);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      ref1.current!.setMatrixAt(i, dummy.matrix);

      dummy.position.set(position[0] + 0.4 * scale, position[1] + 0.4 * scale, position[2] + 0.2 * scale);
      dummy.updateMatrix();
      ref2.current!.setMatrixAt(i, dummy.matrix);

      dummy.position.set(position[0] - 0.4 * scale, position[1] + 0.3 * scale, position[2] - 0.2 * scale);
      dummy.updateMatrix();
      ref3.current!.setMatrixAt(i, dummy.matrix);
    });
    ref1.current.instanceMatrix.needsUpdate = true;
    ref2.current.instanceMatrix.needsUpdate = true;
    ref3.current.instanceMatrix.needsUpdate = true;
  }, [bushes]);

  if (bushes.length === 0) return null;

  return (
    <group>
      <instancedMesh ref={ref1} args={[undefined, undefined, bushes.length]} frustumCulled>
        <sphereGeometry args={[0.8, 8, 8]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={ref2} args={[undefined, undefined, bushes.length]} frustumCulled>
        <sphereGeometry args={[0.6, 8, 8]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={ref3} args={[undefined, undefined, bushes.length]} frustumCulled>
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </instancedMesh>
    </group>
  );
}

export function InstancedRocks({ rocks, biome = 'forest' }: any) {
  const color = biome === 'winter' ? '#94a3b8' : biome === 'desert' ? '#b45309' : '#52525b';

  const ref = useRef<InstancedMesh>(null);

  useSphere(index => {
    if (!rocks[index]) return { type: 'Static', position: [0, -1000, 0], args: [1] };
    return {
      type: 'Static',
      position: rocks[index].position,
      args: [1 * rocks[index].scale]
    };
  });

  useEffect(() => {
    if (!ref.current) return;
    const dummy = new Object3D();
    const euler = new Euler();
    rocks.forEach((rock: any, i: number) => {
      dummy.position.set(rock.position[0], rock.position[1], rock.position[2]);
      dummy.scale.set(rock.scale, rock.scale, rock.scale);
      euler.set(rock.rotation[0], rock.rotation[1], rock.rotation[2]);
      dummy.quaternion.setFromEuler(euler);
      dummy.updateMatrix();
      ref.current!.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  }, [rocks]);

  if (rocks.length === 0) return null;

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, rocks.length]} castShadow receiveShadow frustumCulled>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </instancedMesh>
  );
}

const signTextureCache: Record<string, CanvasTexture> = {};

export function Sign({ position, rotation = [0, 0, 0], text = "DANGER" }: any) {
  const [ref] = useCompoundBody(
    () => ({
      type: 'Static',
      position,
      rotation,
      shapes: [
        { type: 'Cylinder', position: [0, 1, 0], args: [0.1, 0.1, 2, 8] },
        { type: 'Box', position: [0, 2, 0], args: [2, 1, 0.2] },
      ],
    }),
    useRef<Group>(null)
  );

  const tex = useMemo(() => {
    if (signTextureCache[text]) return signTextureCache[text];
    
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = '#facc15';
      context.fillRect(0, 0, 256, 128);
      context.fillStyle = '#000000';
      context.font = 'bold 48px sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(text, 128, 64);
      
      // Border
      context.lineWidth = 8;
      context.strokeRect(4, 4, 248, 120);
    }
    const t = new CanvasTexture(canvas);
    signTextureCache[text] = t;
    return t;
  }, [text]);

  return (
    <group ref={ref as any}>
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.1, 0.1, 2, 8]} />
        <meshStandardMaterial color="#71717a" />
      </mesh>
      <mesh position={[0, 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 1, 0.2]} />
        <meshStandardMaterial color="#facc15" />
      </mesh>
      <mesh position={[0, 2, 0.11]} receiveShadow>
        <planeGeometry args={[1.9, 0.9]} />
        <meshStandardMaterial map={tex} roughness={0.5} />
      </mesh>
      <mesh position={[0, 2, -0.11]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[1.9, 0.9]} />
        <meshStandardMaterial map={tex} roughness={0.5} />
      </mesh>
    </group>
  );
}

export function AnimatedFlag({ position, color = "#ef4444" }: any) {
  const flagRef = useRef<Mesh>(null);
  
  useFrame(({ clock }) => {
    if (flagRef.current) {
      const time = clock.getElapsedTime();
      const positions = flagRef.current?.geometry?.attributes?.position;
      if (!positions) return;
      
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        // Only animate the right side of the flag
        if (x > 0) {
          const z = Math.sin(time * 5 + x * 2) * 0.2 * x;
          positions.setZ(i, z);
        }
      }
      positions.needsUpdate = true;
    }
  });

  return (
    <group position={position}>
      {/* Pole */}
      <mesh position={[0, 3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.05, 6, 8]} />
        <meshStandardMaterial color="#d4d4d8" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Flag */}
      <mesh ref={flagRef} position={[1, 5, 0]} castShadow>
        <planeGeometry args={[2, 1.5, 5, 5]} />
        <meshStandardMaterial color={color} side={2} roughness={0.8} />
      </mesh>
    </group>
  );
}

export function InstancedStreetLights({ streetlights }: any) {
  const poleRef = useRef<InstancedMesh>(null);
  const headRef = useRef<InstancedMesh>(null);
  const lightRef = useRef<InstancedMesh>(null);

  // We can use a single compound body for each streetlight or just simple boxes
  // To keep it simple, we'll just add a cylinder collider for the pole
  useCylinder(index => {
    if (!streetlights[index]) return { type: 'Static', position: [0, -1000, 0], args: [0.2, 0.2, 8, 8] };
    return {
      type: 'Static',
      position: [streetlights[index].position[0], streetlights[index].position[1] + 4, streetlights[index].position[2]],
      rotation: streetlights[index].rotation,
      args: [0.2, 0.2, 8, 8]
    };
  });

  useEffect(() => {
    if (!poleRef.current || !headRef.current || !lightRef.current) return;
    const dummy = new Object3D();
    const euler = new Euler();
    
    streetlights.forEach((sl: any, i: number) => {
      euler.set(sl.rotation[0], sl.rotation[1], sl.rotation[2]);
      
      // Pole
      dummy.position.set(sl.position[0], sl.position[1] + 4, sl.position[2]);
      dummy.quaternion.setFromEuler(euler);
      dummy.updateMatrix();
      poleRef.current!.setMatrixAt(i, dummy.matrix);
      
      // Head
      dummy.position.set(0, 4, 0); // relative to pole center
      dummy.position.applyEuler(euler);
      dummy.position.add(new Vector3(sl.position[0], sl.position[1] + 4, sl.position[2]));
      
      // Actually, it's easier to just use a parent dummy
      const parentDummy = new Object3D();
      parentDummy.position.set(sl.position[0], sl.position[1], sl.position[2]);
      parentDummy.rotation.set(sl.rotation[0], sl.rotation[1], sl.rotation[2]);
      parentDummy.updateMatrixWorld();
      
      const headDummy = new Object3D();
      headDummy.position.set(1.5, 8, 0);
      parentDummy.add(headDummy);
      parentDummy.updateMatrixWorld();
      headRef.current!.setMatrixAt(i, headDummy.matrixWorld);
      
      const lightDummy = new Object3D();
      lightDummy.position.set(2.8, 7.9, 0);
      parentDummy.add(lightDummy);
      parentDummy.updateMatrixWorld();
      lightRef.current!.setMatrixAt(i, lightDummy.matrixWorld);
    });
    
    poleRef.current.instanceMatrix.needsUpdate = true;
    headRef.current.instanceMatrix.needsUpdate = true;
    lightRef.current.instanceMatrix.needsUpdate = true;
  }, [streetlights]);

  if (streetlights.length === 0) return null;

  return (
    <group>
      <instancedMesh ref={poleRef} args={[undefined, undefined, streetlights.length]} castShadow receiveShadow frustumCulled>
        <cylinderGeometry args={[0.2, 0.2, 8, 8]} />
        <meshStandardMaterial color="#3f3f46" />
      </instancedMesh>
      <instancedMesh ref={headRef} args={[undefined, undefined, streetlights.length]} castShadow receiveShadow frustumCulled>
        <boxGeometry args={[3, 0.2, 0.4]} />
        <meshStandardMaterial color="#3f3f46" />
      </instancedMesh>
      <instancedMesh ref={lightRef} args={[undefined, undefined, streetlights.length]} frustumCulled>
        <boxGeometry args={[0.4, 0.1, 0.3]} />
        <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={2} />
      </instancedMesh>
    </group>
  );
}

export function InstancedBenches({ benches }: any) {
  const seatRef = useRef<InstancedMesh>(null);
  const legRef = useRef<InstancedMesh>(null);

  useBox(index => {
    if (!benches[index]) return { type: 'Static', position: [0, -1000, 0], args: [1, 1, 1] };
    return {
      type: 'Static',
      position: [benches[index].position[0], benches[index].position[1] + 0.25, benches[index].position[2]],
      rotation: benches[index].rotation,
      args: [2, 0.5, 0.6]
    };
  });

  useEffect(() => {
    if (!seatRef.current || !legRef.current) return;
    const parentDummy = new Object3D();
    
    benches.forEach((bench: any, i: number) => {
      parentDummy.position.set(...bench.position as [number, number, number]);
      parentDummy.rotation.set(...bench.rotation as [number, number, number]);
      parentDummy.updateMatrixWorld();
      
      const seatDummy = new Object3D();
      seatDummy.position.set(0, 0.5, 0);
      parentDummy.add(seatDummy);
      seatDummy.updateMatrixWorld();
      seatRef.current!.setMatrixAt(i, seatDummy.matrixWorld);
      parentDummy.remove(seatDummy);

      const legDummy1 = new Object3D();
      legDummy1.position.set(-0.8, 0.25, 0);
      parentDummy.add(legDummy1);
      legDummy1.updateMatrixWorld();
      legRef.current!.setMatrixAt(i * 2, legDummy1.matrixWorld);
      parentDummy.remove(legDummy1);

      const legDummy2 = new Object3D();
      legDummy2.position.set(0.8, 0.25, 0);
      parentDummy.add(legDummy2);
      legDummy2.updateMatrixWorld();
      legRef.current!.setMatrixAt(i * 2 + 1, legDummy2.matrixWorld);
      parentDummy.remove(legDummy2);
    });
    
    seatRef.current.instanceMatrix.needsUpdate = true;
    legRef.current.instanceMatrix.needsUpdate = true;
  }, [benches]);

  if (benches.length === 0) return null;

  return (
    <group>
      <instancedMesh ref={seatRef} args={[undefined, undefined, benches.length]} castShadow receiveShadow frustumCulled>
        <boxGeometry args={[2, 0.1, 0.6]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </instancedMesh>
      <instancedMesh ref={legRef} args={[undefined, undefined, benches.length * 2]} castShadow receiveShadow frustumCulled>
        <boxGeometry args={[0.1, 0.5, 0.6]} />
        <meshStandardMaterial color="#3f3f46" roughness={0.6} />
      </instancedMesh>
    </group>
  );
}

export function InstancedTrashCans({ trashCans }: any) {
  const ref = useRef<InstancedMesh>(null);

  useCylinder(index => {
    if (!trashCans[index]) return { type: 'Static', position: [0, -1000, 0], args: [0.3, 0.3, 1, 16] };
    return {
      type: 'Static',
      position: trashCans[index].position,
      rotation: trashCans[index].rotation,
      args: [0.3, 0.3, 1, 16]
    };
  });

  useEffect(() => {
    if (!ref.current) return;
    const dummy = new Object3D();
    trashCans.forEach((can: any, i: number) => {
      dummy.position.set(...can.position as [number, number, number]);
      dummy.rotation.set(...can.rotation as [number, number, number]);
      dummy.updateMatrix();
      ref.current!.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  }, [trashCans]);

  if (trashCans.length === 0) return null;

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, trashCans.length]} castShadow receiveShadow frustumCulled>
      <cylinderGeometry args={[0.3, 0.3, 1, 16]} />
      <meshStandardMaterial color="#3f3f46" roughness={0.7} metalness={0.5} />
    </instancedMesh>
  );
}

export function InstancedBuildings({ buildings }: any) {
  const ref = useRef<InstancedMesh>(null);

  useBox(index => {
    if (!buildings[index]) return { type: 'Static', position: [0, -1000, 0], args: [1, 1, 1] };
    return {
      type: 'Static',
      position: buildings[index].position,
      rotation: buildings[index].rotation,
      args: buildings[index].scale
    };
  });

  useEffect(() => {
    if (!ref.current) return;
    const dummy = new Object3D();
    const euler = new Euler();
    const color = new Color();
    buildings.forEach((building: any, i: number) => {
      dummy.position.set(building.position[0], building.position[1], building.position[2]);
      dummy.scale.set(building.scale[0], building.scale[1], building.scale[2]);
      euler.set(building.rotation[0], building.rotation[1], building.rotation[2]);
      dummy.quaternion.setFromEuler(euler);
      dummy.updateMatrix();
      ref.current!.setMatrixAt(i, dummy.matrix);
      color.set(building.color);
      ref.current!.setColorAt(i, color);
    });
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
  }, [buildings]);

  if (buildings.length === 0) return null;

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, buildings.length]} castShadow receiveShadow frustumCulled>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.8} />
    </instancedMesh>
  );
}

export function Billboard({ position, rotation = [0, 0, 0], text = "ADVERTISEMENT" }: any) {
  const [ref] = useCompoundBody(
    () => ({
      type: 'Static',
      position,
      rotation,
      shapes: [
        { type: 'Cylinder', position: [-4, 5, 0], args: [0.3, 0.3, 10, 8] },
        { type: 'Cylinder', position: [4, 5, 0], args: [0.3, 0.3, 10, 8] },
        { type: 'Box', position: [0, 12, 0], args: [12, 6, 0.5] }
      ],
    }),
    useRef<Group>(null)
  );

  return (
    <group ref={ref as any}>
      <mesh position={[-4, 5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.3, 10, 8]} />
        <meshStandardMaterial color="#71717a" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[4, 5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.3, 10, 8]} />
        <meshStandardMaterial color="#71717a" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, 12, 0]} castShadow receiveShadow>
        <boxGeometry args={[12, 6, 0.5]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <Text
        position={[0, 12, 0.26]}
        fontSize={1.5}
        color="#000000"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#ffffff"
      >
        {text}
      </Text>
    </group>
  );
}

export function InstancedRoads({ roads }: any) {
  return (
    <group>
      {roads.map((road: any, i: number) => (
        <Road key={i} {...road} />
      ))}
    </group>
  );
}

export function FieldEnvironment({ 
  seed = 12345, 
  treeDensity = 1, 
  rockDensity = 1, 
  roadLayout = 'grid',
  biome = 'forest',
  waterLevel = -5,
  worldHeight = 1,
  worldRoughness = 1
}: any) {
  const { trees, pineTrees, deadTrees, grass, bushes, rocks, signs, flags, roads, streetlights, bridges, tunnels, buildings, billboards } = useMemo(() => {
    const trees: any[] = [];
    const pineTrees: any[] = [];
    const deadTrees: any[] = [];
    const grass: any[] = [];
    const bushes: any[] = [];
    const rocks: any[] = [];
    const signs: any[] = [];
    const flags: any[] = [];
    const roads: any[] = [];
    const streetlights: any[] = [];
    const benches: any[] = [];
    const trashCans: any[] = [];
    const bridges: any[] = [];
    const tunnels: any[] = [];
    const buildings: any[] = [];
    const billboards: any[] = [];
    
    // Seeded random for consistent placement
    let seedVal = seed;
    const random = () => {
      const x = Math.sin(seedVal++) * 10000;
      return x - Math.floor(x);
    };

    // Noise for forests
    let fSeed = seed + 123;
    const fRandom = () => {
      const x = Math.sin(fSeed++) * 10000;
      return x - Math.floor(x);
    };
    const treeNoise2D = createNoise2D(fRandom);

    const roadWidth = 20;
    const roadMargin = 14;

    let realisticNetwork: any = null;
    const terrainGenerator = createTerrainGenerator(seed, worldHeight, worldRoughness, waterLevel);
    let roadSegments: any[] = [];

    if (roadLayout === 'realistic') {
      const network = generateRoadNetwork(seed, worldHeight, worldRoughness, waterLevel);
      const maxDist = 20; // Math.sqrt(400)
      realisticNetwork = {
        ...network,
        segments: network.segments.map(seg => ({
          ...seg,
          minX: Math.min(seg.p1.x, seg.p2.x) - maxDist,
          maxX: Math.max(seg.p1.x, seg.p2.x) + maxDist,
          minZ: Math.min(seg.p1.z, seg.p2.z) - maxDist,
          maxZ: Math.max(seg.p1.z, seg.p2.z) + maxDist,
        }))
      };
      roadSegments = realisticNetwork.segments;
    } else {
      const verticalRoads = roadLayout === 'grid' ? [-200, 0, 200] : roadLayout === 'cross' ? [0] : [];
      const horizontalRoads = roadLayout === 'grid' ? [-200, 0, 200] : roadLayout === 'cross' ? [0] : [];
      const maxDist = 20;
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

    const isPointOnRoad = (x: number, z: number) => {
      for (const seg of roadSegments) {
        if (x < seg.minX || x > seg.maxX || z < seg.minZ || z > seg.maxZ) continue;
        if (distToSegmentSquared({x, z}, {x: seg.p1.x, z: seg.p1.z}, {x: seg.p2.x, z: seg.p2.z}) < 400) {
          return true;
        }
      }
      return false;
    };

    if (roadLayout === 'realistic' && realisticNetwork) {
      for (const seg of realisticNetwork.segments) {
        const dx = seg.p2.x - seg.p1.x;
        const dz = seg.p2.z - seg.p1.z;
        const dy = seg.p2.y - seg.p1.y;
        const length = Math.sqrt(dx*dx + dz*dz + dy*dy);
        const angleY = Math.atan2(dx, dz);
        const angleX = Math.atan2(dy, Math.sqrt(dx*dx + dz*dz));
        
        const midX = (seg.p1.x + seg.p2.x) / 2;
        const midY = (seg.p1.y + seg.p2.y) / 2;
        const midZ = (seg.p1.z + seg.p2.z) / 2;
        
        if (seg.type === 'bridge') {
          bridges.push({ position: [midX, midY - 10, midZ], rotation: [angleX, angleY, 0], length, width: 20, height: 10 });
        } else if (seg.type === 'tunnel') {
          tunnels.push({ position: [midX, midY, midZ], rotation: [angleX, angleY, 0], length, width: 20, height: 10 });
          roads.push({ position: [midX, midY + 0.02, midZ], rotation: [angleX, angleY, 0], length, width: 20 });
        } else {
          roads.push({ position: [midX, midY + 0.02, midZ], rotation: [angleX, angleY, 0], length, width: 20 });
          
          if (random() > 0.9) {
            streetlights.push({
              position: [midX + Math.cos(angleY) * 12, midY, midZ - Math.sin(angleY) * 12],
              rotation: [0, angleY + Math.PI / 2, 0]
            });
          }

          if (random() > 0.92) {
            benches.push({
              position: [midX + Math.cos(angleY) * 12, midY, midZ - Math.sin(angleY) * 12],
              rotation: [0, angleY, 0]
            });
          }

          if (random() > 0.94) {
            trashCans.push({
              position: [midX - Math.cos(angleY) * 12, midY + 0.5, midZ + Math.sin(angleY) * 12],
              rotation: [0, 0, 0]
            });
          }

          if (random() > 0.9) {
            signs.push({
              position: [midX - Math.cos(angleY) * 12, midY, midZ + Math.sin(angleY) * 12],
              rotation: [0, angleY - Math.PI / 2, 0],
              text: ["DANGER", "SLOW", "TURN", "BUMP", "YIELD"][Math.floor(random() * 5)]
            });
          }
          
          if (random() > 0.95) {
            billboards.push({
              position: [midX + Math.cos(angleY) * 20, midY, midZ - Math.sin(angleY) * 20],
              rotation: [0, angleY + Math.PI / 2, 0],
              text: ["DRIVE SAFE", "BUY MORE", "SPEED UP", "SLOW DOWN"][Math.floor(random() * 4)]
            });
          }
          
          if (random() > 0.98) {
            buildings.push({
              position: [midX + Math.cos(angleY) * 30, midY + 10, midZ - Math.sin(angleY) * 30],
              rotation: [0, angleY, 0],
              scale: [10 + random() * 10, 20 + random() * 40, 10 + random() * 10],
              color: ["#e2e8f0", "#cbd5e1", "#94a3b8", "#64748b"][Math.floor(random() * 4)]
            });
          }
        }
      }
    } else {
      // Define road network
      const verticalRoads = roadLayout === 'grid' ? [-200, 0, 200] : roadLayout === 'cross' ? [0] : [];
      const horizontalRoads = roadLayout === 'grid' ? [-200, 0, 200] : roadLayout === 'cross' ? [0] : [];

      const signTexts = ["DANGER", "SLOW", "TURN", "BUMP", "YIELD"];

      // Populate along roads
      const addPropsAlongRoad = (isVertical: boolean, center: number) => {
        for (let i = -1000; i <= 1000; i += 50) {
          // Skip intersections
          const isIntersection = (isVertical ? horizontalRoads : verticalRoads).some(cross => Math.abs(i - cross) < 30);
          if (isIntersection) continue;

          const x = isVertical ? center : i;
          const z = isVertical ? i : center;
          
          // Streetlights
          if (Math.abs(i) % 100 === 0) {
            const sx = isVertical ? x + 12 : x;
            const sz = isVertical ? z : z + 12;
            const sy = terrainGenerator.getCarvedHeight(sx, sz, roadSegments);
            streetlights.push({
              position: [sx, sy, sz],
              rotation: [0, isVertical ? Math.PI : Math.PI / 2, 0]
            });
          }

          // Benches
          if (Math.abs(i) % 60 === 0 && random() > 0.4) {
            const sx = isVertical ? x + 12 : x;
            const sz = isVertical ? z : z + 12;
            const sy = terrainGenerator.getCarvedHeight(sx, sz, roadSegments);
            benches.push({
              position: [sx, sy, sz],
              rotation: [0, isVertical ? Math.PI / 2 : 0, 0]
            });
          }

          // Trash Cans
          if (Math.abs(i) % 80 === 0 && random() > 0.5) {
            const sx = isVertical ? x - 12 : x;
            const sz = isVertical ? z : z - 12;
            const sy = terrainGenerator.getCarvedHeight(sx, sz, roadSegments);
            trashCans.push({
              position: [sx, sy + 0.5, sz],
              rotation: [0, 0, 0]
            });
          }

          // Signs
          if (random() > 0.7) {
            const sx = isVertical ? x - 12 : x;
            const sz = isVertical ? z : z - 12;
            const sy = terrainGenerator.getCarvedHeight(sx, sz, roadSegments);
            signs.push({
              position: [sx, sy, sz],
              rotation: [0, isVertical ? 0 : -Math.PI / 2, 0],
              text: signTexts[Math.floor(random() * signTexts.length)]
            });
          }
          
          // Billboards
          if (Math.abs(i) % 400 === 0 && random() > 0.5) {
            const sx = isVertical ? x + 20 : x;
            const sz = isVertical ? z : z + 20;
            const sy = terrainGenerator.getCarvedHeight(sx, sz, roadSegments);
            billboards.push({
              position: [sx, sy, sz],
              rotation: [0, isVertical ? Math.PI : Math.PI / 2, 0],
              text: ["DRIVE SAFE", "BUY MORE", "SPEED UP", "SLOW DOWN"][Math.floor(random() * 4)]
            });
          }
          
          // Buildings
          if (Math.abs(i) % 200 === 0 && random() > 0.7) {
            const sx = isVertical ? x - 30 : x;
            const sz = isVertical ? z : z - 30;
            const sy = terrainGenerator.getCarvedHeight(sx, sz, roadSegments) + 10;
            buildings.push({
              position: [sx, sy, sz],
              rotation: [0, isVertical ? 0 : -Math.PI / 2, 0],
              scale: [10 + random() * 10, 20 + random() * 40, 10 + random() * 10],
              color: ["#e2e8f0", "#cbd5e1", "#94a3b8", "#64748b"][Math.floor(random() * 4)]
            });
          }
        }
      };

      verticalRoads.forEach(x => {
        roads.push({ position: [x, 0.01, 0], rotation: [0, 0, 0], length: 2048, width: roadWidth });
      });
      horizontalRoads.forEach(z => {
        roads.push({ position: [0, 0.02, z], rotation: [0, Math.PI / 2, 0], length: 2048, width: roadWidth });
      });

      verticalRoads.forEach(x => addPropsAlongRoad(true, x));
      horizontalRoads.forEach(z => addPropsAlongRoad(false, z));
    }

    // Generate trees
    for (let i = 0; i < 4000 * treeDensity; i++) {
      const x = (random() - 0.5) * 2048;
      const z = (random() - 0.5) * 2048;
      
      const density = treeNoise2D(x * 0.005, z * 0.005) * 0.5 + 0.5;
      if (random() > density) continue;

      if (!isPointOnRoad(x, z) && Math.sqrt(x*x + z*z) > 40) {
        const y = terrainGenerator.getCarvedHeight(x, z, roadSegments);
        if (y < waterLevel + 1) continue; // Don't spawn underwater
        
        const scale = 1 + random() * 3;
        const treeTypeRand = random();
        
        if (biome === 'winter') {
           if (treeTypeRand < 0.8) pineTrees.push({ position: [x, y, z], scale });
           else deadTrees.push({ position: [x, y, z], scale });
        } else if (biome === 'desert') {
           if (treeTypeRand < 0.2) trees.push({ position: [x, y, z], scale });
           else deadTrees.push({ position: [x, y, z], scale });
        } else {
           if (treeTypeRand < 0.5) trees.push({ position: [x, y, z], scale });
           else if (treeTypeRand < 0.95) pineTrees.push({ position: [x, y, z], scale });
           else deadTrees.push({ position: [x, y, z], scale });
        }
      }
    }

    // Generate grass
    for (let i = 0; i < 10000 * treeDensity; i++) {
      const x = (random() - 0.5) * 2048;
      const z = (random() - 0.5) * 2048;
      
      const density = treeNoise2D(x * 0.01, z * 0.01) * 0.5 + 0.5;
      if (random() > density + 0.2) continue;

      if (!isPointOnRoad(x, z) && Math.sqrt(x*x + z*z) > 40) {
        const y = terrainGenerator.getCarvedHeight(x, z, roadSegments);
        if (y < waterLevel + 0.5) continue;
        grass.push({ position: [x, y, z], scale: 0.5 + random() * 1.5, rotation: [0, random() * Math.PI, 0] });
      }
    }

    // Generate bushes
    for (let i = 0; i < 2000 * treeDensity; i++) {
      const x = (random() - 0.5) * 2048;
      const z = (random() - 0.5) * 2048;
      if (!isPointOnRoad(x, z) && Math.sqrt(x*x + z*z) > 20) {
        const y = terrainGenerator.getCarvedHeight(x, z, roadSegments);
        if (y < waterLevel) continue;
        bushes.push({ position: [x, y, z], scale: 0.5 + random() * 1.5 });
      }
    }

    // Generate rocks
    for (let i = 0; i < 1000 * rockDensity; i++) {
      const x = (random() - 0.5) * 2048;
      const z = (random() - 0.5) * 2048;
      if (!isPointOnRoad(x, z) && Math.sqrt(x*x + z*z) > 30) {
        const y = terrainGenerator.getCarvedHeight(x, z, roadSegments);
        
        // Cluster rocks
        const numRocksInCluster = Math.floor(random() * 3) + 1;
        for (let j = 0; j < numRocksInCluster; j++) {
            const rx = x + (random() - 0.5) * 5;
            const rz = z + (random() - 0.5) * 5;
            if (!isPointOnRoad(rx, rz)) {
                const ry = terrainGenerator.getCarvedHeight(rx, rz, roadSegments);
                rocks.push({ 
                  position: [rx, ry - 0.2, rz], 
                  scale: 0.2 + random() * 2.5,
                  rotation: [random() * Math.PI, random() * Math.PI, random() * Math.PI]
                });
            }
        }
      }
    }

    // Generate flags
    const flagColors = ["#ef4444", "#3b82f6", "#eab308", "#22c55e", "#a855f7"];
    for (let i = 0; i < 50; i++) {
      const x = (random() - 0.5) * 2048;
      const z = (random() - 0.5) * 2048;
      if (!isPointOnRoad(x, z) && Math.sqrt(x*x + z*z) > 30) {
        const y = terrainGenerator.getCarvedHeight(x, z, roadSegments);
        if (y < waterLevel) continue;
        flags.push({ 
          position: [x, y, z], 
          color: flagColors[Math.floor(random() * flagColors.length)]
        });
      }
    }

    return { trees, pineTrees, deadTrees, grass, bushes, rocks, signs, flags, roads, streetlights, bridges, tunnels, buildings, billboards };
  }, [seed, treeDensity, rockDensity, roadLayout, biome, waterLevel, worldHeight, worldRoughness]);

  return (
    <group>
      {waterLevel > -100 && (
        <mesh position={[0, waterLevel, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[2500, 2500]} />
          <meshStandardMaterial color={biome === 'winter' ? '#bae6fd' : '#0ea5e9'} transparent opacity={0.8} roughness={0.1} metalness={0.8} />
        </mesh>
      )}
      <InstancedRoads roads={roads} />
      {bridges.map((b, i) => <Bridge key={`bridge-${i}`} {...b} />)}
      {tunnels.map((t, i) => <Tunnel key={`tunnel-${i}`} {...t} />)}
      <InstancedRocks rocks={rocks} biome={biome} />
      <InstancedTrees trees={trees} biome={biome} />
      <InstancedPineTrees trees={pineTrees} biome={biome} />
      <InstancedDeadTrees trees={deadTrees} biome={biome} />
      <InstancedGrass grass={grass} biome={biome} />
      <InstancedBushes bushes={bushes} biome={biome} />
      {signs.map((s, i) => <Sign key={`sign-${i}`} {...s} />)}
      {flags.map((f, i) => <AnimatedFlag key={`flag-${i}`} {...f} />)}
      <InstancedStreetLights streetlights={streetlights} />
      <InstancedBuildings buildings={buildings} />
      {billboards.map((b, i) => <Billboard key={`billboard-${i}`} {...b} />)}
    </group>
  );
}

export function Road({ position = [0, 0, 0], rotation = [0, 0, 0], length = 1000, width = 16 }: any) {
  const sidewalkWidth = 2.5;
  const sidewalkHeight = 0.08; // subtle lip
  const roadWidth = width - sidewalkWidth * 2;

  const [ref] = useCompoundBody(
    () => ({
      type: 'Static',
      position,
      rotation,
      shapes: [
        { type: 'Box', position: [-(roadWidth / 2 + sidewalkWidth / 2), sidewalkHeight / 2, 0], args: [sidewalkWidth, sidewalkHeight, length] },
        { type: 'Box', position: [(roadWidth / 2 + sidewalkWidth / 2), sidewalkHeight / 2, 0], args: [sidewalkWidth, sidewalkHeight, length] },
      ],
    }),
    useRef<Group>(null)
  );

  const lineTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = '#1a1a1a'; // Dark asphalt
      context.fillRect(0, 0, 512, 512);
      
      // Left Kerb (alternating red and white)
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, 32, 256);
      context.fillStyle = '#ef4444';
      context.fillRect(0, 256, 32, 256);

      // Right Kerb (alternating red and white)
      context.fillStyle = '#ffffff';
      context.fillRect(480, 0, 32, 256);
      context.fillStyle = '#ef4444';
      context.fillRect(480, 256, 32, 256);

      // White edge lines inside kerbs
      context.fillStyle = '#ffffff';
      context.fillRect(32, 0, 8, 512);
      context.fillRect(472, 0, 8, 512);
    }
    const tex = new CanvasTexture(canvas);
    tex.wrapS = RepeatWrapping;
    tex.wrapT = RepeatWrapping;
    tex.repeat.set(1, length / 10);
    tex.anisotropy = 16;
    return tex;
  }, [length]);

  return (
    <group ref={ref as any}>
      {/* Road Surface */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[roadWidth, length]} />
        <meshStandardMaterial map={lineTexture} roughness={0.8} />
      </mesh>
      
      {/* Left Sidewalk */}
      <mesh position={[-(roadWidth / 2 + sidewalkWidth / 2), sidewalkHeight / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[sidewalkWidth, sidewalkHeight, length]} />
        <meshStandardMaterial color="#555555" roughness={0.9} />
      </mesh>

      {/* Right Sidewalk */}
      <mesh position={[(roadWidth / 2 + sidewalkWidth / 2), sidewalkHeight / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[sidewalkWidth, sidewalkHeight, length]} />
        <meshStandardMaterial color="#555555" roughness={0.9} />
      </mesh>
    </group>
  );
}
