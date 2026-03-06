import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshStandardMaterial, MeshPhysicalMaterial, PointLight, BoxGeometry, CylinderGeometry } from 'three';
import { debugData } from './store';

// Shared geometries and materials for performance
const sharedMaterials = {
  glass: new MeshStandardMaterial({ color: "#050505", roughness: 0.05, metalness: 0.9, transparent: true, opacity: 0.8 }),
  chrome: new MeshStandardMaterial({ color: "#ffffff", roughness: 0.1, metalness: 1.0 }),
  rubber: new MeshStandardMaterial({ color: "#111111", roughness: 0.9, metalness: 0.1 }),
  sovietBody: new MeshStandardMaterial({ color: "#d4d4ce", roughness: 0.4, metalness: 0.3 }),
  euroBody: new MeshStandardMaterial({ color: "#fef08a", roughness: 0.3, metalness: 0.4 }),
  sportsBody: new MeshPhysicalMaterial({ color: "#ef4444", roughness: 0.2, metalness: 0.6, clearcoat: 1.0, clearcoatRoughness: 0.1 }),
  muscleBody: new MeshPhysicalMaterial({ color: "#3b82f6", roughness: 0.25, metalness: 0.5, clearcoat: 0.8 }),
  volvoBody: new MeshStandardMaterial({ color: "#f8fafc", roughness: 0.3, metalness: 0.4 }),
  cyberBody: new MeshPhysicalMaterial({ color: "#18181b", metalness: 0.9, roughness: 0.1, clearcoat: 1.0 }),
  cyberAccent: new MeshStandardMaterial({ color: "#06b6d4", emissive: "#06b6d4", emissiveIntensity: 2 }),
  truckBody: new MeshStandardMaterial({ color: "#166534", roughness: 0.6, metalness: 0.2 }),
  f1Body: new MeshPhysicalMaterial({ color: "#dc2626", metalness: 0.5, roughness: 0.2, clearcoat: 1.0 }),
};

function BrakeLight({ position, args, geometry: Geometry = 'boxGeometry', rotation }: any) {
  const materialRef = useRef<MeshStandardMaterial>(null);
  const lightRef = useRef<PointLight>(null);
  
  useFrame(() => {
    const isBraking = debugData.isBraking;
    const intensity = isBraking ? 4 : 0.5;
    if (materialRef.current) {
      materialRef.current.emissiveIntensity = intensity;
    }
    if (lightRef.current) {
      lightRef.current.intensity = isBraking ? 2 : 0;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow receiveShadow>
        {Geometry === 'boxGeometry' ? <boxGeometry args={args} /> : <cylinderGeometry args={args} />}
        <meshStandardMaterial ref={materialRef} color="#dc2626" emissive="#ff0000" toneMapped={false} />
      </mesh>
      <pointLight ref={lightRef} color="#ff0000" distance={5} decay={2} />
    </group>
  );
}

function HeadLight({ position, args, geometry: Geometry = 'boxGeometry', rotation }: any) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow receiveShadow>
        {Geometry === 'boxGeometry' ? <boxGeometry args={args} /> : <cylinderGeometry args={args} />}
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} toneMapped={false} />
      </mesh>
      <spotLight 
        position={[0, 0, 0]} 
        target-position={[0, 0, 10]} 
        color="#ffffff" 
        intensity={5} 
        distance={40} 
        angle={Math.PI / 4} 
        penumbra={0.5} 
        decay={1.5} 
        castShadow 
      />
    </group>
  );
}

