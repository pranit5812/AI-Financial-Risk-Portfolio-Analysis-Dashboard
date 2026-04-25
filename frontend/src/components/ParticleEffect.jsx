import { useEffect, useState } from "react";

function ParticleEffect({ isActive, duration = 3000 }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!isActive) return;

    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: window.innerHeight + 10,
      vx: (Math.random() - 0.5) * 4,
      vy: -(Math.random() * 3 + 2),
      life: 1,
      color: ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 4)]
    }));

    setParticles(newParticles);

    const animate = () => {
      setParticles(prev =>
        prev.map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vy: particle.vy + 0.1, // gravity
          life: particle.life - 0.02
        })).filter(particle => particle.life > 0)
      );
    };

    const interval = setInterval(animate, 16); // ~60fps

    const timeout = setTimeout(() => {
      setParticles([]);
      clearInterval(interval);
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isActive, duration]);

  if (!isActive || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: particle.x,
            top: particle.y,
            backgroundColor: particle.color,
            opacity: particle.life,
            transform: `scale(${particle.life})`,
            boxShadow: `0 0 ${10 * particle.life}px ${particle.color}`
          }}
        />
      ))}
    </div>
  );
}

export default ParticleEffect;