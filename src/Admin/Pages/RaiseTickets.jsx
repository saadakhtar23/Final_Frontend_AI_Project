import React, { useMemo, useRef, useState } from "react";
import { Calendar, ChevronDown, X } from "lucide-react";
import axios from "axios";
import { baseUrl } from "../../utils/ApiConstants";

export default function RaiseTickets({ isOpen, onClose, onSuccess }) {
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState("");
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hiddenDateRef = useRef(null);

  const formattedDate = useMemo(() => {
    if (!date) return "";
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-GB").replace(/\//g, "-");
  }, [date]);

  const openDatePicker = () => {
    if (!hiddenDateRef.current) return;
    if (typeof hiddenDateRef.current.showPicker === "function")
      hiddenDateRef.current.showPicker();
    else hiddenDateRef.current.click();
  };

  const handleSubmitTicket = async () => {
    if (!subject.trim() || !message.trim()) {
      alert("Please fill in both subject and description");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      const meta = [
        formattedDate ? `Date: ${formattedDate}` : "",
        priority ? `Priority: ${priority}` : "",
      ].filter(Boolean);

      const finalMessage = meta.length
        ? `${meta.join(" | ")}\n${message}`
        : message;

      const response = await axios.post(
        `${baseUrl}/api/tickets/raise-ticket-admin`,
        {
          subject,
          message: finalMessage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log(response.data);

      alert("Ticket raised successfully!");
      setSubject("");
      setPriority("");
      setDate("");
      setMessage("");
      onSuccess?.(response.data);
      onClose?.();
    } catch (error) {
      console.error("Error raising ticket:", error);
      alert(error.response?.data?.message || "Failed to raise ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className="w-full max-w-[450px] bg-white shadow-xl relative mx-4 max-h-[90vh]"
          style={{ borderRadius: '22px', overflow: 'hidden' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 pt-5 pb-3 border-b border-gray-100 shrink-0">
            <div className="relative flex items-center justify-center">
              <div className="text-xl font-semibold text-gray-900">
                Create New Ticket
              </div>
              <button
                onClick={onClose}
                className="absolute right-0 top-0 w-9 h-9 grid place-items-center rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-900" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto px-6 pb-6 pt-4 space-y-4" style={{ maxHeight: 'calc(90vh - 60px)' }}>
            <div>
              <div className="text-sm font-medium text-gray-900 mb-2">
                Subject <span className="text-red-500">*</span>
              </div>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter subject"
                className="w-full h-12 rounded-xl border border-gray-200 bg-[#FAFAFF] px-4 text-sm outline-none focus:ring-2 focus:ring-[#6D5BD0]/20"
              />
            </div>

            <div>
              <div className="text-sm font-medium text-gray-900 mb-2">
                Date <span className="text-red-500">*</span>
              </div>
              <div className="relative">
                <input
                  value={formattedDate}
                  readOnly
                  onClick={openDatePicker}
                  placeholder="Select date"
                  className="w-full h-12 rounded-xl border border-gray-200 bg-[#FAFAFF] px-4 pr-10 text-sm outline-none focus:ring-2 focus:ring-[#6D5BD0]/20 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={openDatePicker}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  <Calendar className="w-4 h-4" />
                </button>
                <input
                  ref={hiddenDateRef}
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="absolute inset-0 opacity-0 pointer-events-none"
                  tabIndex={-1}
                />
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-900 mb-2">
                Priority <span className="text-red-500">*</span>
              </div>
              <div className="relative">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full h-12 rounded-xl border border-gray-200 bg-[#FAFAFF] px-4 pr-10 text-sm outline-none focus:ring-2 focus:ring-[#6D5BD0]/20 appearance-none"
                >
                  <option value="">Select priority</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-900 mb-2">
                Description <span className="text-red-500">*</span>
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter description"
                rows={5}
                className="w-full rounded-xl border border-gray-200 bg-[#FAFAFF] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#6D5BD0]/20 resize-none"
              />
            </div>

            <button
              onClick={handleSubmitTicket}
              disabled={isSubmitting}
              className="w-full h-10 rounded-lg bg-gradient-to-r from-[#684FBC] to-[#886BE6] text-white text-sm font-medium disabled:opacity-60 hover:bg-[#5a4abf] transition-colors"
            >
              {isSubmitting ? "Submitting..." : "Submit Ticket"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}