"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Page() {
  const [particles, setParticles] = useState<Array<{ id: number; left: string; delay: number; size: number }>>([]);

  useEffect(() => {
    // Generate floating particles
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 15,
      size: 10 + Math.random() * 20,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <main className="relative min-h-screen flex flex-col md:flex-row items-center justify-center p-6 gap-8 md:gap-16 text-center md:text-left overflow-hidden">
      {/* Floating Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            background: `radial-gradient(circle, ${p.id % 3 === 0 ? '#FFB3D9' : p.id % 3 === 1 ? '#FFD4B8' : '#B3E5D1'
              }, transparent)`,
            filter: 'blur(8px)',
          }}
        />
      ))}

      {/* Left Side: Hero Section */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 space-y-6 max-w-xl flex-1 flex flex-col items-center md:items-start justify-center"
      >
        {/* Hero Illustration */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-full max-w-sm mb-4 md:mb-8"
        >
          <Image
            src="/hero-illustration.png"
            alt="Tournament Bracket"
            width={400}
            height={300}
            className="w-full h-auto drop-shadow-2xl"
            priority
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-5xl md:text-7xl font-black text-preg-ink tracking-tight leading-tight"
        >
          Baby Name{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-preg-pink via-preg-peach to-preg-rose">
            Deathmatch
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-xl md:text-2xl text-preg-ink/70 font-medium max-w-lg"
        >
          The ultimate way to choose a name. Fight it out live or let the crowd decide.
        </motion.p>
      </motion.div>

      {/* Right Side: Mode Cards */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl flex-1 content-center"
      >
        {/* Host Live Game */}
        <Link
          href="/live/host"
          className="group relative overflow-hidden rounded-3xl bg-white/90 backdrop-blur-sm p-6 shadow-soft transition-all duration-300 hover:shadow-strong hover:scale-[1.02] border border-preg-peach/30 tilt-3d flex flex-col justify-between h-full min-h-[200px]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-preg-pink/10 via-transparent to-preg-peach/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative space-y-3">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="h-12 w-12 rounded-xl bg-gradient-to-br from-preg-pink to-preg-peach flex items-center justify-center shadow-lg mb-2"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="13" rx="2" />
                <path d="M17 2l-5 5-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>
            <h2 className="text-2xl font-black text-preg-ink">Host Live</h2>
            <p className="text-sm text-preg-ink/70 leading-relaxed">
              Big screen mode. Party experience.
            </p>
          </div>
          <div className="pt-4 text-xs font-bold text-preg-pink uppercase tracking-wider">
            Start Hosting →
          </div>
        </Link>

        {/* Join Game */}
        <Link
          href="/join"
          className="group relative overflow-hidden rounded-3xl bg-white/90 backdrop-blur-sm p-6 shadow-soft transition-all duration-300 hover:shadow-strong hover:scale-[1.02] border border-preg-peach/30 tilt-3d flex flex-col justify-between h-full min-h-[200px]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-preg-mint/10 via-transparent to-preg-peach/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative space-y-3">
            <motion.div
              whileHover={{ rotate: [0, 10, -10, 10, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="h-12 w-12 rounded-xl bg-gradient-to-br from-preg-mint to-preg-peach flex items-center justify-center shadow-lg mb-2"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2" />
                <path d="M12 18h.01" strokeLinecap="round" />
              </svg>
            </motion.div>
            <h2 className="text-2xl font-black text-preg-ink">Join Game</h2>
            <p className="text-sm text-preg-ink/70 leading-relaxed">
              Enter code to join a live game.
            </p>
          </div>
          <div className="pt-4 text-xs font-bold text-preg-mint uppercase tracking-wider">
            Join Now →
          </div>
        </Link>

        {/* Pass & Play Mode */}
        <Link
          href="/tournament"
          className="group relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-sm p-5 shadow-sm transition-all duration-300 hover:bg-white hover:shadow-md border border-preg-peach/20 flex items-center gap-4 md:col-span-2"
        >
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-preg-ink" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M2 12h20" strokeLinecap="round" />
              <circle cx="7" cy="7" r="2" fill="currentColor" />
              <circle cx="17" cy="7" r="2" fill="currentColor" />
              <circle cx="7" cy="17" r="2" fill="currentColor" />
              <circle cx="17" cy="17" r="2" fill="currentColor" />
            </svg>
          </div>
          <div className="text-left flex-1">
            <h3 className="text-lg font-bold text-preg-ink">Pass & Play Mode</h3>
            <p className="text-xs text-preg-ink/60">Classic single-device tournament</p>
          </div>
          <div className="text-preg-ink/30 group-hover:text-preg-ink/60 transition-colors">→</div>
        </Link>

        {/* Async Poll */}
        <Link
          href="/poll/create"
          className="group relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-sm p-5 shadow-sm transition-all duration-300 hover:bg-white hover:shadow-md border border-preg-peach/20 flex items-center gap-4 md:col-span-2"
        >
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-preg-ink" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 3v18" strokeLinecap="round" />
              <path d="M6 6l2 2M16 6l2 2M6 16l2 2M16 16l2 2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="text-left flex-1">
            <h3 className="text-lg font-bold text-preg-ink">Async Poll</h3>
            <p className="text-xs text-preg-ink/60">Share a link for long-term voting</p>
          </div>
          <div className="text-preg-ink/30 group-hover:text-preg-ink/60 transition-colors">→</div>
        </Link>
      </motion.div>

      {/* Decorative Orbs */}
      <div className="absolute -top-24 -left-20 h-64 w-64 rounded-full orb orb--pink" />
      <div className="absolute top-1/3 -right-10 h-52 w-52 rounded-full orb orb--mint" />
      <div className="absolute bottom-10 left-8 h-48 w-48 rounded-full orb orb--peach" />
    </main>
  );
}
