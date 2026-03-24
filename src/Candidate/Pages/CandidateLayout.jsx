import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import CandidateSidebar from "../Component/CandidateSidebar";
import CandidateHeader from "../Component/CandidateHeader";

const CandidateLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    /** Full-width assessment: set by GiveTest while the timed test is running */
    const [hideSidebarForTest, setHideSidebarForTest] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex relative">
            {!hideSidebarForTest && (
                <>
                    <CandidateSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
                    <div className="hidden lg:block w-64 flex-shrink-0" />
                </>
            )}

            <div className="flex-1 flex flex-col min-w-0">
                <CandidateHeader onMenuToggle={toggleSidebar} />

                <main className={`flex-1 min-w-0 ${hideSidebarForTest ? "p-0" : "p-4 lg:p-6"}`}>
                    <Outlet context={{ setHideSidebarForTest }} />
                </main>
            </div>
        </div>
    );
};

export default CandidateLayout;