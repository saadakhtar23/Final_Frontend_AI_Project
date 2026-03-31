import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { baseUrl } from '../../utils/ApiConstants';
import { FileText } from 'lucide-react';
import banner from "../../img/profile-banner.png";
import india from "../../img/ind-icon.png";

function CandidateProfile() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        resume: ''
    });
    const [originalData, setOriginalData] = useState({});
    const [resumeFile, setResumeFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const resumeRef = useRef(null);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("candidateToken");
                const res = await axios.get(`${baseUrl}/candidate/profile/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const candidate = res.data.candidate;
                console.log(candidate);

                const profileData = {
                    name: candidate.name || '',
                    email: candidate.email || '',
                    phone: candidate.phone || '',
                    resume: candidate.resume || ''
                };
                setFormData(profileData);
                setOriginalData(profileData);
            } catch (err) {
                console.error("Error fetching profile:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            const phoneValue = value.replace(/[^0-9]/g, '').slice(0, 10);
            setFormData((prev) => ({ ...prev, [name]: phoneValue }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleResumeChange = (e) => {
        const file = e.target.files[0];
        if (file) setResumeFile(file);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem("candidateToken");
            const formDataToSend = new FormData();
            formDataToSend.append("phone", formData.phone);
            if (resumeFile) formDataToSend.append("resume", resumeFile);

            const res = await axios.put(`${baseUrl}/candidate/profile/me`, formDataToSend, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            const updatedData = {
                ...formData,
                phone: res.data.candidate.phone || '',
                resume: res.data.candidate.resume || ''
            };
            setFormData(updatedData);
            setOriginalData(updatedData);
            setResumeFile(null);
            alert("Profile updated successfully!");
        } catch (err) {
            alert("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData(originalData);
        setResumeFile(null);
    };

    const getInitials = (name) => {
        if (!name) return 'NA';
        const words = name.trim().split(/\s+/);
        if (words.length === 1) {
            return words[0][0]?.toUpperCase() || 'N';
        }
        const firstLetter = words[0][0]?.toUpperCase() || '';
        const secondLetter = words[1][0]?.toUpperCase() || '';
        return firstLetter + secondLetter;
    };

    if (loading) {
        return (
            <div className="p-8 text-center text-gray-500">Loading...</div>
        );
    }

    return (
        <div className="overflow-hidden">

            <div className="relative">
                <img src={banner} alt="Banner" />
            </div>

            <div className="relative flex left-15">
                <div className="-mt-12 relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-gradient-to-br from-[#6950BD] to-[#896BE6] flex items-center justify-center">
                        <span className="text-white text-2xl font-bold select-none">
                            {getInitials(formData.name)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">

                <div className="grid md:grid-cols-2 gap-6">

                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            disabled
                            className="mt-2 w-full h-11 px-4 border rounded-lg hover:cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            disabled
                            className="mt-2 w-full h-11 px-4 border rounded-lg hover:cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Phone No.
                        </label>

                        <div className="flex mt-2">
                            <div className="flex items-center px-3 w-22 border rounded-l-lg">
                                <img src={india} alt="India" className="w-5 h-5 mr-2" />
                                +91
                            </div>

                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full h-11 px-4 border rounded-r-lg focus:outline-none bg-white"
                                maxLength={10}
                                placeholder="Enter your phone number"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Resume
                        </label>


                        <input
                            ref={resumeRef}
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleResumeChange}
                            className="mt-2 w-full h-11 px-4 border rounded-lg focus:outline-none bg-white flex items-center leading-[2.75rem] file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 file:mt-1.5"
                        />
                        {resumeFile && (
                            <p className="mt-1 text-sm text-green-600">
                                Selected: {resumeFile.name}
                            </p>
                        )}


                        {formData.resume && (
                            <div className="mt-2 mb-2">
                                <a
                                    href={formData.resume}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors"
                                >
                                    <FileText size={18} />
                                    View Current Resume
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <button
                        onClick={handleCancel}
                        disabled={saving}
                        className="px-6 py-2 border border-purple-500 text-purple-600 rounded-lg hover:bg-purple-50"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2 bg-gradient-to-r from-[#6950BD] to-[#896BE6] text-white rounded-lg hover:bg-purple-700"
                    >
                        {saving ? "Updating..." : "Update Profile"}
                    </button>
                </div>

            </div>
        </div>
    );
}

export default CandidateProfile;