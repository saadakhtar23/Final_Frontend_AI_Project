import React, { useCallback, useEffect, useState } from 'react';
import {
  Wifi,
  Clock,
  Camera,
  AppWindow,
  Cloud,
  FileText,
  BarChart3,
  X,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { testApi } from '../../RecruiterAdmin/api/tests.js';

const PURPLE = '#7C69EF';

const SECTION_TYPES = ['mcq', 'coding', 'audio', 'video'];

/** Build counts from backend test payload (same section rules as GiveTest.jsx). */
function deriveSummaryFromPayload(data) {
  const questions = Array.isArray(data?.questions) ? data.questions : [];

  const totalQuestions =
    Number(data?.total_questions ?? data?.question_count ?? questions.length) || 0;

  const typesPresent = new Set(questions.map((q) => q.type).filter(Boolean));
  const totalSections =
    Number(
      data?.total_sections ??
        data?.section_count ??
        SECTION_TYPES.filter((t) => typesPresent.has(t)).length
    ) || 0;

  let totalDurationMins =
    data?.total_duration_mins ??
    data?.duration_minutes ??
    data?.total_duration_minutes ??
    null;

  if (
    (totalDurationMins == null || totalDurationMins === '') &&
    data?.total_duration_seconds != null &&
    data?.total_duration_seconds !== ''
  ) {
    totalDurationMins = Math.max(1, Math.round(Number(data.total_duration_seconds) / 60));
  }

  if (totalDurationMins == null || totalDurationMins === '') {
    let totalSeconds = 0;
    for (const q of questions) {
      const minsField = q.duration_mins ?? q.duration_minutes ?? q.time_limit_minutes;
      if (minsField != null && minsField !== '') {
        totalSeconds += Number(minsField) * 60;
      } else {
        totalSeconds += Number(q.time_limit ?? 60);
      }
    }
    totalDurationMins = questions.length
      ? Math.max(1, Math.round(totalSeconds / 60))
      : 0;
  } else {
    totalDurationMins = Math.max(1, Number(totalDurationMins) || 1);
  }

  return {
    totalQuestions,
    totalSections,
    totalDurationMins,
  };
}

const INSTRUCTIONS = [
  { icon: Wifi, text: 'Ensure Stable Internet Connection' },
  {
    icon: Clock,
    text: 'The Exam is timed - Once started, you can not start, pause or restart.',
  },
  {
    icon: Camera,
    text: 'Your webcam and microphone may be used for AI proctoring.',
  },
  {
    icon: AppWindow,
    text: 'Switching tabs or using external applications may end the test automatically.',
  },
  { icon: Cloud, text: 'Answers are auto-saved after each question.' },
  { icon: FileText, text: 'Read each question carefully before moving to the next.' },
  {
    icon: BarChart3,
    text: 'Once submitted, results will be generated automatically.',
  },
];

const TestDetails = () => {
  const navigate = useNavigate();
  const { questionSetId } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({
    totalQuestions: 0,
    totalSections: 0,
    totalDurationMins: 0,
  });
  const [consent, setConsent] = useState(true);

  const loadTestMeta = useCallback(async () => {
    if (!questionSetId) {
      setError('Missing assessment id.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await testApi.startTest(questionSetId);
      setSummary(deriveSummaryFromPayload(data));
    } catch (e) {
      console.error('TestDetails: failed to load test', e);
      setError('Could not load test details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [questionSetId]);

  useEffect(() => {
    loadTestMeta();
  }, [loadTestMeta]);

  const handleCancel = () => {
    navigate('/Candidate-Dashboard/Examination');
  };

  const handleClose = () => {
    navigate('/Candidate-Dashboard/Examination');
  };

  const handleStartExam = () => {
    if (!consent) return;
    const search = window.location.search || '';
    try {
      const params = new URLSearchParams(search);
      const jobId =
        params.get('job_id') || params.get('jobId') || params.get('jdId') || null;
      if (jobId) {
        sessionStorage.setItem(
          'jobData',
          JSON.stringify({ job_id: jobId, questionSetId })
        );
      }
    } catch (e) {}
    navigate(`/Candidate-Dashboard/Examination/CameraCheck/${questionSetId}${search}`);
  };

  const durationLabel =
    summary.totalDurationMins > 0
      ? `${summary.totalDurationMins} mins`
      : '—';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div
        className="relative w-full max-w-[900px] rounded-3xl bg-white p-8 shadow-xl"
        style={{ fontFamily: 'inherit' }}
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-6 top-6 rounded-lg p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          aria-label="Close"
        >
          <X size={22} strokeWidth={2} />
        </button>

        <h2 className="pr-10 text-2xl font-semibold text-gray-900">Test Details</h2>

        {loading ? (
          <div className="mt-10 flex justify-center py-16">
            <div
              className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-transparent"
              style={{ borderTopColor: PURPLE }}
            />
          </div>
        ) : error ? (
          <div className="mt-8 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            {error}
            <button
              type="button"
              onClick={loadTestMeta}
              className="mt-3 block text-sm font-semibold underline"
              style={{ color: PURPLE }}
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="text-center sm:text-left">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Total Questions
                </p>
                <p
                  className="mt-1 text-3xl font-bold tabular-nums"
                  style={{ color: PURPLE }}
                >
                  {summary.totalQuestions}
                </p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Total Duration
                </p>
                <p
                  className="mt-1 text-3xl font-bold tabular-nums"
                  style={{ color: PURPLE }}
                >
                  {durationLabel}
                </p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Total Section
                </p>
                <p
                  className="mt-1 text-3xl font-bold tabular-nums"
                  style={{ color: PURPLE }}
                >
                  {summary.totalSections}
                </p>
              </div>
            </div>

            <ul className="mt-10 space-y-5">
              {INSTRUCTIONS.map((item, index) => {
                const Icon = item.icon;
                return (
                  <li key={index} className="flex items-start gap-4">
                    <span className="mt-0.5 shrink-0 text-gray-900">
                      <Icon className="h-5 w-5" strokeWidth={2} />
                    </span>
                    <p className="text-[15px] leading-snug text-gray-800">{item.text}</p>
                  </li>
                );
              })}
            </ul>

            <label className="mt-10 flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300"
                style={{ accentColor: PURPLE }}
              />
              <span className="text-sm leading-relaxed text-gray-700">
                I understand and consent to being recorded during the assessment.
              </span>
            </label>

            <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-4">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-xl border-2 px-8 py-2.5 text-sm font-semibold transition hover:bg-violet-50"
                style={{ borderColor: PURPLE, color: PURPLE }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartExam}
                disabled={!consent}
                className="rounded-xl px-8 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-45"
                style={{ backgroundColor: PURPLE }}
              >
                Start Exam
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TestDetails;
