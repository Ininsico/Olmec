import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Center, ContactShadows, Html } from '@react-three/drei';

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  useEffect(() => {
    return () => {
      useGLTF.clear(url);
    };
  }, [url]);
  return (
    <Center>
      <primitive object={scene} scale={1.5} />
    </Center>
  );
}

function LoadingFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 text-slate-400">
        <div className="w-6 h-6 border-2 border-richred/30 border-t-richred rounded-full animate-spin" />
        <span className="text-xs font-mono">Loading 3D Model...</span>
      </div>
    </Html>
  );
}

interface GLBViewerProps {
  url: string;
}

const GLBViewer: React.FC<GLBViewerProps> = ({ url }) => {
  const controlsRef = useRef<any>(null);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900 to-black">
      <Canvas shadows camera={{ position: [3, 2, 3], fov: 45 }} gl={{ antialias: true }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <directionalLight position={[-3, 3, -3]} intensity={0.3} />
        <hemisphereLight args={['#ffffff', '#444444', 0.5]} />
        <Suspense fallback={<LoadingFallback />}>
          <Model url={url} />
        </Suspense>
        <ContactShadows position={[0, -1.2, 0]} opacity={0.4} scale={5} blur={2} />
        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={1}
          maxDistance={10}
          autoRotate
          autoRotateSpeed={3}
        />
      </Canvas>
    </div>
  );
};

export default GLBViewer;
