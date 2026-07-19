export default function Mark({ className = "w-8 h-8" }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className}>
      {/* Abstract conical form referencing the mokorotlo, rendered as a minimal signal mark */}
      <path
        d="M24 6L40 34H8L24 6Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M15 34V38.5C15 39.8807 16.1193 41 17.5 41H30.5C31.8807 41 33 39.8807 33 38.5V34"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="24" cy="20" r="2.2" fill="currentColor" />
    </svg>
  );
}
