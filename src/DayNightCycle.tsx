import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { DirectionalLight, Color, AmbientLight } from 'three';

export function DayNightCycle({ enableShadows, graphicsQuality }: any) {
  const sunRef = useRef<DirectionalLight>(null);
  const ambientRef = useRef<AmbientLight>(null);

  useFrame(({ clock, scene }) => {
    const t = clock.getElapsedTime() * 0.05; // Speed of cycle
    
    // Sun position (circular path, much larger radius for long shadows)
    const radius = 500;
    const sunX = Math.cos(t) * radius;
    const sunY = Math.sin(t) * radius;
    const sunZ = Math.sin(t * 0.5) * 200; // Wobble

    if (sunRef.current) {
      sunRef.current.position.set(sunX, sunY, sunZ);
      
      const dayColor = new Color('#ffffff');
      const sunsetColor = new Color('#ff7b00');
      const nightColor = new Color('#1a2b4c');

      let currentColor = new Color();
      if (sunY > 100) {
        currentColor.lerpColors(sunsetColor, dayColor, (sunY - 100) / 400);
        sunRef.current.intensity = 2.5;
      } else if (sunY > 0) {
        currentColor.lerpColors(nightColor, sunsetColor, sunY / 100);
        sunRef.current.intensity = 1.5 + (sunY / 100);
      } else {
        currentColor = nightColor;
        sunRef.current.intensity = 0.5; // Moon light
      }
      
      sunRef.current.color.copy(currentColor);
    }

    if (ambientRef.current) {
      const ambientDay = new Color('#ffffff');
      const ambientNight = new Color('#051024');
      const heightRatio = Math.max(0, Math.min(1, (sunY + 100) / 600));
      ambientRef.current.color.lerpColors(ambientNight, ambientDay, heightRatio);
      ambientRef.current.intensity = 0.2 + heightRatio * 0.4;
    }

    // Background color
    const bgDay = new Color('#87CEEB');
    const bgSunset = new Color('#ffb37b');
    const bgNight = new Color('#050505');
    
    let bgColor = new Color();
    if (sunY > 100) {
      bgColor.lerpColors(bgSunset, bgDay, (sunY - 100) / 400);
    } else if (sunY > -100) {
      bgColor.lerpColors(bgNight, bgSunset, (sunY + 100) / 200);
    } else {
      bgColor = bgNight;
    }
    scene.background = bgColor;
  });

  return (
    <>
      <ambientLight ref={ambientRef} />
      <directionalLight 
        ref={sunRef}
        castShadow={enableShadows} 
        shadow-mapSize={graphicsQuality === 'high' ? [4096, 4096] : [2048, 2048]}
        shadow-camera-left={-400}
        shadow-camera-right={400}
        shadow-camera-top={400}
        shadow-camera-bottom={-400}
        shadow-camera-near={0.1}
        shadow-camera-far={1500}
        shadow-bias={-0.0005}
      />
    </>
  );
}
