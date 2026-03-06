import { useEffect, useState } from 'react';

export function useControls() {
  const [controls, setControls] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    lookUp: false,
    lookDown: false,
    lookLeft: false,
    lookRight: false,
    brake: false,
    reset: false,
    interact: false,
    sprint: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w':
          setControls((c) => ({ ...c, forward: true }));
          break;
        case 'arrowup':
          setControls((c) => ({ ...c, lookUp: true }));
          break;
        case 's':
          setControls((c) => ({ ...c, backward: true }));
          break;
        case 'arrowdown':
          setControls((c) => ({ ...c, lookDown: true }));
          break;
        case 'a':
          setControls((c) => ({ ...c, left: true }));
          break;
        case 'arrowleft':
          setControls((c) => ({ ...c, lookLeft: true }));
          break;
        case 'd':
          setControls((c) => ({ ...c, right: true }));
          break;
        case 'arrowright':
          setControls((c) => ({ ...c, lookRight: true }));
          break;
        case ' ':
          setControls((c) => ({ ...c, brake: true }));
          break;
        case 'r':
          setControls((c) => ({ ...c, reset: true }));
          break;
        case 'e':
        case 'enter':
          setControls((c) => ({ ...c, interact: true }));
          break;
        case 'shift':
          setControls((c) => ({ ...c, sprint: true }));
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w':
          setControls((c) => ({ ...c, forward: false }));
          break;
        case 'arrowup':
          setControls((c) => ({ ...c, lookUp: false }));
          break;
        case 's':
          setControls((c) => ({ ...c, backward: false }));
          break;
        case 'arrowdown':
          setControls((c) => ({ ...c, lookDown: false }));
          break;
        case 'a':
          setControls((c) => ({ ...c, left: false }));
          break;
        case 'arrowleft':
          setControls((c) => ({ ...c, lookLeft: false }));
          break;
        case 'd':
          setControls((c) => ({ ...c, right: false }));
          break;
        case 'arrowright':
          setControls((c) => ({ ...c, lookRight: false }));
          break;
        case ' ':
          setControls((c) => ({ ...c, brake: false }));
          break;
        case 'r':
          setControls((c) => ({ ...c, reset: false }));
          break;
        case 'e':
        case 'enter':
          setControls((c) => ({ ...c, interact: false }));
          break;
        case 'shift':
          setControls((c) => ({ ...c, sprint: false }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return controls;
}
