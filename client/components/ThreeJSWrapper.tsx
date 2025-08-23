import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface ThreeJSWrapperProps {
  children: React.ReactNode;
}

const ThreeJSWrapper: React.FC<ThreeJSWrapperProps> = ({ children }) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [dotPosition, setDotPosition] = useState({ x: 0, y: 0 });
  const [isDotVisible, setIsDotVisible] = useState(false);

  // Three.js effect for the hero background
  useEffect(() => {
    if (!heroRef.current) return;

    let scene: THREE.Scene,
      camera: THREE.PerspectiveCamera,
      renderer: THREE.WebGLRenderer,
      plane: THREE.Mesh,
      light: THREE.AmbientLight;
    const width = heroRef.current.clientWidth;
    const height = heroRef.current.clientHeight;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 2;

    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    heroRef.current.appendChild(renderer.domElement);

    light = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(light);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 0, 5);
    scene.add(directionalLight);

    const geometry = new THREE.PlaneGeometry(10, 10, 32, 32);
    const material = new THREE.MeshLambertMaterial({
      color: 0x4b5563,
      wireframe: true,
      transparent: true,
      opacity: 0.1,
    });
    plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    let mouseX = 0,
      mouseY = 0;
    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);
      plane.rotation.x = mouseY * 0.1;
      plane.rotation.y = mouseX * 0.1;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!heroRef.current) return;
      const newWidth = heroRef.current.clientWidth;
      const newHeight = heroRef.current.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (
        heroRef.current &&
        renderer.domElement &&
        heroRef.current.contains(renderer.domElement)
      ) {
        heroRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  // Mouse cursor dot effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setDotPosition({ x: e.clientX, y: e.clientY });
      if (!isDotVisible) setIsDotVisible(true);
    };
    const handleMouseLeave = () => setIsDotVisible(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isDotVisible]);

  return (
    <>
      {/* Cursor dot */}
      {isDotVisible && (
        <div
          className="fixed w-3 h-3 rounded-full bg-blue-500 pointer-events-none transition-transform duration-75 ease-out z-[9999]"
          style={{
            transform: `translate(${dotPosition.x - 6}px, ${dotPosition.y - 6}px)`,
            opacity: 0.8,
          }}
        />
      )}

      {/* Pass heroRef to children through cloning */}
      {React.cloneElement(children as React.ReactElement, { heroRef })}
    </>
  );
};

export default ThreeJSWrapper;
