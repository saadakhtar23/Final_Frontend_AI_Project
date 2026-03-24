import React, { useState, useRef, useEffect } from 'react';
import { pythonUrl } from '../../utils/ApiConstants';

const VISIBLE_TEST_CASES = 2;

const LANGUAGES = [
  {
    id: 'python',
    label: 'Python',
    icon: (
      <span className="text-lg leading-none" aria-hidden>
        🐍
      </span>
    ),
  },
  {
    id: 'cpp',
    label: 'C++',
    icon: (
      <span className="text-xs font-bold text-blue-600 font-mono leading-none" aria-hidden>
        C++
      </span>
    ),
  },
  {
    id: 'c',
    label: 'C',
    icon: (
      <span className="text-xs font-bold text-slate-600 font-mono leading-none" aria-hidden>
        C
      </span>
    ),
  },
  {
    id: 'java',
    label: 'Java',
    icon: (
      <span className="text-xs font-bold text-amber-700 font-mono leading-none" aria-hidden>
        J
      </span>
    ),
  },
];

const defaultRunUrl = () => `${pythonUrl}/v1/test/run_code`;

/** API may return numbers, or nested objects (e.g. BSON); React cannot render plain objects as text. */
function formatTestCaseField(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

const CodingQuestion = ({ question, answer, onAnswer, runCodeUrl }) => {
  const [runResult, setRunResult] = useState(null);
  const [runLoading, setRunLoading] = useState(false);
  const [language, setLanguage] = useState('python');
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef(null);

  const effectiveRunUrl = runCodeUrl || defaultRunUrl();

  useEffect(() => {
    const onDocClick = (e) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  if (!question) return null;

  const rawExamples = question.examples || question.content?.examples || [];
  const rawTestCases = question.test_cases || question.content?.test_cases || [];
  const sourceList = rawTestCases.length ? rawTestCases : rawExamples;
  const visibleList = sourceList.slice(0, VISIBLE_TEST_CASES);
  const totalCount = sourceList.length;
  const hasHidden = totalCount > VISIBLE_TEST_CASES;

  const testCasesForRun = visibleList.map((tc) => ({
    input: formatTestCaseField(tc.input ?? tc.input_value ?? ''),
    expected_output: formatTestCaseField(tc.output ?? tc.expected_output ?? ''),
  }));

  const selectedLang = LANGUAGES.find((l) => l.id === language) || LANGUAGES[0];

  const handleRunCode = async () => {
    if (!answer?.trim()) {
      setRunResult({ error: 'No code to run.', results: [] });
      return;
    }
    setRunLoading(true);
    setRunResult(null);
    try {
      const res = await fetch(effectiveRunUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: answer.trim(),
          language,
          test_cases: testCasesForRun.length ? testCasesForRun : [{ input: '', expected_output: '' }],
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setRunResult({
          error: data.error || data.syntax_error || 'Run failed',
          results: data.results || [],
          syntax_ok: data.syntax_ok,
        });
        return;
      }
      setRunResult({
        results: data.results || [],
        error: data.error || (data.syntax_ok === false ? data.syntax_error : null),
        syntax_ok: data.syntax_ok,
        syntax_error: data.syntax_error,
      });
    } catch (e) {
      setRunResult({ error: e.message || 'Request failed', results: [] });
    } finally {
      setRunLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {question.skill}
          </span>
          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
            {question.difficulty}
          </span>
          <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
            Coding
          </span>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-4">{question.question}</h2>
      </div>

      {visibleList.length > 0 && (
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-3">
            Test cases {hasHidden ? `(showing ${VISIBLE_TEST_CASES} of ${totalCount})` : ''}
          </h3>
          <div className="space-y-2">
            {visibleList.map((example, index) => (
              <div key={index} className="text-sm">
                <span className="text-gray-600">Input: </span>
                <code className="bg-white px-2 py-1 rounded text-blue-600">
                  {formatTestCaseField(example.input ?? example.input_value)}
                </code>
                <span className="text-gray-600 ml-4">Output: </span>
                <code className="bg-white px-2 py-1 rounded text-green-600">
                  {formatTestCaseField(example.output ?? example.expected_output)}
                </code>
              </div>
            ))}
          </div>
          {hasHidden && (
            <p className="text-xs text-gray-500 mt-2">
              Remaining test cases are hidden and will be run on submit.
            </p>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Your Solution:</label>

        <div className="flex flex-wrap items-center gap-3 mb-3" ref={langMenuRef}>
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangMenuOpen((o) => !o)}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              aria-expanded={langMenuOpen}
              aria-haspopup="listbox"
            >
              {selectedLang.icon}
              <span>{selectedLang.label}</span>
              <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {langMenuOpen && (
              <ul
                className="absolute left-0 z-20 mt-1 min-w-[11rem] rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                role="listbox"
              >
                {LANGUAGES.map((lang) => (
                  <li key={lang.id} role="option" aria-selected={lang.id === language}>
                    <button
                      type="button"
                      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                        lang.id === language ? 'bg-blue-50 text-blue-900' : 'text-gray-800'
                      }`}
                      onClick={() => {
                        setLanguage(lang.id);
                        setLangMenuOpen(false);
                      }}
                    >
                      {lang.icon}
                      {lang.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="button"
            onClick={handleRunCode}
            disabled={runLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {runLoading ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Running…
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M8 5v14l11-7z" />
                </svg>
                Run
              </>
            )}
          </button>
        </div>

        <textarea
          value={answer || ''}
          onChange={(e) => onAnswer(e.target.value)}
          placeholder="Write your code here..."
          className="w-full h-64 p-4 font-mono text-sm border-2 border-gray-300 rounded-lg 
          focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          style={{ resize: 'vertical' }}
        />

        <div className="mt-4">
          {runResult && (
            <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              {runResult.syntax_ok === false && runResult.syntax_error && (
                <p className="text-red-600 text-sm mb-2 font-medium">Syntax: {runResult.syntax_error}</p>
              )}
              {runResult.error && !(runResult.syntax_ok === false && runResult.syntax_error === runResult.error) && (
                <p className="text-red-600 text-sm mb-2">{runResult.error}</p>
              )}
              {runResult.results && runResult.results.length > 0 && (
                <div className="space-y-2 text-sm">
                  {runResult.results.map((r, i) => (
                    <div key={i} className="flex flex-wrap items-start gap-2">
                      <span
                        className={
                          r.passed ? 'text-green-600 font-medium' : 'text-red-600 font-medium'
                        }
                      >
                        Test {i + 1}: {r.passed ? 'Passed' : 'Failed'}
                      </span>
                      {r.actual_output != null && r.actual_output !== '' && (
                        <span className="text-gray-600">
                          Output:{' '}
                          <code className="bg-white px-1 rounded">
                            {formatTestCaseField(r.actual_output)}
                          </code>
                        </span>
                      )}
                      {r.error && <span className="text-red-500 break-all">{r.error}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodingQuestion;
