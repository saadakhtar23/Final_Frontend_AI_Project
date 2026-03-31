import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseUrl } from "../../utils/ApiConstants";
import banner from "../../img/profile-banner.png"
import india from "../../img/ind-icon.png"

const AdminProfile = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "",
        phone: "",
        isActive: true,
    });

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

                console.log("admin profile", response.data);

                const data = response.data;

                if (data.data) {
                    const profileData = {
                        name: data.data.name || "",
                        email: data.data.email || "",
                        role: data.data.role || "",
                        phone: data.data.phone || "",
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

        if (name === "phone") {
            const phoneValue = value.replace(/[^0-9]/g, "").slice(0, 10);
            setFormData((prev) => ({ ...prev, [name]: phoneValue }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

   const handleSave = async () => {
    setSaving(true);
    try {
        const token = localStorage.getItem("token");

        const meResponse = await axios.get(`${baseUrl}/auth/meAll`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        const adminId = meResponse.data.data._id;

        const response = await axios.put(
            `${baseUrl}/admin/admin/${adminId}`,
            {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        console.log("admin profile updated", response.data);

        if (response.data.data) {
            const updated = {
                name: response.data.data.name || "",
                email: response.data.data.email || "",
                role: response.data.data.role || "",
                phone: response.data.data.phone || "",
                isActive: response.data.data.isActive ?? true,
            };

            setFormData(updated);
            setOriginalData(updated);
        }

        alert("Profile updated successfully!");
    } catch (error) {
        console.error("Error saving profile:", error);
        alert("Failed to update profile");
    } finally {
        setSaving(false);
    }
};

    const handleCancel = () => {
        setFormData(originalData);
    };

    if (loading) {
        return (
            <div className="p-8 text-center text-gray-500">Loading...</div>
        );
    }

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

    return (
        <div className="overflow-hidden">

            <div className="relative ">
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
                            onChange={handleInputChange}
                            className="mt-2 w-full h-11 px-4 border rounded-lg"
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
                            onChange={handleInputChange}
                            className="mt-2 w-full h-11 px-4 border rounded-lg"
                        />
                    </div>


                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Role
                        </label>

                        <input
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            className="mt-2 w-full h-11 px-4 border rounded-lg"
                        />

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
                        {saving ? "Updating..." : "Update Profile "}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AdminProfile;