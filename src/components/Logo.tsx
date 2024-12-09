import {
  useEffect,
  useState,
} from 'react';

export function Logo() {
  const [glowIntensity, setGlowIntensity] = useState(0);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    // Glow animation
    const glowAnimate = () => {
      const intensity = (Math.sin(Date.now() / 1000) * 0.5 + 0.5) * 0.8 + 0.2; // Keep minimum glow at 0.2
      setGlowIntensity(intensity);
    };

    // Floating animation
    const floatAnimate = () => {
      const scaleValue = (Math.sin(Date.now() / 1500) * 0.05 + 1); // Subtle scale between 0.95 and 1.05
      setScale(scaleValue);
    };

    // Combine animations
    const animate = () => {
      glowAnimate();
      floatAnimate();
      requestAnimationFrame(animate);
    };

    const animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <div className="relative w-48 h-48 mx-auto mb-8">
      {/* Multiple glow layers for enhanced effect */}
      <div
        className="absolute inset-0 rounded-full blur-3xl transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle, rgba(139, 92, 246, ${glowIntensity * 0.3}), rgba(34, 197, 94, ${glowIntensity * 0.2}))`,
          opacity: glowIntensity,
        }}
      />
      <div
        className="absolute inset-0 rounded-full blur-2xl transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle, rgba(139, 92, 246, ${glowIntensity * 0.4}), rgba(34, 197, 94, ${glowIntensity * 0.3}))`,
          opacity: glowIntensity,
        }}
      />
      <div
        className="absolute inset-0 rounded-full blur-xl transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle, rgba(139, 92, 246, ${glowIntensity * 0.5}), rgba(34, 197, 94, ${glowIntensity * 0.4}))`,
          opacity: glowIntensity,
        }}
      />
      
      {/* Image with enhanced glow and scale animation */}
      <img
        src="https://guzlanuvzfgcekmupcrx.supabase.co/storage/v1/object/public/Art/dope.png"
        alt="Logo"
        className="relative w-full h-full object-contain transition-transform duration-300"
        style={{
          transform: `scale(${scale})`,
          filter: `
            drop-shadow(0 0 ${10 * glowIntensity}px rgba(139, 92, 246, ${glowIntensity * 0.5}))
            drop-shadow(0 0 ${20 * glowIntensity}px rgba(34, 197, 94, ${glowIntensity * 0.3}))
          `,
        }}
      />
    </div>
  );
}
