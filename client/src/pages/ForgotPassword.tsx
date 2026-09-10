import React, { useState } from "react";
import { Link } from "wouter";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Fuel, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const res = await resetPassword(email);
    setLoading(false);

    if (res.success) {
      setSuccess(true);
    } else {
      setErrorMsg(res.error || "Failed to send reset instructions.");
    }
  };

  return (
    <div className="fuel-app min-h-screen flex flex-col justify-center items-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="fuel-logo justify-center text-xl inline-flex">
            <span>
              <Fuel size={22} />
            </span>
            FUEL<b>NOW</b>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 mt-4">
            Reset Your Password
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enter your email to receive password recovery instructions
          </p>
        </div>

        <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-md">
          {errorMsg && (
            <div className="mb-5 p-3 rounded-lg border border-red-500/30 bg-red-950/40 text-red-300 text-xs flex items-center gap-2.5">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {success ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 grid place-items-center mx-auto mb-3">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-100 mb-1">
                Reset Link Dispatched
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                If an account exists for <b className="text-slate-200">{email}</b>, you will
                receive recovery instructions shortly.
              </p>
              <Link href="/login">
                <Button className="mt-6 w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs h-10">
                  Return to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="driver@fuelnow.io"
                    required
                    className="w-full h-11 pl-10 pr-4 bg-slate-950 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm rounded-lg flex items-center justify-center gap-2 mt-2 transition-all shadow-lg shadow-amber-900/30"
              >
                {loading ? "Sending link..." : "Send Password Reset Link"}
                {!loading && <ArrowRight size={16} />}
              </Button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <Link
              href="/login"
              className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1.5"
            >
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
