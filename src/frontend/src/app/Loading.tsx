import React from "react";
import { motion } from "framer-motion";

const FishLoading = ({ message = "Loading..." }) => {
  const bubbles = Array.from({ length: 6 });

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] w-full bg-blue-50/50 rounded-xl p-8">
      <div className="relative w-40 h-24">
        {bubbles.map((_, i) => (
          <motion.div
            key={i}
            className="absolute bottom-0 bg-blue-300 rounded-full opacity-60"
            style={{
              width: Math.random() * 10 + 5,
              height: Math.random() * 10 + 5,
              left: `${Math.random() * 80 + 10}%`,
            }}
            animate={{
              y: [-10, -80],
              opacity: [0, 0.6, 0],
              scale: [0.5, 1.2, 0.8],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeOut",
            }}
          />
        ))}

        <motion.div
          className="absolute inset-0 z-10"
          animate={{
            x: [-20, 20, -20],
            rotateY: [0, 180, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <svg
            viewBox="0 0 100 60"
            className="w-20 h-20 fill-orange-500 drop-shadow-md"
          >
            <path d="M10,30 Q30,10 60,25 T90,30 Q60,50 30,35 T10,30" />
            <motion.path
              d="M10,30 L-5,15 L-5,45 Z"
              animate={{ rotate: [-10, 10, -10] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
            <path d="M40,20 Q45,10 50,20" fill="currentColor" opacity="0.7" />
            <circle cx="75" cy="27" r="2" fill="white" />
            <circle cx="76" cy="27" r="0.8" fill="black" />
          </svg>
        </motion.div>
      </div>

      <motion.p
        className="mt-4 text-blue-600 font-medium italic"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {message}
      </motion.p>
    </div>
  );
};

export default FishLoading;