export function SovietClassic({ damage = 0 }: { damage?: number }) {
  return (
    <>
      {/* Main Body */}
      <mesh position={[0, -0.2, 0]} scale={[1, 1, 1 - damage * 0.1]} castShadow receiveShadow material={sharedMaterials.sovietBody}>
        <boxGeometry args={[1.65, 0.45, 4.1]} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.25, -0.2]} castShadow receiveShadow material={sharedMaterials.sovietBody}>
        <boxGeometry args={[1.35, 0.45, 1.8]} />
      </mesh>
      {/* Windows */}
      <mesh position={[0, 0.25, -0.2]} castShadow receiveShadow material={sharedMaterials.glass}>
        <boxGeometry args={[1.4, 0.35, 1.85]} />
      </mesh>
      {/* Grille */}
      <mesh position={[0, -0.15, 2.06]} castShadow receiveShadow material={sharedMaterials.glass}>
        <boxGeometry args={[1.2, 0.25, 0.05]} />
      </mesh>
      {/* Headlights (Round) */}
      {damage < 0.6 && <HeadLight position={[0.5, -0.15, 2.08]} rotation={[Math.PI / 2, 0, 0]} args={[0.12, 0.12, 0.05, 16]} geometry="cylinderGeometry" />}
      {damage < 0.9 && <HeadLight position={[-0.5, -0.15, 2.08]} rotation={[Math.PI / 2, 0, 0]} args={[0.12, 0.12, 0.05, 16]} geometry="cylinderGeometry" />}
      {/* Chrome Bumpers */}
      <mesh position={[0, -0.35 - damage * 0.1, 2.1]} rotation={[damage * 0.4, damage * 0.1, 0]} castShadow receiveShadow material={sharedMaterials.chrome}>
        <boxGeometry args={[1.7, 0.1, 0.15]} />
      </mesh>
      <mesh position={[0, -0.35 - damage * 0.1, -2.1]} rotation={[-damage * 0.4, -damage * 0.1, 0]} castShadow receiveShadow material={sharedMaterials.chrome}>
        <boxGeometry args={[1.7, 0.1, 0.15]} />
      </mesh>
      {/* Taillights */}
      <BrakeLight position={[0.6, -0.15, -2.06]} args={[0.2, 0.4, 0.05]} />
      <BrakeLight position={[-0.6, -0.15, -2.06]} args={[0.2, 0.4, 0.05]} />
      {/* Scratches */}
      {damage > 0.3 && (
        <mesh position={[0.83, -0.1, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
          <planeGeometry args={[2, 0.2]} />
          <meshStandardMaterial color="#222" roughness={0.9} transparent opacity={damage * 0.8} depthWrite={false} />
        </mesh>
      )}
    </>
  );
}

