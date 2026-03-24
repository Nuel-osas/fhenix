type VeilMarkProps = {
  className?: string;
  title?: string;
};

export default function VeilMark({
  className = "h-6 w-6",
  title = "VeilData",
}: VeilMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label={title}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      <path
        d="M16 2.75C10.46 7.38 7.25 11.57 7.25 16.14C7.25 22.02 11 26.5 16 26.5C21 26.5 24.75 22.02 24.75 16.14C24.75 11.57 21.54 7.38 16 2.75Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="11.25" cy="18.85" r="1.45" fill="currentColor" />
      <circle cx="13.9" cy="16.1" r="1.18" fill="currentColor" />
      <circle cx="16.65" cy="13.45" r="1.05" fill="currentColor" />
      <circle cx="19.1" cy="10.75" r="0.92" fill="currentColor" />
      <circle cx="17.1" cy="20.15" r="0.96" fill="currentColor" />
      <circle cx="20.35" cy="16.65" r="0.84" fill="currentColor" />
      <circle cx="14.55" cy="21.95" r="0.7" fill="currentColor" />
    </svg>
  );
}
