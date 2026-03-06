import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useCylinder } from '@react-three/cannon';
import { Vector3, Mesh, Quaternion, Euler, Group, MathUtils } from 'three';
import { useControls } from './useControls';
import { debugData } from './store';

const WALK_SPEED = 6;
const SPRINT_SPEED = 12;
const JUMP_FORCE = 6;
const TURN_SPEED = 3;

const direction = new Vector3();
const _euler = new Euler(0, 0, 0, 'YXZ');
const _quaternion = new Quaternion();

export function Player({ position = [0, 2, 0], onEnterVehicle }: { position?: [number, number, number], onEnterVehicle: () => void }) {
  const [ref, api] = useCylinder(
    () => ({
      mass: 75,
      type: 'Dynamic',
      position,
      args: [0.4, 0.4, 1.8, 16],
      fixedRotation: true,
      linearDamping: 0.9,
    }),
    useRef<Group>(null)
  );

  const { forward, backward, left, right, lookLeft, lookRight, lookUp, lookDown, interact, brake, sprint } = useControls();
  const velocity = useRef([0, 0, 0]);
  const playerPosition = useRef([0, 0, 0]);
  const [canJump, setCanJump] = useState(true);
  
  const cameraYaw = useRef(0);
  const cameraPitch = useRef(0.2);
  const playerYaw = useRef(0);

  // Model refs for animation
  const leftLeg = useRef<Mesh>(null);
  const rightLeg = useRef<Mesh>(null);
  const leftArm = useRef<Mesh>(null);
  const rightArm = useRef<Mesh>(null);

  useEffect(() => {
    const unsubVel = api.velocity.subscribe((v) => {
      velocity.current = v;
      if (Math.abs(v[1]) < 0.05) {
        setCanJump(true);
      }
    });
    const unsubPos = api.position.subscribe((p) => (playerPosition.current = p));
    return () => {
      unsubVel();
      unsubPos();
    };
  }, [api]);

  useFrame((state, delta) => {
    if (!ref.current) return;

    // Camera Look
    if (lookLeft) cameraYaw.current += TURN_SPEED * delta;
    if (lookRight) cameraYaw.current -= TURN_SPEED * delta;
    if (lookUp) cameraPitch.current -= TURN_SPEED * delta;
    if (lookDown) cameraPitch.current += TURN_SPEED * delta;
    
    // Clamp pitch to prevent flipping
    cameraPitch.current = MathUtils.clamp(cameraPitch.current, -Math.PI / 4, Math.PI / 3);

    // Movement relative to camera yaw
    const currentSpeed = sprint ? SPRINT_SPEED : WALK_SPEED;
    const moveZ = Number(backward) - Number(forward);
    const moveX = Number(right) - Number(left);
    
    direction.set(moveX, 0, moveZ);
    
    const isMoving = direction.lengthSq() > 0.1;

    if (isMoving) {
      direction.normalize().multiplyScalar(currentSpeed);
      
      // Apply camera yaw to movement direction
      _euler.set(0, cameraYaw.current, 0, 'YXZ');
      direction.applyEuler(_euler);
      
      // Rotate player model to face movement direction smoothly
      const targetYaw = Math.atan2(direction.x, direction.z);
      
      // Smooth rotation towards target yaw
      // Need to handle the wrap-around at PI/-PI
      let diff = targetYaw - playerYaw.current;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      
      playerYaw.current += diff * 10 * delta;
      
      _euler.set(0, playerYaw.current, 0, 'YXZ');
      _quaternion.setFromEuler(_euler);
      ref.current.quaternion.copy(_quaternion);

      api.velocity.set(direction.x, velocity.current[1], direction.z);
    } else {
      // Allow damping to stop the player
      api.velocity.set(velocity.current[0] * 0.8, velocity.current[1], velocity.current[2] * 0.8);
    }

    // Jump
    if (brake && canJump) {
      api.velocity.set(velocity.current[0], JUMP_FORCE, velocity.current[2]);
      setCanJump(false);
    }

    // Animations
    const speed = Math.sqrt(velocity.current[0] ** 2 + velocity.current[2] ** 2);
    const time = state.clock.getElapsedTime();
    
    if (speed > 0.5 && leftLeg.current && rightLeg.current && leftArm.current && rightArm.current) {
      const strideFreq = sprint ? 15 : 10;
      const strideAmp = sprint ? 0.8 : 0.5;
      leftLeg.current.rotation.x = Math.sin(time * strideFreq) * strideAmp;
      rightLeg.current.rotation.x = Math.sin(time * strideFreq + Math.PI) * strideAmp;
      leftArm.current.rotation.x = Math.sin(time * strideFreq + Math.PI) * strideAmp;
      rightArm.current.rotation.x = Math.sin(time * strideFreq) * strideAmp;
    } else if (leftLeg.current && rightLeg.current && leftArm.current && rightArm.current) {
      // Return to idle
      leftLeg.current.rotation.x = MathUtils.lerp(leftLeg.current.rotation.x, 0, 0.1);
      rightLeg.current.rotation.x = MathUtils.lerp(rightLeg.current.rotation.x, 0, 0.1);
      leftArm.current.rotation.x = MathUtils.lerp(leftArm.current.rotation.x, 0, 0.1);
      rightArm.current.rotation.x = MathUtils.lerp(rightArm.current.rotation.x, 0, 0.1);
    }

    // Camera follow (Third Person Orbit)
    const cameraDistance = 5;
    
    const targetPos = new Vector3(...playerPosition.current);
    
    // Calculate camera position using spherical coordinates based on yaw and pitch
    const cameraOffset = new Vector3(
      Math.sin(cameraYaw.current) * Math.cos(cameraPitch.current) * cameraDistance,
      Math.sin(cameraPitch.current) * cameraDistance,
      Math.cos(cameraYaw.current) * Math.cos(cameraPitch.current) * cameraDistance
    );
    
    const desiredCameraPos = targetPos.clone().add(cameraOffset);
    
    // Smoothly interpolate camera position
    state.camera.position.lerp(desiredCameraPos, 0.2);
    
    // Look at player's head
    const lookAtPos = targetPos.clone();
    lookAtPos.y += 0.8; // Look slightly up
    state.camera.lookAt(lookAtPos);

    // Interact to enter vehicle
    if (interact) {
      const carPos = new Vector3(...debugData.position);
      const playerPos = new Vector3(...playerPosition.current);
      const distance = playerPos.distanceTo(carPos);
      
      if (distance < 5) {
        onEnterVehicle();
      }
    }
  });

  return (
    <group ref={ref as any}>
      {/* Invisible collision cylinder */}
      <mesh visible={false}>
        <cylinderGeometry args={[0.4, 0.4, 1.8, 16]} />
        <meshBasicMaterial />
      </mesh>

      {/* Visual Model */}
      <group position={[0, -0.9, 0]}>
        {/* Torso */}
        <mesh position={[0, 1.1, 0]} castShadow>
          <boxGeometry args={[0.5, 0.6, 0.3]} />
          <meshStandardMaterial color="#3b82f6" /> {/* Blue shirt */}
        </mesh>

        {/* Head */}
        <mesh position={[0, 1.6, 0]} castShadow>
          <boxGeometry args={[0.35, 0.35, 0.35]} />
          <meshStandardMaterial color="#fcd34d" /> {/* Skin tone */}
        </mesh>
        
        {/* Face/Eyes indicator */}
        <mesh position={[0, 1.65, 0.18]} castShadow>
          <boxGeometry args={[0.2, 0.05, 0.05]} />
          <meshStandardMaterial color="#1f2937" /> {/* Sunglasses/Eyes */}
        </mesh>

        {/* Left Arm */}
        <group position={[-0.35, 1.3, 0]} ref={leftArm as any}>
          <mesh position={[0, -0.25, 0]} castShadow>
            <boxGeometry args={[0.15, 0.6, 0.15]} />
            <meshStandardMaterial color="#fcd34d" />
          </mesh>
        </group>

        {/* Right Arm */}
        <group position={[0.35, 1.3, 0]} ref={rightArm as any}>
          <mesh position={[0, -0.25, 0]} castShadow>
            <boxGeometry args={[0.15, 0.6, 0.15]} />
            <meshStandardMaterial color="#fcd34d" />
          </mesh>
        </group>

        {/* Left Leg */}
        <group position={[-0.15, 0.8, 0]} ref={leftLeg as any}>
          <mesh position={[0, -0.4, 0]} castShadow>
            <boxGeometry args={[0.2, 0.8, 0.2]} />
            <meshStandardMaterial color="#1f2937" /> {/* Dark pants */}
          </mesh>
        </group>

        {/* Right Leg */}
        <group position={[0.15, 0.8, 0]} ref={rightLeg as any}>
          <mesh position={[0, -0.4, 0]} castShadow>
            <boxGeometry args={[0.2, 0.8, 0.2]} />
            <meshStandardMaterial color="#1f2937" /> {/* Dark pants */}
          </mesh>
        </group>
      </group>
    </group>
  );
}