export function EuroCompact({ damage = 0 }: { damage?: number }) {
  return (
    <>
      {/* Main Body */}
      <mesh position={[0, -0.2, 0]} scale={[1, 1, 1 - damage * 0.1]} castShadow receiveShadow material={sharedMaterials.euroBody}>
        <boxGeometry args={[1.5, 0.4, 3.2]} />
      </mesh>
      {/* Cabin (Rounded) */}
      <mesh position={[0, 0.2, -0.1]} castShadow receiveShadow material={sharedMaterials.euroBody}>
        <boxGeometry args={[1.2, 0.4, 1.5]} />
      </mesh>
      {/* Windows */}
      <mesh position={[0, 0.2, -0.1]} castShadow receiveShadow material={sharedMaterials.glass}>
        <boxGeometry args={[1.25, 0.3, 1.55]} />
      </mesh>
      {/* Headlights (Round) */}
      {damage < 0.6 && <HeadLight position={[0.45, -0.1, 1.6]} rotation={[Math.PI / 2, 0, 0]} args={[0.15, 0.15, 0.05, 16]} geometry="cylinderGeometry" />}
      {damage < 0.9 && <HeadLight position={[-0.45, -0.1, 1.6]} rotation={[Math.PI / 2, 0, 0]} args={[0.15, 0.15, 0.05, 16]} geometry="cylinderGeometry" />}
      {/* Chrome Bumpers */}
      <mesh position={[0, -0.35 - damage * 0.1, 1.65]} rotation={[damage * 0.4, damage * 0.1, 0]} castShadow receiveShadow material={sharedMaterials.chrome}>
        <boxGeometry args={[1.4, 0.08, 0.1]} />
      </mesh>
      <mesh position={[0, -0.35 - damage * 0.1, -1.65]} rotation={[-damage * 0.4, -damage * 0.1, 0]} castShadow receiveShadow material={sharedMaterials.chrome}>
        <boxGeometry args={[1.4, 0.08, 0.1]} />
      </mesh>
      {/* Taillights */}
      <BrakeLight position={[0.5, -0.15, -1.61]} args={[0.15, 0.2, 0.05]} />
      <BrakeLight position={[-0.5, -0.15, -1.61]} args={[0.15, 0.2, 0.05]} />
      {/* Scratches */}
      {damage > 0.3 && (
        <mesh position={[0.76, -0.1, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
          <planeGeometry args={[1.5, 0.2]} />
          <meshStandardMaterial color="#222" roughness={0.9} transparent opacity={damage * 0.8} depthWrite={false} />
        </mesh>
      )}
    </>
  );
}
export function Volvo140({ damage = 0 }: { damage?: number }) {
  return (
    <>
      {/* Lower Body */}
      <mesh position={[0, -0.25, 0]} scale={[1, 1, 1 - damage * 0.1]} castShadow receiveShadow material={sharedMaterials.volvoBody}>
        <boxGeometry args={[1.7, 0.5, 4]} />
      </mesh>
      {/* Black Trim Line */}
      <mesh position={[0, -0.05, 0]} castShadow receiveShadow material={sharedMaterials.rubber}>
        <boxGeometry args={[1.72, 0.05, 4.02]} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.25, -0.2]} castShadow receiveShadow material={sharedMaterials.volvoBody}>
        <boxGeometry args={[1.4, 0.5, 2]} />
      </mesh>
      {/* Windows (Inner dark block) */}
      <mesh position={[0, 0.25, -0.2]} castShadow receiveShadow material={sharedMaterials.glass}>
        <boxGeometry args={[1.45, 0.4, 2.05]} />
      </mesh>
      {/* Front Grille */}
      <mesh position={[0, -0.15, 2.01]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.25, 0.1]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Headlights */}
      {damage < 0.6 && <HeadLight position={[0.6, -0.15, 2.01]} args={[0.25, 0.25, 0.1]} />}
      {damage < 0.9 && <HeadLight position={[-0.6, -0.15, 2.01]} args={[0.25, 0.25, 0.1]} />}
      {/* Bumpers */}
      <mesh position={[0, -0.4 - damage * 0.1, 2.05]} rotation={[damage * 0.4, damage * 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.15, 0.2]} />
        <meshStandardMaterial color="#ccc" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, -0.4 - damage * 0.1, -2.05]} rotation={[-damage * 0.4, -damage * 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.15, 0.2]} />
        <meshStandardMaterial color="#ccc" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Taillights */}
      <BrakeLight position={[0.6, -0.15, -2.01]} args={[0.3, 0.3, 0.1]} />
      <BrakeLight position={[-0.6, -0.15, -2.01]} args={[0.3, 0.3, 0.1]} />
      {/* Roof Rack */}
      <mesh position={[0, 0.52, 0.2]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.05, 0.05]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[0, 0.52, -0.5]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.05, 0.05]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Side Mirrors */}
      <mesh position={[0.75, 0.2, 0.4]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.15, 0.15]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[-0.75, 0.2, 0.4]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.15, 0.15]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Exhaust */}
      <mesh position={[0.6, -0.4, -2.1]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.2, 16]} />
        <meshStandardMaterial color="#333" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* License Plates */}
      <mesh position={[0, -0.3, 2.16]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.15, 0.02]} />
        <meshStandardMaterial color="#eab308" />
      </mesh>
      <mesh position={[0, -0.3, -2.16]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.15, 0.02]} />
        <meshStandardMaterial color="#eab308" />
      </mesh>
      {/* Door Handles */}
      <mesh position={[0.86, 0.05, 0.2]} castShadow receiveShadow>
        <boxGeometry args={[0.05, 0.05, 0.2]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[-0.86, 0.05, 0.2]} castShadow receiveShadow>
        <boxGeometry args={[0.05, 0.05, 0.2]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Scratches */}
      {damage > 0.3 && (
        <mesh position={[0.86, -0.1, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
          <planeGeometry args={[2, 0.2]} />
          <meshStandardMaterial color="#222" roughness={0.9} transparent opacity={damage * 0.8} depthWrite={false} />
        </mesh>
      )}
    </>
  );
}

