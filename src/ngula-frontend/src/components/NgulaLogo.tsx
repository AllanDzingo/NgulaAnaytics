interface Props {
  className?: string;
}

export function NgulaLogo({ className = 'w-10 h-10' }: Props) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Mountain/Mine shaft silhouette */}
      <path
        d="M4 40L14 16L24 28L34 12L44 40H4Z"
        fill="#1a2744"
        stroke="#d4a843"
        strokeWidth="1.5"
      />
      {/* Data line graph integrated */}
      <path
        d="M14 24L20 18L26 22L34 14"
        stroke="#d4a843"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Data dot */}
      <circle cx="34" cy="14" r="2.5" fill="#d4a843" />
    </svg>
  );
}
