import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  LayoutGrid,
  ClipboardList,
  BarChart3,
  Search,
  Headphones,
  ChevronRight,
  Brain,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";

const RecruiterAdminSidebar = ({ isOpen = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeNav, setActiveNav] = useState("Dashboard");

  const navItems = useMemo(
    () => [
      {
        name: "Dashboard",
        path: "/RecruiterAdmin-Dashboard",
        icon: Home,
        label: "Dashboard",
        match: ["/RecruiterAdmin-Dashboard"],
      },
      {
        name: "JobRequisitions",
        path: "/RecruiterAdmin-Dashboard/JD",
        icon: LayoutGrid,
        label: "Job Requisitions",
        match: ["/JD"],
      },
      {
        name: "Assessment",
        path: "/RecruiterAdmin-Dashboard/Assessment",
        icon: ClipboardList,
        label: "Candidate Assessment",
        match: ["/Assessment"],
      },
      {
        name: "Evaluation",
        path: "/RecruiterAdmin-Dashboard/Results",
        icon: BarChart3,
        label: "Candidate Evaluation",
        match: ["/Results"],
      },
    ],
    []
  );

  useEffect(() => {
    const p = location.pathname;

    if (p.includes("/JD")) setActiveNav("JobRequisitions");
    else if (p.includes("/Assessment")) setActiveNav("Assessment");
    else if (p.includes("/Results")) setActiveNav("Evaluation");
    else if (p === "/RecruiterAdmin-Dashboard") setActiveNav("Dashboard");
  }, [location.pathname]);

  const handleNavClick = (name, path) => {
    setActiveNav(name);
    navigate(path);
  };

  const NavItem = ({ name, path, icon: Icon, label }) => {
    const isActive = activeNav === name;

    return (
      <button
        onClick={() => handleNavClick(name, path)}
        className={[
          "group w-full flex items-center gap-3",
          "h-9 px-3 rounded-md text-left",
          "text-[12px] font-medium tracking-wide",
          "transition-colors duration-200",
          isActive
            ? "bg-[#332173] text-white shadow-[0_8px_18px_rgba(0,0,0,0.22)]"
            : "text-white/80 hover:bg-white/10 hover:text-white",
        ].join(" ")}
      >
        <Icon size={16} className={isActive ? "text-white" : "text-white/80"} />
        <span className="truncate">{label}</span>
      </button>
    );
  };

  return (
    <aside
      className={[
        "fixed left-0 top-0 bottom-0 z-40 w-[260px] ml-1 my-1 rounded-xl",
        "px-4 py-5 text-white",
        "transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0",
        "bg-gradient-to-b from-[#1A1034] via-[#241554] to-[#1A1034]",
        "flex flex-col",
      ].join(" ")}
    >
      <div className="shrink-0">
        <div className="flex justify-center items-center gap-2 px-1">
          <div className="text-[22px] font-semibold">
            Recruiter<span className="text-white/90">AI</span>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60"
            />
            <input
              placeholder="Search"
              className={[
                "w-full h-9 rounded-md",
                "bg-white/10",
                "pl-9 pr-3 text-[12px]",
                "outline-none text-white placeholder:text-white/60",
                "ring-1 ring-white/40 focus:ring-white/40",
              ].join(" ")}
            />
          </div>
        </div>
      </div>

      <div
        className="mt-5 flex-1 overflow-y-auto pr-1 pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <NavItem key={item.name} {...item} />
          ))}
        </nav>

        <div className="mt-6">
          <div
            className={[
              "rounded-xl p-4",
              "bg-gradient-to-b from-white/10 to-white/5",
              "ring-1 ring-white/10",
            ].join(" ")}
          >
            <div className="flex justify-center">
              <div className="grid place-items-center h-10 w-10 rounded-full bg-white/10 ring-1 ring-white/10">
                <Headphones size={18} />
              </div>
            </div>

            <div className="mt-3 text-center">
              <div className="text-[12px] font-semibold">Need Support?</div>
              <div className="mt-1 text-[10px] text-white/65">
                Get in touch with our agents
              </div>

              <button
                className={[
                  "mt-3 w-full h-9 rounded-md",
                  "bg-[#332173] hover:bg-[#3a2580]",
                  "text-[12px] font-semibold",
                  "shadow-[0_10px_22px_rgba(0,0,0,0.25)]",
                ].join(" ")}
                onClick={() => navigate("/support")}
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="shrink-0 pt-3 border-t border-white/10">
        <button
          className={[
            "w-full flex items-center gap-3",
            "rounded-full p-3",
            "bg-white/10 hover:bg-white/15",
            "ring-1 ring-white/10",
            "transition-colors",
          ].join(" ")}
          onClick={() => navigate("/profile")}
        >
          <img
            src="https://i.pravatar.cc/80?img=47"
            alt="profile"
            className="h-9 w-9 rounded-full ring-2 ring-white/20"
          />
          <div className="min-w-0 flex-1 text-left">
            <div className="text-[12px] font-semibold leading-4 truncate">
              Leena Singh
            </div>
            <div className="text-[10px] text-white/65 leading-4 truncate">
              Recruiter
            </div>
          </div>
          <ChevronsUpDown size={16} className="text-white/70" />
        </button>
      </div>
    </aside>
  );
};

export default RecruiterAdminSidebar;