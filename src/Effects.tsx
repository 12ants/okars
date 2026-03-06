import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Object3D, Vector3, Color, Quaternion, AdditiveBlending } from 'three';

const MAX_SMOKE = 150;
const MAX_SPARKS = 150;
const MAX_SKIDMARKS = 400;
const MAX_WIND = 200;
const MAX_BOOST = 100;

interface SmokeParticle {
  active: boolean;
  position: Vector3;
  velocity: Vector3;
  age: number;
  life: number;
  scale: number;
}

interface SparkParticle {
  active: boolean;
  position: Vector3;
  velocity: Vector3;
  age: number;
  life: number;
}

interface SkidParticle {
  active: boolean;
  position: Vector3;
  quaternion: Quaternion;
  age: number;
}

interface WindParticle {
  active: boolean;
  position: Vector3;
  quaternion: Quaternion;
  velocity: Vector3;
  age: number;
  life: number;
  scale: number;
}

interface BoostParticle {
  active: boolean;
  position: Vector3;
  velocity: Vector3;
  age: number;
  life: number;
  scale: number;
}

const smokeParticles: SmokeParticle[] = Array.from({ length: MAX_SMOKE }, () => ({
  active: false, position: new Vector3(), velocity: new Vector3(), age: 0, life: 1, scale: 1
}));

const sparkParticles: SparkParticle[] = Array.from({ length: MAX_SPARKS }, () => ({
  active: false, position: new Vector3(), velocity: new Vector3(), age: 0, life: 1
}));

const skidParticles: SkidParticle[] = Array.from({ length: MAX_SKIDMARKS }, () => ({
  active: false, position: new Vector3(), quaternion: new Quaternion(), age: 0
}));

const windParticles: WindParticle[] = Array.from({ length: MAX_WIND }, () => ({
  active: false, position: new Vector3(), quaternion: new Quaternion(), velocity: new Vector3(), age: 0, life: 1, scale: 1
}));

const boostParticles: BoostParticle[] = Array.from({ length: MAX_BOOST }, () => ({
  active: false, position: new Vector3(), velocity: new Vector3(), age: 0, life: 1, scale: 1
}));

let smokeIdx = 0;
let sparkIdx = 0;
let skidIdx = 0;
let windIdx = 0;
let boostIdx = 0;

export const spawnSmoke = (pos: Vector3, vel: Vector3) => {
  const p = smokeParticles[smokeIdx];
  p.active = true;
  p.position.copy(pos);
  p.position.y -= 0.2; // closer to ground
  p.velocity.copy(vel).multiplyScalar(0.2).add(new Vector3((Math.random()-0.5)*2, Math.random()*2 + 1, (Math.random()-0.5)*2));
  p.age = 0;
  p.life = 0.5 + Math.random() * 0.5;
  p.scale = 0.5 + Math.random() * 0.8;
  smokeIdx = (smokeIdx + 1) % MAX_SMOKE;
};

export const spawnSpark = (pos: Vector3, vel: Vector3) => {
  const p = sparkParticles[sparkIdx];
  p.active = true;
  p.position.copy(pos);
  p.velocity.copy(vel).multiplyScalar(0.5).add(new Vector3((Math.random()-0.5)*15, Math.random()*10 + 5, (Math.random()-0.5)*15));
  p.age = 0;
  p.life = 0.2 + Math.random() * 0.4;
  sparkIdx = (sparkIdx + 1) % MAX_SPARKS;
};

export const spawnSkidMark = (pos: Vector3, vel: Vector3) => {
  const p = skidParticles[skidIdx];
  p.active = true;
  p.position.copy(pos);
  p.position.y = 0.05; // slightly above ground
  
  const angle = Math.atan2(vel.x, vel.z);
  p.quaternion.setFromAxisAngle(new Vector3(0, 1, 0), angle);
  p.quaternion.multiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI/2));
  
  p.age = 0;
  skidIdx = (skidIdx + 1) % MAX_SKIDMARKS;
};

