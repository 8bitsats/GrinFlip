import {
  useEffect,
  useRef,
} from 'react';

import * as THREE from 'three';

import { SoundManager } from '../lib/sounds';

interface CoinFlipProps {
    isFlipping: boolean;
    result: 'heads' | 'tails' | null;
    soundEnabled?: boolean;
}

export function CoinFlip({ isFlipping, result, soundEnabled = true }: CoinFlipProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const coinRef = useRef<THREE.Mesh | null>(null);
    const frameIdRef = useRef<number>(0);
    const flipStartTimeRef = useRef<number>(0);

    useEffect(() => {
        if (!containerRef.current) return;

        // Initialize Three.js scene
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance"
        });

        renderer.setSize(300, 300);
        renderer.setPixelRatio(window.devicePixelRatio);
        containerRef.current.appendChild(renderer.domElement);

        // Create coin geometry with higher detail
        const geometry = new THREE.CylinderGeometry(1, 1, 0.1, 64, 4);

        // Create materials for both sides of the coin using MeshStandardMaterial
        const headsMaterial = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            metalness: 0.8,
            roughness: 0.2,
            envMapIntensity: 1
        });

        const tailsMaterial = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            metalness: 0.8,
            roughness: 0.2,
            envMapIntensity: 1
        });

        // Create edge material
        const edgeMaterial = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            metalness: 0.9,
            roughness: 0.1,
            envMapIntensity: 1
        });

        // Create materials array for the coin
        const materials = [
            edgeMaterial,    // Edge
            headsMaterial,   // Top (Heads)
            tailsMaterial,   // Bottom (Tails)
        ];

        const coin = new THREE.Mesh(geometry, materials);
        scene.add(coin);

        // Add lighting
        const mainLight = new THREE.DirectionalLight(0xffffff, 1);
        mainLight.position.set(1, 1, 1);
        scene.add(mainLight);

        const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
        fillLight.position.set(-1, -1, -1);
        scene.add(fillLight);

        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        scene.add(ambientLight);

        // Add rim light
        const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
        rimLight.position.set(0, 0, -1);
        scene.add(rimLight);

        camera.position.z = 5;

        // Add subtle rotation to coin when idle
        const idleAnimation = () => {
            if (coin && !isFlipping) {
                coin.rotation.y += 0.005;
                renderer.render(scene, camera);
                requestAnimationFrame(idleAnimation);
            }
        };

        idleAnimation();

        sceneRef.current = scene;
        cameraRef.current = camera;
        rendererRef.current = renderer;
        coinRef.current = coin;

        // Initial render
        renderer.render(scene, camera);

        return () => {
            if (frameIdRef.current) {
                cancelAnimationFrame(frameIdRef.current);
            }
            if (containerRef.current && renderer.domElement) {
                containerRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);

    useEffect(() => {
        if (!coinRef.current || !sceneRef.current || !cameraRef.current || !rendererRef.current) return;

        let rotationSpeed = 0;
        const FLIP_DURATION = 3000; // 3 seconds

        if (isFlipping) {
            // Play flip sound
            SoundManager.playFlip(soundEnabled);
            
            flipStartTimeRef.current = Date.now();
            rotationSpeed = Math.PI * 8; // Initial rotation speed

            const animate = () => {
                const elapsedTime = Date.now() - flipStartTimeRef.current;
                const progress = Math.min(elapsedTime / FLIP_DURATION, 1);

                if (coinRef.current) {
                    // Calculate current rotation speed with easing
                    const currentSpeed = rotationSpeed * (1 - Math.pow(progress, 2));
                    
                    // Rotate coin with some randomness
                    coinRef.current.rotation.x += currentSpeed * 0.02;
                    coinRef.current.rotation.y += currentSpeed * 0.01;
                    coinRef.current.rotation.z += currentSpeed * 0.005;

                    // Add wobble effect
                    const wobble = Math.sin(progress * Math.PI * 4) * (1 - progress) * 0.2;
                    coinRef.current.rotation.z += wobble;

                    // Render scene
                    if (sceneRef.current && cameraRef.current && rendererRef.current) {
                        rendererRef.current.render(sceneRef.current, cameraRef.current);
                    }

                    if (progress < 1) {
                        frameIdRef.current = requestAnimationFrame(animate);
                    } else {
                        // Set final rotation based on result
                        if (result === 'heads') {
                            coinRef.current.rotation.x = Math.PI * 2;
                            coinRef.current.rotation.y = 0;
                            coinRef.current.rotation.z = 0;
                        } else if (result === 'tails') {
                            coinRef.current.rotation.x = Math.PI;
                            coinRef.current.rotation.y = 0;
                            coinRef.current.rotation.z = 0;
                        }
                        
                        if (sceneRef.current && cameraRef.current && rendererRef.current) {
                            rendererRef.current.render(sceneRef.current, cameraRef.current);
                        }
                    }
                }
            };

            frameIdRef.current = requestAnimationFrame(animate);
        } else {
            // Reset coin position when not flipping
            coinRef.current.rotation.x = result === 'tails' ? Math.PI : 0;
            coinRef.current.rotation.y = 0;
            coinRef.current.rotation.z = 0;
            
            if (sceneRef.current && cameraRef.current && rendererRef.current) {
                rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
        }

        return () => {
            if (frameIdRef.current) {
                cancelAnimationFrame(frameIdRef.current);
            }
        };
    }, [isFlipping, result, soundEnabled]);

    return (
        <div 
            ref={containerRef} 
            className="w-[300px] h-[300px] mx-auto"
            style={{ perspective: '1000px' }}
        />
    );
}
