export default function PrometheeLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      className={className}
      fill="none"
    >
      <g filter="url(#glow)">
        {/* Core Geometry (Separated Triangles / Valknut / Destiny style) */}
        
        {/* Top Triangle */}
        <path 
          d="M50 15 L65 40 L35 40 Z" 
          fill="currentColor"
        />
        
        {/* Bottom Left Triangle */}
        <path 
          d="M32 45 L47 70 L17 70 Z" 
          fill="currentColor"
        />

        {/* Bottom Right Triangle */}
        <path 
          d="M68 45 L83 70 L53 70 Z" 
          fill="currentColor"
        />

        {/* Inner/Central Triangle (Empty/Negative Space) */}
        {/* L'espace entre les 3 triangles forme naturellement un triangle inversé, 
            renforçant l'aspect géométrique "séparé" demandé. */}
      </g>

      <defs>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}
