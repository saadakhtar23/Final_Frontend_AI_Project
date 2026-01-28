import React, { useState } from "react";
import img from "../assets/SALogin.png";

const SuperAdminRegister = () => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePassword = () => setShowPassword(!showPassword);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f6f1fb]">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
                Welcome Back
            </h2>
            <div className="flex gap-20">
                <div className="w-[500px] hidden md:flex flex-col items-center justify-center">
                    <h2 className="text-2xl font-semibold mb-10 text-purple-800 text-center">
                        Login to your Recruter AI
                    </h2>
                    <img className="h-full w-full" src={img} alt="" />
                </div>
                <div className="border border-gray-300 bg-white rounded-2xl shadow-md p-8 w-full max-w-md">

                    <div className="mb-4">
                        <label className="block text-gray-800 font-medium mb-1">Email ID</label>
                        <input
                            type="email"
                            placeholder="Enter Email ID"
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    <div className="mb-4 relative">
                        <label className="block text-gray-800 font-medium mb-1">Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter Password"
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <button
                            type="button"
                            onClick={togglePassword}
                            className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? "🙈" : "👁️"}
                        </button>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-800 font-medium mb-1">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            placeholder="Enter Confirm Password"
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    <div className="flex items-center justify-between text-sm mb-6">
                        <label className="flex items-center">
                            <input type="checkbox" className="mr-2 accent-purple-600" />
                            Remember Me
                        </label>
                        <a href="#" className="text-purple-600 hover:underline">
                            Forget Password?
                        </a>
                    </div>

                    <button className="w-full bg-purple-600 text-white py-2 rounded-md font-medium hover:bg-purple-700 transition-colors">
                        Login
                    </button>

                    <p className="text-center text-sm text-gray-600 mt-4">
                        Already have an account?{" "}
                        <a href="#" className="text-purple-600 hover:underline">
                            Sign In
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminRegister;
