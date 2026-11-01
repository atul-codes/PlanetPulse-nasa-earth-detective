'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, ZoomIn, ZoomOut, Compass, MapPin, Eye, MousePointerClick, Navigation } from 'lucide-react';

export default function EarthGlobe({
  latitude = 26.8467,
  longitude = 80.9462,
  onCoordinateSelect,
  variableId = 'T2M',
  trendDirection = 'increasing'
}) {
  const containerRef = useRef(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [lastClickedPoint, setLastClickedPoint] = useState(null);
  const [isInvestigating, setIsInvestigating] = useState(false);

  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const globeGroupRef = useRef(null);
  const earthMeshRef = useRef(null);
  const cloudsMeshRef = useRef(null);
  const markerRef = useRef(null);
  const cameraRef = useRef(null);

  // Helper: Convert Lat/Lon (degrees) to 3D Cartesian coordinates
  const latLonToVector3 = (lat, lon, radius = 2.0) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 520;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5.2);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 2. Lighting (Realistic Sun & Ambient Light)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
    sunLight.position.set(6, 3, 5);
    scene.add(sunLight);

    const cyanLimbLight = new THREE.DirectionalLight(0x16c7e8, 1.2);
    cyanLimbLight.position.set(-6, -2, -5);
    scene.add(cyanLimbLight);

    // 3. Earth Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // 4. Load Real NASA Blue Marble Textures
    const textureLoader = new THREE.TextureLoader();
    const earthMap = textureLoader.load('/textures/earth_atmos_2048.jpg');
    const specularMap = textureLoader.load('/textures/earth_specular_2048.jpg');
    const cloudsMap = textureLoader.load('/textures/earth_clouds_1024.png');

    // Earth Sphere Mesh
    const earthGeometry = new THREE.SphereGeometry(2.0, 64, 64);
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: earthMap,
      specularMap: specularMap,
      specular: new THREE.Color(0x334466),
      shininess: 25,
      bumpScale: 0.04
    });
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    globeGroup.add(earthMesh);
    earthMeshRef.current = earthMesh;

    // 5. Cloud Sphere Layer (Realistic Atmospheric Clouds)
    const cloudsGeometry = new THREE.SphereGeometry(2.025, 48, 48);
    const cloudsMaterial = new THREE.MeshPhongMaterial({
      map: cloudsMap,
      transparent: true,
      opacity: 0.38,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
    globeGroup.add(cloudsMesh);
    cloudsMeshRef.current = cloudsMesh;

    // 6. Glowing Atmospheric Limb Shader
    const atmosphereGeometry = new THREE.SphereGeometry(2.14, 48, 48);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.68 - dot(vNormal, vec3(0, 0, 1.0)), 2.4);
          gl_FragColor = vec4(0.086, 0.78, 0.91, 1.0) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphereMesh);

    // 7. Ambient Deep Space Starfield
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 1000;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 75;
      starPositions[i + 1] = (Math.random() - 0.5) * 75;
      starPositions[i + 2] = (Math.random() - 0.5) * 75;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0x94a3b8, size: 0.1, transparent: true, opacity: 0.65 });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // 8. Location Pin Marker
    const markerGroup = new THREE.Group();
    globeGroup.add(markerGroup);
    markerRef.current = markerGroup;

    // Pin Pole
    const pinPoleGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.35, 16);
    const pinPoleMat = new THREE.MeshBasicMaterial({ color: 0x16c7e8 });
    const pinPole = new THREE.Mesh(pinPoleGeo, pinPoleMat);
    pinPole.position.y = 0.175;
    markerGroup.add(pinPole);

    // Glowing Pin Head
    const pinHeadGeo = new THREE.SphereGeometry(0.075, 16, 16);
    const pinHeadMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const pinHead = new THREE.Mesh(pinHeadGeo, pinHeadMat);
    pinHead.position.y = 0.35;
    markerGroup.add(pinHead);

    // Surface Radar Pulse Wave
    const ringGeo = new THREE.RingGeometry(0.05, 0.18, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x16c7e8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    const pulseRing = new THREE.Mesh(ringGeo, ringMat);
    pulseRing.rotation.x = Math.PI / 2;
    markerGroup.add(pulseRing);

    // Position marker at initial coordinates
    const initialPos = latLonToVector3(latitude, longitude, 2.0);
    markerGroup.position.copy(initialPos);
    markerGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), initialPos.clone().normalize());

    // Orient globe so initial point faces user
    const initRotY = -((longitude + 180) * (Math.PI / 180)) + Math.PI / 2;
    const initRotX = (latitude * (Math.PI / 180)) * 0.4;
    globeGroup.rotation.y = initRotY;
    globeGroup.rotation.x = initRotX;

    // 9. Simple, Frictionless Drag & Click Interaction
    let isDragging = false;
    let pointerDownPos = { x: 0, y: 0 };
    let previousPointerPos = { x: 0, y: 0 };

    const onPointerDown = (e) => {
      isDragging = false;
      pointerDownPos = { x: e.clientX, y: e.clientY };
      previousPointerPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e) => {
      const deltaFromDown = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (deltaFromDown > 5) {
        isDragging = true;
      }

      if (isDragging && globeGroupRef.current) {
        const deltaX = e.clientX - previousPointerPos.x;
        const deltaY = e.clientY - previousPointerPos.y;

        globeGroupRef.current.rotation.y += deltaX * 0.005;
        globeGroupRef.current.rotation.x += deltaY * 0.005;
        globeGroupRef.current.rotation.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, globeGroupRef.current.rotation.x));
      }
      previousPointerPos = { x: e.clientX, y: e.clientY };
    };

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerUp = (e) => {
      // If pointer did not drag more than 5px, it is an intentional CLICK to check a location!
      if (!isDragging && earthMeshRef.current && onCoordinateSelect) {
        const rect = domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(earthMeshRef.current);

        if (intersects.length > 0) {
          const hitPoint = intersects[0].point;
          // Transform hit point into local globe coordinates
          const localPoint = globeGroup.worldToLocal(hitPoint.clone()).normalize();
          const clickedLat = 90 - (Math.acos(localPoint.y) * 180) / Math.PI;
          const clickedLon = ((Math.atan2(localPoint.z, -localPoint.x) * 180) / Math.PI) - 180;

          let normalizedLon = clickedLon;
          if (normalizedLon < -180) normalizedLon += 360;
          if (normalizedLon > 180) normalizedLon -= 360;

          const finalLat = Number(clickedLat.toFixed(4));
          const finalLon = Number(normalizedLon.toFixed(4));

          setLastClickedPoint({ lat: finalLat, lon: finalLon });
          setIsInvestigating(true);

          // Update pin position immediately
          const newPos = latLonToVector3(finalLat, finalLon, 2.0);
          markerGroup.position.copy(newPos);
          markerGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), newPos.clone().normalize());

          // Trigger data retrieval & analysis
          onCoordinateSelect(finalLat, finalLon);
          setTimeout(() => setIsInvestigating(false), 1200);
        }
      }
      isDragging = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      const newZ = cameraRef.current.position.z + e.deltaY * 0.003;
      if (newZ >= 3.0 && newZ <= 8.5) {
        cameraRef.current.position.z = newZ;
        setZoomLevel(Number(((8.5 - newZ) / 5.5 + 0.5).toFixed(2)));
      }
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    domElement.addEventListener('wheel', onWheel, { passive: false });

    // 10. Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle realistic Earth rotation
      if (autoRotate && !isDragging && globeGroupRef.current) {
        globeGroupRef.current.rotation.y += 0.0012;
      }

      // Independent cloud layer rotation
      if (cloudsMeshRef.current) {
        cloudsMeshRef.current.rotation.y += 0.0006;
      }

      // Radar pulse wave expansion
      if (pulseRing) {
        const scale = 1 + 0.35 * Math.sin(elapsedTime * 4.5);
        pulseRing.scale.set(scale, scale, scale);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      domElement.removeEventListener('pointerdown', onPointerDown);
      domElement.removeEventListener('wheel', onWheel);
      renderer.dispose();
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
    };
  }, []);

  // Update pin when coordinates change via left panel or presets
  useEffect(() => {
    if (!markerRef.current || !globeGroupRef.current) return;
    const pos = latLonToVector3(latitude, longitude, 2.0);
    markerRef.current.position.copy(pos);
    markerRef.current.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      pos.clone().normalize()
    );

    // Smoothly orient globe towards selected region
    const targetRotY = -((longitude + 180) * (Math.PI / 180)) + Math.PI / 2;
    const targetRotX = (latitude * (Math.PI / 180)) * 0.4;
    globeGroupRef.current.rotation.y = targetRotY;
    globeGroupRef.current.rotation.x = targetRotX;
  }, [latitude, longitude]);

  const handleRecenter = () => {
    if (!globeGroupRef.current || !cameraRef.current) return;
    const targetRotY = -((longitude + 180) * (Math.PI / 180)) + Math.PI / 2;
    const targetRotX = (latitude * (Math.PI / 180)) * 0.4;
    globeGroupRef.current.rotation.y = targetRotY;
    globeGroupRef.current.rotation.x = targetRotX;
    cameraRef.current.position.set(0, 0, 5.2);
    setZoomLevel(1);
  };

  const handleZoom = (delta) => {
    if (!cameraRef.current) return;
    const newZ = cameraRef.current.position.z - delta;
    if (newZ >= 3.0 && newZ <= 8.5) {
      cameraRef.current.position.z = newZ;
      setZoomLevel(Number(((8.5 - newZ) / 5.5 + 0.5).toFixed(2)));
    }
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-[#02040A] rounded-xl overflow-hidden border border-white/[0.08] shadow-card-space flex flex-col group select-none">
      {/* Top HUD Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        {/* Selected Coordinates Readout */}
        <div className="flex items-center space-x-2 bg-[#040714]/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 pointer-events-auto">
          <MapPin className="w-3.5 h-3.5 text-[#16C7E8]" />
          <span className="text-xs font-mono text-slate-200">
            {latitude >= 0 ? `${latitude.toFixed(2)}°N` : `${Math.abs(latitude).toFixed(2)}°S`},{' '}
            {longitude >= 0 ? `${longitude.toFixed(2)}°E` : `${Math.abs(longitude).toFixed(2)}°W`}
          </span>
        </div>

        {/* Simple Controls (Rotate, Recenter, Zoom) */}
        <div className="flex items-center space-x-2 pointer-events-auto">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-2.5 py-1 text-xs rounded-md border font-mono transition flex items-center space-x-1.5 ${
              autoRotate
                ? 'bg-[#16C7E8]/15 border-[#16C7E8] text-[#16C7E8]'
                : 'bg-[#0A1226] border-white/10 text-slate-400 hover:text-white'
            }`}
            title="Toggle Earth Rotation"
          >
            <RotateCw className={`w-3 h-3 ${autoRotate ? 'animate-spin' : ''}`} />
            <span>{autoRotate ? 'ROTATING' : 'PAUSED'}</span>
          </button>

          <button
            onClick={handleRecenter}
            className="p-1.5 text-xs rounded-md border bg-[#0A1226] border-white/10 text-slate-400 hover:text-white hover:border-[#16C7E8]/50 transition"
            title="Recenter Globe on Selected Pin"
          >
            <Navigation className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center space-x-0.5 bg-[#0A1226] border border-white/10 rounded-md p-0.5">
            <button
              onClick={() => handleZoom(0.6)}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/[0.05]"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleZoom(-0.6)}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/[0.05]"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="w-full flex-1 cursor-grab active:cursor-grabbing" />

      {/* Floating Click Notification when user clicks a point */}
      {isInvestigating && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 bg-[#040714]/95 backdrop-blur-md px-4 py-2 rounded-xl border border-[#16C7E8] text-xs font-mono text-white flex items-center space-x-2 shadow-glow-cyan animate-pulse">
          <span className="w-2 h-2 rounded-full bg-accent-green" />
          <span>NASA POWER: RETRIEVING RECORDS FOR CLICKED LOCATION...</span>
        </div>
      )}

      {/* Bottom Simple Hint Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="bg-[#040714]/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 pointer-events-auto flex items-center space-x-2 text-[11px] font-mono text-slate-300">
          <MousePointerClick className="w-3.5 h-3.5 text-[#16C7E8] animate-bounce" />
          <span>Click anywhere on the globe to investigate that location</span>
        </div>

        <div className="bg-[#040714]/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 pointer-events-auto text-[10px] font-mono text-slate-400">
          NASA BLUE MARBLE 2K
        </div>
      </div>
    </div>
  );
}
