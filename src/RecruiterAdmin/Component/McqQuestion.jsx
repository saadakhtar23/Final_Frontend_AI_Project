import React from 'react';

const labels = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function McqQuestion({ question, answer, onAnswer, embedded, questionOrdinal }) {
  const data = question.content || question;
  const wrap = embedded
    ? 'rounded-xl bg-transparent'
    : 'p-4 border rounded-lg shadow-md bg-white';

  const qText = data.question || 'No question text';
  const title =
    questionOrdinal != null ? (
      <>
        <span className="text-[#7C69EF]">Q{questionOrdinal}.</span>{' '}
        <span>{qText}</span>
      </>
    ) : (
      qText
    );

  return (
    <div className={wrap}>
      <h2 className={`font-semibold text-gray-900 ${embedded ? 'mb-4 text-base' : 'mb-4 text-xl'}`}>
        {title}
      </h2>

      <div className="space-y-2.5">
        {data.options?.map((option, idx) => {
          const letter = labels[idx] ?? String(idx + 1);
          const selected = answer === option;
          return (
            <label
              key={idx}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                selected
                  ? 'border-[#7C69EF] bg-[#7C69EF]/10'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${
                  selected ? 'border-[#7C69EF] bg-[#7C69EF]' : 'border-gray-300 bg-white'
                }`}
              >
                {selected ? (
                  <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none" aria-hidden>
                    <path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : null}
              </span>
              <input
                type="radio"
                name="mcq-option"
                value={option}
                checked={selected}
                onChange={(e) => onAnswer(e.target.value)}
                className="sr-only"
              />
              <span className={`text-sm ${selected ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                <span className="mr-2 font-semibold text-[#7C69EF]">{letter}.</span>
                {option}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
