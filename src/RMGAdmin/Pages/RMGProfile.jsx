import React, { useState, useEffect } from "react";
import axios from "axios";
import banner from "../../img/profile-banner.png";
import { baseUrl } from "../../utils/ApiConstants";

const RMGProfile = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "",
        isActive: true,
    });

    const [rmgId, setRmgId] = useState(null);
    const [originalData, setOriginalData] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");

                const response = await axios.get(`${baseUrl}/auth/meAll`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = response.data;

                if (data.data) {
                    setRmgId(data.data._id);

                    const profileData = {
                        name: data.data.name || "",
                        email: data.data.email || "",
                        role: data.data.role || "",
                        isActive: data.data.isActive ?? true,
                    };

                    setFormData(profileData);
                    setOriginalData(profileData);
                }

                setLoading(false);
            } catch (error) {
                console.error("Error fetching profile data:", error);
                setLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!rmgId) {
            alert("RMG ID not found. Please refresh the page.");
            return;
        }

        setSaving(true);
        try {
            const token = localStorage.getItem("token");

            const updateData = {};
            if (formData.name !== originalData.name) {
                updateData.name = formData.name;
            }

            if (Object.keys(updateData).length === 0) {
                alert("No changes to update");
                setSaving(false);
                return;
            }

            const response = await axios.put(
                `${baseUrl}/offer/rmg/${rmgId}`,
                updateData,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success && response.data.data) {
                const updatedProfile = {
                    name: response.data.data.name || "",
                    email: response.data.data.email || "",
                    role: response.data.data.role || "",
                    isActive: response.data.data.isActive ?? true,
                };

                setFormData(updatedProfile);
                setOriginalData(updatedProfile);
                alert("Profile updated successfully!");
            }
        } catch (error) {
            console.error("Error saving profile:", error);
            if (error.response) {
                alert(error.response.data.error || "Failed to update profile");
            } else {
                alert("Network error. Please try again.");
            }
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData(originalData);
    };

    const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

    if (loading) {
        return (
            <div className="p-8 text-center text-gray-500">Loading...</div>
        );
    }

    const getInitials = (name) => {
        if (!name) return "NA";
        const words = name.trim().split(/\s+/);
        if (words.length === 1) {
            return words[0][0]?.toUpperCase() || "N";
        }
        return words[0][0]?.toUpperCase() + words[1][0]?.toUpperCase();
    };

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
                        <label className="text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="mt-2 w-full h-11 px-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            disabled
                            className="mt-2 w-full h-11 px-4 border rounded-lg bg-gray-100 hover:cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">Role</label>
                        <input
                            name="role"
                            value={formData.role}
                            disabled
                            className="mt-2 w-full h-11 px-4 border rounded-lg bg-gray-100 hover:cursor-not-allowed"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <button
                        onClick={handleCancel}
                        disabled={saving || !hasChanges}
                        className={`px-6 py-2 border border-purple-500 text-purple-600 rounded-lg ${!hasChanges ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-50'}`}
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={saving || !hasChanges}
                        className={`px-6 py-2 bg-gradient-to-r from-[#6950BD] to-[#896BE6] text-white rounded-lg ${!hasChanges ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
                    >
                        {saving ? "Updating..." : "Update Profile"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RMGProfile;