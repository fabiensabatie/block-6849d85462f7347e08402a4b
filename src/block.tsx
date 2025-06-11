import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface BlockProps {
  title?: string;
  showOrbits?: boolean;
  animationSpeed?: number;
}

// Planet data with realistic relative sizes and distances
const planetData = [
  { name: 'Mercury', size: 0.1, distance: 2, color: '#8C7853', speed: 4.15 },
  { name: 'Venus', size: 0.15, distance: 2.7, color: '#FFA500', speed: 1.62 },
  { name: 'Earth', size: 0.16, distance: 3.5, color: '#6B93D6', speed: 1.0 },
  { name: 'Mars', size: 0.12, distance: 4.2, color: '#CD5C5C', speed: 0.53 },
  { name: 'Jupiter', size: 0.5, distance: 6.0, color: '#D2691E', speed: 0.084 },
  { name: 'Saturn', size: 0.45, distance: 8.0, color: '#FAD5A5', speed: 0.034 },
  { name: 'Uranus', size: 0.25, distance: 10.0, color: '#4FD0E3', speed: 0.012 },
  { name: 'Neptune', size: 0.24, distance: 12.0, color: '#4169E1', speed: 0.006 }
];

// Sun component
const Sun: React.FC = () => {
  const sunRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (sunRef.current) {
      sunRef.current.rotation.y += 0.005;
    }
  });

  return (
    <mesh ref={sunRef}>
      <Sphere args={[0.8, 32, 32]}>
        <meshBasicMaterial color="#FDB813" />
      </Sphere>
      <pointLight position={[0, 0, 0]} intensity={2} />
    </mesh>
  );
};

// Planet component
interface PlanetProps {
  name: string;
  size: number;
  distance: number;
  color: string;
  speed: number;
  animationSpeed: number;
  showOrbits: boolean;
}

const Planet: React.FC<PlanetProps> = ({ name, size, distance, color, speed, animationSpeed, showOrbits }) => {
  const planetRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += speed * 0.01 * animationSpeed;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
    }
  });

  // Create orbit ring geometry
  const orbitGeometry = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(angle) * distance, 0, Math.sin(angle) * distance));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [distance]);

  return (
    <group>
      {/* Orbit ring */}
      {showOrbits && (
        <line geometry={orbitGeometry}>
          <lineBasicMaterial color="#333333" opacity={0.3} transparent />
        </line>
      )}
      
      {/* Planet */}
      <group ref={planetRef}>
        <mesh ref={meshRef} position={[distance, 0, 0]}>
          <Sphere args={[size, 16, 16]}>
            <meshStandardMaterial color={color} />
          </Sphere>
        </mesh>
        
        {/* Planet label */}
        <Text
          position={[distance, size + 0.3, 0]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {name}
        </Text>
      </group>
    </group>
  );
};

// Main Solar System component
const SolarSystem: React.FC<{ showOrbits: boolean; animationSpeed: number }> = ({ showOrbits, animationSpeed }) => {
  return (
    <>
      <ambientLight intensity={0.1} />
      <Sun />
      {planetData.map((planet) => (
        <Planet
          key={planet.name}
          {...planet}
          showOrbits={showOrbits}
          animationSpeed={animationSpeed}
        />
      ))}
    </>
  );
};

// Main Block component
const Block: React.FC<BlockProps> = ({ 
  title = "3D Solar System", 
  showOrbits = true, 
  animationSpeed = 1 
}) => {
  return (
    <div style={{ width: '100%', height: '100vh', background: '#000011' }}>
      {/* Header */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 10,
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>{title}</h1>
        <p style={{ margin: '5px 0', fontSize: '14px', opacity: 0.8 }}>
          Use mouse to orbit • Scroll to zoom • Click and drag to explore
        </p>
      </div>

      {/* Controls */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 10,
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        background: 'rgba(0,0,0,0.7)',
        padding: '15px',
        borderRadius: '8px'
      }}>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>
            Show Orbits
          </label>
          <input
            type="checkbox"
            checked={showOrbits}
            onChange={() => {}} // This would be controlled by parent in real use
            style={{ marginRight: '5px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>
            Animation Speed: {animationSpeed}x
          </label>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={animationSpeed}
            onChange={() => {}} // This would be controlled by parent in real use
            style={{ width: '100px' }}
          />
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 8, 15], fov: 60 }}
        style={{ width: '100%', height: '100%' }}
      >
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxDistance={50}
          minDistance={3}
        />
        <SolarSystem showOrbits={showOrbits} animationSpeed={animationSpeed} />
        
        {/* Stars background */}
        <mesh>
          <sphereGeometry args={[100, 32, 32]} />
          <meshBasicMaterial color="#000011" side={THREE.BackSide} />
        </mesh>
      </Canvas>
    </div>
  );
};

export default Block;