export function SportsCar80s({ damage = 0 }: { damage?: number }) {
  return (
    <>
      {/* Main Body (Wedge) */}
      <mesh position={[0, -0.2, 0.1]} scale={[1, 1, 1 - damage * 0.1]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.3, 4.2]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      {/* Black Trim */}
      <mesh position={[0, -0.2, 0.1]} castShadow receiveShadow>
        <boxGeometry args={[1.82, 0.05, 4.22]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.1, -0.4]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.35, 1.8]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Pop-up Headlights */}
      {/* Pop-up Headlights */}
      {damage < 0.6 && <mesh position={[0.6, -0.05, 2.0]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.1, 0.2]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>}
      {damage < 0.9 && <mesh position={[-0.6, -0.05, 2.0]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.1, 0.2]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>}
      {damage < 0.6 && <HeadLight position={[0.6, -0.05, 2.11]} args={[0.25, 0.05, 0.05]} />}
      {damage < 0.9 && <HeadLight position={[-0.6, -0.05, 2.11]} args={[0.25, 0.05, 0.05]} />}
      {/* Spoiler */}
      <mesh position={[0, 0.2, -1.9]} castShadow receiveShadow>
        <boxGeometry args={[1.7, 0.05, 0.4]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      <mesh position={[0.7, 0.0, -1.9]} castShadow receiveShadow>
        <boxGeometry args={[0.05, 0.4, 0.3]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      <mesh position={[-0.7, 0.0, -1.9]} castShadow receiveShadow>
        <boxGeometry args={[0.05, 0.4, 0.3]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      {/* Taillights (Full width strip) */}
      <BrakeLight position={[0, -0.15, -2.01]} args={[1.6, 0.15, 0.1]} />
      {/* Exhaust */}
      <mesh position={[0.3, -0.35, -2.05]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.2, 16]} />
        <meshStandardMaterial color="#333" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[-0.3, -0.35, -2.05]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.2, 16]} />
        <meshStandardMaterial color="#333" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Scratches */}
      {damage > 0.3 && (
        <mesh position={[0.91, -0.1, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
          <planeGeometry args={[2, 0.2]} />
          <meshStandardMaterial color="#222" roughness={0.9} transparent opacity={damage * 0.8} depthWrite={false} />
        </mesh>
      )}
    </>
  );
}

export function MuscleCar60s({ damage = 0 }: { damage?: number }) {
  return (
    <>
      {/* Main Body */}
      <mesh position={[0, -0.15, 0]} scale={[1, 1, 1 - damage * 0.1]} castShadow receiveShadow>
        <boxGeometry args={[1.75, 0.45, 4.4]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      {/* Racing Stripes */}
      <mesh position={[0, -0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.46, 4.41]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.2, -0.3]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.35, 1.6]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      {/* Windows */}
      <mesh position={[0, 0.2, -0.3]} castShadow receiveShadow>
        <boxGeometry args={[1.45, 0.25, 1.65]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Engine Blower */}
      <mesh position={[0, 0.15, 1.2]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.2, 0.6]} />
        <meshStandardMaterial color="#ccc" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.25, 1.2]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.1, 0.4]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Front Grille */}
      <mesh position={[0, -0.15, 2.21]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.25, 0.1]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Headlights (Round) */}
      {damage < 0.6 && <HeadLight position={[0.6, -0.15, 2.22]} rotation={[Math.PI / 2, 0, 0]} args={[0.1, 0.1, 0.1, 16]} geometry="cylinderGeometry" />}
      {damage < 0.9 && <HeadLight position={[-0.6, -0.15, 2.22]} rotation={[Math.PI / 2, 0, 0]} args={[0.1, 0.1, 0.1, 16]} geometry="cylinderGeometry" />}
      {/* Bumpers */}
      <mesh position={[0, -0.35 - damage * 0.1, 2.25]} rotation={[damage * 0.4, damage * 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.15, 0.2]} />
        <meshStandardMaterial color="#ccc" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, -0.35 - damage * 0.1, -2.25]} rotation={[-damage * 0.4, -damage * 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.15, 0.2]} />
        <meshStandardMaterial color="#ccc" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Taillights */}
      <BrakeLight position={[0.6, -0.15, -2.21]} args={[0.4, 0.15, 0.1]} />
      <BrakeLight position={[-0.6, -0.15, -2.21]} args={[0.4, 0.15, 0.1]} />
      {/* Scratches */}
      {damage > 0.3 && (
        <mesh position={[0.88, -0.1, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
          <planeGeometry args={[2, 0.2]} />
          <meshStandardMaterial color="#222" roughness={0.9} transparent opacity={damage * 0.8} depthWrite={false} />
        </mesh>
      )}
    </>
  );
}

