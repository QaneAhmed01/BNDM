"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfettiProps {
    active: boolean;
}

export function Confetti({ active }: ConfettiProps) {
    const [pieces, setPieces] = useState<Array<{ id: number; left: string; delay: number; color: string; rotation: number }>>([]);

    useEffect(() => {
        if (active) {
            const colors = ["#FF6B9D", "#FFA07A", "#A8E6CF", "#FFD4B8", "#B3E5D1", "#FFC0CB"];
            const newPieces = Array.from({ length: 50 }, (_, i) => ({
                id: i,
                left: `${Math.random() * 100}%`,
                delay: Math.random() * 0.5,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
            }));
            setPieces(newPieces);
        }
    }, [active]);

    if (!active) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            <AnimatePresence>
                {pieces.map((piece) => (
                    <motion.div
                        key={piece.id}
                        initial={{ y: -20, opacity: 0, rotate: 0 }}
                        animate={{
                            y: window.innerHeight + 20,
                            opacity: [0, 1, 1, 0],
                            rotate: piece.rotation + 720,
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            delay: piece.delay,
                            ease: "easeIn",
                        }}
                        className="absolute w-3 h-3 rounded-sm"
                        style={{
                            left: piece.left,
                            backgroundColor: piece.color,
                        }}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}
