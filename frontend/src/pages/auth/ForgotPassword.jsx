import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../lib/axios";
import { Mail, ArrowRight, Loader2, AlertCircle, Lock, KeyRound, ShieldCheck, ArrowLeft, CheckCircle2 } from "lucide-react";

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=new password, 4=success
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1: Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setStep(2);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to send verification code.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setErrorMsg("Please enter all 6 digits.");
      return;
    }
    setErrorMsg("");
    setStep(3);
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    
    if (newPassword.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const otpCode = otp.join("");
      await api.post("/auth/reset-password", { token: otpCode, newPassword });
      setStep(4);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Invalid or expired code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // OTP input handler
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // digits only
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    
    // Auto-advance to next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    // Focus the next empty or the last field
    const nextEmpty = newOtp.findIndex(d => !d);
    const focusIdx = nextEmpty === -1 ? 5 : nextEmpty;
    document.getElementById(`otp-${focusIdx}`)?.focus();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Step 1: Enter Email */}
      {step === 1 && (
        <>
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-primary-50 dark:bg-primary-950 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={24} className="text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-xl font-bold text-[--text-primary]">Reset Your Password</h2>
            <p className="text-sm text-[--text-secondary]">
              Enter the email address linked to your account. We'll send a 6-digit verification code.
            </p>
          </div>

          {errorMsg && (
            <div className="flex items-start gap-3 p-4 bg-danger/10 border border-red-200 dark:border-red-800/50 rounded-[--radius-sm] text-sm">
              <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
              <span className="text-danger dark:text-red-300 font-medium">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleRequestOTP} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[--text-primary]">Email Address</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[--text-muted]">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full h-11 pl-10 pr-4 rounded-[--radius-sm] border border-[--border] bg-[--surface] text-[--text-primary] placeholder:text-[--text-muted] font-medium text-sm transition-all duration-200 outline-none focus:ring-2 focus:ring-[--ring] hover:border-primary-300 focus:border-primary-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-semibold text-sm rounded-[--radius-sm] shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Sending Code...</>
              ) : (
                <>Send Verification Code <ArrowRight size={16} strokeWidth={2.5} /></>
              )}
            </button>
          </form>

          <Link to="/login" className="flex items-center justify-center gap-2 text-sm font-semibold text-[--text-muted] hover:text-primary-600 transition-colors">
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </>
      )}

      {/* Step 2: Enter OTP */}
      {step === 2 && (
        <>
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950 rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound size={24} className="text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-[--text-primary]">Enter Verification Code</h2>
            <p className="text-sm text-[--text-secondary]">
              We sent a 6-digit code to <span className="font-bold text-[--text-primary]">{email}</span>
            </p>
          </div>

          {errorMsg && (
            <div className="flex items-start gap-3 p-4 bg-danger/10 border border-red-200 dark:border-red-800/50 rounded-[--radius-sm] text-sm">
              <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
              <span className="text-danger dark:text-red-300 font-medium">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-12 h-14 text-center text-xl font-bold rounded-[--radius-sm] border-2 border-[--border] bg-[--surface] text-[--text-primary] transition-all duration-200 outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-primary-300"
                />
              ))}
            </div>

            <button
              type="submit"
              className="w-full h-11 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-semibold text-sm rounded-[--radius-sm] shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              Verify Code <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={() => { setStep(1); setOtp(["","","","","",""]); setErrorMsg(""); }}
              className="text-sm font-semibold text-[--text-muted] hover:text-primary-600 transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft size={14} /> Use a different email
            </button>
          </div>
        </>
      )}

      {/* Step 3: New Password */}
      {step === 3 && (
        <>
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={24} className="text-teal" />
            </div>
            <h2 className="text-xl font-bold text-[--text-primary]">Create New Password</h2>
            <p className="text-sm text-[--text-secondary]">
              Choose a strong password with at least 8 characters.
            </p>
          </div>

          {errorMsg && (
            <div className="flex items-start gap-3 p-4 bg-danger/10 border border-red-200 dark:border-red-800/50 rounded-[--radius-sm] text-sm">
              <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
              <span className="text-danger dark:text-red-300 font-medium">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[--text-primary]">New Password</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[--text-muted]">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full h-11 pl-10 pr-4 rounded-[--radius-sm] border border-[--border] bg-[--surface] text-[--text-primary] placeholder:text-[--text-muted] font-medium text-sm transition-all duration-200 outline-none focus:ring-2 focus:ring-[--ring] hover:border-primary-300 focus:border-primary-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[--text-primary]">Confirm Password</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[--text-muted]">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full h-11 pl-10 pr-4 rounded-[--radius-sm] border border-[--border] bg-[--surface] text-[--text-primary] placeholder:text-[--text-muted] font-medium text-sm transition-all duration-200 outline-none focus:ring-2 focus:ring-[--ring] hover:border-primary-300 focus:border-primary-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-semibold text-sm rounded-[--radius-sm] shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Resetting...</>
              ) : (
                <>Reset Password <ArrowRight size={16} strokeWidth={2.5} /></>
              )}
            </button>
          </form>
        </>
      )}

      {/* Step 4: Success */}
      {step === 4 && (
        <div className="text-center space-y-6 py-4">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={40} className="text-success" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[--text-primary]">Password Reset Complete</h2>
            <p className="text-sm text-[--text-secondary]">
              Your password has been successfully updated. You can now sign in with your new credentials.
            </p>
          </div>
          <Link
            to="/login"
            className="w-full h-11 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm rounded-[--radius-sm] shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            Go to Sign In <ArrowRight size={16} strokeWidth={2.5} />
          </Link>
        </div>
      )}

      <p className="text-center text-xs text-[--text-muted] font-medium">
        🔒 Secured with 256-bit encryption
      </p>
    </div>
  );
};
