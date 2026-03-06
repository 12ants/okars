import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox, useRaycastVehicle } from '@react-three/cannon';
import { useControls } from './useControls';
import { Wheel } from './Wheel';
import { Group, Mesh, Vector3, Quaternion, Euler } from 'three';
import { debugData } from './store';
import { Volvo140, SportsCar80s, MuscleCar60s, SovietClassic, EuroCompact, CyberpunkCar, PickupTruck, Formula1 } from './CarModels';
import { spawnSmoke, spawnSpark, spawnSkidMark, spawnWind, spawnBoostFlame } from './Effects';

// Pre-allocate objects outside the render loop to prevent garbage collection stutter
const _position = new Vector3();
const _quaternion = new Quaternion();
const _wDir = new Vector3();
const _cameraPosition = new Vector3();
const _offset = new Vector3();
const _lookAtPos = new Vector3();
const _velocity = new Vector3();
const _lateralVelocity = new Vector3();
const _wheelPos = new Vector3();

export function Vehicle({
  carType = 'volvo',
  cameraMode = 'third-person',
  cameraDistance = 10,
  cameraSensitivity = 1,
  steeringType = 'buttons',
  isActive = true,
  onExitVehicle,
  radius = 0.5,
  width = 1.75,
  height = -0.2,
  front = 1.3,
  back = -1.15,
  steer = 0.45,
  force = 12000,
  mass = 1500,
  suspension = 35,
  friction = 4.5,
  maxBrake = 2e5,
  ...props
}: any) {
  const chassisRef = useRef<Group>(null);
  const damageRef = useRef(0);
  const [visualDamage, setVisualDamage] = useState(0);

  const [chassisBody, chassisApi] = useBox(
    () => ({
      mass: mass,
      args: [1.7, 1, 4],
      position: [0, 5, 0],
      angularDamping: 0.5,
      linearDamping: 0.15,
      onCollide: (e) => {
        if (e.contact.impactVelocity > 3) {
          const sparkCount = Math.min(Math.floor(e.contact.impactVelocity * 2), 20);
          for (let i = 0; i < sparkCount; i++) {
            spawnSpark(
              new Vector3(...e.contact.contactPoint),
              new Vector3(...e.contact.contactNormal).multiplyScalar(e.contact.impactVelocity)
            );
          }
          const damageIncrease = e.contact.impactVelocity * 0.05;
          const newDamage = Math.min(damageRef.current + damageIncrease, 1);
          if (Math.floor(newDamage * 10) > Math.floor(damageRef.current * 10)) {
            setVisualDamage(newDamage);
          }
          damageRef.current = newDamage;
        }
      },
      ...props,
    }),
    chassisRef
  );

  const wheel1 = useRef<Group>(null);
  const wheel2 = useRef<Group>(null);
  const wheel3 = useRef<Group>(null);
  const wheel4 = useRef<Group>(null);

  const wheelInfo = {
    radius,
    directionLocal: [0, -1, 0] as [number, number, number],
    suspensionStiffness: suspension,
    suspensionRestLength: 0.35,
    maxSuspensionForce: 1e5,
    maxSuspensionTravel: 0.3,
    dampingRelaxation: 11.0,
    dampingCompression: 4.5,
    axleLocal: [-1, 0, 0] as [number, number, number],
    chassisConnectionPointLocal: [1, 0, 1] as [number, number, number],
    useCustomSlidingRotationalSpeed: true,
    customSlidingRotationalSpeed: -30,
    frictionSlip: friction,
    rollInfluence: 0.15,
  };

  const wheelInfo1 = { ...wheelInfo, isFrontWheel: true, frictionSlip: friction + 1, chassisConnectionPointLocal: [-width / 2, height, front] as [number, number, number] };
  const wheelInfo2 = { ...wheelInfo, isFrontWheel: true, frictionSlip: friction + 1, chassisConnectionPointLocal: [width / 2, height, front] as [number, number, number] };
  const wheelInfo3 = { ...wheelInfo, isFrontWheel: false, frictionSlip: friction - 1, chassisConnectionPointLocal: [-width / 2, height, back] as [number, number, number] };
  const wheelInfo4 = { ...wheelInfo, isFrontWheel: false, frictionSlip: friction - 1, chassisConnectionPointLocal: [width / 2, height, back] as [number, number, number] };

  const [vehicle, vehicleApi] = useRaycastVehicle(
    () => ({
      chassisBody,
      wheels: [wheel1, wheel2, wheel3, wheel4],
      wheelInfos: [wheelInfo1, wheelInfo2, wheelInfo3, wheelInfo4],
      indexForwardAxis: 2,
      indexRightAxis: 0,
      indexUpAxis: 1,
    }),
    useRef<Group>(null)
  );

  const controls = useControls();

  useEffect(() => {
    const unsubPos = chassisApi.position.subscribe((v) => (debugData.position = v));
    const unsubVel = chassisApi.velocity.subscribe((v) => {
      debugData.velocity = v;
      debugData.speed = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
    });
    const unsubRot = chassisApi.rotation.subscribe((v) => (debugData.rotation = v));
    const unsubAng = chassisApi.angularVelocity.subscribe((v) => (debugData.angularVelocity = v));
    return () => {
      unsubPos();
      unsubVel();
      unsubRot();
      unsubAng();
    };
  }, [chassisApi]);

  const cameraAngleX = useRef(0);
  const cameraAngleY = useRef(0);
  const isDragging = useRef(false);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      // Don't drag if clicking UI
      if ((e.target as HTMLElement).tagName === 'BUTTON' || (e.target as HTMLElement).tagName === 'INPUT') return;
      isDragging.current = true;
    };
    const onMouseUp = () => {
      isDragging.current = false;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        cameraAngleX.current += e.movementX * 0.005 * cameraSensitivity;
        cameraAngleY.current += e.movementY * 0.005 * cameraSensitivity;
        cameraAngleY.current = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, cameraAngleY.current));
      }
    };
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    return () => {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  useFrame((state, delta) => {
    const { forward, backward, left, right, brake, reset, interact, sprint } = controls;

    if (chassisRef.current) {
      _position.setFromMatrixPosition(chassisRef.current.matrixWorld);
      _quaternion.setFromRotationMatrix(chassisRef.current.matrixWorld);
    }

    if (interact && isActive && debugData.speed < 2) {
      onExitVehicle?.();
    }

    // Boost logic
    const isBoosting = isActive && sprint && forward && debugData.boostFuel > 0;
    if (isBoosting) {
      debugData.boostFuel = Math.max(0, debugData.boostFuel - delta * 30); // Consume fuel (approx 3.3s to empty)
    } else {
      debugData.boostFuel = Math.min(100, debugData.boostFuel + delta * 10); // Recharge fuel (approx 10s to full)
    }
    debugData.isBoosting = isBoosting;

    const currentForce = isBoosting ? force * 2.5 : force;
    const engineForce = isActive ? (forward ? -currentForce : backward ? currentForce : 0) : 0;
    
    // Speed-dependent steering (less steering at high speeds)
    const speedFactor = Math.max(0.25, 1 - debugData.speed / 35);
    const currentSteer = steer * speedFactor;
    
    let steeringValue = 0;
    if (isActive) {
      if (steeringType === 'joystick') {
        steeringValue = debugData.joystickSteering * currentSteer;
      } else {
        steeringValue = left ? currentSteer : right ? -currentSteer : 0;
      }
    }

    debugData.engineForce = engineForce;
    debugData.steering = steeringValue;
    debugData.cameraMode = cameraMode;
    debugData.isBraking = isActive ? brake : true; // Auto brake when not active

    _velocity.set(debugData.velocity[0], debugData.velocity[1], debugData.velocity[2]);
    _wDir.set(0, 0, 1).applyQuaternion(_quaternion).normalize();
    const forwardSpeed = _velocity.dot(_wDir);

    // Aerodynamic downforce (pushes car down at high speeds for better grip)
    const speedSq = debugData.speed * debugData.speed;
    const downforce = speedSq * 1.5;
    
    // Aerodynamic drag (slows car down at high speeds)
    const dragForce = speedSq * 0.5;
    const dragZ = dragForce * Math.sign(-forwardSpeed);

    chassisApi.applyLocalForce([0, -downforce, dragZ], [0, 0, 0]);

    // Aerodynamic visual effects (wind streaks at high speeds)
    if (debugData.speed > 15) {
      const windCount = Math.floor((debugData.speed - 10) / 5);
      for (let i = 0; i < windCount; i++) {
        spawnWind(_position, _velocity, _quaternion, debugData.speed);
      }
    }

    // Boost visual effects
    if (isBoosting) {
      spawnBoostFlame(_position, _velocity, _quaternion);
      spawnBoostFlame(_position, _velocity, _quaternion); // Spawn more for a thicker flame
    }

    // Drift and Skid Marks logic
    _lateralVelocity.copy(_velocity).sub(_wDir.clone().multiplyScalar(forwardSpeed));
    const slipSpeed = _lateralVelocity.length();

    const isDrifting = slipSpeed > 2.5 && debugData.speed > 5;
    const isBrakingHard = brake && debugData.speed > 5 && (Math.abs(steeringValue) > 0.05 || slipSpeed > 1.0);

    if (isBrakingHard || isDrifting) {
      if (wheel3.current) {
        wheel3.current.getWorldPosition(_wheelPos);
        spawnSkidMark(_wheelPos, _velocity);
        if (Math.random() > 0.5) spawnSmoke(_wheelPos, _velocity);
      }
      if (wheel4.current) {
        wheel4.current.getWorldPosition(_wheelPos);
        spawnSkidMark(_wheelPos, _velocity);
        if (Math.random() > 0.5) spawnSmoke(_wheelPos, _velocity);
      }
      if (isBrakingHard || slipSpeed > 5.0) {
        if (wheel1.current) {
          wheel1.current.getWorldPosition(_wheelPos);
          spawnSkidMark(_wheelPos, _velocity);
        }
        if (wheel2.current) {
          wheel2.current.getWorldPosition(_wheelPos);
          spawnSkidMark(_wheelPos, _velocity);
        }
      }
    } else if (Math.abs(engineForce) > 0 && debugData.speed < 2) {
      // Burnout smoke
      if (Math.random() > 0.5) {
        if (wheel3.current) {
          wheel3.current.getWorldPosition(_wheelPos);
          spawnSmoke(_wheelPos, _velocity);
        }
        if (wheel4.current) {
          wheel4.current.getWorldPosition(_wheelPos);
          spawnSmoke(_wheelPos, _velocity);
        }
      }
    }

    // AWD for better handling
    for (let e = 0; e < 4; e++) vehicleApi.applyEngineForce(engineForce, e);
    for (let s = 0; s < 2; s++) vehicleApi.setSteeringValue(steeringValue, s);
    // 4-wheel braking
    for (let b = 0; b < 4; b++) vehicleApi.setBrake((isActive && brake) || (!isActive && debugData.speed > 0.1) ? maxBrake : 0, b);

    if (reset && isActive) {
      const initPos = props.position || [0, 5, 0];
      const initRot = props.rotation || [0, 0, 0];
      chassisApi.position.set(initPos[0], initPos[1] + 3, initPos[2]);
      chassisApi.velocity.set(0, 0, 0);
      chassisApi.angularVelocity.set(0, 0, 0);
      chassisApi.rotation.set(initRot[0], initRot[1], initRot[2]);
    }

    if (cameraMode === 'free' || !isActive) {
      return;
    }

    if (damageRef.current > 0.5 && Math.random() < damageRef.current * 0.1) {
      _offset.set(0, 0.5, 1.5).applyQuaternion(_quaternion);
      _lookAtPos.copy(_position).add(_offset);
      spawnSmoke(_lookAtPos, _velocity);
    }
    
    if (damageRef.current > 0.8 && Math.random() < damageRef.current * 0.2) {
      _offset.set(0, 0.5, 1.5).applyQuaternion(_quaternion);
      _lookAtPos.copy(_position).add(_offset);
      spawnBoostFlame(_lookAtPos, _velocity, _quaternion);
    }

    if (!isDragging.current) {
      cameraAngleX.current *= 0.95;
      cameraAngleY.current *= 0.95;
    }

    if (chassisRef.current) {
      if (cameraMode === 'third-person') {
        const height = cameraDistance * 0.5;
        
        const euler = new Euler(cameraAngleY.current, cameraAngleX.current, 0, 'YXZ');
        _wDir.set(0, 0, 1).applyEuler(euler).applyQuaternion(_quaternion).normalize();

        _cameraPosition.copy(_wDir).multiplyScalar(-cameraDistance);
        _cameraPosition.add(_position);
        _cameraPosition.y += height;
        
        state.camera.position.lerp(_cameraPosition, 0.1);
        state.camera.lookAt(_position);
      } else if (cameraMode === 'first-person') {
        // Position camera inside the cabin
        _offset.set(0, 0.5, 0.5).applyQuaternion(_quaternion);
        _cameraPosition.copy(_position).add(_offset);
        state.camera.position.copy(_cameraPosition);
        
        // Look forward with offset
        const euler = new Euler(cameraAngleY.current, cameraAngleX.current, 0, 'YXZ');
        _wDir.set(0, 0, 1).applyEuler(euler).applyQuaternion(_quaternion).normalize();

        _lookAtPos.copy(_wDir).multiplyScalar(10).add(_cameraPosition);
        state.camera.lookAt(_lookAtPos);
      }
    }
  });

  return (
    <group ref={vehicle}>
      <group ref={chassisRef}>
        {carType === 'volvo' && <Volvo140 damage={visualDamage} />}
        {carType === 'sports' && <SportsCar80s damage={visualDamage} />}
        {carType === 'muscle' && <MuscleCar60s damage={visualDamage} />}
        {carType === 'soviet' && <SovietClassic damage={visualDamage} />}
        {carType === 'euro' && <EuroCompact damage={visualDamage} />}
        {carType === 'cyber' && <CyberpunkCar damage={visualDamage} />}
        {carType === 'truck' && <PickupTruck damage={visualDamage} />}
        {carType === 'f1' && <Formula1 damage={visualDamage} />}
      </group>
      <Wheel ref={wheel1} radius={radius} leftSide />
      <Wheel ref={wheel2} radius={radius} />
      <Wheel ref={wheel3} radius={radius} leftSide />
      <Wheel ref={wheel4} radius={radius} />
    </group>
  );
}