export const spawnWind = (pos: Vector3, vel: Vector3, quat: Quaternion, speed: number) => {
  const p = windParticles[windIdx];
  p.active = true;
  
  // Spawn around the car's bounding box
  const offset = new Vector3(
    (Math.random() - 0.5) * 3.0,
    Math.random() * 1.5,
    (Math.random() - 0.5) * 4.0
  ).applyQuaternion(quat);
  
  p.position.copy(pos).add(offset);
  p.quaternion.copy(quat);
  
  // Move slightly slower than the car so it streaks backwards relative to the camera
  p.velocity.copy(vel).multiplyScalar(0.6);
  
  p.age = 0;
  p.life = 0.15 + Math.random() * 0.15; 
  p.scale = speed * 0.15; 
  
  windIdx = (windIdx + 1) % MAX_WIND;
};

export const spawnBoostFlame = (pos: Vector3, vel: Vector3, rot: Quaternion) => {
  const p = boostParticles[boostIdx];
  p.active = true;
  
  // Spawn slightly behind the car
  const offset = new Vector3((Math.random()-0.5)*0.5, Math.random()*0.5 + 0.2, -2.5);
  offset.applyQuaternion(rot);
  
  p.position.copy(pos).add(offset);
  p.velocity.copy(vel).multiplyScalar(0.2).add(new Vector3((Math.random()-0.5)*2, (Math.random()-0.5)*2, (Math.random()-0.5)*2));
  
  p.age = 0;
  p.life = 0.1 + Math.random() * 0.2;
  p.scale = 0.5 + Math.random() * 0.5;
  
  boostIdx = (boostIdx + 1) % MAX_BOOST;
};

const dummy = new Object3D();
const color = new Color();

