"use client";

import { motion } from "framer-motion";
import PrometheeLogo from './PrometheeLogo';

export default function ParticleOrb() {
  const particles = [...Array(15)].map((_, i) => ({
    id: i,
    angle: Math.random() * 360,
    distance: 100 + Math.random() * 200,
    size: Math.random() * 4 + 1,
    duration: 3 + Math.random() * 5,
    delay: Math.random() * 5,
  }));

  return (
    <div className="w-full h-full relative flex items-center justify-center scale-[0.85] md:scale-100 group">
      
      {/* Outer Massive Glow */}
      <motion.div 
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-[radial-gradient(circle,rgba(168,85,247,0.2)_0%,transparent_70%)] pointer-events-none blur-xl will-change-transform" 
      />

      {/* Floating Particles */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 0.8, 0], 
              x: Math.cos(p.angle * (Math.PI / 180)) * p.distance,
              y: Math.sin(p.angle * (Math.PI / 180)) * p.distance,
              scale: [0, 1.5, 0]
            }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeOut" }}
            className="absolute rounded-full bg-fuchsia-400 will-change-transform"
            style={{ width: p.size, height: p.size }}
          />
        ))}
      </div>

      {/* Complex Network Branches */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
        className="absolute w-[500px] h-[500px] pointer-events-none will-change-transform"
      >
        <svg viewBox="0 0 200 200" className="w-full h-full opacity-60">
          {[...Array(12)].map((_, i) => (
            <g key={i} transform={`rotate(${i * 30} 100 100)`}>
              <path d="M 100 30 L 100 5 L 115 -5" fill="none" stroke="url(#branchGrad)" strokeWidth="0.5" className="animate-pulse" />
              <circle cx="115" cy="-5" r="1.5" fill="#f0abfc" className="animate-ping" />
              <path d="M 100 40 L 80 10 L 75 0" fill="none" stroke="#a855f7" strokeWidth="0.3" strokeDasharray="2 2" />
              <rect x="73.5" y="-1.5" width="3" height="3" fill="#c084fc" />
            </g>
          ))}
          <defs>
            <linearGradient id="branchGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#7e22ce" stopOpacity="0" />
              <stop offset="100%" stopColor="#d946ef" stopOpacity="1" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Ring 1 - 3D Perspective Ring */}
      <motion.div 
        animate={{ rotateX: [60, 60], rotateZ: [0, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute w-96 h-96 rounded-full border-2 border-fuchsia-500/30 pointer-events-none shadow-[0_0_15px_rgba(217,70,239,0.3)] will-change-transform"
        style={{ transformStyle: "preserve-3d" }}
      />
      <motion.div 
        animate={{ rotateY: [60, 60], rotateZ: [360, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute w-96 h-96 rounded-full border-2 border-purple-500/30 pointer-events-none shadow-[0_0_15px_rgba(168,85,247,0.3)] will-change-transform"
        style={{ transformStyle: "preserve-3d" }}
      />

      {/* Ring 2 - Segmented Tech Markers */}
      <motion.div 
        animate={{ rotate: -360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="absolute w-72 h-72 rounded-full pointer-events-none will-change-transform"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-90 drop-shadow-[0_0_8px_#c084fc]">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="15 5 2 5" />
          <circle cx="50" cy="50" r="41" fill="none" stroke="#f0abfc" strokeWidth="0.5" strokeDasharray="2 8" />
        </svg>
      </motion.div>

      {/* Ring 3 - Bold Arc Reactor Ring */}
      <motion.div 
        animate={{ rotate: 360, scale: [1, 1.05, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-56 h-56 rounded-full pointer-events-none will-change-transform"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_10px_#9333ea]">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#d946ef" strokeWidth="5" strokeDasharray="40 20" strokeLinecap="round" />
          <circle cx="50" cy="50" r="34" fill="none" stroke="#f0abfc" strokeWidth="1" strokeDasharray="3 4" />
        </svg>
      </motion.div>

      {/* Core Glowing Orb */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="w-28 h-28 rounded-full bg-gradient-to-tr from-purple-600 via-fuchsia-400 to-white flex items-center justify-center z-10 border-4 border-white/50 cursor-pointer shadow-[0_0_40px_rgba(217,70,239,0.7)] will-change-transform"
      >
        <div className="absolute inset-0 bg-white/50 rounded-full blur-[10px] mix-blend-overlay" />
        <PrometheeLogo className="w-14 h-14 text-white relative z-20 drop-shadow-[0_0_10px_rgba(255,255,255,1)]" />
      </motion.div>
      
      {/* Central Super Bright Glare */}
      <motion.div
        animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.3, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-12 h-12 bg-white rounded-full blur-[15px] z-20 pointer-events-none mix-blend-screen will-change-transform"
      />
    </div>
  );
}
