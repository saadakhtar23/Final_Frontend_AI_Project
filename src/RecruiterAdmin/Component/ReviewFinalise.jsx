import { useState, useMemo, useId } from 'react';
import { CheckCircle, Clock, Pencil, Trash2, BarChart3, Medal, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import AssessmentAPI from '../api/generateAssessmentApi';
import { baseUrl } from '../../utils/ApiConstants';

// Mini sparkline — stroke fades out toward the bottom (matches reference UI)
function Sparkline({ color = '#7c3aed', type = 'wave' }) {
  const uid = useId().replace(/:/g, '');
  const gradId = `spark-fade-${uid}`;
  const paths = {
    wave: "M0,20 C10,10 20,30 30,20 C40,10 50,30 60,20 C70,10 80,25 90,15",
    dip: "M0,10 C15,10 20,25 35,25 C50,25 55,10 75,15 C85,18 90,12 90,12",
    rise: "M0,28 C20,25 40,18 55,12 C65,8 75,5 90,8",
    bump: "M0,20 C10,20 20,8 35,8 C50,8 60,20 75,18 C82,16 88,18 90,18",
  };
  return (
    <svg width="92" height="38" viewBox="0 0 92 38" fill="none" aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="45%" stopColor={color} stopOpacity="0.85" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={paths[type]}
        stroke={`url(#${gradId})`}
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** "1:21 mins" → large time + smaller unit; otherwise single line */
function DurationValue({ text, color }) {
  const m = String(text).trim().match(/^(\d+):(\d{2})\s*(mins?)$/i);
  if (m) {
    return (
      <span className="flex items-baseline gap-1.5" style={{ color }}>
        <span
          className="text-[2rem] font-bold tabular-nums tracking-tight leading-none"
          style={{ letterSpacing: '-0.03em' }}
        >
          {m[1]}:{m[2]}
        </span>
        <span className="text-[0.95rem] font-semibold leading-none">{m[3]}</span>
      </span>
    );
  }
  const onlyMins = String(text).trim().match(/^(\d+)\s*(mins?)$/i);
  if (onlyMins) {
    return (
      <span className="flex items-baseline gap-1.5" style={{ color }}>
        <span className="text-[2rem] font-bold tabular-nums leading-none">{onlyMins[1]}</span>
        <span className="text-[0.95rem] font-semibold leading-none">{onlyMins[2]}</span>
      </span>
    );
  }
  return (
    <span className="text-[2rem] font-bold tabular-nums leading-none" style={{ color }}>
      {text}
    </span>
  );
}

function StatCard({ label, value, valueNode, icon, sparkColor, sparkType, iconSolidBg, valueColor }) {
  const main =
    valueNode ??
    (
      <span
        className="text-[2rem] font-bold tabular-nums tracking-tight leading-none"
        style={{ color: valueColor, letterSpacing: '-0.03em' }}
      >
        {value}
      </span>
    );

  return (
    <div
      className="flex flex-col justify-between rounded-2xl border border-gray-100/90 bg-white p-[18px] shadow-sm"
      style={{ minHeight: 128, boxShadow: '0 8px 30px rgba(15, 23, 42, 0.07)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-medium leading-snug text-gray-700">{label}</span>
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm"
          style={{ background: iconSolidBg }}
        >
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between gap-2">
        <div className="min-w-0 flex-1">{main}</div>
        <div className="shrink-0 -mr-1 -mb-0.5 self-end opacity-95">
          <Sparkline color={sparkColor} type={sparkType} />
        </div>
      </div>
    </div>
  );
}

/** Y-axis ticks: match reference (0–10) when data fits; extend with step 2 if needed */
function getChartYTicks(maxCount) {
  const cap = Math.max(10, Math.ceil(maxCount / 2) * 2);
  const ticks = [];
  for (let v = 0; v <= cap; v += 2) ticks.push(v);
  return { yMax: cap, ticks };
}

function SkillDistributionChart({ skills }) {
  const sorted = useMemo(
    () => [...skills].sort((a, b) => b.value - a.value || String(a.name).localeCompare(String(b.name))),
    [skills]
  );
  const maxCount = sorted.length ? Math.max(...sorted.map((s) => s.value), 1) : 1;
  const { yMax, ticks } = getChartYTicks(maxCount);
  const chartH = 208;
  const showScroll = sorted.length > 10;
  const colPct = sorted.length ? 100 / sorted.length : 100;

  const stripeBg = {
    backgroundImage: `repeating-linear-gradient(
      -45deg,
      #f3f4f6,
      #f3f4f6 5px,
      #e8eaef 5px,
      #e8eaef 10px
    )`,
  };

  if (!sorted.length) {
    return (
      <div
        className="min-w-0 flex-1 rounded-2xl border border-gray-100/80 bg-white p-8 text-center text-sm text-gray-500 shadow-sm"
        style={{ boxShadow: '0 4px 24px rgba(15, 23, 42, 0.06)' }}
      >
        <h2 className="mb-2 text-base font-bold text-gray-900">Question Distribution by Skill</h2>
        No skill data yet — add questions with skills to see the chart.
      </div>
    );
  }

  return (
    <div
      className="min-w-0 flex-1 rounded-2xl border border-gray-100/80 bg-white p-5 shadow-sm"
      style={{ boxShadow: '0 4px 24px rgba(15, 23, 42, 0.06)' }}
    >
      <h2 className="mb-5 text-base font-bold text-gray-900">Question Distribution by Skill</h2>

      <div className="flex gap-1">
        {/* Y-axis labels aligned to scale */}
        <div className="relative shrink-0" style={{ width: 32, height: chartH }}>
          {ticks.map((t) => (
            <span
              key={t}
              className="absolute right-1 text-[11px] font-medium tabular-nums text-gray-400"
              style={{ bottom: `calc(${(t / yMax) * 100}% - 6px)`, lineHeight: 1 }}
            >
              {t}
            </span>
          ))}
        </div>

        {/* Scroll: inner width = (n/10)×viewport so ~10 columns visible */}
        <div className="min-w-0 flex-1 overflow-x-auto pb-1 [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-violet-200">
          <div
            className="flex flex-col"
            style={{ minWidth: showScroll ? `${(sorted.length / 10) * 100}%` : '100%' }}
          >
            <div className="relative" style={{ height: chartH }}>
              {ticks.map((t) => (
                <div
                  key={`grid-${t}`}
                  className="pointer-events-none absolute left-0 right-0 border-t border-gray-200/90"
                  style={{ bottom: `${(t / yMax) * 100}%` }}
                />
              ))}

              <div className="absolute inset-0 z-[1] flex items-end">
                {sorted.map((skill, i) => (
                  <div
                    key={`${skill.name}-${i}`}
                    className="flex h-full flex-col justify-end px-1.5"
                    style={{ flex: `0 0 ${colPct}%`, maxWidth: `${colPct}%` }}
                  >
                    <div className="relative mx-auto flex h-full w-[min(76%,52px)] flex-col justify-end">
                      <div
                        className="absolute inset-0 rounded-full border border-gray-100"
                        style={stripeBg}
                      />
                      <div
                        className="relative z-[1] w-full rounded-full bg-gradient-to-t from-violet-600 via-violet-300 to-violet-100"
                        style={{
                          height: `${Math.min(1, skill.value / yMax) * 100}%`,
                          minHeight: skill.value > 0 ? 8 : 0,
                          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4)',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 flex border-t border-gray-100 pt-2">
              {sorted.map((skill, i) => (
                <div
                  key={`lbl-${skill.name}-${i}`}
                  className="px-0.5 text-center"
                  style={{ flex: `0 0 ${colPct}%`, maxWidth: `${colPct}%` }}
                >
                  <span
                    className="line-clamp-2 text-[10px] font-medium leading-tight text-gray-500"
                    title={skill.name}
                  >
                    {skill.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showScroll && (
        <p className="mt-3 text-center text-[11px] text-gray-400">
          About <strong>10 skills</strong> fit on screen — scroll sideways to see all{' '}
          <strong>{sorted.length}</strong>.
        </p>
      )}
    </div>
  );
}

function DifficultyBadge({ difficulty }) {
  const map = {
    easy:   { label: 'Easy',   bg: '#e0f7ea', color: '#16a34a' },
    medium: { label: 'Medium', bg: '#fff8e1', color: '#b45309' },
    hard:   { label: 'High',   bg: '#fde8e8', color: '#dc2626' },
  };
  const key = (difficulty || '').toLowerCase();
  const d = map[key] || { label: difficulty || 'Medium', bg: '#fff8e1', color: '#b45309' };
  return (
    <span className="px-3 py-0.5 rounded-full text-xs font-semibold" style={{ background: d.bg, color: d.color }}>{d.label}</span>
  );
}

function TypeBadge({ type }) {
  const map = {
    audio:  { bg: '#ede9fe', color: '#7c3aed' },
    video:  { bg: '#dbeafe', color: '#2563eb' },
    mcq:    { bg: '#dcfce7', color: '#16a34a' },
    coding: { bg: '#fef9c3', color: '#b45309' },
    text:   { bg: '#f1f5f9', color: '#475569' },
    rating: { bg: '#fce7f3', color: '#db2777' },
  };
  const t = map[(type || '').toLowerCase()] || { bg: '#f1f5f9', color: '#475569' };
  const label = type ? type.charAt(0).toUpperCase() + type.slice(1).toLowerCase() : 'Unknown';
  return (
    <span className="px-4 py-1 rounded-full text-sm font-semibold" style={{ background: t.bg, color: t.color }}>{label}</span>
  );
}

function SkillPill({ label }) {
  return (
    <span className="px-3 py-1 rounded-full border border-gray-300 text-xs text-gray-600 bg-white font-medium">{label}</span>
  );
}

export default function ReviewFinalise({ formData, questions, onFinalize, onBack, loading }) {
  const navigate = useNavigate();
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState(null);

  const displayQuestions = questions.map((q, idx) => {
    const content = q.content || {};
    if (q.type === 'mcq') {
      const correctAnswerRaw = q.correct_answer || content.correct_answer || content.answer || q.correctAnswer || null;
      return {
        id: idx + 1, question_id: q.question_id,
        text: content.prompt || content.question || '',
        options: content.options || [],
        correctAnswer: correctAnswerRaw || '',
        correctOptionText: q.correct_option_text || null,
        explanation: content.explanation || 'No explanation provided',
        tags: [q.skill], skills: [q.skill],
        time: q.time_limit || 60, difficulty: q.difficulty || 'medium',
        questionType: 'MCQ', marks: q.positive_marking || 5,
        negative_marking: q.negative_marking || 0,
        type: q.type, skill: q.skill
      };
    } else if (q.type === 'coding') {
      return {
        id: idx + 1, question_id: q.question_id,
        text: content.prompt || content.question || '',
        input_spec: content.input_spec || '', output_spec: content.output_spec || '',
        examples: content.examples || [], expected_answer: content.expected_answer || '',
        tags: [q.skill], skills: [q.skill],
        time: q.time_limit || 300, difficulty: q.difficulty || 'medium',
        questionType: 'Coding', marks: q.positive_marking || 2,
        type: q.type, skill: q.skill
      };
    } else if (q.type === 'audio') {
      return {
        id: idx + 1, question_id: q.question_id,
        text: content.prompt_text || content.question || '',
        expected_keywords: content.expected_keywords || [],
        expected_answer: content.expected_answer || '',
        rubric: content.rubric || '',
        tags: [q.skill], skills: [q.skill],
        time: q.time_limit || content.suggested_time_seconds || 120,
        difficulty: q.difficulty || 'medium',
        questionType: 'Audio', marks: q.positive_marking || 5,
        type: q.type, skill: q.skill
      };
    } else if (q.type === 'video') {
      return {
        id: idx + 1, question_id: q.question_id,
        text: content.prompt_text || content.question || '',
        expected_answer: content.expected_answer || '',
        rubric: content.rubric || '',
        tags: [q.skill], skills: [q.skill],
        time: q.time_limit || content.suggested_time_seconds || 180,
        difficulty: q.difficulty || 'medium',
        questionType: 'Video', marks: q.positive_marking || 5,
        type: q.type, skill: q.skill
      };
    } else if (q.type === 'text') {
      return {
        id: idx + 1, question_id: q.question_id,
        text: content.prompt || content.question || '',
        tags: [q.skill], skills: [q.skill],
        time: q.time_limit || 60, difficulty: q.difficulty || 'medium',
        questionType: 'Text', marks: q.positive_marking || 1,
        type: q.type, skill: q.skill
      };
    } else if (q.type === 'rating') {
      return {
        id: idx + 1, question_id: q.question_id,
        text: content.prompt || content.question || '',
        scale: content.scale || 5,
        tags: [q.skill], skills: [q.skill],
        time: q.time_limit || 60, difficulty: q.difficulty || 'medium',
        questionType: 'Rating', marks: q.positive_marking || 1,
        type: q.type, skill: q.skill
      };
    }
    return { id: idx + 1, question_id: q.question_id, text: 'Question format not supported', type: q.type, skill: q.skill || 'Unknown', questionType: 'Unknown', marks: 0, time: 0, difficulty: 'medium' };
  });

  const totalQuestions = displayQuestions.length;
  const totalMarks = displayQuestions.reduce((sum, q) => sum + (q.marks || 0), 0);
  const totalTimeSecs = displayQuestions.reduce((sum, q) => sum + parseInt(q.time || 0), 0);
  const totalTimeMin = Math.floor(totalTimeSecs / 60);
  const totalTimeHrs = Math.floor(totalTimeMin / 60);
  const totalTimeRemMin = totalTimeMin % 60;
  const durationLabel = totalTimeHrs > 0 ? `${totalTimeHrs} hr ${totalTimeRemMin} mins` : `${totalTimeMin} mins`;
  const durationLabelCard =
    totalTimeHrs > 0
      ? `${totalTimeHrs}:${String(totalTimeRemMin).padStart(2, '0')} mins`
      : `${Math.max(0, totalTimeMin)} mins`;

  const skillDistribution = displayQuestions.reduce((acc, q) => {
    const skill = q.skill || 'Unknown';
    if (!acc[skill]) acc[skill] = { count: 0, marks: 0 };
    acc[skill].count += 1;
    acc[skill].marks += q.marks || 0;
    return acc;
  }, {});
  const skills = Object.entries(skillDistribution).map(([name, data]) => ({ name, value: data.count, marks: data.marks }));

  const handleFinalize = async () => {
    setLocalLoading(true);
    setError(null);
    try {
      let jobIdFromLocal = null;
      const selectedJDRaw = localStorage.getItem('selectedJD');
      if (selectedJDRaw) { try { const j = JSON.parse(selectedJDRaw); jobIdFromLocal = j._id || j.job_id || null; } catch {} }
      let candidateIds = [];
      const filteredCandidateIdsRaw = localStorage.getItem('filteredCandidateIds');
      if (filteredCandidateIdsRaw) { try { candidateIds = JSON.parse(filteredCandidateIdsRaw); } catch {} }
      let candidateIdsArray = typeof candidateIds === 'string'
        ? candidateIds.split(',').map(id => id.trim()).filter(Boolean)
        : Array.isArray(candidateIds) ? candidateIds : [];
      if (!candidateIdsArray.length) {
        alert('No candidates found to send. Either none selected or all have already received the exam.');
        setLocalLoading(false);
        return;
      }
      const candidateIdsString = candidateIdsArray.join(',');
      const minimalPayload = {
        test_title: formData.test_title || `${formData.role_title || formData.title || ''} Assessment`,
        test_description: formData.test_description || `Assessment for ${formData.role_title || formData.title || ''} position`,
        job_id: jobIdFromLocal || formData.job_id || formData.jobId || null,
        role_title: formData.role_title || formData.title || null,
        skills: (formData.skills || (formData.skillLevels ? formData.skillLevels.map(s => s.skill) : [])).join(','),
        candidate_ids: candidateIdsString,
        company: formData.company || null,
        startDate: formData.startDate, startTime: formData.startTime,
        endDate: formData.endDate, endTime: formData.endTime,
        questions: questions.map(q => ({
          question_id: q.question_id, type: q.type, skill: q.skill,
          difficulty: q.difficulty, content: q.content,
          time_limit: q.time_limit || 60,
          positive_marking: q.positive_marking ?? (q.type === 'coding' ? 2 : (['mcq','audio','video'].includes(q.type) ? 5 : 1)),
          negative_marking: q.negative_marking || 0,
        })),
      };
      const token = localStorage.getItem('token');
      const sendRes = await axios.post(
        `${baseUrl}/candidate/send-email-shortlisted/${jobIdFromLocal}`,
        { candidateIds: candidateIdsArray, startDate: minimalPayload.startDate, startTime: minimalPayload.startTime, endDate: minimalPayload.endDate, endTime: minimalPayload.endTime },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      const sentCandidateIds = sendRes?.data?.sentCandidateIds || sendRes?.data?.sentIds || [];
      const sentCount = sendRes?.data?.sentCount || 0;
      if (!sentCandidateIds.length && sentCount === 0) {
        alert('No candidates were emailed — either all selected candidates already received the exam or sending failed.');
        setLocalLoading(false);
        return;
      }
      const sentIdsString = sentCandidateIds.join ? sentCandidateIds.join(',') : (sentCandidateIds || minimalPayload.candidate_ids);
      const result = await AssessmentAPI.finalizeTest({ ...minimalPayload, candidate_ids: sentIdsString });
      if (result.status === 'success') {
        navigate('/RecruiterAdmin-Dashboard/JDDetails/GenerateAssessment/Created');
      } else {
        setError(result?.message || 'Failed to finalize test');
      }
    } catch (err) {
      setError(err.message || 'Failed to finalize test. Please try again.');
    } finally {
      setLocalLoading(false);
    }
  };

  function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  }

  const handleDownload = async () => {
    const title = formData.test_title || formData.title || formData.role_title || 'Assessment';
    const bodyHtml = `<h1>${escapeHtml(title)}</h1><p>Questions: ${totalQuestions} | Marks: ${totalMarks} | Duration: ${durationLabel}</p>${displayQuestions.map(q => `<div style="margin:12px 0"><strong>Q${q.id} ${escapeHtml(q.text)}</strong></div>`).join('')}`;
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
      const container = document.createElement('div');
      container.style.cssText = 'width:800px;padding:24px;background:#fff;position:fixed;left:-9999px';
      container.innerHTML = bodyHtml;
      document.body.appendChild(container);
      const canvas = await html2canvas(container, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
      const w = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      pdf.addImage(imgData, 'PNG', 0, 0, w, (imgProps.height * w) / imgProps.width);
      pdf.save(`${title.replace(/[^a-z0-9-_]/gi,'_').toLowerCase()}_review.pdf`);
      document.body.removeChild(container);
    } catch (e) {
      setError('Failed to generate PDF.');
    }
  };

  const isLoading = loading || localLoading;

  return (
    <div className="min-h-screen p-6" style={{ background: '#f4f6fb' }}>

      {/* Dashboard: summary cards + skill chart */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <div className="mx-auto grid w-full max-w-[400px] shrink-0 grid-cols-2 gap-3 sm:max-w-none lg:mx-0 lg:w-[380px]">
          <StatCard
            label="Total Questions"
            value={totalQuestions}
            valueColor="#7c3aed"
            iconSolidBg="#7c3aed"
            icon={<BarChart3 size={19} strokeWidth={2.5} className="text-white" />}
            sparkColor="#7c3aed"
            sparkType="wave"
          />
          <StatCard
            label="Total Duration"
            valueNode={<DurationValue text={durationLabelCard} color="#db2777" />}
            iconSolidBg="#db2777"
            icon={<Clock size={19} strokeWidth={2.5} className="text-white" />}
            sparkColor="#db2777"
            sparkType="dip"
          />
          <StatCard
            label="Total Marks"
            value={totalMarks}
            valueColor="#2563eb"
            iconSolidBg="#2563eb"
            icon={<Medal size={19} strokeWidth={2.5} className="text-white" />}
            sparkColor="#2563eb"
            sparkType="rise"
          />
          <StatCard
            label="Total Skills"
            value={skills.length}
            valueColor="#ea580c"
            iconSolidBg="#ea580c"
            icon={<SlidersHorizontal size={19} strokeWidth={2.5} className="text-white" />}
            sparkColor="#ea580c"
            sparkType="bump"
          />
        </div>

        <SkillDistributionChart skills={skills} />
      </div>

      {/* Summary bar */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-gray-800">Total Questions : {totalQuestions}</span>
        <span className="text-sm text-gray-500">Total Duration : {durationLabel}</span>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
      )}

      {/* Questions list */}
      <div className="space-y-4 mb-8">
        {displayQuestions.map((question) => (
          <div key={question.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            {/* Header row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-gray-800 text-sm">Question {question.id}</span>
                <DifficultyBadge difficulty={question.difficulty} />
                {question.skill && <SkillPill label={question.skill} />}
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2 py-1 rounded-full">
                  <Clock size={11} />{question.time} sec
                </span>
                <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><Pencil size={14} /></button>
                <button className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"><Trash2 size={14} /></button>
                <TypeBadge type={question.questionType} />
              </div>
            </div>

            {/* Question text */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <p className="text-sm font-medium text-gray-800">Q. {question.text}</p>
              <span className="text-xs text-gray-500 bg-white border border-gray-200 rounded-full px-3 py-1 whitespace-nowrap shrink-0">
                Total Marks: {question.marks}
              </span>
            </div>

            {/* MCQ options */}
            {question.questionType === 'MCQ' && question.options && (
              <div className="space-y-1.5 mb-3">
                {question.options.map((opt, idx) => {
                  const optText = typeof opt === 'string' ? opt : String(opt);
                  const label = String.fromCharCode(65 + idx);
                  const isCorrect = question.correctAnswer === label || question.correctAnswer === optText || question.correctOptionText === optText;
                  return (
                    <div key={idx} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isCorrect ? 'bg-green-50 border border-green-200 text-green-800 font-semibold' : 'bg-gray-50 text-gray-700'}`}>
                      {optText}{isCorrect && <span className="ml-1">✅</span>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Expected Keywords */}
            {(question.questionType === 'Audio' || question.questionType === 'Video') && question.expected_keywords && question.expected_keywords.length > 0 && (
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="text-xs text-gray-500 font-medium">Expected Keywords:</span>
                {question.expected_keywords.map((kw, i) => <SkillPill key={i} label={kw} />)}
              </div>
            )}

            {/* Correct Answer green block */}
            {(question.expected_answer || (question.questionType === 'MCQ' && question.explanation)) && (
              <div className="rounded-xl px-4 py-3 mb-2 text-sm" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <span className="text-green-600 font-semibold">Correct Answer:  </span>
                <span className="text-green-800">{question.expected_answer || question.explanation}</span>
              </div>
            )}

            {/* Rubric purple block */}
            {question.rubric && (
              <div className="rounded-xl px-4 py-3 text-sm" style={{ background: '#faf5ff', border: '1px solid #e9d5ff' }}>
                <span className="text-purple-600 font-semibold">Evaluation Rubric:  </span>
                <span className="text-purple-700">{question.rubric}</span>
              </div>
            )}

            {/* Coding spec */}
            {question.questionType === 'Coding' && (
              <div className="space-y-2 mt-2">
                {question.input_spec && <div className="text-sm bg-gray-50 rounded-lg p-3"><strong>Input:</strong> {question.input_spec}</div>}
                {question.output_spec && <div className="text-sm bg-gray-50 rounded-lg p-3"><strong>Output:</strong> {question.output_spec}</div>}
              </div>
            )}

            {/* Rating */}
            {question.questionType === 'Rating' && (
              <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3 mt-2">Rating scale: {question.scale || 5}</div>
            )}

            {/* Text */}
            {question.questionType === 'Text' && (
              <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3 mt-2">Candidate will provide a written answer.</div>
            )}
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="px-6 py-2.5 bg-white border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 font-medium text-sm disabled:opacity-50 transition-colors"
        >
          Back
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            disabled={isLoading || displayQuestions.length === 0}
            className="px-6 py-2.5 rounded-xl font-semibold text-sm border border-blue-400 text-blue-500 bg-white hover:bg-blue-50 disabled:opacity-50 transition-colors"
          >
            Download PDF
          </button>
          <button
            onClick={handleFinalize}
            disabled={isLoading || displayQuestions.length === 0}
            className="px-8 py-2.5 rounded-xl font-semibold text-sm text-white flex items-center gap-2 disabled:opacity-50 transition-all"
            style={{ background: 'linear-gradient(90deg, #0496FF 0%, #0073cc 100%)' }}
          >
            {isLoading ? (
              <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />Finalizing...</>
            ) : (
              <><CheckCircle size={18} />Finalize & Publish Test</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}