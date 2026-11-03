"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function GuidePrismCanvas({ className = "w-full h-48" }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 280;
    const height = container.clientHeight || 192;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // Colorful Holographic Prism / Octahedron
    const geo = new THREE.OctahedronGeometry(2.0, 0);
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0x98e376, // Brand lime
      emissive: 0x6366f1, // Indigo glow
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      wireframe: false,
    });
    const prism = new THREE.Mesh(geo, mat);
    group.add(prism);

    // Surrounding glowing wireframe cage
    const cageGeo = new THREE.IcosahedronGeometry(2.5, 1);
    const cageMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const cage = new THREE.Mesh(cageGeo, cageMat);
    group.add(cage);

    // Orbiting mini tokens
    const nodeCount = 3;
    const nodes: THREE.Mesh[] = [];
    const colors = [0xf43f5e, 0x38bdf8, 0xfbbf24];
    const nodeGeo = new THREE.SphereGeometry(0.2, 12, 12);

    for (let i = 0; i < nodeCount; i++) {
      const nodeMat = new THREE.MeshStandardMaterial({
        color: colors[i],
        emissive: colors[i],
        emissiveIntensity: 0.8,
      });
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      group.add(node);
      nodes.push(node);
    }

    const light = new THREE.DirectionalLight(0xffffff, 2.5);
    light.position.set(3, 4, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 1.0));

    let frameId: number;
    let time = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.015;

      prism.rotation.y += 0.012;
      prism.rotation.x += 0.008;
      cage.rotation.y -= 0.006;

      nodes.forEach((node, i) => {
        const angle = time + (i * Math.PI * 2) / nodeCount;
        node.position.x = Math.cos(angle) * 3.2;
        node.position.z = Math.sin(angle) * 3.2;
        node.position.y = Math.sin(time * 2 + i) * 0.5;
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geo.dispose();
      mat.dispose();
      cageGeo.dispose();
      cageMat.dispose();
      nodeGeo.dispose();
    };
  }, []);

  return <div ref={mountRef} className={className} />;
}