export function CyberpunkCar({ damage = 0 }: { damage?: number }) {
  return (
    <>
      {/* Main Body (Wedge Shape) */}
      <mesh position={[0, -0.1, 0]} scale={[1, 1, 1 - damage * 0.1]} castShadow receiveShadow material={sharedMaterials.cyberBody}>
        <boxGeometry args={[1.9, 0.4, 4.6]} />
      </mesh>
      {/* Cabin (Low Profile) */}
      <mesh position={[0, 0.15, -0.5]} castShadow receiveShadow material={sharedMaterials.cyberBody}>
        <boxGeometry args={[1.5, 0.3, 2.0]} />
      </mesh>
      {/* Windows (Neon Tint) */}
      <mesh position={[0, 0.15, -0.5]} castShadow receiveShadow material={sharedMaterials.glass}>
        <boxGeometry args={[1.55, 0.25, 2.05]} />
      </mesh>
      {/* Neon Accents */}
      <mesh position={[0, -0.25, 0]} castShadow receiveShadow material={sharedMaterials.cyberAccent}>
        <boxGeometry args={[1.95, 0.05, 4.65]} />
      </mesh>
      {/* Front Lightbar */}
      {damage < 0.8 && <HeadLight position={[0, -0.1, 2.31]} args={[1.8, 0.05, 0.05]} />}
      {/* Rear Lightbar */}
      <BrakeLight position={[0, 0.1, -2.31]} args={[1.8, 0.05, 0.05]} />
      {/* Exhaust (Dual Large) */}
      <mesh position={[0.5, -0.2, -2.3]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.2, 16]} />
        <meshStandardMaterial color="#111" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[-0.5, -0.2, -2.3]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.2, 16]} />
        <meshStandardMaterial color="#111" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Scratches */}
      {damage > 0.3 && (
        <mesh position={[0.96, -0.1, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
          <planeGeometry args={[2, 0.2]} />
          <meshStandardMaterial color="#222" roughness={0.9} transparent opacity={damage * 0.8} depthWrite={false} />
        </mesh>
      )}
    </>
  );
}

export function PickupTruck({ damage = 0 }: { damage?: number }) {
  return (
    <>
      {/* Main Body (Front/Cab) */}
      <mesh position={[0, -0.1, 0.5]} scale={[1, 1, 1 - damage * 0.1]} castShadow receiveShadow material={sharedMaterials.truckBody}>
        <boxGeometry args={[2.1, 0.6, 2.5]} />
      </mesh>
      {/* Truck Bed */}
      <mesh position={[0, -0.2, -1.5]} castShadow receiveShadow material={sharedMaterials.truckBody}>
        <boxGeometry args={[2.1, 0.4, 2.5]} />
      </mesh>
      {/* Bed Liner */}
      <mesh position={[0, 0.05, -1.5]} castShadow receiveShadow material={sharedMaterials.rubber}>
        <boxGeometry args={[1.9, 0.1, 2.3]} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.4, 0.5]} castShadow receiveShadow material={sharedMaterials.truckBody}>
        <boxGeometry args={[1.9, 0.5, 1.8]} />
      </mesh>
      {/* Windows */}
      <mesh position={[0, 0.4, 0.5]} castShadow receiveShadow material={sharedMaterials.glass}>
        <boxGeometry args={[1.95, 0.4, 1.85]} />
      </mesh>
      {/* Grille (Massive) */}
      <mesh position={[0, -0.1, 1.76]} castShadow receiveShadow material={sharedMaterials.chrome}>
        <boxGeometry args={[1.8, 0.5, 0.1]} />
      </mesh>
      {/* Headlights (Square) */}
      {damage < 0.6 && <HeadLight position={[0.7, -0.1, 1.77]} args={[0.3, 0.3, 0.1]} />}
      {damage < 0.9 && <HeadLight position={[-0.7, -0.1, 1.77]} args={[0.3, 0.3, 0.1]} />}
      {/* Bumpers (Heavy Duty) */}
      <mesh position={[0, -0.4 - damage * 0.1, 1.8]} rotation={[damage * 0.4, damage * 0.1, 0]} castShadow receiveShadow material={sharedMaterials.rubber}>
        <boxGeometry args={[2.2, 0.2, 0.2]} />
      </mesh>
      <mesh position={[0, -0.4 - damage * 0.1, -2.8]} rotation={[-damage * 0.4, -damage * 0.1, 0]} castShadow receiveShadow material={sharedMaterials.rubber}>
        <boxGeometry args={[2.2, 0.2, 0.2]} />
      </mesh>
      {/* Taillights */}
      <BrakeLight position={[0.9, -0.1, -2.76]} args={[0.2, 0.3, 0.1]} />
      <BrakeLight position={[-0.9, -0.1, -2.76]} args={[0.2, 0.3, 0.1]} />
      {/* Scratches */}
      {damage > 0.3 && (
        <mesh position={[1.06, -0.1, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
          <planeGeometry args={[2, 0.2]} />
          <meshStandardMaterial color="#222" roughness={0.9} transparent opacity={damage * 0.8} depthWrite={false} />
        </mesh>
      )}
    </>
  );
}

