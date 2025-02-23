"use client";

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {ArrowLeft, ArrowRight, KeyRound, Mail} from 'lucide-react';
import {sendPasswordResetEmail} from 'firebase/auth';
import {auth} from '@/config/firebaseConfig';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleForgotPassword = async (e) => {
        e.preventDefault();

        try {
            if (!email) {
                setError("Please enter your email address.");
                return;
            }

            setIsLoading(true);
            setError("");

            await sendPasswordResetEmail(auth, email);
            setSuccess(true);
        } catch (error) {
            setError(error?.message || "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Healthcare Theme */}
            <div className="hidden lg:block w-1/2 relative overflow-hidden">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: 'url("https://carrington.edu/wp-content/uploads/2016/09/Physical-Therapy-Aide-and-Doctor-Assisting-Seniors-in-Wheelchairs.jpg")',
                    }}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/80 to-pink-600/80"/>

                {/* Content */}
                <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-12">
                    <div
                        className="glass dark:glass-dark rounded-2xl border border-white/10 p-8 backdrop-blur-sm max-w-lg"
                        style={{
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                            backdropFilter: "blur(5px)",
                        }}>


                        <h2 className="text-4xl font-bold text-white text-center mb-6">
                            Password Recovery
                        </h2>

                        <p className="text-lg text-white/90 text-center">
                            Don't worry! It happens to the best of us. Enter your email address and we'll send you a
                            link to reset your password.
                        </p>
                    </div>
                </div>

                {/* Bottom Gradient */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent"/>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative gradient-background">
                <div className="w-full max-w-md space-y-8 relative z-10">
                    {/* Logo */}
                    <div className="text-center">
                        <div
                            className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 mb-4 shadow-lg">
                            <KeyRound className="h-8 w-8 text-white"/>
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Reset Password
                        </h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Enter your email to receive reset instructions
                        </p>
                    </div>

                    <div
                        className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl shadow-purple-500/10 backdrop-blur-xl p-8 relative overflow-hidden">
                        {/* Decorative Elements */}
                        <div
                            className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl -mr-16 -mt-16"/>
                        <div
                            className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl -ml-16 -mb-16"/>

                        {success ? (
                            <div className="text-center space-y-6">
                                <div
                                    className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <Mail className="h-8 w-8 text-green-600"/>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                        Check your email
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        We've sent password reset instructions to your email address.
                                    </p>
                                </div>
                                <button
                                    onClick={() => router.push('/auth/login')}
                                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                                >
                                    <ArrowLeft className="h-5 w-5"/>
                                    <span>Back to Login</span>
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleForgotPassword} className="space-y-6 relative">
                                {/* Email Input */}
                                <div className="space-y-2">
                                    <label htmlFor="email"
                                           className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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

                                {/* Error Message */}
                                {error && (
                                    <div
                                        className="p-4 rounded-xl bg-red-50/50 backdrop-blur-sm border border-red-200/50 text-red-600 text-sm">
                                        {error}
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/20"
                                >
                                    {isLoading ? (
                                        <>
                                            <div
                                                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                                            <span>Sending...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Send Reset Link</span>
                                            <ArrowRight className="h-5 w-5"/>
                                        </>
                                    )}
                                </button>

                                {/* Back to Login */}
                                <div className="text-center">
                                    <Link
                                        href="/auth/login"
                                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <ArrowLeft className="h-4 w-4"/>
                                        <span>Back to Login</span>
                                    </Link>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}