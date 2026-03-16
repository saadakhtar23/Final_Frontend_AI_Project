import React, { useId } from "react";

function clamp(n, min = 0, max = 100) {
  const num = Number(n) || 0;
  return Math.min(max, Math.max(min, num));
}

function toSkillsArray(candidate) {
  if (Array.isArray(candidate?.skillsArr)) return candidate.skillsArr.filter(Boolean);

  if (Array.isArray(candidate?.skills)) return candidate.skills.filter(Boolean);
  if (candidate?.skills) {
    return String(candidate.skills)
      .split(/[,|]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function DonutScore({ value = 0, variant = "filtered" }) {
  const pct = clamp(value);
  const gradientId = useId();

  const size = 176;
  const cx = 88;
  const cy = 88;
  const r = 72;
  const stroke = 14;

  const circumference = 2 * Math.PI * r;
  const dash = (pct / 100) * circumference;

  const trackStroke = variant === "filtered" ? "#d9d6fe" : "#fee2e2";
  const textColor = variant === "filtered" ? "text-indigo-700" : "text-red-600";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg width="192" height="192" viewBox="0 0 176 176" className="absolute inset-0">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#c4b5fd" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>

          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={trackStroke}
            strokeWidth={stroke}
          />

          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transition: "stroke-dasharray 0.5s ease" }}
          />
        </svg>

        <div className="relative flex flex-col items-center justify-center text-center">
          <div className={`text-3xl font-bold ${textColor}`}>{pct}%</div>
        </div>
      </div>
    </div>
  );
}

export default function FilteredCandidate({ candidate, jobTitle, onClose }) {
  const skills = toSkillsArray(candidate);
  const visibleSkills = skills.slice(0, 4);
  const remaining = skills.length - visibleSkills.length;

  return (
    <div className="bg-white w-full max-w-[450px] rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-h-[90vh] overflow-y-auto">
      <div className="px-6 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-gray-900 truncate">
              {candidate?.name || "N/A"}
            </h2>
            <p className="text-sm text-gray-500 truncate">
              {candidate?.email || "N/A"}
              {candidate?.phone ? ` | ${candidate.phone}` : ""}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-green-50 text-green-700 border-green-200">
              Filtered
            </span>

            <button
              onClick={onClose}
              className="w-9 h-9 grid place-items-center rounded-full hover:bg-gray-100 text-gray-700"
              aria-label="Close"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-5">
        <div className="flex justify-center">
          <DonutScore value={candidate?.percentage || 0} variant="filtered" />
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium text-gray-800 mb-2">Skills</p>
          <div className="flex flex-wrap gap-2">
            {visibleSkills.length ? (
              <>
                {visibleSkills.map((s, idx) => (
                  <span
                    key={`${s}-${idx}`}
                    className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                  >
                    {s}
                  </span>
                ))}
                {remaining > 0 && (
                  <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                    +{remaining}
                  </span>
                )}
              </>
            ) : (
              <span className="text-sm text-gray-500">N/A</span>
            )}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium text-gray-800 mb-2">Summary</p>
          <div className="border border-gray-100 rounded-xl p-4 bg-white shadow-sm">
            <p className="text-sm text-gray-600 leading-relaxed">
              {candidate?.aiExplanation || "No AI explanation available"}
            </p>
          </div>
        </div>

        <div className="mt-6">
          {candidate?.resume ? (
            <a
              href={candidate.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center text-white font-semibold py-3 rounded-xl bg-[#6D5BD0] hover:bg-[#5B4AC6] transition-colors"
            >
              View Resume
            </a>
          ) : (
            <button
              disabled
              className="block w-full text-center text-white font-semibold py-3 rounded-xl bg-gray-300 cursor-not-allowed"
            >
              Resume Not Available
            </button>
          )}
        </div>
      </div>
    </div>
  );
}