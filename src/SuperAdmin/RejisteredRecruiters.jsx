import { useEffect, useMemo, useState } from "react";
import { Eye, Trash2, Search } from "lucide-react";
import Pagination from "../components/LandingPage/Pagination";
import axios from "axios";
import { superAdminBaseUrl } from "../utils/ApiConstants";

function RejisteredRecruiters() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRegister, setSelectedRegister] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [registers, setRegisters] = useState([]);
    const [logoError, setLogoError] = useState(false);

    const itemsPerPage = 8;

    const convertCloudinaryUrl = (url) => {
        if (!url) return "";
        if (url.includes("cloudinary.com")) {
            return url.replace("/upload/", "/upload/f_auto,q_auto/");
        }
        return url;
    };

    const getCompanyTypeBadge = (type = "") => {
        const t = (type || "").toLowerCase();
        if (t.includes("non")) return "bg-[#F1E9FF] text-[#7C3AED]";
        if (t.includes("product")) return "bg-[#E8F2FF] text-[#2563EB]";
        if (t.includes("service")) return "bg-[#FFE8F1] text-[#DB2777]";
        if (t === "it" || t.includes("it")) return "bg-[#E9FFF4] text-[#16A34A]";
        return "bg-gray-100 text-gray-700";
    };

    const getSubscriptionBadge = (label = "") => {
        const t = (label || "").toLowerCase();
        if (t.includes("kick")) return "bg-[#7C3AED] text-white";
        if (t.includes("plus")) return "bg-[#B8860B] text-white";
        if (t.includes("pro")) return "bg-[#0B4FD8] text-white";
        if (t.includes("enterprise")) return "bg-[#A21CAF] text-white";
        return "bg-gray-200 text-gray-800";
    };

    const getSubscriptionLabel = (register) => {
        return (
            register?.subscription?.planName ||
            register?.subscription?.type ||
            register?.subscription?.name ||
            register?.subscription ||
            "NA"
        );
    };

    useEffect(() => {
        const fetchRegisteredRecruiters = async () => {
            try {
                const response = await axios.get(`${superAdminBaseUrl}/company/`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                console.log(response.data);

                const mapped = (response.data?.companies || []).map((company) => ({
                    _id: company._id,
                    companyName: company.companyName,
                    registerName: "Sneha Singh",
                    email: company.email,
                    phoneNumber: company.phoneNo,
                    companyType: company.companyType
                        ? company.companyType.charAt(0).toUpperCase() +
                        company.companyType.slice(1)
                        : "NA",
                    contactPerson: "Rajesh Pandi",
                    employees: (company.numberOfEmployees ?? "").toString() + "+",
                    gstNumber: company.gstNumber,
                    panNumber: company.panNumber,
                    typeOfStaffing: company.typeOfStaffing
                        ? company.typeOfStaffing.charAt(0).toUpperCase() +
                        company.typeOfStaffing.slice(1)
                        : "NA",
                    address1: company.address1,
                    address2: company.address2,
                    city: company.city,
                    state: company.state,
                    logo: convertCloudinaryUrl(company.logo),
                    themeColors: ["#6B46C1", "#3B82F6", "#FFFFFF"],
                    phone: company.phoneNo,
                    subdomain: company.subdomain,
                    createdAt: company.createdAt,
                    createdBy: company.createdBy,
                    adminCredentials: company.adminCredentials,
                    subscription: company.subscription,
                    settings: company.settings,
                    address: {
                        street: company.address1,
                        city: company.city,
                        state: company.state,
                        country: company.country,
                        zipCode: company.zipCode,
                    },
                }));

                mapped.sort(
                    (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
                );

                setRegisters(mapped.map((r, idx) => ({ ...r, id: idx + 1 })));
            } catch (error) {
                console.error("Error fetching registered recruiters:", error);
            }
        };

        fetchRegisteredRecruiters();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this company?")) {
            try {
                await axios.delete(`${superAdminBaseUrl}/company/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });

                setRegisters((prev) =>
                    prev
                        .filter((r) => r._id !== id)
                        .map((r, idx) => ({ ...r, id: idx + 1 }))
                );

                if (selectedRegister?._id === id) setSelectedRegister(null);
            } catch (error) {
                console.error("Error deleting company:", error);
                alert(error.response?.data?.message || "Failed to delete company");
            }
        }
    };

    const filteredRegisters = useMemo(() => {
        const term = (searchTerm || "").trim().toLowerCase();
        if (!term) return registers;

        return registers.filter((register) => {
            const idMatch = register.id?.toString().includes(term);
            const companyMatch = (register.companyName || "")
                .toLowerCase()
                .includes(term);
            const registerNameMatch = (register.registerName || "")
                .toLowerCase()
                .includes(term);
            return idMatch || companyMatch || registerNameMatch;
        });
    }, [registers, searchTerm]);

    const totalPages = Math.ceil(filteredRegisters.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredRegisters.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleViewDetails = (register) => {
        setSelectedRegister(register);
        setLogoError(false);
    };

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-base font-semibold text-gray-900">
                        Registered Companies
                    </h1>

                    <div className="relative w-[220px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="h-9 w-full pl-9 pr-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
                        />
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-[#CBB9FF] shadow-[0_8px_24px_rgba(90,70,170,0.08)] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[#F3F1FF]">
                                <tr className="text-left text-xs font-semibold text-gray-700">
                                    <th className="px-5 py-4 whitespace-nowrap">Serial No.</th>
                                    <th className="px-5 py-4 whitespace-nowrap">Company Name</th>
                                    <th className="px-5 py-4 whitespace-nowrap">Email</th>
                                    <th className="px-5 py-4 whitespace-nowrap">Phone No.</th>
                                    <th className="px-5 py-4 whitespace-nowrap">Company Type</th>
                                    <th className="px-5 py-4 whitespace-nowrap">
                                        Subscription Type
                                    </th>
                                    <th className="px-5 py-4 whitespace-nowrap text-center">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {currentItems.length > 0 ? (
                                    currentItems.map((register) => {
                                        const subLabel = getSubscriptionLabel(register);

                                        return (
                                            <tr key={register._id} className="hover:bg-[#FAFAFF]">
                                                <td className="px-5 py-4 text-sm text-gray-900 whitespace-nowrap">
                                                    {register.id}.
                                                </td>

                                                <td className="px-5 py-4 text-sm text-gray-900 whitespace-nowrap">
                                                    {register.companyName}
                                                </td>

                                                <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                                                    {register.email}
                                                </td>

                                                <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                                                    {register.phoneNumber}
                                                </td>

                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <span
                                                        className={[
                                                            "inline-flex items-center justify-center",
                                                            "px-3 py-1 rounded-full text-xs font-medium",
                                                            getCompanyTypeBadge(register.companyType),
                                                        ].join(" ")}
                                                    >
                                                        {register.companyType}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <span
                                                        className={[
                                                            "inline-flex items-center justify-center",
                                                            "px-4 py-1 rounded-md text-xs font-semibold",
                                                            getSubscriptionBadge(subLabel),
                                                        ].join(" ")}
                                                    >
                                                        {subLabel}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => handleViewDetails(register)}
                                                            className="w-8 h-8 grid place-items-center rounded-md bg-violet-50 text-violet-700 hover:bg-violet-100"
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>

                                                        <button
                                                            onClick={() => handleDelete(register._id)}
                                                            className="w-8 h-8 grid place-items-center rounded-md bg-red-50 text-red-600 hover:bg-red-100"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-6 py-10 text-center text-gray-500"
                                        >
                                            No records found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                </div>
                {filteredRegisters.length > 0 && (
                    <div className="pb-4 pt-2">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>

            {selectedRegister && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
                    <div className="bg-white rounded-[24px] max-w-[560px] w-full max-h-[95vh] overflow-y-auto shadow-xl">
                        <div className="relative px-6 pt-5">
                            <h2 className="text-[18px] font-semibold text-black">
                                Company Details
                            </h2>

                            <button
                                onClick={() => setSelectedRegister(null)}
                                className="absolute right-5 top-5 text-black hover:opacity-70"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        <div className="px-6 pb-8">
                            <div className="relative flex flex-col items-center pt-4 pb-10">
                                <button className="absolute right-0 top-2 border border-[#4338CA] text-[#4338CA] rounded-full px-5 py-1.5 text-sm font-medium bg-white">
                                    Edit
                                </button>

                                <div className="w-[130px] h-[130px] rounded-full bg-[#E7E1E1] flex items-center justify-center text-black text-4xl font-semibold">
                                    {selectedRegister.companyName
                                        ?.split(" ")
                                        .filter(word => word.length > 0)
                                        .slice(0, 2)
                                        .map(word => word.charAt(0).toUpperCase())
                                        .join("")}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-x-16 mb-10">
                                <div>
                                    <h3 className="text-[15px] font-semibold text-black mb-6">
                                        Company Type
                                    </h3>
                                    <p className="text-[13px] text-[#555]">
                                        {selectedRegister.companyType}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-[15px] font-semibold text-black mb-6">
                                        Email
                                    </h3>
                                    <p className="text-[13px] text-[#555]">
                                        {selectedRegister.email}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-x-16 mb-10">
                                <div></div>
                                <div>
                                    <h3 className="text-[15px] font-semibold text-black mb-6">
                                        Company Name
                                    </h3>
                                    <p className="text-[13px] text-[#555]">
                                        {selectedRegister.companyName}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-x-16 mb-10">
                                <div>
                                    <h3 className="text-[15px] font-semibold text-black mb-6">
                                        Contact No.
                                    </h3>
                                    <p className="text-[13px] text-[#555]">
                                        {selectedRegister.phoneNumber}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-[15px] font-semibold text-black mb-6">
                                        PAN No.
                                    </h3>
                                    <p className="text-[13px] text-[#555]">
                                        {selectedRegister.panNumber}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-x-16 mb-10">
                                <div></div>
                                <div>
                                    <h3 className="text-[15px] font-semibold text-black mb-6">
                                        GST Number
                                    </h3>
                                    <p className="text-[13px] text-[#555]">
                                        {selectedRegister.gstNumber}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-x-16 mb-10">
                                <div>
                                    <h3 className="text-[15px] font-semibold text-black mb-6">
                                        How many Employees
                                    </h3>
                                    <p className="text-[13px] text-[#555]">
                                        {selectedRegister.employees}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-[15px] font-semibold text-black mb-6">
                                        Type of Staffing
                                    </h3>
                                    <p className="text-[13px] text-[#555]">
                                        {selectedRegister.typeOfStaffing}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-x-16 mb-10">
                                <div></div>
                                <div>
                                    <h3 className="text-[15px] font-semibold text-black mb-6">
                                        Address 1
                                    </h3>
                                    <p className="text-[13px] text-[#555]">
                                        {selectedRegister.address1}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-x-16 mb-10">
                                <div>
                                    <h3 className="text-[15px] font-semibold text-black mb-6">
                                        Address 2
                                    </h3>
                                    <p className="text-[13px] text-[#555]">
                                        {selectedRegister.address2}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-[15px] font-semibold text-black mb-6">
                                        State
                                    </h3>
                                    <p className="text-[13px] text-[#555]">
                                        {selectedRegister.state}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-x-16">
                                <div></div>
                                <div>
                                    <h3 className="text-[15px] font-semibold text-black mb-6">
                                        City
                                    </h3>
                                    <p className="text-[13px] text-[#555]">
                                        {selectedRegister.city}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RejisteredRecruiters;