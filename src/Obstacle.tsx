import { useBox } from '@react-three/cannon';
import { useRef } from 'react';
import { Mesh } from 'three';

export function Obstacle({ position, args = [2, 2, 2], color = '#ff9900' }: any) {
  const [ref] = useBox(
    () => ({
      mass: 10,
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
