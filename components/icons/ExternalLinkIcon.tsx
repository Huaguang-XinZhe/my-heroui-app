interface ExternalLinkIconProps {
  className?: string;
}

export function ExternalLinkIcon({ className = "" }: ExternalLinkIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="img"
      className={`absolute right-[-10px] top-0 outline-none transition-transform group-data-[hover=true]:translate-y-0.5 [&>path]:stroke-[2.5px] ${className}`}
      width="10"
      height="10"
      viewBox="0 0 24 24"
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M6 18L18 6m0 0H9m9 0v9"
      />
    </svg>
  );
}
