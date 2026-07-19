import { memo } from "react";
import { FiLoader } from "react-icons/fi";

function SubmitButtonBase({ loading, children, ...props }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full h-11 rounded-lg bg-teal hover:bg-teal-light disabled:bg-teal/50 text-navy font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
      {...props}
    >
      {loading && <FiLoader className="animate-spin" size={16} aria-hidden="true" />}
      {loading ? "Please wait…" : children}
    </button>
  );
}

export default memo(SubmitButtonBase);
