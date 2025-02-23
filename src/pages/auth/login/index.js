"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {ArrowRight, Eye, EyeOff, Lock, Mail,} from "lucide-react";
import {doSignInWithEmailAndPassword} from "../../../config/auth";
import {useAuth} from "@/contexts/AuthContext";
import axios from "axios";

export default function NewLoginPage() {
    const router = useRouter();
    const {isAuthenticated} = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [isVerified, setIsVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const API = axios.create({
        baseURL: process.env.NEXT_PUBLIC_MOSCARE,
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const hostname = window.location.hostname;
            const parts = hostname.split('.');
            console.log('hostname: ' + hostname + ' parts: ' + parts);

            // *.mossolutions.com
            if (parts.length > 1) {
                setCompanyName(parts[0]);
            } else {
                // temporary for localhost
                setCompanyName('ylss');
            }
        }
    }, []);

    const validateUserWithEmail = async () => {
        const res = await API.post(
            `api/validateUserWithEmail`,
            {email},
            {
                headers: {
                    "Content-Type": "application/json",
                    "x-tenant-id": localStorage.getItem("companyName"),
                },
            }
        );
        return res.data.success;
    };

    const handleProceedClick = async () => {
        try {
            setIsLoading(true);
            setError("");

            const res = await API.post(
                `api/checkCompany`,
                {companyName, email},
                {
                    headers: {
                        "Content-Type": "application/json",
                        "x-tenant-id": "moscare",
                    },
                }
            );

            const isUserEmailValid = await validateUserWithEmail();

            if (res.data.success && isUserEmailValid) {
                localStorage.setItem("companyName", companyName.toLowerCase());
                setIsVerified(true);
                setError("");
            } else {
                setIsVerified(false);
                setError(
                    "Something went wrong, please try again with correct credentials."
                );
            }
        } catch (error) {
            setError(error?.response?.data?.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            if (!email || !password) {
                setError("Please fill in all fields.");
                return;
            }

            setIsLoading(true);
            setError("");

            const result = await doSignInWithEmailAndPassword(email, password);

            if (result.success) {
                router.push("/home");
            } else {
                setError(result.message);
            }
        } catch (error) {
            console.error("Unexpected Error in handleLogin:", error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isAuthenticated) {
        router.push("/home");
        return null;
    }

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Healthcare Theme */}
            <div className="hidden lg:block w-1/2 relative overflow-hidden">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage:
                            'url("https://img.freepik.com/free-photo/side-view-nurse-helping-patient-wheelchair_23-2149741224.jpg")',
                        // Increase visibility
                    }}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/80 to-pink-600/80"/>

                {/* Pattern Background */}
                <div className="absolute inset-0 opacity-5"></div>

                {/* Content */}
                <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-12">
                    <div
                        className="glass dark:glass-dark shadow rounded-2xl border border-white/10 p-8  max-w-lg"
                        style={{
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                            backdropFilter: "blur(5px)",
                        }}
                    >
                        <h2 className="text-4xl font-bold text-white text-center mb-6">
                            Empowering Healthcare Management
                        </h2>

                        <p className="text-lg text-white/90 text-center mb-8">
                            Join thousands of healthcare providers who trust our platform to
                            manage their workforce efficiently and provide better care for
                            their patients.
                        </p>

                        <div className="flex items-center justify-center gap-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white mb-1">10k+</div>
                                <div className="text-sm text-white/80">Active Users</div>
                            </div>
                            <div className="h-8 w-px bg-white/20"/>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white mb-1">5M+</div>
                                <div className="text-sm text-white/80">Shifts Managed</div>
                            </div>
                            <div className="h-8 w-px bg-white/20"/>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white mb-1">99%</div>
                                <div className="text-sm text-white/80">Satisfaction</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Gradient */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent"/>
            </div>

            {/* Right Side - Form */}
            <div className="w-full gradient-background lg:w-1/2 flex items-center justify-center p-8 relative">
                {/* <PatternBackground /> */}

                <div className="w-full max-w-md mx-auto flex flex-col items-center space-y-8 relative z-10">
                    <img
                        src="/mostechLogo.png"
                        alt="Mostech Solutions"
                        style={{
                            width: "150px",
                        }}
                    />
                    <div className="text-center">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            {isVerified ? "Welcome Back" : "Company Verification"}
                        </h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            {isVerified
                                ? "Please sign in to your account"
                                : "Verify your company details to continue"}
                        </p>
                    </div>

                    <div
                        className="glass w-full dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl shadow-purple-500/10 backdrop-blur-xl p-8 relative overflow-hidden">
                        {/* Decorative Elements */}
                        <div
                            className="absolute top-0 right-0 w-64 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl -mr-16 -mt-16"/>
                        <div
                            className="absolute bottom-0 left-0 w-64 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl -ml-16 -mb-16"/>

                        <form onSubmit={handleLogin} className="space-y-6 relative">
                            {isVerified ? (
                                <>
                                    {/* Email Input */}
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="email"
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                        >
                                            Email Address
                                        </label>
                                        <div className="relative group">
                                            <input
                                                type="email"
                                                id="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all group-hover:border-purple-500/50"
                                                placeholder="Enter your email address"
                                                required
                                            />
                                            <Mail
                                                className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors"/>
                                        </div>
                                    </div>

                                    {/* Password Input */}
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="password"
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                        >
                                            Password
                                        </label>
                                        <div className="relative group">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                id="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all group-hover:border-purple-500/50"
                                                placeholder="••••••••••••"
                                                required
                                            />
                                            <Lock
                                                className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors"/>
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-500 transition-colors"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-5 w-5"/>
                                                ) : (
                                                    <Eye className="h-5 w-5"/>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Remember Me & Forgot Password */}
                                    <div className="flex items-center justify-between text-sm">
                                        <label className="flex items-center group">
                                            <input
                                                type="checkbox"
                                                className="rounded-md border-gray-300 text-purple-600 focus:ring-purple-500/30 transition-colors group-hover:border-purple-500"
                                            />
                                            <span
                                                className="ml-2 text-gray-600 dark:text-gray-400 group-hover:text-purple-600 transition-colors">
                        Remember me
                      </span>
                                        </label>
                                        <Link
                                            href="/auth/forgot-password"
                                            className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
                                        >
                                            Forgot Password?
                                        </Link>
                                    </div>

                                    {/* Login Button */}
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/20"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div
                                                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                                                <span>Signing In...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Sign In</span>
                                                <ArrowRight className="h-5 w-5"/>
                                            </>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <>
                                    {/* Company Verification Form */}
                                    <div className="space-y-6">
                                        {/* Company Name Input */}
                                        <div className="space-y-2">
                                            <label
                                                htmlFor="companyName"
                                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                            >
                                                Company Name
                                            </label>
                                            <div className="relative group">
                                                <input
                                                    type="text"
                                                    id="companyName"
                                                    value={companyName}
                                                    onChange={(e) => setCompanyName(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all group-hover:border-purple-500/50 text-gray-400 dark:text-gray-100 font-bold"
                                                    placeholder="Enter your company name"
                                                    required
                                                    readOnly
                                                />
                                            </div>
                                        </div>

                                        {/* Email Input */}
                                        <div className="space-y-2">
                                            <label
                                                htmlFor="verifyEmail"
                                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                            >
                                                Email Address
                                            </label>
                                            <div className="relative group">
                                                <input
                                                    type="email"
                                                    id="verifyEmail"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all group-hover:border-purple-500/50"
                                                    placeholder="Enter your email address"
                                                    required
                                                />
                                                <Mail
                                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors"/>
                                            </div>
                                        </div>

                                        {/* Proceed Button */}
                                        <button
                                            type="button"
                                            onClick={handleProceedClick}
                                            disabled={isLoading}
                                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/20"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div
                                                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                                                    <span>Verifying...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Proceed to Login</span>
                                                    <ArrowRight className="h-5 w-5"/>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div
                                    className="p-4 mt-6 rounded-xl bg-red-50/50 backdrop-blur-sm border border-red-200/50 text-red-600 text-sm">
                                    {error}
                                </div>
                            )}
                        </form>

                    </div>
                    {/* <div className="flex justify-end pt-2">
        <Link href="/auth/forgot-password" className="text-sm text-purple-600 hover:text-purple-700">
          Forgot Password?
        </Link>
      </div> */}
                </div>

            </div>
        </div>
    );
}
