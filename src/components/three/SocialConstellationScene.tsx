"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface SocialConstellationSceneProps {
  className?: string;
  interactive?: boolean;
}

export function SocialConstellationScene({
  className = "w-full h-full",
  interactive = true,
}: SocialConstellationSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    // ── Scene, Camera & Renderer ──
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 24;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // ── Group Container for Rotation & Parallax ──
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // ── Central Geometric Core (Icosahedron with wireframe + solid core) ──
    const coreGeometry = new THREE.IcosahedronGeometry(3.6, 2);
    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x2563eb,
      roughness: 0.2,
      metalness: 0.8,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      wireframe: false,
      transparent: true,
      opacity: 0.8,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    worldGroup.add(coreMesh);

    // Wireframe outer cage
    const cageGeometry = new THREE.IcosahedronGeometry(4.4, 1);
    const cageMaterial = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const cageMesh = new THREE.Mesh(cageGeometry, cageMaterial);
    worldGroup.add(cageMesh);

    // ── Orbiting Rings ──
    const createRing = (radius: number, tiltX: number, tiltY: number, color: number) => {
      const ringGeo = new THREE.TorusGeometry(radius, 0.04, 16, 100);
      const ringMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.45,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = tiltX;
      ring.rotation.y = tiltY;
      worldGroup.add(ring);
      return ring;
    };

    const ring1 = createRing(6.8, Math.PI / 3, Math.PI / 6, 0x3b82f6);
    const ring2 = createRing(8.5, -Math.PI / 4, Math.PI / 4, 0x06b6d4);
    const ring3 = createRing(10.2, Math.PI / 2.2, 0, 0x38bdf8);

    // ── Floating Network Nodes (Satellite Nodes) ──
    const nodeCount = 12;
    const nodes: { mesh: THREE.Mesh; angle: number; speed: number; radius: number; yOffset: number }[] = [];
    const nodeGeometry = new THREE.SphereGeometry(0.35, 16, 16);
    const nodeColors = [0x2563eb, 0x0ea5e9, 0x10b981, 0xf59e0b, 0x3b82f6];

    for (let i = 0; i < nodeCount; i++) {
      const mat = new THREE.MeshStandardMaterial({
        color: nodeColors[i % nodeColors.length],
        emissive: nodeColors[i % nodeColors.length],
        emissiveIntensity: 0.6,
        roughness: 0.2,
      });
      const mesh = new THREE.Mesh(nodeGeometry, mat);
      const radius = 6.2 + (i % 4) * 1.4;
      const angle = (i / nodeCount) * Math.PI * 2;
      const yOffset = Math.sin(i) * 2.5;

      mesh.position.x = Math.cos(angle) * radius;
      mesh.position.z = Math.sin(angle) * radius;
      mesh.position.y = yOffset;

      worldGroup.add(mesh);
      nodes.push({
        mesh,
        angle,
        speed: 0.008 + (i % 3) * 0.004,
        radius,
        yOffset,
      });
    }

    // ── Particle Field (Star / Data dust) ──
    const particleCount = 260;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 45;
      positions[i + 1] = (Math.random() - 0.5) * 35;
      positions[i + 2] = (Math.random() - 0.5) * 30;

      colors[i] = 0.3 + Math.random() * 0.4;
      colors[i + 1] = 0.6 + Math.random() * 0.4;
      colors[i + 2] = 0.95;
    }

    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    worldGroup.add(particleSystem);

    // ── Lighting ──
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x60a5fa, 2.5);
    dirLight1.position.set(12, 18, 15);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x22d3ee, 1.8);
    dirLight2.position.set(-15, -10, -10);
    scene.add(dirLight2);

    // ── Mouse Tracking for Smooth Parallax ──
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const normX = (x / rect.width) * 2;
      const normY = (y / rect.height) * 2;
      targetRotationY = normX * 0.45;
      targetRotationX = normY * 0.35;
    };

    if (interactive) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    // ── Resize Observer ──
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      if (newWidth === 0 || newHeight === 0) return;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // ── Animation Loop ──
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth camera/world interpolation
      worldGroup.rotation.y += (targetRotationY - worldGroup.rotation.y) * 0.05 + 0.003;
      worldGroup.rotation.x += (targetRotationX - worldGroup.rotation.x) * 0.05;

      // Spin internal geometry
      coreMesh.rotation.y += 0.008;
      coreMesh.rotation.x += 0.004;
      cageMesh.rotation.y -= 0.005;
      cageMesh.rotation.z += 0.003;

      // Pulsing scale effect on core
      const pulse = 1 + Math.sin(elapsed * 2) * 0.04;
      coreMesh.scale.set(pulse, pulse, pulse);

      // Rings spin
      ring1.rotation.z += 0.006;
      ring2.rotation.z -= 0.005;
      ring3.rotation.z += 0.004;

      // Orbit satellite nodes
      nodes.forEach((node) => {
        node.angle += node.speed;
        node.mesh.position.x = Math.cos(node.angle) * node.radius;
        node.mesh.position.z = Math.sin(node.angle) * node.radius;
        node.mesh.position.y = node.yOffset + Math.sin(elapsed * 2 + node.angle) * 0.6;
      });

      // Subtle particle drift
      particleSystem.rotation.y = elapsed * 0.02;

      renderer.render(scene, camera);
    };

    animate();
    setIsLoaded(true);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (interactive) {
        window.removeEventListener("mousemove", handleMouseMove);
      }
      resizeObserver.disconnect();
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      coreGeometry.dispose();
      coreMaterial.dispose();
      cageGeometry.dispose();
      cageMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
    };
  }, [interactive]);

  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${className}`}>
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
        </div>
      )}
    </div>
  );
}
