import { useState } from 'react';
import { Info, Edit, Copy, Trash2, Clock, RefreshCcw, Check, X, Plus } from 'lucide-react';

const DIFFICULTY_STYLES = {
    easy: { label: 'Beginner', color: 'text-green-500' },
    medium: { label: 'Medium', color: 'text-orange-400' },
    hard: { label: 'High', color: 'text-red-500' },
};

const TYPE_STYLES = {
    MCQ: 'bg-purple-600 text-white',
    Coding: 'bg-blue-600 text-white',
    Audio: 'bg-purple-500 text-white',
    Video: 'bg-purple-700 text-white',
    Text: 'bg-gray-600 text-white',
    Rating: 'bg-yellow-600 text-white',
};

export default function QuestionMaker({ questions, onUpdate, onNext, onBack, loading }) {
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [editedData, setEditedData] = useState(null);
    const [newQuestionType, setNewQuestionType] = useState('mcq');

    const displayQuestions = questions.map((q, idx) => {
        const content = q.content || {};
        if (q.type === 'mcq') {
             const correctAnswerRaw = q.correct_answer || content.correct_answer || content.answer || q.correctAnswer || null;
            // derive correct option text if available on top-level (from GenerateAssessment normalization)
            const correctOptionText = q.correct_option_text || null;

            return {
                id: idx + 1,
                question_id: q.question_id,
                text: q.question || content.prompt || content.question || '',
                options: (q.options || content.options || (typeof content.options === 'string' ? JSON.parse(content.options) : [])),
                correctAnswer: q.correct_answer || content.correct_answer || content.answer || q.correctAnswer || null,
                correctOptionText: q.correct_option_text || null,
                explanation: q.explanation || content.explanation || 'No explanation provided',
                tags: [q.skill],
                skills: [q.skill],
                time: q.time_limit || 60,
                difficulty: q.difficulty || 'medium',
                questionType: 'MCQ',
                marks: q.positive_marking || 5,
                negative_marking: q.negative_marking || 0,
                type: q.type
            };
        } else if (q.type === 'coding') {
            return {
                id: idx + 1, question_id: q.question_id,
                text: content.prompt || content.question || '',
                input_spec: content.input_spec || '', output_spec: content.output_spec || '',
                examples: content.examples || [], expected_answer: content.expected_answer || '',
                tags: [q.skill], skills: [q.skill],
                time: q.time_limit || 300, difficulty: q.difficulty || 'medium',
                questionType: 'Coding', marks: q.positive_marking || 2, type: q.type
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
                questionType: 'Audio', marks: q.positive_marking || 5, type: q.type
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
                questionType: 'Video', marks: q.positive_marking || 5, type: q.type
            };
        } else if (q.type === 'text') {
            return {
                id: idx + 1, question_id: q.question_id,
                text: content.prompt || content.question || '',
                tags: [q.skill], skills: [q.skill],
                time: q.time_limit || 60, difficulty: q.difficulty || 'medium',
                questionType: 'Text', marks: q.positive_marking || 1, type: q.type
            };
        } else if (q.type === 'rating') {
            return {
                id: idx + 1, question_id: q.question_id,
                text: content.prompt || content.question || '',
                scale: content.scale || 5,
                tags: [q.skill], skills: [q.skill],
                time: q.time_limit || 60, difficulty: q.difficulty || 'medium',
                questionType: 'Rating', marks: q.positive_marking || 1, type: q.type
            };
        }
        return { id: idx + 1, question_id: q.question_id, text: 'Question format not supported', type: q.type };
    });

    const totalDurationSecs = displayQuestions.reduce((sum, q) => sum + parseInt(q.time || 0), 0);
    const totalHours = Math.floor(totalDurationSecs / 3600);
    const totalMins = Math.floor((totalDurationSecs % 3600) / 60);
    const durationLabel = totalHours > 0
        ? `${totalHours} hr ${totalMins} mins`
        : `${totalMins} mins`;

    const handleEditClick = (question) => {
        setEditingQuestion(question);
        if (question.questionType === 'MCQ') {
            setEditedData({
                ...question, questionType: 'MCQ',
                timeLimit: question.time?.toString() || '60',
                marks: question.marks?.toString() || '5',
                level: question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1) || 'Medium',
                skills: question.skills || question.tags || [],
                questionText: question.text,
                options: Array.isArray(question.options) ? question.options.map((opt, idx) => {
                    const optionText = typeof opt === 'string' ? opt : opt.text || opt;
                    const isCorrect = question.correctAnswer === String.fromCharCode(65 + idx) ||
                        question.correctAnswer === optionText ||
                        question.correctAnswer === (idx + 1).toString();
                    return { id: String.fromCharCode(65 + idx), text: optionText.replace(/^[A-D]\.\s*/, ''), isCorrect };
                }) : []
            });
        } else if (question.questionType === 'Coding') {
            setEditedData({
                ...question, questionType: 'Coding',
                timeLimit: question.time?.toString() || '300',
                marks: question.marks?.toString() || '2',
                level: question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1) || 'Medium',
                skills: question.skills || question.tags || [],
                questionText: question.text,
                input_spec: question.input_spec || '', output_spec: question.output_spec || '',
                examples: question.examples || []
            });
        } else if (question.questionType === 'Audio') {
            setEditedData({
                ...question, questionType: 'Audio',
                timeLimit: question.time?.toString() || '120',
                marks: question.marks?.toString() || '5',
                level: question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1) || 'Medium',
                skills: question.skills || question.tags || [],
                questionText: question.text,
                expected_keywords: question.expected_keywords || []
            });
        } else if (question.questionType === 'Video') {
            setEditedData({
                ...question, questionType: 'Video',
                timeLimit: question.time?.toString() || '180',
                marks: question.marks?.toString() || '5',
                level: question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1) || 'Medium',
                skills: question.skills || question.tags || [],
                questionText: question.text
            });
        } else if (question.questionType === 'Text') {
            setEditedData({
                ...question, questionType: 'Text',
                timeLimit: question.time?.toString() || '60',
                marks: question.marks?.toString() || '1',
                level: question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1) || 'Medium',
                skills: question.skills || question.tags || [],
                questionText: question.text
            });
        } else if (question.questionType === 'Rating') {
            setEditedData({
                ...question, questionType: 'Rating',
                timeLimit: question.time?.toString() || '60',
                marks: question.marks?.toString() || '1',
                level: question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1) || 'Medium',
                skills: question.skills || question.tags || [],
                questionText: question.text,
                scale: question.scale || 5
            });
        }
    };

    const handleSaveEdit = () => {
        if (!editedData || !editingQuestion) return;
        const existingIndex = questions.findIndex(q => q.question_id === editingQuestion.question_id);
        if (existingIndex !== -1) {
            const updatedQuestions = [...questions];
            const updatedQuestion = { ...updatedQuestions[existingIndex] };
            updatedQuestion.content = updatedQuestion.content || {};
            if (editedData.questionType === 'MCQ') {
                updatedQuestion.time_limit = parseInt(editedData.timeLimit);
                updatedQuestion.positive_marking = parseInt(editedData.marks);
                updatedQuestion.difficulty = editedData.level.toLowerCase();
                updatedQuestion.content.prompt = editedData.questionText;
                updatedQuestion.content.options = editedData.options.map(opt => opt.text);
                const correctOption = editedData.options.find(opt => opt.isCorrect);
                const correctId = correctOption ? correctOption.id : 'A';
                const correctText = correctOption ? correctOption.text : '';
                updatedQuestion.content.answer = correctId;
                updatedQuestion.content.correct_answer = correctId;
                updatedQuestion.content.correct_option_text = correctText;
                updatedQuestion.correct_answer = correctId;
                updatedQuestion.correct_option_text = correctText;
            } else if (editedData.questionType === 'Coding') {
                updatedQuestion.time_limit = parseInt(editedData.timeLimit);
                updatedQuestion.positive_marking = parseInt(editedData.marks);
                updatedQuestion.difficulty = editedData.level.toLowerCase();
                updatedQuestion.content.prompt = editedData.questionText;
                updatedQuestion.content.input_spec = editedData.input_spec;
                updatedQuestion.content.output_spec = editedData.output_spec;
            } else if (editedData.questionType === 'Audio') {
                updatedQuestion.time_limit = parseInt(editedData.timeLimit);
                updatedQuestion.difficulty = editedData.level.toLowerCase();
                updatedQuestion.positive_marking = parseInt(editedData.marks);
                updatedQuestion.content.prompt_text = editedData.questionText;
                updatedQuestion.content.expected_keywords = editedData.expected_keywords;
            } else if (editedData.questionType === 'Video') {
                updatedQuestion.time_limit = parseInt(editedData.timeLimit);
                updatedQuestion.difficulty = editedData.level.toLowerCase();
                updatedQuestion.positive_marking = parseInt(editedData.marks);
                updatedQuestion.content.prompt_text = editedData.questionText;
            } else if (editedData.questionType === 'Text') {
                updatedQuestion.time_limit = parseInt(editedData.timeLimit);
                updatedQuestion.positive_marking = parseInt(editedData.marks);
                updatedQuestion.difficulty = editedData.level.toLowerCase();
                updatedQuestion.content.prompt = editedData.questionText;
            } else if (editedData.questionType === 'Rating') {
                updatedQuestion.time_limit = parseInt(editedData.timeLimit);
                updatedQuestion.positive_marking = parseInt(editedData.marks);
                updatedQuestion.difficulty = editedData.level.toLowerCase();
                updatedQuestion.content.prompt = editedData.questionText;
                updatedQuestion.content.scale = editedData.scale || 5;
            }
            updatedQuestions[existingIndex] = updatedQuestion;
            if (onUpdate) onUpdate(updatedQuestions);
        } else {
            const newQuestion = {
                question_id: editingQuestion.question_id,
                type: editedData.questionType === 'MCQ' ? 'mcq' : editedData.questionType === 'Coding' ? 'coding' : editedData.questionType === 'Audio' ? 'audio' : editedData.questionType === 'Video' ? 'video' : editedData.questionType.toLowerCase(),
                skill: (editedData.skills && editedData.skills[0]) || '',
                difficulty: (editedData.level || 'Medium').toLowerCase(),
                positive_marking: parseInt(editedData.marks) || 0,
                negative_marking: parseInt(editedData.negative_marking) || 0,
                time_limit: parseInt(editedData.timeLimit) || 60,
                content: {}
            };
            if (editedData.questionType === 'MCQ') {
                newQuestion.content.prompt = editedData.questionText;
                newQuestion.content.options = editedData.options.map(o => o.text);
                const correctOpt = editedData.options.find(o => o.isCorrect) || editedData.options[0];
                const correctId = correctOpt ? correctOpt.id : 'A';
                const correctText = correctOpt ? correctOpt.text : '';
                newQuestion.content.answer = correctId;
                newQuestion.content.correct_answer = correctId;
                newQuestion.content.correct_option_text = correctText;
                newQuestion.correct_answer = correctId;
                newQuestion.correct_option_text = correctText;
            } else if (editedData.questionType === 'Coding') {
                newQuestion.content.prompt = editedData.questionText;
                newQuestion.content.input_spec = editedData.input_spec;
                newQuestion.content.output_spec = editedData.output_spec;
                newQuestion.content.examples = editedData.examples || [];
            } else if (editedData.questionType === 'Audio') {
                newQuestion.content.prompt_text = editedData.questionText;
                newQuestion.content.expected_keywords = editedData.expected_keywords || [];
            } else if (editedData.questionType === 'Video') {
                newQuestion.content.prompt_text = editedData.questionText;
            } else {
                newQuestion.content.prompt = editedData.questionText;
            }
            const updatedQuestions = [...questions, newQuestion];
            if (onUpdate) onUpdate(updatedQuestions);
        }
        setEditingQuestion(null);
        setEditedData(null);
    };

    const handleCancelEdit = () => { setEditingQuestion(null); setEditedData(null); };

    const handleDeleteQuestion = (question) => {
        if (window.confirm('Are you sure you want to delete this question?')) {
            const updatedQuestions = questions.filter(q => q.question_id !== question.question_id);
            if (onUpdate) onUpdate(updatedQuestions);
        }
    };

    const handleAddQuestion = (type) => {
        const newId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `tmp-${Date.now()}`;
        const base = {
            question_id: newId, type,
            skill: '', difficulty: 'medium',
            positive_marking: type === 'coding' ? 2 : 5,
            negative_marking: 0,
            time_limit: type === 'coding' ? 300 : type === 'video' ? 180 : type === 'audio' ? 120 : 60,
            content: {}
        };
        if (type === 'mcq') base.content = { prompt: '', options: ['Option A', 'Option B'], answer: 'A' };
        else if (type === 'coding') base.content = { prompt: '', input_spec: '', output_spec: '', examples: [] };
        else if (type === 'audio' || type === 'video') base.content = { prompt_text: '', expected_keywords: [], suggested_time_seconds: base.time_limit };
        else base.content = { prompt: '' };

        const display = {
            id: displayQuestions.length + 1,
            question_id: newId, text: '',
            options: type === 'mcq' ? base.content.options : [],
            expected_keywords: type === 'audio' ? [] : [],
            input_spec: '', output_spec: '',
            time: base.time_limit, difficulty: 'medium',
            questionType: type === 'mcq' ? 'MCQ' : type === 'coding' ? 'Coding' : type === 'audio' ? 'Audio' : 'Video',
            marks: base.positive_marking, negative_marking: base.negative_marking,
            tags: [], skills: []
        };
        display._isNew = true;
        setEditingQuestion(display);

        let edited;
        if (display.questionType === 'MCQ') {
            edited = { ...display, questionType: 'MCQ', timeLimit: String(display.time || 60), marks: String(display.marks || 5), level: 'Medium', skills: [], questionText: '', options: (display.options || []).map((opt, idx) => ({ id: String.fromCharCode(65 + idx), text: opt || '', isCorrect: idx === 0 })) };
        } else if (display.questionType === 'Coding') {
            edited = { ...display, questionType: 'Coding', timeLimit: String(display.time || 300), marks: String(display.marks || 2), level: 'Medium', skills: [], questionText: '', input_spec: '', output_spec: '', examples: [] };
        } else if (display.questionType === 'Audio') {
            edited = { ...display, questionType: 'Audio', timeLimit: String(display.time || 120), marks: String(display.marks || 5), level: 'Medium', skills: [], questionText: '', expected_keywords: [] };
        } else {
            edited = { ...display, questionType: 'Video', timeLimit: String(display.time || 180), marks: String(display.marks || 5), level: 'Medium', skills: [], questionText: '' };
        }
        setEditedData(edited);
    };

    const updateOptionText = (id, text) => {
        if (!editedData) return;
        setEditedData({ ...editedData, options: editedData.options.map(opt => opt.id === id ? { ...opt, text } : opt) });
    };
    const toggleCorrectAnswer = (id) => {
        if (!editedData) return;
        setEditedData({ ...editedData, options: editedData.options.map(opt => ({ ...opt, isCorrect: opt.id === id })) });
    };
    const addOption = () => {
        if (!editedData || !editedData.options) return;
        const newId = String.fromCharCode(65 + editedData.options.length);
        setEditedData({ ...editedData, options: [...editedData.options, { id: newId, text: '', isCorrect: false }] });
    };
    const removeOption = (id) => {
        if (!editedData || !editedData.options) return;
        if (editedData.options.length <= 2) { alert('Minimum 2 options required'); return; }
        setEditedData({ ...editedData, options: editedData.options.filter(opt => opt.id !== id) });
    };

    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;').replace(/'/g, '&#039;');
    }

    const handleDownload = async () => {
        const title = 'Generated Questions';
        const totalQuestions = displayQuestions.length;
        const totalMarks = displayQuestions.reduce((sum, q) => sum + (q.marks || 0), 0);
        const totalTime = Math.ceil(displayQuestions.reduce((sum, q) => sum + parseInt(q.time || 0), 0) / 60);
        const headerHtml = `<div style="padding:20px;border-bottom:1px solid #e5e7eb;margin-bottom:20px;"><h1 style="margin:0;font-size:22px;font-family:Arial,Helvetica,sans-serif;color:#0f172a">${escapeHtml(title)}</h1><div style="margin-top:6px;color:#475569;font-family:Arial,Helvetica,sans-serif">Questions: ${totalQuestions}</div></div>`;
        const summaryHtml = `<div style="margin-bottom:18px;font-family:Arial,Helvetica,sans-serif;color:#0f172a"><h2 style="font-size:16px;margin:0 0 8px 0">Summary</h2><ul style="margin:0;padding-left:18px;color:#334155"><li>Total Questions: ${totalQuestions}</li><li>Total Marks: ${totalMarks}</li><li>Duration (mins): ${totalTime}</li></ul></div>`;
        const questionBlocks = displayQuestions.map((q) => {
            const qTitle = `<div style="font-family:Arial,Helvetica,sans-serif;margin-bottom:6px;"><strong>Q${q.id}.</strong> ${escapeHtml(q.text)}</div>`;
            let details = '';
            if (q.questionType === 'MCQ' && q.options && q.options.length) {
                const opts = q.options.map((opt, i) => `<div style="margin-left:14px;margin-bottom:4px;">${String.fromCharCode(65 + i)}. ${escapeHtml(typeof opt === 'string' ? opt : opt)}</div>`).join('');
                details = `<div style="font-family:Arial,Helvetica,sans-serif;color:#374151;margin-bottom:8px">${opts}</div>`;
                 // Determine and show correct answer when available
                let correctText = '';
                if (q.correctOptionText) {
                    correctText = q.correctOptionText;
                } else if (q.correctAnswer) {
                    const ca = String(q.correctAnswer).trim();
                    if (/^[A-Za-z]$/.test(ca)) {
                        const idxC = ca.toUpperCase().charCodeAt(0) - 65;
                        let optionVal = q.options[idxC];
                        if (optionVal) {
                           correctText = (typeof optionVal === 'string' ? optionVal : optionVal).trim().replace(/^([a-zA-Z0-9]+)\s*[.)-]\s*/, '');
                        }
                        if (correctText) correctText = `${ca.toUpperCase()}. ${correctText}`;
                    } else {
                        // If it's the full text, clean it anyway
                        correctText = ca.trim().replace(/^([a-zA-Z0-9]+)\s*[.)-]\s*/, '');
                    }
                }
                if (correctText) details += `<div style="font-family:Arial,Helvetica,sans-serif;color:#065f46;font-weight:600;margin-bottom:8px">Correct Answer: ${escapeHtml(correctText)}</div>`;
            } else if (q.questionType === 'Coding') {
                details = `<div style="font-family:Arial,Helvetica,sans-serif;color:#374151;margin-bottom:8px">Input: ${escapeHtml(q.input_spec || '')}<br/>Output: ${escapeHtml(q.output_spec || '')}</div>`;
            } else if (q.questionType === 'Audio') {
                details = `<div style="font-family:Arial,Helvetica,sans-serif;color:#374151;margin-bottom:8px">Expected Keywords: ${escapeHtml((q.expected_keywords || []).join(', '))}</div>`;
            }
            const meta = `<div style="font-family:Arial,Helvetica,sans-serif;color:#6b7280;font-size:12px;margin-bottom:20px">Time: ${q.time}s | Marks: ${q.marks || 0} | Type: ${q.questionType}</div>`;
            return `<div style="margin-bottom:12px;">${qTitle}${details}${meta}</div>`;
        }).join('');
        const footer = `<div style="font-family:Arial,Helvetica,sans-serif;color:#94a3b8;margin-top:20px">Generated: ${escapeHtml(new Date().toLocaleString())}</div>`;
        const bodyHtml = `<div style="width:750px;padding:20px;background:#fff">${headerHtml}${summaryHtml}${questionBlocks}${footer}</div>`;
        try {
            const html2canvas = (await import('html2canvas')).default;
            const { jsPDF } = await import('jspdf');
            const container = document.createElement('div');
            container.style.position = 'fixed'; container.style.left = '-9999px'; container.style.top = '0';
            container.innerHTML = bodyHtml;
            document.body.appendChild(container);
            const canvas = await html2canvas(container, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'pt', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgProps = pdf.getImageProperties(imgData);
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${title.replace(/\s+/g, '_')}.pdf`);
            document.body.removeChild(container);
        } catch (err) {
            console.error('PDF export failed:', err);
            try {
                const w = window.open('', '_blank');
                if (w) { w.document.write(bodyHtml); w.document.close(); w.print(); }
            } catch (e) { console.error('Fallback print failed', e); }
        }
    };

    const isQuestionComplete = editedData?.questionText?.trim() !== '' &&
        (editedData?.questionType !== 'MCQ' ||
            (editedData?.options?.every(opt => opt.text.trim() !== '') &&
                editedData?.options?.some(opt => opt.isCorrect)));

    if (displayQuestions.length === 0) {
        return (
            <div className="p-6 border border-gray-300 shadow-md rounded-xl">
                <div className="text-center py-8">
                    <p className="text-gray-600">No questions generated yet.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/60">
            {/* Top Header Bar */}
            <div className="flex items-center justify-between  py-2 mb-1  ">
                <h2 className="text-base font-semibold text-gray-900">
                    Total Questions : <span className="text-gray-900">{displayQuestions.length}</span>
                </h2>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">Total Duration : {durationLabel}</span>
                    <div className="flex items-center gap-2">
                        <select
                            value={newQuestionType}
                            onChange={(e) => setNewQuestionType(e.target.value)}
                            className="px-2 py-1.5 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none"
                        >
                            <option value="mcq">MCQ</option>
                            <option value="coding">Coding</option>
                            <option value="audio">Audio</option>
                            <option value="video">Video</option>
                        </select>
                        <button
                            onClick={() => handleAddQuestion(newQuestionType)}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium transition-colors"
                        >
                            <Plus size={15} />
                            Add Question
                        </button>
                    </div>
                </div>
            </div>

            {/* Question Cards */}
            <div className="space-y-4">
                {displayQuestions.map((question) => {
                    const diff = DIFFICULTY_STYLES[question.difficulty] || DIFFICULTY_STYLES.medium;
                    const typeCls = TYPE_STYLES[question.questionType] || 'bg-gray-500 text-white';
                    return (
                        <div key={question.id} className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                            {/* Card Header */}
                            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <span className="font-semibold text-gray-800 text-sm">Question {question.id}</span>
                                    <span className={`text-xs font-semibold ${diff.color}`}>{diff.label}</span>
                                    {(question.tags || []).filter(Boolean).map((tag, i) => (
                                        <span key={i} className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">{tag}</span>
                                    ))}
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 text-gray-400 text-xs">
                                        <Clock size={13} />
                                        <span>{question.time} sec</span>
                                    </div>
                                    <button
                                        onClick={() => handleEditClick(question)}
                                        className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <Edit size={15} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteQuestion(question)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${typeCls}`}>
                                        {question.questionType}
                                    </span>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="px-5 py-4">
                                <div className="flex items-start justify-between mb-4">
                                    <p className="text-sm text-gray-800 font-medium leading-relaxed">
                                        <span className="text-gray-500 mr-1">Q.</span>{question.text}
                                    </p>
                                    <span className="ml-4 shrink-0 px-3 py-1 border border-gray-300 rounded-full text-xs text-gray-600 font-medium whitespace-nowrap">
                                        Total Marks: {question.marks}
                                    </span>
                                </div>

                                {/* MCQ Options */}
                                {question.questionType === 'MCQ' && question.options && (
                                    <div className="space-y-2 mb-4">
                                        {question.options.map((option, idx) => {
                                            const optionText = typeof option === 'string' ? option : option;
                                            const letter = String.fromCharCode(65 + idx);
                                            const isCorrect = (
                                                            (question.correctAnswer && String(question.correctAnswer).toString().trim().toUpperCase() === letter) ||
                                                            (question.correctAnswer && question.correctAnswer === optionText) ||
                                                            (question.correctOptionText && question.correctOptionText === optionText)
                                                        );
                                            return (
                                                <div key={idx} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${isCorrect ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}>
                                                        {isCorrect && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                                    </div>
                                                    <span className={isCorrect ? 'text-green-800 font-medium' : 'text-gray-700'}>{optionText}</span>
                                                    {isCorrect && <span className="ml-auto text-green-500 text-xs font-semibold">✓ Correct</span>}
                                                </div>
                                            );
                                        })}
                                        {question.explanation && (
                                            <div className="mt-3 p-3 bg-blue-50 rounded-xl text-xs text-gray-600">
                                                <span className="font-semibold text-blue-700">Explanation: </span>{question.explanation}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Coding Details */}
                                {question.questionType === 'Coding' && (
                                    <div className="space-y-2 mb-4">
                                        {question.input_spec && <div className="text-xs text-gray-600"><span className="font-semibold text-gray-700">Input: </span>{question.input_spec}</div>}
                                        {question.output_spec && <div className="text-xs text-gray-600"><span className="font-semibold text-gray-700">Output: </span>{question.output_spec}</div>}
                                        {question.examples && question.examples.length > 0 && (
                                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 mt-2">
                                                <span className="text-xs font-semibold text-gray-700">Examples:</span>
                                                <pre className="text-xs text-gray-600 mt-1 whitespace-pre-wrap">{JSON.stringify(question.examples, null, 2)}</pre>
                                            </div>
                                        )}
                                        {question.expected_answer && (
                                            <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-800">
                                                <span className="font-semibold">Correct Answer: </span>{question.expected_answer}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Audio Details */}
                                {question.questionType === 'Audio' && (
                                    <div className="space-y-2 mb-2">
                                        {question.expected_keywords && question.expected_keywords.length > 0 && (
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-xs font-semibold text-gray-600">Expected Keywords:</span>
                                                {question.expected_keywords.map((kw, i) => (
                                                    <span key={i} className="px-2.5 py-0.5 bg-gray-100 border border-gray-200 text-gray-600 rounded-full text-xs">{kw}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Video Details */}
                                {question.questionType === 'Video' && question.expected_answer && (
                                    <div className="mb-2 p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-800">
                                        <span className="font-semibold">Expected Answer: </span>{question.expected_answer}
                                    </div>
                                )}

                                {/* Correct Answer Row */}
                                {(question.questionType === 'Audio' || question.questionType === 'Video') && question.expected_answer && (
                                    <div className="mt-2 px-3 py-2 bg-green-50 border border-green-100 rounded-xl text-xs text-gray-700">
                                        <span className="text-green-700 font-semibold">Correct Answer: </span>
                                        <span className="text-gray-600">{question.expected_answer}</span>
                                    </div>
                                )}

                                {/* Rubric */}
                                {(question.questionType === 'Audio' || question.questionType === 'Video') && question.rubric && (
                                    <div className="mt-2 px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-600">
                                        <span className="text-gray-700 font-semibold">Evaluation Rubric: </span>
                                        <span>{question.rubric}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 flex justify-between items-center">
                <button
                    onClick={onBack}
                    disabled={loading}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium disabled:opacity-50 transition-colors"
                >
                    Back
                </button>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleDownload}
                        disabled={loading || displayQuestions.length === 0}
                        className="px-4 py-2 bg-[#0496FF] text-white rounded-lg hover:bg-blue-600 font-medium disabled:opacity-50 transition-colors"
                    >
                        Download PDF
                    </button>
                    <button
                        onClick={onNext}
                        disabled={loading || displayQuestions.length === 0}
                        className="px-6 py-2 bg-[#9157ED] text-white rounded-lg hover:bg-[#7940d6] font-medium disabled:opacity-50 transition-colors"
                    >
                        Next: Review & Finalize
                    </button>
                </div>
            </div>

            {/* Edit Modal */}
            {editingQuestion && editedData && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-800">Edit Question {editingQuestion.id}</h2>
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                        <Check className="w-3.5 h-3.5" /> Editing
                                    </span>
                                    <button onClick={handleCancelEdit} className="p-2 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors">
                                        <X className="w-4 h-4 text-gray-500" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Question Type</label>
                                    <input type="text" value={editedData.questionType || ''} readOnly
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Time Limit (seconds)</label>
                                    <input type="number" value={editedData.timeLimit || ''}
                                        onChange={(e) => setEditedData({ ...editedData, timeLimit: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" min="10" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Marks</label>
                                    <input type="number" value={editedData.marks || ''}
                                        onChange={(e) => setEditedData({ ...editedData, marks: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" min="0" />
                                </div>
                            </div>

                            {editedData.skills?.length > 0 && (
                                <div className="mb-6">
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Skills</label>
                                    <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50 min-h-[40px]">
                                        {editedData.skills.map((skill, idx) => (
                                            <span key={skill + idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mb-6">
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Question Text</label>
                                <textarea
                                    value={editedData.questionText || ''}
                                    onChange={(e) => setEditedData({ ...editedData, questionText: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 min-h-[90px] resize-y"
                                    placeholder="Enter your question here..."
                                />
                            </div>

                            {editedData?.questionType === 'MCQ' && (
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-xs font-semibold text-gray-600">Options (Click to mark correct)</label>
                                        <button onClick={addOption} className="flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs hover:bg-gray-700 transition-colors">
                                            <Plus size={12} /> Add Option
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {editedData.options?.map((option) => (
                                            <div key={option.id} className="flex items-center gap-2">
                                                <span className="text-xs font-semibold text-gray-600 w-5">{option.id}.</span>
                                                <input type="text" value={option.text || ''}
                                                    onChange={(e) => updateOptionText(option.id, e.target.value)}
                                                    onClick={() => toggleCorrectAnswer(option.id)}
                                                    className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none cursor-pointer transition-colors ${option.isCorrect ? 'bg-green-50 border-green-400 font-medium text-green-800' : 'bg-gray-50 border-gray-200 text-gray-700'}`}
                                                    placeholder="Enter option text..."
                                                />
                                                {option.isCorrect && <Check className="text-green-500 w-4 h-4 shrink-0" />}
                                                <button onClick={() => removeOption(option.id)} disabled={editedData.options.length <= 2}
                                                    className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {editedData?.questionType === 'Coding' && (
                                <>
                                    <div className="mb-4">
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Input Specification</label>
                                        <textarea value={editedData.input_spec || ''}
                                            onChange={(e) => setEditedData({ ...editedData, input_spec: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-y" rows="2"
                                            placeholder="Describe the input format..." />
                                    </div>
                                    <div className="mb-6">
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Output Specification</label>
                                        <textarea value={editedData.output_spec || ''}
                                            onChange={(e) => setEditedData({ ...editedData, output_spec: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-y" rows="2"
                                            placeholder="Describe the expected output..." />
                                    </div>
                                </>
                            )}

                            {editedData?.questionType === 'Audio' && (
                                <div className="mb-6">
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Expected Keywords (comma-separated)</label>
                                    <input type="text"
                                        value={Array.isArray(editedData.expected_keywords) ? editedData.expected_keywords.join(', ') : ''}
                                        onChange={(e) => setEditedData({ ...editedData, expected_keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k) })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                                        placeholder="e.g., leadership, teamwork, communication" />
                                </div>
                            )}

                            {isQuestionComplete && (
                                <div className="mb-5 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-xs font-medium">
                                    ✓ Question {editingQuestion.id} is complete and ready.
                                </div>
                            )}

                            <div className="flex justify-center gap-3">
                                <button onClick={handleCancelEdit}
                                    className="px-8 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium text-sm">
                                    Cancel
                                </button>
                                <button onClick={handleSaveEdit} disabled={!isQuestionComplete}
                                    className="px-8 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed">
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}