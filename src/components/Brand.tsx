export function Emblem({
  className = '',
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 100 116"
      fill="none"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M50 3 92 20Q99 23 96 33L83 90Q82 95 76 99L50 114 24 99Q18 95 17 90L4 33Q1 23 8 20Z"
        fill="currentColor"
      />
      <path
        d="m13 29 26 11m48-11L61 40M50 62v37"
        stroke="var(--logo-cutout, #000000)"
        strokeWidth="7"
        strokeLinecap="round"
      />
    </svg>
  );
}
export function Brand() {
  return (
    <span className="brand">
      <Emblem />
      <span>
        LASETE
        <span className="brand-caption">SEGURANÇA & TECNOLOGIA</span>
      </span>
    </span>
  );
}
