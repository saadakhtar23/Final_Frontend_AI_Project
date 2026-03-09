import { X } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { baseUrl } from "../../utils/ApiConstants";

const RMGSupportTickets = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    subject: "",
    date: "",
    priority: "Medium",
    description: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.subject || !formData.description) {
      setMessage("Please fill all required fields");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      const { data } = await axios.post(
        `${baseUrl}/tickets/`,
        {
          subject: formData.subject,
          description: formData.description,
          priority: formData.priority
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (data.success) {
        setMessage(data.message || "Ticket created successfully");

        setFormData({
          subject: "",
          date: "",
          priority: "Medium",
          description: ""
        });

        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setMessage(data.message || "Failed to create ticket");
      }

    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        "Error creating ticket. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl px-6 py-4">

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Create New Tickets
          </h2>

          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {message && (
          <div className="mb-2 text-sm text-center text-green-500">
            {message}
          </div>
        )}

        <div className="mb-2">
          <label className="text-sm font-medium text-gray-800">
            Subject <span className="text-red-500">*</span>
          </label>

          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Enter subject"
            className="mt-2 w-full h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none"
          />
        </div>

        <div className="mb-2">
          <label className="text-sm font-medium text-gray-800">
            Date <span className="text-red-500">*</span>
          </label>

          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="mt-2 w-full h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none"
          />
        </div>

        <div className="mb-2">
          <label className="text-sm font-medium text-gray-800">
            Priority <span className="text-red-500">*</span>
          </label>

          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="mt-2 w-full h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none"
          >
            <option value="">Select priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="text-sm font-medium text-gray-800">
            Description <span className="text-red-500">*</span>
          </label>

          <textarea
            rows="4"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter description"
            className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none resize-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-11 rounded-xl text-white text-sm font-medium bg-gradient-to-r from-[#735BC7] to-[#AAA9FB] disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit Ticket"}
        </button>

      </div>
    </div>
  );
};

export default RMGSupportTickets;