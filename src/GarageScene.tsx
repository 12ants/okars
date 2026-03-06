import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { SovietClassic, EuroCompact, Volvo140, SportsCar80s, MuscleCar60s } from './CarModels';

const CARS = [
  { id: 'volvo', Component: Volvo140, name: 'Volvo 140' },
  { id: 'sports', Component: SportsCar80s, name: '80s Sports' },
  { id: 'muscle', Component: MuscleCar60s, name: '60s Muscle' },
  { id: 'soviet', Component: SovietClassic, name: 'Soviet Classic' },
  { id: 'euro', Component: EuroCompact, name: 'Euro Compact' },
];

export function GarageScene({ selectedCar, onSelectCar }: { selectedCar: string, onSelectCar: (id: string) => void }) {
  const bayWidth = 8;
  const garageLength = CARS.length * bayWidth;
  const garageDepth = 12;
  const garageHeight = 6;
  const wallThickness = 0.5;

  return (
    <group>
      {/* Garage Floor */}
      <mesh position={[0, -0.25, -garageDepth / 2]} receiveShadow>
        <boxGeometry args={[garageLength + wallThickness * 2, 0.5, garageDepth]} />
        <meshStandardMaterial color="#222" roughness={0.8} />
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, garageHeight / 2, -garageDepth]} receiveShadow castShadow>
        <boxGeometry args={[garageLength + wallThickness * 2, garageHeight, wallThickness]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      {/* Side Walls */}
      <mesh position={[-garageLength / 2 - wallThickness / 2, garageHeight / 2, -garageDepth / 2]} receiveShadow castShadow>
        <boxGeometry args={[wallThickness, garageHeight, garageDepth]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[garageLength / 2 + wallThickness / 2, garageHeight / 2, -garageDepth / 2]} receiveShadow castShadow>
        <boxGeometry args={[wallThickness, garageHeight, garageDepth]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      {/* Roof */}
      <mesh position={[0, garageHeight + wallThickness / 2, -garageDepth / 2]} receiveShadow castShadow>
        <boxGeometry args={[garageLength + wallThickness * 2, wallThickness, garageDepth]} />
        <meshStandardMaterial color="#111" />
      </mesh>

      {/* Bays and Cars */}
      {CARS.map((car, index) => {
        const xPos = (index - Math.floor(CARS.length / 2)) * bayWidth;
        const isSelected = selectedCar === car.id;
        
        return (
          <group key={car.id} position={[xPos, 0, -garageDepth / 2]}>
            {/* Pillar between bays */}
            {index > 0 && (
              <mesh position={[-bayWidth / 2, garageHeight / 2, garageDepth / 2 - 1]} receiveShadow castShadow>
                <boxGeometry args={[1, garageHeight, 2]} />
                <meshStandardMaterial color="#444" />
              </mesh>
            )}
            
            {/* Bay Lighting */}
            <pointLight position={[0, garageHeight - 1, 0]} intensity={isSelected ? 3 : 1} distance={15} color={isSelected ? "#fff" : "#aaa"} />
            <spotLight position={[0, garageHeight - 0.5, 2]} angle={0.5} penumbra={0.5} intensity={isSelected ? 5 : 2} castShadow target-position={[0, 0, 0]} />

            {/* Car Model */}
            <group 
              position={[0, 0, 0]} 
              rotation={[0, Math.PI / 6, 0]} 
              onClick={(e) => {
                e.stopPropagation();
                onSelectCar(car.id);
              }}
              onPointerOver={() => document.body.style.cursor = 'pointer'}
              onPointerOut={() => document.body.style.cursor = 'auto'}
            >
              <car.Component />
              
              {/* Selection Highlight */}
              {isSelected && (
                <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[2.5, 2.8, 32]} />
                  <meshBasicMaterial color="#10b981" transparent opacity={0.5} />
                </mesh>
              )}
            </group>
          </group>
        );
      })}
    </group>
  );
}
