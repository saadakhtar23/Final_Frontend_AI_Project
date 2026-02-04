import React, { useState, useEffect } from 'react';
import { Pencil, Phone, Mail, User, Briefcase, Building, Save, X } from "lucide-react";
import axios from 'axios';
import { baseUrl } from '../utils/ApiConstants';

function RecruiterProfile() {
    const [recruiter, setRecruiter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [phone, setPhone] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`${baseUrl}/auth/meAll`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setRecruiter(res.data.data);
                setPhone(res.data.data.phone || "");
            } catch (err) {
                console.error("Error fetching user:", err);
                setRecruiter(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.put(
                `${baseUrl}/recruiter/profile/me`,
                { phone },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setRecruiter(res.data.data);
            setPhone(res.data.data.phone || "");
            setEditMode(false);
            alert("Profile updated successfully!");
        } catch (err) {
            alert("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setEditMode(false);
        setPhone(recruiter.phone || "");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Loading profile...</div>
            </div>
        );
    }

    if (!recruiter) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
                <div className="text-red-500">Failed to load profile.</div>
            </div>
        );
    }

    const getInitials = (name) => {
        if (!name) return '?';
        const words = name.trim().split(' ');
        if (words.length === 1) {
            return words[0][0].toUpperCase();
        }
        return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-medium text-gray-800 mb-2">Profile</h1>
                    <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto"></div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-white">
                        <div className="flex items-center space-x-6">
                            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-light">
                                {getInitials(recruiter.name)}
                            </div>
                            <div>
                                <h2 className="text-2xl font-light mb-1">{recruiter.name}</h2>
                                <p className="text-white/80 font-light">{recruiter.email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        {!editMode && (
                            <div className="flex justify-end mb-6">
                                <button
                                    onClick={() => setEditMode(true)}
                                    className="flex items-center gap-2 px-6 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                                >
                                    <Pencil size={18} />
                                    <span>Edit</span>
                                </button>
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="group">
                                <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                    <User size={16} />
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={recruiter.name || ""}
                                    disabled
                                    className="w-full px-4 py-3 bg-gray-50 rounded-lg text-gray-800 transition-all duration-200 cursor-not-allowed"
                                />
                            </div>

                            <div className="group">
                                <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                    <Mail size={16} />
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={recruiter.email || ""}
                                    disabled
                                    className="w-full px-4 py-3 bg-gray-50 rounded-lg text-gray-800 transition-all duration-200 cursor-not-allowed"
                                />
                            </div>

                            <div className="group">
                                <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                    <Briefcase size={16} />
                                    Role
                                </label>
                                <input
                                    type="text"
                                    value={recruiter.role || ""}
                                    disabled
                                    className="w-full px-4 py-3 bg-gray-50 rounded-lg text-gray-800 transition-all duration-200 cursor-not-allowed"
                                />
                            </div>

                            <div className="group">
                                <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                    <Phone size={16} />
                                    Phone
                                    {editMode && (
                                        <span className="text-xs text-indigo-500 ml-2">(Editable)</span>
                                    )}
                                </label>
                                <input
                                    type="text"
                                    maxLength={10}
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                                    disabled={!editMode}
                                    placeholder="Enter your phone number"
                                    className={`w-full px-4 py-3 rounded-lg transition-all duration-200 ${editMode
                                            ? 'bg-white border-2 border-indigo-200 focus:border-indigo-500 focus:outline-none'
                                            : 'bg-gray-50 text-gray-800 cursor-not-allowed'
                                        }`}
                                />
                            </div>



                            <div className="group">
                                <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                    Status
                                </label>
                                <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${recruiter.isActive
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}>
                                        {recruiter.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {editMode && (
                            <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Save size={18} />
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50"
                                >
                                    <X size={18} />
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RecruiterProfile;