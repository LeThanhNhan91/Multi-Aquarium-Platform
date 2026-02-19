import React from "react";

interface AquariumLoaderProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  text?: string;
}

export const AquariumLoader: React.FC<AquariumLoaderProps> = ({
  size = "md",
  showText = true,
  text = "Đang tải...",
}) => {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const bubbleSizes = {
    sm: ["w-1 h-1", "w-1.5 h-1.5", "w-2 h-2"],
    md: ["w-1.5 h-1.5", "w-2 h-2", "w-3 h-3"],
    lg: ["w-2 h-2", "w-3 h-3", "w-4 h-4"],
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`relative ${sizeClasses[size]}`}>
        <div className="absolute inset-0 rounded-lg opacity-30"></div>

        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="animate-swim"
            style={{
              width: size === "sm" ? "32px" : size === "md" ? "48px" : "64px",
              height: size === "sm" ? "24px" : size === "md" ? "36px" : "48px",
            }}
            viewBox="0 0 64 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <ellipse
              cx="32"
              cy="24"
              rx="20"
              ry="12"
              fill="url(#fishGradient)"
            />

            <path
              d="M12 24 Q6 18, 2 16 Q6 24, 2 32 Q6 30, 12 24"
              fill="url(#tailGradient)"
              className="animate-tail-wave"
            />

            <path
              d="M32 12 Q34 6, 36 8 Q34 12, 32 12"
              fill="url(#finGradient)"
              className="animate-fin-wave"
            />

            <path
              d="M32 36 Q34 42, 36 40 Q34 36, 32 36"
              fill="url(#finGradient)"
              className="animate-fin-wave-reverse"
            />

            <circle cx="44" cy="22" r="3" fill="#1e3a8a" />
            <circle cx="45" cy="21" r="1" fill="white" />

            <circle cx="28" cy="24" r="2" fill="rgba(255,255,255,0.3)" />
            <circle cx="36" cy="26" r="1.5" fill="rgba(255,255,255,0.3)" />
            <circle cx="40" cy="24" r="2" fill="rgba(255,255,255,0.3)" />

            <defs>
              <linearGradient id="fishGradient" x1="12" y1="24" x2="52" y2="24">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="50%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#fdba74" />
              </linearGradient>
              <linearGradient id="tailGradient" x1="2" y1="24" x2="12" y2="24">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#fb923c" />
              </linearGradient>
              <linearGradient id="finGradient" x1="32" y1="0" x2="36" y2="48">
                <stop offset="0%" stopColor="#fb923c" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#fdba74" stopOpacity="0.9" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Bubbles */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className={`absolute ${bubbleSizes[size][0]} bg-cyan-300 rounded-full opacity-60 animate-bubble-1`}
            style={{ left: "20%", bottom: "10%" }}
          ></div>

          <div
            className={`absolute ${bubbleSizes[size][1]} bg-blue-300 rounded-full opacity-50 animate-bubble-2`}
            style={{ left: "50%", bottom: "5%" }}
          ></div>

          <div
            className={`absolute ${bubbleSizes[size][2]} bg-cyan-400 rounded-full opacity-70 animate-bubble-3`}
            style={{ left: "70%", bottom: "15%" }}
          ></div>

          <div
            className={`absolute ${bubbleSizes[size][0]} bg-blue-200 rounded-full opacity-60 animate-bubble-4`}
            style={{ left: "35%", bottom: "20%" }}
          ></div>
        </div>
      </div>

      {/* Text loading */}
      {showText && (
        <p className="text-sm text-cyan-600 animate-pulse">{text}</p>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes swim {
          0%, 100% {
            transform: translateX(-10px) rotate(-2deg);
          }
          50% {
            transform: translateX(10px) rotate(2deg);
          }
        }

        @keyframes tail-wave {
          0%, 100% {
            transform: scaleX(1);
          }
          50% {
            transform: scaleX(0.8);
          }
        }

        @keyframes fin-wave {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-2px);
          }
        }

        @keyframes fin-wave-reverse {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(2px);
          }
        }

        @keyframes bubble-rise-1 {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-100px) translateX(10px);
            opacity: 0;
          }
        }

        @keyframes bubble-rise-2 {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.5;
          }
          90% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-120px) translateX(-15px);
            opacity: 0;
          }
        }

        @keyframes bubble-rise-3 {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.7;
          }
          90% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(-110px) translateX(8px);
            opacity: 0;
          }
        }

        @keyframes bubble-rise-4 {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-95px) translateX(-12px);
            opacity: 0;
          }
        }

        @keyframes wave {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-swim {
          animation: swim 3s ease-in-out infinite;
        }

        .animate-tail-wave {
          transform-origin: left center;
          animation: tail-wave 0.5s ease-in-out infinite;
        }

        .animate-fin-wave {
          animation: fin-wave 1s ease-in-out infinite;
        }

        .animate-fin-wave-reverse {
          animation: fin-wave-reverse 1s ease-in-out infinite;
        }

        .animate-bubble-1 {
          animation: bubble-rise-1 3s ease-in infinite;
        }

        .animate-bubble-2 {
          animation: bubble-rise-2 3.5s ease-in infinite 0.5s;
        }

        .animate-bubble-3 {
          animation: bubble-rise-3 4s ease-in infinite 1s;
        }

        .animate-bubble-4 {
          animation: bubble-rise-4 3.2s ease-in infinite 1.5s;
        }

        .animate-wave {
          animation: wave 2s linear infinite;
        }
      `}</style>
    </div>
  );
};
