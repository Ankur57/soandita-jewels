import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";
import loginBg from "../assets/login_bg.png";
import logo from "../assets/soandita-logo.png";

function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Steps: 1 = form, 2 = OTP verification
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    mobileNumber: "",
  });
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // If redirected from login with pending verification
  useEffect(() => {
    if (location.state?.pendingEmail) {
      setForm((prev) => ({ ...prev, email: location.state.pendingEmail }));
      setStep(2);
      setSuccess("Your email is not yet verified. Please enter the OTP sent to your email.");
    }
  }, [location.state]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Step 1: Submit registration form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("/auth/register", form);
      setSuccess(res.data.message);
      setStep(2);
      setCountdown(60);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("/auth/verify-otp", {
        email: form.email,
        otp,
      });
      login(res.data.user, res.data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setError("");
    setLoading(true);
    try {
      await axios.post("/auth/resend-otp", { email: form.email });
      setSuccess("New OTP sent to your email.");
      setCountdown(60);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex relative -mx-6" style={{ width: "calc(100% + 3rem)" }}>
      {/* ── Left: Background Image Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden">
        <img src={loginBg} alt="Luxury Jewelry" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/70" />
        <div className="absolute top-8 left-8 w-20 h-20 border-t-2 border-l-2 border-yellow-500/50" />
        <div className="absolute bottom-8 right-8 w-20 h-20 border-b-2 border-r-2 border-yellow-500/50" />
        <div className="absolute inset-0 flex flex-col justify-center px-12 xl:px-20">
          <div className="max-w-md">
            <div className="w-12 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 mb-6" />
            <h2 className="text-white text-3xl xl:text-4xl font-serif italic leading-snug mb-4">
              {step === 1 ? (
                <>Begin Your Journey<br />Into the World of<br />Fine Jewelry</>
              ) : (
                <>Almost There!<br />Verify Your<br />Email Address</>
              )}
            </h2>
            <p className="text-white/60 text-sm leading-relaxed max-w-sm">
              {step === 1
                ? "Join Soandita Jewels and unlock access to exclusive collections, personalized recommendations, and members-only offers crafted just for you."
                : "We've sent a verification code to your email. Enter it below to activate your account and start exploring our exquisite collections."
              }
            </p>
            <div className="w-12 h-0.5 bg-gradient-to-r from-yellow-600 to-yellow-400 mt-6" />
          </div>
        </div>
      </div>

      {/* ── Right: Register Form Panel ── */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 px-6 py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23b8860b' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-yellow-600/5 rounded-full blur-3xl" />

        <div className="w-full max-w-md relative z-10">
          <div className="flex justify-center mb-6">
            <Link to="/">
              <img src={logo} alt="Soandita Jewels" className="h-14 object-contain hover:opacity-80 transition-opacity" />
            </Link>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-serif italic text-gray-800 mb-2">
              {step === 1 ? "Create Account" : "Verify Email"}
            </h1>
            <p className="text-gray-400 text-sm">
              {step === 1
                ? "Join our exclusive community of jewelry lovers"
                : `Enter the 6-digit code sent to ${form.email}`
              }
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className={`flex items-center gap-2`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${step >= 1 ? "bg-gradient-to-r from-yellow-700 to-yellow-600 text-white shadow-lg shadow-yellow-700/20" : "bg-gray-100 text-gray-400"
                }`}>
                {step > 1 ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : "1"}
              </div>
              <span className={`text-xs ${step >= 1 ? "text-yellow-700 font-medium" : "text-gray-400"}`}>Details</span>
            </div>
            <div className={`w-10 h-px ${step > 1 ? "bg-yellow-600" : "bg-gray-200"}`} />
            <div className={`flex items-center gap-2`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${step >= 2 ? "bg-gradient-to-r from-yellow-700 to-yellow-600 text-white shadow-lg shadow-yellow-700/20" : "bg-gray-100 text-gray-400"
                }`}>
                2
              </div>
              <span className={`text-xs ${step >= 2 ? "text-yellow-700 font-medium" : "text-gray-400"}`}>Verify</span>
            </div>
          </div>

          {/* ── Card ── */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100/80 p-8">
            <div className="w-16 h-0.5 bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 mx-auto mb-7 rounded-full" />

            {/* Success message */}
            {success && (
              <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-100 rounded-xl mb-5">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl mb-5">
                <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* ── Step 1: Registration Form ── */}
            {step === 1 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label htmlFor="register-name" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
                    <input id="register-name" name="name" type="text" value={form.name} onChange={handleChange} required placeholder="Enter your full name"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500 transition-all duration-300" />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="register-email" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    </div>
                    <input id="register-email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="your@email.com"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500 transition-all duration-300" />
                  </div>
                </div>

                {/* Mobile */}
                <div>
                  <label htmlFor="register-mobile" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Mobile Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                      </svg>
                    </div>
                    <input id="register-mobile" name="mobileNumber" type="tel" value={form.mobileNumber} onChange={handleChange} required placeholder="Enter your mobile number"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500 transition-all duration-300" />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="register-password" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    </div>
                    <input id="register-password" name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={handleChange} required placeholder="Create a strong password"
                      className="w-full pl-11 pr-12 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500 transition-all duration-300" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      )}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-yellow-700 via-yellow-600 to-yellow-700 hover:from-yellow-800 hover:via-yellow-700 hover:to-yellow-800 text-white text-sm font-medium uppercase tracking-wider rounded-xl shadow-lg shadow-yellow-700/20 hover:shadow-yellow-800/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2">
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Creating Account…</>
                  ) : (
                    <>Create Account <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg></>
                  )}
                </button>
              </form>
            )}

            {/* ── Step 2: OTP Verification ── */}
            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                {/* OTP input */}
                <div>
                  <label htmlFor="register-otp" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Verification Code</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                      </svg>
                    </div>
                    <input id="register-otp" type="text" value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      required placeholder="Enter 6-digit OTP" maxLength={6}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500 transition-all duration-300 tracking-[0.3em] text-center font-mono text-lg" />
                  </div>
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    Sent to <span className="text-gray-600 font-medium">{form.email}</span>
                  </p>
                </div>

                <button type="submit" disabled={loading || otp.length !== 6}
                  className="w-full py-3.5 bg-gradient-to-r from-yellow-700 via-yellow-600 to-yellow-700 hover:from-yellow-800 hover:via-yellow-700 hover:to-yellow-800 text-white text-sm font-medium uppercase tracking-wider rounded-xl shadow-lg shadow-yellow-700/20 hover:shadow-yellow-800/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Verifying…</>
                  ) : (
                    <>Verify & Continue <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></>
                  )}
                </button>

                {/* Resend OTP */}
                <div className="text-center">
                  {countdown > 0 ? (
                    <p className="text-sm text-gray-400">
                      Resend OTP in <span className="text-yellow-700 font-medium">{countdown}s</span>
                    </p>
                  ) : (
                    <button type="button" onClick={handleResendOtp} disabled={loading}
                      className="text-sm text-yellow-700 hover:text-yellow-800 font-medium transition-colors disabled:opacity-50">
                      Resend OTP
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* Divider */}
            <div className="flex items-center gap-4 my-5">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
              <span className="text-xs text-gray-400 uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
            </div>

            {/* Login link */}
            <p className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link to="/login" className="text-yellow-700 hover:text-yellow-800 font-medium transition-colors relative group">
                Sign In
                <span className="absolute bottom-0 left-0 w-0 h-px bg-yellow-700 group-hover:w-full transition-all duration-300" />
              </Link>
            </p>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="flex items-center gap-1.5 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
              <span className="text-xs">Secure</span>
            </div>
            <div className="w-1 h-1 bg-gray-300 rounded-full" />
            <div className="flex items-center gap-1.5 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
              <span className="text-xs">256-bit SSL</span>
            </div>
            <div className="w-1 h-1 bg-gray-300 rounded-full" />
            <div className="flex items-center gap-1.5 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span className="text-xs">Privacy Protected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;