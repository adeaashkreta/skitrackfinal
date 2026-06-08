import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 28, ...rest }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 32 32",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...rest,
  };
}

export function MountainPeak(props: IconProps) {
  return (
    <svg {...base(props)}>
      {/* Twin peaks with snow caps */}
      <path d="M3 26 L12 10 L17 18 L21 13 L29 26 Z" />
      <path d="M9.5 14.5 L12 10 L14 13.5" strokeOpacity="0.6" />
      <path d="M19 15 L21 13 L23 15.5" strokeOpacity="0.6" />
    </svg>
  );
}

export function Gondola(props: IconProps) {
  return (
    <svg {...base(props)}>
      {/* Diagonal cable */}
      <path d="M3 5 L29 19" />
      {/* Hanger */}
      <path d="M16 12 L16 16" />
      {/* Cabin */}
      <rect x="10" y="16" width="12" height="8" rx="1.5" />
      <path d="M10 19 L22 19" strokeOpacity="0.5" />
      {/* Tower */}
      <path d="M27 19 L27 28" strokeOpacity="0.5" />
    </svg>
  );
}

export function Snowflake(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M16 3 L16 29" />
      <path d="M5 9.5 L27 22.5" />
      <path d="M5 22.5 L27 9.5" />
      {/* Tips */}
      <path d="M13 5 L16 7 L19 5" />
      <path d="M13 27 L16 25 L19 27" />
      <path d="M6.5 12.5 L7 9 L10.5 9.5" strokeOpacity="0.8" />
      <path d="M25.5 19.5 L25 23 L21.5 22.5" strokeOpacity="0.8" />
      <path d="M10.5 22.5 L7 23 L6.5 19.5" strokeOpacity="0.8" />
      <path d="M21.5 9.5 L25 9 L25.5 12.5" strokeOpacity="0.8" />
    </svg>
  );
}

export function Medal(props: IconProps) {
  return (
    <svg {...base(props)}>
      {/* Ribbon */}
      <path d="M10 3 L13 13" />
      <path d="M22 3 L19 13" />
      <path d="M14 3 L17 9" strokeOpacity="0.5" />
      {/* Medal */}
      <circle cx="16" cy="20" r="8" />
      <path d="M16 16 L17.4 18.7 L20.3 19.2 L18.1 21.3 L18.6 24.2 L16 22.8 L13.4 24.2 L13.9 21.3 L11.7 19.2 L14.6 18.7 Z" strokeOpacity="0.7" />
    </svg>
  );
}