export function Effects() {
  const smokeRef = useRef<InstancedMesh>(null);
  const sparkRef = useRef<InstancedMesh>(null);
  const skidRef = useRef<InstancedMesh>(null);
  const windRef = useRef<InstancedMesh>(null);
  const boostRef = useRef<InstancedMesh>(null);

  useFrame((state, delta) => {
    let smokeActive = false;
    let sparkActive = false;
    let skidActive = false;
    let windActive = false;
    let boostActive = false;

    if (smokeRef.current) {
      for (let i = 0; i < MAX_SMOKE; i++) {
        const p = smokeParticles[i];
        if (p.active) {
          smokeActive = true;
          p.age += delta;
          if (p.age >= p.life) {
            p.active = false;
            dummy.position.set(0, -1000, 0);
            dummy.scale.set(0,0,0);
          } else {
            p.position.addScaledVector(p.velocity, delta);
            const progress = p.age / p.life;
            const s = p.scale * (1 + progress * 2);
            dummy.position.copy(p.position);
            dummy.scale.set(s, s, s);
            
            const c = 1 - progress;
            color.setRGB(c * 0.8, c * 0.8, c * 0.8);
            smokeRef.current.setColorAt(i, color);
          }
          dummy.updateMatrix();
          smokeRef.current.setMatrixAt(i, dummy.matrix);
        }
      }
      if (smokeActive) {
        smokeRef.current.instanceMatrix.needsUpdate = true;
        if (smokeRef.current.instanceColor) smokeRef.current.instanceColor.needsUpdate = true;
      }
    }

    if (sparkRef.current) {
      for (let i = 0; i < MAX_SPARKS; i++) {
        const p = sparkParticles[i];
        if (p.active) {
          sparkActive = true;
          p.age += delta;
          if (p.age >= p.life) {
            p.active = false;
            dummy.position.set(0, -1000, 0);
            dummy.scale.set(0,0,0);
          } else {
            p.velocity.y -= 20 * delta; // gravity
            p.position.addScaledVector(p.velocity, delta);
            dummy.position.copy(p.position);
            
            const speed = p.velocity.length();
            dummy.scale.set(0.05, speed * 0.02 + 0.1, 0.05);
            
            if (speed > 0.1) {
              dummy.quaternion.setFromUnitVectors(new Vector3(0,1,0), p.velocity.clone().normalize());
            }
            
            const progress = p.age / p.life;
            color.setRGB(2, 1.5 - progress, 0); // Bright yellow to orange/red
            sparkRef.current.setColorAt(i, color);
          }
          dummy.updateMatrix();
          sparkRef.current.setMatrixAt(i, dummy.matrix);
        }
      }
      if (sparkActive) {
        sparkRef.current.instanceMatrix.needsUpdate = true;
        if (sparkRef.current.instanceColor) sparkRef.current.instanceColor.needsUpdate = true;
      }
    }

    if (skidRef.current) {
      for (let i = 0; i < MAX_SKIDMARKS; i++) {
        const p = skidParticles[i];
        if (p.active) {
          skidActive = true;
          p.age += delta;
          if (p.age >= 5) { // fade out after 5 seconds
            p.active = false;
            dummy.position.set(0, -1000, 0);
            dummy.scale.set(0, 0, 0);
          } else {
            dummy.position.copy(p.position);
            dummy.quaternion.copy(p.quaternion);
            // Shrink slightly as it ages to simulate fading
            const scale = Math.max(0, 1 - (p.age / 5));
            dummy.scale.set(0.4, 0.8 * scale, 1);
          }
          dummy.updateMatrix();
          skidRef.current.setMatrixAt(i, dummy.matrix);
        }
      }
      if (skidActive) skidRef.current.instanceMatrix.needsUpdate = true;
    }

    if (windRef.current) {
      for (let i = 0; i < MAX_WIND; i++) {
        const p = windParticles[i];
        if (p.active) {
          windActive = true;
          p.age += delta;
          if (p.age >= p.life) {
            p.active = false;
            dummy.position.set(0, -1000, 0);
            dummy.scale.set(0, 0, 0);
          } else {
            p.position.addScaledVector(p.velocity, delta);
            dummy.position.copy(p.position);
            dummy.quaternion.copy(p.quaternion);
            
            const progress = p.age / p.life;
            // Stretch along Z axis, fade out scale
            dummy.scale.set(0.02, 0.02, p.scale * (1 - progress));
            
            const alpha = 1 - progress;
            color.setRGB(0.2 * alpha, 0.6 * alpha, 1.0 * alpha); // Cyan/Blue glow
            windRef.current.setColorAt(i, color);
          }
          dummy.updateMatrix();
          windRef.current.setMatrixAt(i, dummy.matrix);
        }
      }
      if (windActive) {
        windRef.current.instanceMatrix.needsUpdate = true;
        if (windRef.current.instanceColor) windRef.current.instanceColor.needsUpdate = true;
      }
    }

    if (boostRef.current) {
      for (let i = 0; i < MAX_BOOST; i++) {
        const p = boostParticles[i];
        if (p.active) {
          boostActive = true;
          p.age += delta;
          if (p.age >= p.life) {
            p.active = false;
            dummy.position.set(0, -1000, 0);
            dummy.scale.set(0, 0, 0);
          } else {
            p.position.addScaledVector(p.velocity, delta);
            const progress = p.age / p.life;
            const s = p.scale * (1 - progress);
            dummy.position.copy(p.position);
            dummy.scale.set(s, s, s);
            
            const c = 1 - progress;
            color.setRGB(2, 0.5 + c, 0); // Orange/Yellow flame
            boostRef.current.setColorAt(i, color);
          }
          dummy.updateMatrix();
          boostRef.current.setMatrixAt(i, dummy.matrix);
        }
      }
      if (boostActive) {
        boostRef.current.instanceMatrix.needsUpdate = true;
        if (boostRef.current.instanceColor) boostRef.current.instanceColor.needsUpdate = true;
      }
    }
  });

  return (
    <>
      <instancedMesh ref={boostRef} args={[undefined as any, undefined as any, MAX_BOOST]} frustumCulled={false}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial transparent opacity={0.8} depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={windRef} args={[undefined as any, undefined as any, MAX_WIND]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial transparent opacity={0.6} depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={skidRef} args={[undefined as any, undefined as any, MAX_SKIDMARKS]} frustumCulled={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#111111" transparent opacity={0.6} depthWrite={false} polygonOffset polygonOffsetFactor={-1} />
      </instancedMesh>
      <instancedMesh ref={smokeRef} args={[undefined as any, undefined as any, MAX_SMOKE]} frustumCulled={false}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial transparent opacity={0.3} depthWrite={false} color="#aaaaaa" />
      </instancedMesh>
      <instancedMesh ref={sparkRef} args={[undefined as any, undefined as any, MAX_SPARKS]} frustumCulled={false}>
        <cylinderGeometry args={[1, 1, 1, 4]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </>
  );
}
