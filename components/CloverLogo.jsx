export default function CloverLogo({ className = "w-12 h-12 text-green-500" }) {
    return (
      <svg
        className={className}
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
      >
        {/* Folha superior */}
        <path d="M100 60 C100 40, 80 20, 60 20 C40 20, 20 40, 20 60 C20 80, 40 100, 60 100 C80 100, 100 80, 100 60Z" />
        {/* Folha direita */}
        <path
          d="M140 100 C160 100, 180 80, 180 60 C180 40, 160 20, 140 20 C120 20, 100 40, 100 60 C100 80, 120 100, 140 100Z"
          transform="rotate(90 100 100)"
        />
        {/* Folha inferior */}
        <path
          d="M100 140 C100 160, 80 180, 60 180 C40 180, 20 160, 20 140 C20 120, 40 100, 60 100 C80 100, 100 120, 100 140Z"
          transform="rotate(180 100 100)"
        />
        {/* Folha esquerda */}
        <path
          d="M60 100 C40 100, 20 80, 20 60 C20 40, 40 20, 60 20 C80 20, 100 40, 100 60 C100 80, 80 100, 60 100Z"
          transform="rotate(270 100 100)"
        />
        {/* Talo */}
        <path
          d="M100 140 C105 160, 110 180, 115 200"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  