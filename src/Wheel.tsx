import { forwardRef } from 'react';
import { useCompoundBody } from '@react-three/cannon';
import { Group } from 'three';

interface WheelProps {
  radius?: number;
  leftSide?: boolean;
}

export const Wheel = forwardRef<Group, WheelProps>(({ radius = 0.7, leftSide, ...props }, ref) => {
  useCompoundBody(
    () => ({
      mass: 1,
      type: 'Kinematic',
      material: 'wheel',
      collisionFilterGroup: 0,
      shapes: [
        {
          type: 'Cylinder',
          args: [radius, radius, 0.5, 16],
          rotation: [0, 0, -Math.PI / 2],
        },
      ],
      ...props,
    }),
    ref as any
  );

  return (
    <group ref={ref}>
      <group rotation={[0, 0, ((leftSide ? 1 : -1) * Math.PI) / 2]}>
        {/* Tire */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[radius, radius, 0.5, 24]} />
          <meshStandardMaterial color="#111" roughness={0.9} />
        </mesh>
        {/* Hubcap / Rim */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[radius * 0.6, radius * 0.6, 0.52, 16]} />
          <meshStandardMaterial color="#ccc" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Inner Rim Detail */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[radius * 0.4, radius * 0.4, 0.54, 8]} />
          <meshStandardMaterial color="#222" metalness={0.5} roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
});
