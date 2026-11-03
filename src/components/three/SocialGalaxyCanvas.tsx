"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface SocialGalaxyCanvasProps {
  className?: string;
  connectedCount?: number;
}

export function SocialGalaxyCanvas({
  className = "w-full h-52",
  connectedCount = 5,
}: SocialGalaxyCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 340;
    const height = container.clientHeight || 208;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 8.5);

    // High performance WebGL renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 1. Central Glowing Iridescent Sphere
    const coreGeo = new THREE.IcosahedronGeometry(1.6, 3);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x98e376, // Postly brand lime green
      emissive: 0x1e3a8a, // Deep blue glow
      emissiveIntensity: 0.85,
      roughness: 0.15,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      wireframe: false,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    rootGroup.add(coreMesh);

    // 2. Wireframe Aura Shell around core
    const auraGeo = new THREE.IcosahedronGeometry(1.9, 1);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const auraMesh = new THREE.Mesh(auraGeo, auraMat);
    rootGroup.add(auraMesh);

    // 3. Tilted Glowing Orbital Rings
    const createRing = (radius: number, tiltX: number, tiltZ: number, color: number) => {
      const ringGeo = new THREE.TorusGeometry(radius, 0.02, 16, 80);
      const ringMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.45,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = tiltX;
      ring.rotation.z = tiltZ;
      return ring;
    };

    const ring1 = createRing(3.2, Math.PI / 3, Math.PI / 8, 0x38bdf8);
    const ring2 = createRing(3.9, -Math.PI / 3.5, -Math.PI / 6, 0xf43f5e);
    rootGroup.add(ring1);
    rootGroup.add(ring2);

    // 4. Vibrant Orbiting Social Satellites (Twitter, Instagram, LinkedIn, TikTok, YouTube)
    const platformColors = [
      0x1d9bf0, // Twitter/X (Sky blue)
      0xe1306c, // Instagram (Rose magenta)
      0x0a66c2, // LinkedIn (Cobalt)
      0x00f2fe, // TikTok (Cyan)
      0xff0000, // YouTube (Red)
      0x98e376, // Postly Hub (Lime green)
    ];

    const satCount = Math.max(3, Math.min(connectedCount, 6));
    const satellites: {
      mesh: THREE.Mesh;
      angle: number;
      speed: number;
      radius: number;
      elevation: number;
      elevSpeed: number;
    }[] = [];

    const satGeo = new THREE.SphereGeometry(0.24, 16, 16);

    for (let i = 0; i < satCount; i++) {
      const color = platformColors[i % platformColors.length];
      const sMat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.9,
        roughness: 0.2,
        metalness: 0.4,
      });
      const sMesh = new THREE.Mesh(satGeo, sMat);
      const radius = 2.8 + (i % 2) * 0.8;
      const angle = (i / satCount) * Math.PI * 2;
      sMesh.position.x = Math.cos(angle) * radius;
      sMesh.position.z = Math.sin(angle) * radius;
      sMesh.position.y = Math.sin(angle * 2) * 0.4;
      rootGroup.add(sMesh);

      satellites.push({
        mesh: sMesh,
        angle,
        speed: 0.012 + (i % 3) * 0.005,
        radius,
        elevation: Math.sin(angle * 2) * 0.4,
        elevSpeed: 0.02 + (i % 2) * 0.01,
      });
    }

    // 5. Multi-Color Shimmering Particle Cloud
    const particleCount = 75;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const palette = [
      new THREE.Color(0x98e376), // Mint
      new THREE.Color(0x38bdf8), // Cyan
      new THREE.Color(0xf43f5e), // Coral
      new THREE.Color(0xa855f7), // Purple
      new THREE.Color(0xfbbf24), // Gold
    ];

    for (let i = 0; i < particleCount; i++) {
      const r = 2.0 + Math.random() * 3.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.07,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
    });
    const particlePoints = new THREE.Points(particleGeo, particleMat);
    rootGroup.add(particlePoints);

    // 6. Lighting
    const pointLight = new THREE.PointLight(0xffffff, 2.5, 20);
    pointLight.position.set(4, 4, 4);
    scene.add(pointLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    // 7. Mouse Tilt Interaction
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotationY = x * 0.4;
      targetRotationX = -y * 0.3;
    };

    container.addEventListener("mousemove", handleMouseMove);

    // 8. Animation Loop
    let frameId: number;
    let time = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.015;

      // Smooth mouse follow
      rootGroup.rotation.y += (targetRotationY - rootGroup.rotation.y) * 0.05 + 0.004;
      rootGroup.rotation.x += (targetRotationX - rootGroup.rotation.x) * 0.05;

      coreMesh.rotation.y += 0.01;
      coreMesh.rotation.x += 0.005;
      auraMesh.rotation.y -= 0.008;

      ring1.rotation.y += 0.003;
      ring2.rotation.y -= 0.004;

      particlePoints.rotation.y += 0.002;

      // Update orbiting satellites
      satellites.forEach((sat, idx) => {
        sat.angle += sat.speed;
        sat.mesh.position.x = Math.cos(sat.angle) * sat.radius;
        sat.mesh.position.z = Math.sin(sat.angle) * sat.radius;
        sat.mesh.position.y = Math.sin(time * 2 + idx) * 0.35;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
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

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", handleMouseMove);
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      auraGeo.dispose();
      auraMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, [connectedCount]);

  return <div ref={mountRef} className={className} />;
}
