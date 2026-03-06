import { usePlane } from '@react-three/cannon';
import { useRef } from 'react';
import { Mesh, RepeatWrapping, TextureLoader } from 'three';
import { useLoader } from '@react-three/fiber';

export function Ground(props: any) {
  const [ref] = usePlane(
    () => ({
      type: 'Static',
      material: 'ground',
      rotation: [-Math.PI / 2, 0, 0],
      ...props,
    }),
    useRef<Mesh>(null)
  );

  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[10000, 10000]} />
      <meshStandardMaterial 
        color="#166534" 
        roughness={0.9} 
      />
    </mesh>
  );
}
