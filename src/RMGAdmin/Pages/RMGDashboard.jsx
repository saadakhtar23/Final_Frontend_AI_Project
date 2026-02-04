import React, { useEffect, useState } from "react";
import {
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    LineChart,
    CartesianGrid,
    Line,
    PieChart, Pie, Cell,
} from "recharts";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  BarController,
} from 'chart.js';
import { Bar as ChartJSBar } from 'react-chartjs-2';
import img from "../../assets/RMGDashImg1.png";
import axios from "axios";
import { baseUrl } from "../../utils/ApiConstants";
import { Layout, FileText, Calendar, Briefcase, MapPin, Clock } from 'lucide-react';
import Pagination from "../../components/LandingPage/Pagination";

class InterlockingCurvedBar extends BarElement {
  draw(ctx) {
    const { x, y, base, width, options } = this.getProps(['x', 'y', 'base', 'width', 'options']);
    const halfWidth = width / 2;
    const curveDeepness = width * 0.35; 
    ctx.save();
    ctx.fillStyle = options.backgroundColor;
    ctx.beginPath();
    ctx.moveTo(x - halfWidth, base);
    ctx.quadraticCurveTo(x, base + curveDeepness, x + halfWidth, base);
    ctx.lineTo(x + halfWidth, y);
    ctx.quadraticCurveTo(x, y - curveDeepness, x - halfWidth, y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

InterlockingCurvedBar.id = 'interlockingBar';
InterlockingCurvedBar.defaults = BarElement.defaults;

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  ChartLegend,
  BarController,
  InterlockingCurvedBar
);

const ALL_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function RMGDashboard() {
    const [totalOffers, setTotalOffers] = useState(0);
    const [totalTickets, setTotalTickets] = useState(0);
    const [totalJobs, setTotalJobs] = useState(0);
    const [currentOffers, setCurrentOffers] = useState([]);
    const [recentJobs, setRecentJobs] = useState([]);
    const [jdStatusPercentage, setJdStatusPercentage] = useState({
        closed: 0,
        inProgress: 0,
        jdCreated: 0,
        jdPending: 0,
        open: 0
    });
    const [recruitersData, setRecruitersData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [popularJDsData, setPopularJDsData] = useState([]);
    
    const [itemApprovalsYear, setItemApprovalsYear] = useState('2026');
    const [rangeChartYear, setRangeChartYear] = useState('2026');
    const [hrTicketsYear, setHrTicketsYear] = useState('2026');
    const [ticketsOffersYear, setTicketsOffersYear] = useState('2026');
    
    const [offers2025, setOffers2025] = useState({});
    const [offers2026, setOffers2026] = useState({});
    const [recruitersJD2025, setRecruitersJD2025] = useState({});
    const [recruitersJD2026, setRecruitersJD2026] = useState({});
    const [tickets2025, setTickets2025] = useState({});
    const [tickets2026, setTickets2026] = useState({});
    const [hr2025, setHr2025] = useState({});
    const [hr2026, setHr2026] = useState({});

    const [currentOffersPage, setCurrentOffersPage] = useState(1);
    const offersPerPage = 5;
    const [recruitersPage, setRecruitersPage] = useState(1);
    const recruitersPerPage = 5;

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const token = localStorage.getItem("token");

                const [
                    offersRes,
                    totalTicketsRes,
                    jobsRecRes,
                    hrTicketsRes,
                    currentOffersRes,
                    recentJobsRes,
                    jdStatusPercentageRes,
                    recruitersClosedRes
                ] = await Promise.all([
                    axios.get(`${baseUrl}/dashboard/total-offers`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`${baseUrl}/dashboard/total-tickets-rmg`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`${baseUrl}/dashboard/jobs-recruiters-month-wise`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`${baseUrl}/dashboard/count-hr-tickets-month-wise`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`${baseUrl}/dashboard/current-offers`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`${baseUrl}/dashboard/recent-jobs`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`${baseUrl}/dashboard/jd-status-percentage`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`${baseUrl}/dashboard/getAll-recruiters-closed`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                ]);

                if (offersRes.data.success) {
                    setTotalOffers(offersRes.data.totalOffers);
                }

                if (totalTicketsRes.data.success) {
                    setTotalTickets(totalTicketsRes.data.totalTickets);
                }

                if (jobsRecRes.data.success) {
                    const { totalRecruiterMonthWise, offersMonthWise } = jobsRecRes.data;
                    
                    const off2025 = {};
                    const off2026 = {};
                    offersMonthWise.forEach(item => {
                        if (item.month >= 11) {
                            off2025[item.month] = item.count;
                        } else {
                            off2026[item.month] = item.count;
                        }
                    });
                    setOffers2025(off2025);
                    setOffers2026(off2026);
                    
                    const rec2025 = {};
                    const rec2026 = {};
                    totalRecruiterMonthWise.forEach(item => {
                        if (item._id >= 11) {
                            rec2025[item._id] = item.count;
                        } else {
                            rec2026[item._id] = item.count;
                        }
                    });
                    setRecruitersJD2025(rec2025);
                    setRecruitersJD2026(rec2026);
                }

                if (hrTicketsRes.data.success) {
                    const { totalHRMonthWise, totalTicketsMonthWise } = hrTicketsRes.data;
                    
                    const tick2025 = {};
                    const tick2026 = {};
                    totalTicketsMonthWise.forEach(item => {
                        if (item._id >= 11) {
                            tick2025[item._id] = item.count;
                        } else {
                            tick2026[item._id] = item.count;
                        }
                    });
                    setTickets2025(tick2025);
                    setTickets2026(tick2026);
                    
                    const hrData2025 = {};
                    const hrData2026 = {};
                    totalHRMonthWise.forEach(item => {
                        if (item._id >= 11) {
                            hrData2025[item._id] = item.count;
                        } else {
                            hrData2026[item._id] = item.count;
                        }
                    });
                    setHr2025(hrData2025);
                    setHr2026(hrData2026);
                }

                if (currentOffersRes.data.success) {
                    setCurrentOffers(currentOffersRes.data.offers);
                    
                    const jobTitleCount = {};
                    const colors = ['#6379F2', '#6FCF97', '#FFA94D', '#00D1FF', '#9B8AFB', '#2D9CDB', '#FF9999', '#F472B6', '#34D399', '#FBBF24'];
                    
                    currentOffersRes.data.offers.forEach(offer => {
                        const title = offer.jobTitle;
                        if (jobTitleCount[title]) {
                            jobTitleCount[title].value += 1;
                        } else {
                            jobTitleCount[title] = { name: title, value: 1 };
                        }
                    });
                    
                    const sortedJDs = Object.values(jobTitleCount)
                        .sort((a, b) => b.value - a.value)
                        .slice(0, 7)
                        .map((item, index) => ({
                            ...item,
                            color: colors[index % colors.length]
                        }));
                    
                    setPopularJDsData(sortedJDs);
                }

                if (recentJobsRes.data.success) {
                    setRecentJobs(recentJobsRes.data.recentJobs.slice(0, 4));
                    setTotalJobs(recentJobsRes.data.totalJobs);
                }

                if (jdStatusPercentageRes.data.success) {
                    setJdStatusPercentage(jdStatusPercentageRes.data.jdStatusPercentage);
                }

                if (recruitersClosedRes.data.success) {
                    setRecruitersData(recruitersClosedRes.data.recruiterData);
                }

                setLoading(false);

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    const getItemApprovalsData = () => {
        const offersData = ALL_MONTHS.map((_, i) => {
            const monthNum = i + 1;
            return itemApprovalsYear === '2026' ? (offers2026[monthNum] || 0) : (offers2025[monthNum] || 0);
        });
        
        const recruitersJDData = ALL_MONTHS.map((_, i) => {
            const monthNum = i + 1;
            return itemApprovalsYear === '2026' ? (recruitersJD2026[monthNum] || 0) : (recruitersJD2025[monthNum] || 0);
        });
        
        return {
            labels: ALL_MONTHS,
            datasets: [
                {
                    label: 'Total Offers',
                    data: offersData,
                    backgroundColor: '#2e3a8c',
                    borderRadius: { topLeft: 0, topRight: 0, bottomLeft: 20, bottomRight: 20 },
                    borderSkipped: false,
                    borderColor: '#fff',
                    borderWidth: { top: 3, bottom: 0, left: 0, right: 0 }
                },
                {
                    label: 'Recruiters JD Created',
                    data: recruitersJDData,
                    backgroundColor: '#6b7aff',
                    borderRadius: { topLeft: 20, topRight: 20, bottomLeft: 0, bottomRight: 0 },
                    borderSkipped: false,
                    borderColor: '#fff',
                    borderWidth: { top: 0, bottom: 3, left: 0, right: 0 }
                },
            ],
        };
    };

    const getRangeChartData = () => {
        return ALL_MONTHS.map((month, i) => {
            const monthNum = i + 1;
            const tickets = rangeChartYear === '2026' ? (tickets2026[monthNum] || 0) : (tickets2025[monthNum] || 0);
            const offers = rangeChartYear === '2026' ? (offers2026[monthNum] || 0) : (offers2025[monthNum] || 0);
            return { month, tickets, offers };
        });
    };

    const getHrTicketsData = () => {
        return ALL_MONTHS.map((month, i) => {
            const monthNum = i + 1;
            const tickets = hrTicketsYear === '2026' ? (tickets2026[monthNum] || 0) : (tickets2025[monthNum] || 0);
            const recruiters = hrTicketsYear === '2026' ? (hr2026[monthNum] || 0) : (hr2025[monthNum] || 0);
            return { month, tickets, recruiters };
        });
    };

    const getTicketsOffersBarData = () => {
        const ticketsData = ALL_MONTHS.map((_, i) => {
            const monthNum = i + 1;
            return ticketsOffersYear === '2026' ? (tickets2026[monthNum] || 0) : (tickets2025[monthNum] || 0);
        });
        
        const offersData = ALL_MONTHS.map((_, i) => {
            const monthNum = i + 1;
            return ticketsOffersYear === '2026' ? (offers2026[monthNum] || 0) : (offers2025[monthNum] || 0);
        });

        return {
            labels: ALL_MONTHS,
            datasets: [
                {
                    label: 'Tickets',
                    data: ticketsData,
                    backgroundColor: '#7232d6',
                },
                {
                    label: 'Offers',
                    data: offersData,
                    backgroundColor: '#d6bfff',
                },
            ],
        };
    };

    const totalOffersPages = Math.ceil(currentOffers.length / offersPerPage);
    const indexOfLastOffer = currentOffersPage * offersPerPage;
    const indexOfFirstOffer = indexOfLastOffer - offersPerPage;
    const currentOffersToShow = currentOffers.slice(indexOfFirstOffer, indexOfLastOffer);

    const totalRecruitersPages = Math.ceil(recruitersData.length / recruitersPerPage);
    const indexOfLastRecruiter = recruitersPage * recruitersPerPage;
    const indexOfFirstRecruiter = indexOfLastRecruiter - recruitersPerPage;
    const currentRecruitersToShow = recruitersData.slice(indexOfFirstRecruiter, indexOfLastRecruiter);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const itemApprovalsOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                align: 'end',
                labels: {
                    usePointStyle: true,
                    pointStyle: 'rectRounded',
                    boxWidth: 8,
                    padding: 15,
                    color: '#8e94a3',
                    font: { size: 11 }
                },
            },
            tooltip: { enabled: true }
        },
        scales: {
            x: {
                stacked: true,
                grid: { display: false },
                ticks: { 
                    color: '#b1b5c0',
                    font: { size: 10 },
                    padding: 5
                },
                border: { display: false }
            },
            y: {
                stacked: true,
                beginAtZero: true,
                ticks: {
                    stepSize: 10,
                    color: '#b1b5c0',
                    font: { size: 10 },
                    padding: 5
                },
                grid: {
                    color: '#f0f2f5',
                    drawBorder: false,
                },
                border: { display: false }
            },
        },
        barPercentage: 0.22, 
        categoryPercentage: 0.8,
    };

    const ticketsOffersOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { 
                display: true,
                position: 'top',
                align: 'end',
                labels: {
                    usePointStyle: true,
                    boxWidth: 8,
                    padding: 10,
                    color: '#6b7280',
                    font: { size: 10 }
                }
            },
            tooltip: {
                backgroundColor: '#1f2937',
                padding: 10,
                cornerRadius: 8,
            }
        },
        scales: {
            x: {
                stacked: true,
                grid: { display: false },
                ticks: { 
                    color: '#9ca3af', 
                    font: { family: 'Inter, sans-serif', size: 10 },
                    padding: 5
                },
                border: { display: false }
            },
            y: {
                stacked: true,
                beginAtZero: true,
                ticks: {
                    stepSize: 10,
                    color: '#4b5563',
                    font: { family: 'Inter, sans-serif', size: 10 }
                },
                grid: {
                    color: '#f3f4f6',
                    tickBorderDash: [5, 5],
                    drawTicks: false,
                },
                border: { display: false }
            },
        },
        barPercentage: 0.4,
    };
    
    const getPriorityColor = (priority) => {
        const colors = {
            'Critical': 'bg-red-100 text-red-600',
            'High': 'bg-orange-100 text-orange-600',
            'Model': 'bg-blue-100 text-blue-600',
            'Low': 'bg-green-100 text-green-600'
        };
        return colors[priority] || 'bg-gray-100 text-gray-600';
    };
    
    const getStatusColor = (status) => {
        const colors = {
            'JD created': 'bg-green-100 text-green-600',
            'JD pending': 'bg-yellow-100 text-yellow-600',
            'In Progress': 'bg-blue-100 text-blue-600',
            'Closed': 'bg-gray-100 text-gray-600'
        };
        return colors[status] || 'bg-gray-100 text-gray-600';
    };

    const popularJDsTotal = popularJDsData.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="min-h-screen">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4 lg:gap-6 mb-4 lg:mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 lg:gap-4">
                    <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-5 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start">
                            <h2 className="text-[#646D82] text-sm lg:text-base font-medium">Total Jobs</h2>
                            <div className="p-2 lg:p-3 bg-[#EBEBFF] rounded-lg lg:rounded-xl">
                                <svg className="w-5 h-5 lg:w-6 lg:h-6 text-[#7C7EF4]" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-2xl lg:text-3xl xl:text-4xl font-bold text-[#1A1C21] mt-2">{totalOffers}+</p>
                    </div>

                    <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-5 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start">
                            <h2 className="text-[#646D82] text-sm lg:text-base font-medium">Total Tickets</h2>
                            <div className="p-2 lg:p-3 bg-[#E3F9ED] rounded-lg lg:rounded-xl">
                                <svg className="w-5 h-5 lg:w-6 lg:h-6 text-[#00B69B]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10l6-6 6 6 6-6" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-2xl lg:text-3xl xl:text-4xl font-bold text-[#1A1C21] mt-2">{totalTickets}+</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-5">
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        <h2 className="text-sm lg:text-base text-gray-600 font-semibold">Item approvals in</h2>
                        <select 
                            className="border-0 border-b border-gray-300 text-gray-400 text-xs lg:text-sm px-1 pr-4 py-1 bg-transparent cursor-pointer outline-none"
                            value={itemApprovalsYear}
                            onChange={(e) => setItemApprovalsYear(e.target.value)}
                        >
                            <option value="2026">2026</option>
                            <option value="2025">2025</option>
                        </select>
                        <div className="ml-auto text-xs text-gray-500">
                            Total Offers: <span className="font-bold text-[#2e3a8c]">{totalOffers}</span>
                        </div>
                    </div>
                    <div className="h-48 sm:h-56 lg:h-64">
                        <ChartJSBar options={itemApprovalsOptions} data={getItemApprovalsData()} />
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-sm rounded-xl lg:rounded-2xl p-4 lg:p-5 mb-4 lg:mb-6 border border-gray-100">
                <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                    <h3 className="text-gray-800 font-semibold text-sm lg:text-base">Tickets vs Offers Comparison</h3>
                    <select 
                        className="border border-gray-300 text-gray-600 text-xs lg:text-sm px-3 py-1.5 rounded-lg cursor-pointer outline-none focus:ring-2 focus:ring-blue-500"
                        value={rangeChartYear}
                        onChange={(e) => setRangeChartYear(e.target.value)}
                    >
                        <option value="2026">2026</option>
                        <option value="2025">2025</option>
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <div className="min-w-[500px]">
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={getRangeChartData()}>
                                <defs>
                                    <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FDA4AF" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#FDA4AF" stopOpacity={0.3}/>
                                    </linearGradient>
                                    <linearGradient id="colorOffers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#C4B5FD" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#C4B5FD" stopOpacity={0.3}/>
                                    </linearGradient>
                                </defs>
                                <XAxis 
                                    dataKey="month" 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 10 }}
                                />
                                <YAxis 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 10 }}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#fff', 
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                        fontSize: '12px'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="tickets"
                                    stroke="#F87171"
                                    strokeWidth={2}
                                    fill="url(#colorTickets)"
                                    name="Tickets"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="offers"
                                    stroke="#A78BFA"
                                    strokeWidth={2}
                                    fill="url(#colorOffers)"
                                    name="Offers"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="flex flex-wrap justify-center gap-4 lg:gap-6 mt-3">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#F87171]"></div>
                        <span className="text-xs text-gray-600">Tickets</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#A78BFA]"></div>
                        <span className="text-xs text-gray-600">Offers</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 lg:gap-6 mb-4 lg:mb-6">
                <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-5 shadow-sm border border-gray-100">
                    <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                        <h2 className="text-sm lg:text-base font-semibold">HR & Tickets Overview</h2>
                        <select 
                            className="border border-gray-300 text-gray-600 text-xs lg:text-sm px-3 py-1.5 rounded-lg cursor-pointer outline-none focus:ring-2 focus:ring-blue-500"
                            value={hrTicketsYear}
                            onChange={(e) => setHrTicketsYear(e.target.value)}
                        >
                            <option value="2026">2026</option>
                            <option value="2025">2025</option>
                        </select>
                    </div>
                    <div className="overflow-x-auto">
                        <div className="min-w-[500px] h-56 lg:h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={getHrTicketsData()}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                                    <YAxis tick={{ fontSize: 10 }} />
                                    <Tooltip contentStyle={{ fontSize: '12px' }} />
                                    <Line
                                        type="monotone"
                                        dataKey="tickets"
                                        stroke="#22c55e"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                        name="Tickets"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="recruiters"
                                        stroke="#f59e0b"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                        name="HR Count"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-5 shadow-sm border border-gray-100">
                    <h2 className="text-sm lg:text-base font-semibold mb-4">Upcoming Job Interviews</h2>
                    <div className="space-y-3">
                        {recentJobs.length > 0 ? (
                            recentJobs.map((job) => (
                                <div
                                    key={job._id}
                                    className="flex items-center justify-between p-2.5 lg:p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                                >
                                    <div className="flex items-center space-x-2.5">
                                        <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                            <Briefcase className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800 text-xs lg:text-sm">{job.jobTitle}</p>
                                            <p className="text-[10px] lg:text-xs text-blue-500">
                                                {job.positionAvailable} Position{job.positionAvailable > 1 ? 's' : ''} Available
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-1.5 text-gray-500">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span className="text-[10px] lg:text-xs font-medium">{formatDate(job.createdAt)}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-400 py-8 text-sm">
                                No upcoming interviews
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-5 shadow-sm border border-gray-100 mb-4 lg:mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-sm lg:text-base font-semibold text-[#1A1C21]">Current Jobs Open</h2>
                    <button className="text-blue-600 text-xs lg:text-sm font-medium hover:underline">See all</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-[700px]">
                        <thead>
                            <tr className="text-[#505887] text-xs lg:text-sm font-medium">
                                <th className="p-3 lg:p-4 border border-[#F0F2F5] bg-white text-left">
                                    <div className="flex items-center gap-1.5">
                                        <Layout size={14} className="text-[#505887]" />
                                        <span>Job Title</span>
                                    </div>
                                </th>
                                <th className="p-3 lg:p-4 border border-[#F0F2F5] bg-white text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <FileText size={14} className="text-[#505887]" />
                                        <span>Company</span>
                                    </div>
                                </th>
                                <th className="p-3 lg:p-4 border border-[#F0F2F5] bg-white text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <Calendar size={14} className="text-[#505887]" />
                                        <span>Due Date</span>
                                    </div>
                                </th>
                                <th className="p-3 lg:p-4 border border-[#F0F2F5] bg-white text-center">Priority</th>
                                <th className="p-3 lg:p-4 border border-[#F0F2F5] bg-white text-center">Status</th>
                                <th className="p-3 lg:p-4 border border-[#F0F2F5] bg-white text-center">Work Mode</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentOffersToShow.length > 0 ? (
                                currentOffersToShow.map((offer) => (
                                    <tr key={offer._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-3 lg:p-4 border border-[#F0F2F5] text-[#505887] font-medium text-xs lg:text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                                    <Briefcase className="w-4 h-4 text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{offer.jobTitle}</p>
                                                    <p className="text-[10px] text-gray-400">{offer.employmentType}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3 lg:p-4 border border-[#F0F2F5] text-[#505887] text-center font-medium text-xs lg:text-sm">
                                            {offer.companyName || 'N/A'}
                                        </td>
                                        <td className="p-3 lg:p-4 border border-[#F0F2F5] text-[#505887] text-center font-medium text-xs lg:text-sm">
                                            {formatDate(offer.dueDate)}
                                        </td>
                                        <td className="p-3 lg:p-4 border border-[#F0F2F5] text-center">
                                            <span className={`px-2 py-1 rounded-full text-[10px] lg:text-xs font-medium ${getPriorityColor(offer.priority)}`}>
                                                {offer.priority}
                                            </span>
                                        </td>
                                        <td className="p-3 lg:p-4 border border-[#F0F2F5] text-center">
                                            <span className={`px-2 py-1 rounded-full text-[10px] lg:text-xs font-medium ${getStatusColor(offer.status)}`}>
                                                {offer.status}
                                            </span>
                                        </td>
                                        <td className="p-3 lg:p-4 border border-[#F0F2F5] text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <MapPin className="w-3 h-3 text-gray-400" />
                                                <span className="text-xs text-gray-600">{offer.workMode}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-400 border border-[#F0F2F5] text-sm">
                                        No current jobs open
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {currentOffers.length > offersPerPage && (
                    <Pagination
                        currentPage={currentOffersPage}
                        totalPages={totalOffersPages}
                        onPageChange={setCurrentOffersPage}
                    />
                )}
            </div>

            <div className="bg-gray-50 rounded-xl lg:rounded-2xl p-3 lg:p-5">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    <div className="flex flex-col gap-4 lg:gap-6">
                        <div className="rounded-xl lg:rounded-2xl shadow-sm overflow-hidden bg-white">
                            <img
                                src={img}
                                alt="Laptop icon"
                                className="w-full h-auto object-cover"
                            />
                        </div>

                        <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-5">
                            <div className="flex justify-between items-center mb-4">
                                <div className="relative">
                                    <h2 className="text-sm lg:text-base font-bold text-gray-800">Popular JDs</h2>
                                    <div className="absolute -bottom-1.5 left-0 w-10 h-0.5 bg-cyan-400 rounded-full"></div>
                                </div>
                                <button className="text-gray-400 text-[10px] lg:text-xs font-black tracking-widest hover:text-gray-600 transition">
                                    MORE
                                </button>
                            </div>
                            <div className="relative h-64 sm:h-80 lg:h-96 flex items-center justify-center">
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                                    <span className="text-2xl lg:text-3xl font-bold text-gray-600">{popularJDsTotal}</span>
                                </div>
                                {popularJDsData.length > 0 ? (
                                    <div style={{
                                        transform: 'rotateX(40deg) rotateZ(-5deg)',
                                        transformStyle: 'preserve-3d',
                                        width: '100%',
                                        height: '100%'
                                    }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <defs>
                                                    <filter id="solid-extrusion" x="-20%" y="-20%" width="140%" height="140%">
                                                        <feOffset dx="0" dy="10" in="SourceGraphic" result="movedDown" />
                                                        <feComponentTransfer in="movedDown" result="shadedSide">
                                                            <feFuncR type="linear" slope="0.8" />
                                                            <feFuncG type="linear" slope="0.8" />
                                                            <feFuncB type="linear" slope="0.8" />
                                                        </feComponentTransfer>
                                                        <feMerge>
                                                            <feMergeNode in="shadedSide" />
                                                            <feMergeNode in="SourceGraphic" />
                                                        </feMerge>
                                                    </filter>
                                                </defs>
                                                <Pie
                                                    data={popularJDsData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={90}
                                                    paddingAngle={4}
                                                    dataKey="value"
                                                    stroke="none"
                                                    filter="url(#solid-extrusion)"
                                                    labelLine={false}
                                                    label={(props) => {
                                                        const { cx, cy, midAngle, outerRadius, value, name, color } = props;
                                                        const RADIAN = Math.PI / 180;
                                                        const x0 = cx + outerRadius * Math.cos(-midAngle * RADIAN);
                                                        const y0 = cy + outerRadius * Math.sin(-midAngle * RADIAN);
                                                        const x1 = cx + (outerRadius + 30) * Math.cos(-midAngle * RADIAN);
                                                        const y1 = cy + (outerRadius + 30) * Math.sin(-midAngle * RADIAN);
                                                        const isRight = x1 > cx;
                                                        const x2 = x1 + (isRight ? 25 : -25);
                                                        return (
                                                            <g transform="rotateX(-40deg) rotateZ(5deg)">
                                                                <path d={`M${x0},${y0} L${x1},${y1} L${x2},${y1}`} stroke={color} fill="none" strokeWidth={1} />
                                                                <text x={x2 + (isRight ? 5 : -5)} y={y1 - 6} fill="#6B7280" textAnchor={isRight ? "start" : "end"} fontSize="10" fontWeight="600">{name}</text>
                                                                <text x={x2 + (isRight ? 5 : -5)} y={y1 + 8} fill={color} textAnchor={isRight ? "start" : "end"} fontSize="14" fontWeight="bold">{value}</text>
                                                            </g>
                                                        );
                                                    }}
                                                >
                                                    {popularJDsData.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={entry.color}
                                                            style={{ cursor: 'pointer' }}
                                                        />
                                                    ))}
                                                </Pie>
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="text-gray-400 text-sm">No data available</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 lg:gap-6">
                        <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-5">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-gray-500 text-xs lg:text-sm font-medium">Tickets vs Offers</span>
                                <select 
                                    className="border border-gray-300 text-gray-600 text-xs lg:text-sm px-3 py-1.5 rounded-lg cursor-pointer outline-none focus:ring-2 focus:ring-blue-500"
                                    value={ticketsOffersYear}
                                    onChange={(e) => setTicketsOffersYear(e.target.value)}
                                >
                                    <option value="2026">2026</option>
                                    <option value="2025">2025</option>
                                </select>
                            </div>
                            <div className="h-52 lg:h-64">
                                <ChartJSBar options={ticketsOffersOptions} data={getTicketsOffersBarData()} />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-5">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-sm lg:text-base font-medium text-black">JD Status</h2>
                                    <span className="text-xl lg:text-2xl font-normal text-black">100</span>
                                </div>
                                <div className="flex flex-col gap-2 w-full sm:w-3/5">
                                    {[
                                        { label: 'JD Created', value: jdStatusPercentage.jdCreated, color: 'bg-[#2B63E1]', textColor: 'text-[#2B63E1]' },
                                        { label: 'JD Pending', value: jdStatusPercentage.jdPending, color: 'bg-[#FF9447]', textColor: 'text-[#FF9447]' },
                                        { label: 'In Progress', value: jdStatusPercentage.inProgress, color: 'bg-[#22C55E]', textColor: 'text-[#22C55E]' },
                                    ].map((item, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <div className="flex-1">
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-xs text-gray-500">{item.label}</span>
                                                </div>
                                                <div className="w-full bg-gray-100 h-4 lg:h-5 rounded-sm overflow-hidden">
                                                    <div 
                                                        className={`${item.color} h-full transition-all duration-500`} 
                                                        style={{ width: `${item.value || 0}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <span className={`w-12 text-right font-semibold text-sm lg:text-base ${item.textColor}`}>
                                                {(item.value || 0).toFixed(1)}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-sm rounded-xl lg:rounded-2xl mt-4 lg:mt-6 border border-gray-100">
                <h2 className="text-sm lg:text-base font-semibold p-4">Active Recruiter Table</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-gray-500 text-xs lg:text-sm">
                                <th className="px-3 lg:px-4 py-2.5 lg:py-3 text-left font-medium">Sr.No</th>
                                <th className="px-3 lg:px-4 py-2.5 lg:py-3 text-left font-medium">Recruiter Name</th>
                                <th className="px-3 lg:px-4 py-2.5 lg:py-3 text-left font-medium">Active JDs</th>
                                <th className="px-3 lg:px-4 py-2.5 lg:py-3 text-left font-medium">Candidate Shortlisted</th>
                                <th className="px-3 lg:px-4 py-2.5 lg:py-3 text-left font-medium">Closed Position</th>
                                <th className="px-3 lg:px-4 py-2.5 lg:py-3 text-left font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentRecruitersToShow.length > 0 ? (
                                currentRecruitersToShow.map((rec, index) => (
                                    <tr
                                        key={index}
                                        className="border-b border-gray-200 text-xs lg:text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                        <td className="px-3 lg:px-4 py-2.5 lg:py-3">{indexOfFirstRecruiter + index + 1}.</td>
                                        <td className="px-3 lg:px-4 py-2.5 lg:py-3">{rec.recruiterName}</td>
                                        <td className="px-3 lg:px-4 py-2.5 lg:py-3">{rec.activeJDs}</td>
                                        <td className="px-3 lg:px-4 py-2.5 lg:py-3">{rec.candidateShortlisted}</td>
                                        <td className="px-3 lg:px-4 py-2.5 lg:py-3">{rec.closedPositions}</td>
                                        <td className="px-3 lg:px-4 py-2.5 lg:py-3">
                                            <span
                                                className={`px-2 lg:px-3 py-0.5 lg:py-1 rounded-full text-[10px] lg:text-xs font-medium ${
                                                    rec.isActive
                                                        ? "bg-green-100 text-green-600"
                                                        : "bg-orange-100 text-orange-600"
                                                }`}
                                            >
                                                {rec.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-4 py-4 text-center text-gray-500 text-sm">
                                        No recruiter data available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {recruitersData.length > recruitersPerPage && (
                    <Pagination
                        currentPage={recruitersPage}
                        totalPages={totalRecruitersPages}
                        onPageChange={setRecruitersPage}
                    />
                )}
            </div>
        </div>
    );
}