export function Formula1({ damage = 0 }: { damage?: number }) {
  return (
    <>
      {/* Main Body (Narrow) */}
      <mesh position={[0, -0.2, 0]} scale={[1, 1, 1 - damage * 0.1]} castShadow receiveShadow material={sharedMaterials.f1Body}>
        <boxGeometry args={[0.8, 0.3, 4.8]} />
      </mesh>
      {/* Front Wing */}
      <mesh position={[0, -0.3 - damage * 0.1, 2.2]} rotation={[damage * 0.4, damage * 0.1, 0]} castShadow receiveShadow material={sharedMaterials.f1Body}>
        <boxGeometry args={[2.0, 0.1, 0.6]} />
      </mesh>
      {/* Rear Wing */}
      <mesh position={[0, 0.3 - damage * 0.1, -2.2]} rotation={[-damage * 0.4, -damage * 0.1, 0]} castShadow receiveShadow material={sharedMaterials.f1Body}>
        <boxGeometry args={[1.8, 0.1, 0.5]} />
      </mesh>
      {/* Rear Wing Supports */}
      <mesh position={[0.4, 0.05 - damage * 0.1, -2.2]} rotation={[-damage * 0.4, -damage * 0.1, 0]} castShadow receiveShadow material={sharedMaterials.f1Body}>
        <boxGeometry args={[0.05, 0.5, 0.4]} />
      </mesh>
      <mesh position={[-0.4, 0.05 - damage * 0.1, -2.2]} rotation={[-damage * 0.4, -damage * 0.1, 0]} castShadow receiveShadow material={sharedMaterials.f1Body}>
        <boxGeometry args={[0.05, 0.5, 0.4]} />
      </mesh>
      {/* Cockpit / Driver Area */}
      <mesh position={[0, 0.05, -0.2]} castShadow receiveShadow material={sharedMaterials.glass}>
        <boxGeometry args={[0.6, 0.2, 1.0]} />
      </mesh>
      {/* Air Intake (Above Driver) */}
      <mesh position={[0, 0.25, -0.6]} castShadow receiveShadow material={sharedMaterials.f1Body}>
        <boxGeometry args={[0.4, 0.3, 0.6]} />
      </mesh>
      {/* Sidepods */}
      <mesh position={[0.6, -0.2, -0.2]} castShadow receiveShadow material={sharedMaterials.f1Body}>
        <boxGeometry args={[0.5, 0.3, 1.8]} />
      </mesh>
      <mesh position={[-0.6, -0.2, -0.2]} castShadow receiveShadow material={sharedMaterials.f1Body}>
        <boxGeometry args={[0.5, 0.3, 1.8]} />
      </mesh>
      {/* Exhaust */}
      <mesh position={[0, -0.1, -2.4]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.2, 16]} />
        <meshStandardMaterial color="#111" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Tiny Taillight (Rain Light) */}
      <BrakeLight position={[0, -0.2, -2.41]} args={[0.1, 0.1, 0.05]} />
      {/* Scratches */}
      {damage > 0.3 && (
        <mesh position={[0.41, -0.2, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
          <planeGeometry args={[2, 0.2]} />
          <meshStandardMaterial color="#222" roughness={0.9} transparent opacity={damage * 0.8} depthWrite={false} />
        </mesh>
      )}
    </>
  );
}
