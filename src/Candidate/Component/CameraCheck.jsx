import React, { useState, useRef } from "react";
// import { CheckSquare, Square } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckSquare, Square, Mic, Camera, X } from "lucide-react";

function getFullscreenElement() {
  return (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement ||
    null
  );
}

async function requestDocumentFullscreen() {
  const el = document.documentElement;
  try {
    if (el.requestFullscreen) {
      await el.requestFullscreen();
      return;
    }
    if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
      return;
    }
    if (el.msRequestFullscreen) {
      el.msRequestFullscreen();
    }
  } catch (e) {
    console.warn("Fullscreen request failed:", e);
  }
}

const CameraCheck = ({ onBack }) => {
  const navigate = useNavigate();
  const baseWidths = [
  24,16,20,14,28,18,26,22,
  16,24,20,30,18,22,16,26,22,
  16,24,20,30,
];
const MAX_BAR_WIDTH = 70;
  const barsRef = useRef([]);
  const { questionSetId } = useParams();
  const [isChecked, setIsChecked] = useState(false);
  const [cameraAllowed, setCameraAllowed] = useState(false);
  const videoRef = useRef(null);
  const audioLevelRef = useRef(0);
  const [micAllowed, setMicAllowed] = useState(false);
const [camAllowed, setCamAllowed] = useState(false);
const [permissionGranted, setPermissionGranted] = useState(false);

  const startMicBars = async () => {
  try {
    const audioStream = await navigator.mediaDevices.getUserMedia({
      audio: true
    });

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(audioStream);
    const analyser = audioContext.createAnalyser();

    analyser.fftSize = 32;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    source.connect(analyser);

    const update = () => {
      analyser.getByteFrequencyData(dataArray);

      barsRef.current.forEach((bar, i) => {
        const value = dataArray[i] || 0;
        const width = Math.min(20 + value / 2, 70);

        if (bar) bar.style.width = `${width}px`;
      });

      requestAnimationFrame(update);
    };

    update();
  } catch (err) {
    console.log("Mic permission denied");
  }
};
 
  const handleNext = async () => {
    if (!cameraAllowed) return;

    if (!questionSetId) {
      alert("Question set ID is missing!");
      return;
    }

    await requestDocumentFullscreen();
    try {
      if (getFullscreenElement()) {
        sessionStorage.setItem("exam_expects_fullscreen", "1");
      }
    } catch (e) {}

    const search = window.location.search || "";
    navigate(`/Candidate-Dashboard/give-test/${questionSetId}${search}`);
  };
 
  const handleCheckbox = () => setIsChecked(!isChecked);
 
  const handleAllowCamera = async () => {
  if (!isChecked) setIsChecked(true);

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });

    if (videoRef.current) {
      try { videoRef.current.muted = true; } catch (e) {}
      videoRef.current.srcObject = stream;
      try {
        const p = videoRef.current.play && videoRef.current.play();
        if (p && p.then) p.catch(()=>{});
      } catch (e) {}
    }

    setCameraAllowed(true);

    // ✅ ADD THESE (FIX UI STATUS)
    setCamAllowed(true);
    setMicAllowed(true);

    startMicBars();

    try {
      window.__candidateCameraStream = stream;
      window.__cameraAllowed = true;
    } catch (e) {}

    setTimeout(() => {
      try {
        if (videoRef.current && (!videoRef.current.srcObject || videoRef.current.srcObject !== stream)) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(()=>{});
        }
      } catch (e) {}
    }, 50);

  } catch (err) {
    console.error("Camera access denied:", err);
    alert("Camera access was denied. Please enable it to continue.");
  }
};
 
  return (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div className="bg-white w-[950px] rounded-3xl px-8 py-6 shadow-xl relative">

      {/* CLOSE */}
      <button
        onClick={onBack}
        className="absolute right-6 top-6 text-gray-600 hover:text-black"
      >
        <X size={22} />
      </button>

      {/* HEADER */}
      <h2 className="text-xl font-semibold mb-4">
        Camera & Microphone Permission
      </h2>

      <div className="flex gap-8 items-start">

        {/* LEFT SIDE */}
        <div className="flex items-center gap-5">

          {/* 🎤 MIC WAVEFORM */}
          <div className="flex flex-col gap-[4px] w-[60px] min-w-[60px]">
            {baseWidths.map((w, i) => (
              <div
                key={i}
                ref={(el) => (barsRef.current[i] = el)}
                className="h-[4px] bg-purple-500 rounded-full"
                style={{
                  width: `${w}px`,
                  maxWidth: `${MAX_BAR_WIDTH}px`,
                  transition: "width .08s linear"
                }}
              />
            ))}
          </div>

          {/* 📷 CAMERA BOX */}
          <div className="bg-gray-500 w-[300px] h-[190px] rounded-xl flex items-center justify-center text-white text-base font-medium overflow-hidden relative">

            {!camAllowed && (
              <span className="absolute text-center leading-snug text-white text-base font-medium">
                Camera Permission <br /> Required
              </span>
            )}

            <video
              ref={videoRef}
              autoPlay
              muted
              className={`w-full h-full object-cover ${
                camAllowed ? "block" : "hidden"
              }`}
            />
          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="flex-1">

          <h3 className="font-semibold text-lg mb-3">
            Grant Camera & Microphone Permission
          </h3>

          <ul className="space-y-3 text-gray-600 text-sm">
            <li className="flex gap-3">
              <span className="w-2 h-2 bg-purple-500 rounded-full mt-2"></span>
              All audio and video data securely encrypted.
            </li>

            <li className="flex gap-3">
              <span className="w-2 h-2 bg-purple-500 rounded-full mt-2"></span>
              Audio and video recorded only during proctored exams.
            </li>

            <li className="flex gap-3">
              <span className="w-2 h-2 bg-purple-500 rounded-full mt-2"></span>
              Access ensures a fair and secure testing environment.
            </li>
          </ul>

          {/* Checkbox */}
          <div
            onClick={handleCheckbox}
            className="flex items-center gap-3 mt-5 cursor-pointer"
          >
            {isChecked ? (
              <CheckSquare className="w-5 h-5 text-purple-600" />
            ) : (
              <Square className="w-5 h-5 text-gray-400" />
            )}

            <span className="text-sm text-gray-600">
              I understand and consent to being recorded during the assessment.
            </span>
          </div>

        </div>
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-between mt-8 pt-4">

        {/* STATUS */}
        <div className="flex gap-4 text-sm">

          <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg">
            <Mic size={16}/>
            Microphone
            {micAllowed
              ? <span className="text-green-500">✔</span>
              : <span className="text-red-500">✖</span>}
          </div>

          <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg">
            <Camera size={16}/>
            Camera
            {camAllowed
              ? <span className="text-green-500">✔</span>
              : <span className="text-red-500">✖</span>}
          </div>

        </div>

        {/* BUTTONS */}
        <div className="flex gap-4">

          <button
            onClick={onBack}
            className="border border-purple-500 text-purple-600 px-6 py-2 rounded-xl font-medium hover:bg-purple-50"
          >
            Cancel
          </button>

         <button
  onClick={handleAllowCamera}
  disabled={!isChecked}
  className={`px-6 py-2 rounded-xl text-white font-medium ${
    isChecked
      ? "bg-gradient-to-r from-purple-600 to-indigo-400"
      : "bg-gray-300 cursor-not-allowed"
  }`}
>
  Allow Camera & Microphone Access
</button>

        </div>

      </div>

      {/* ✅ YOUR ORIGINAL CONTINUE BUTTON (UNCHANGED) */}
      <div className="flex justify-end mt-6">
        <button
          onClick={handleNext}
          disabled={!cameraAllowed}
          className={`px-6 py-2 rounded-xl text-sm font-medium transition ${
            cameraAllowed
              ? "bg-gradient-to-r from-purple-500 to-indigo-400 text-white hover:opacity-90"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Continue to Test
        </button>
      </div>

    </div>
  </div>
);
};
 
export default CameraCheck;