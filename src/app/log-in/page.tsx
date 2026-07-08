"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import OnboardingShell from "@/components/OnboardingShell";
import { useLoginMutation } from "@/services/authApi";
import { useLazyGetMeQuery } from "@/services/meApi";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials, logOut } from "@/features/auth/authSlice";
import { isAdminType } from "@/lib/userType";
import { unwrapApiError, describeApiError } from "@/services/api";
import { NEW_DEVICE_REQUIRES_OTP } from "@/services/types";
import {
  getOnboarding,
  setOnboarding,
  clearOnboarding,
  getPendingPropertyTypeId,
  clearPendingPropertyTypeId,
} from "@/lib/onboarding";
import { useUpdateSeekerPreferencesMutation } from "@/services/seekerApi";

export default function LogInPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [login, { isLoading: loggingIn }] = useLoginMutation();
  const [getMe, { isFetching: fetchingMe }] = useLazyGetMeQuery();
  const [updatePreferences] = useUpdateSeekerPreferencesMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefill the email if we just came from the sign-up wizard.
  useEffect(() => {
    // Read once on mount (sessionStorage is client-only).
    const o = getOnboarding();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (o?.email) setEmail(o.email);
  }, []);

  const isLoading = loggingIn || fetchingMe;
  const canSignIn = !!(email && password) && !isLoading;

  async function handleSignIn() {
    if (!canSignIn) return;
    setError(null);
    const trimmedEmail = email.trim();
    try {
      const tokens = await login({ email: trimmedEmail, password }).unwrap();
      // Ensure the token is in the store before GET /me reads it for its header.
      dispatch(setCredentials(tokens));
      const me = await getMe().unwrap(); // resolves role + user; sets the dashboard role
      // This is the user app — administrators belong in the admin portal. Reject
      // admin/super-admin accounts even with valid credentials (the backend keeps
      // them out of user endpoints anyway).
      if (isAdminType(me.userType)) {
        dispatch(logOut());
        setError("This is an administrator account. Please sign in from the admin portal.");
        return;
      }
      // Apply a property-type preference picked during seeker onboarding (the
      // user wasn't authenticated when they chose it). Best-effort — never block login.
      const pendingPref = getPendingPropertyTypeId();
      if (pendingPref != null) {
        try {
          await updatePreferences({ propertyTypeId: pendingPref }).unwrap();
        } catch {
          /* non-fatal — they can set it later in profile */
        }
        clearPendingPropertyTypeId();
      }
      clearOnboarding();
      router.push("/dashboard");
    } catch (err) {
      const code = unwrapApiError(err)?.code;
      if (code === NEW_DEVICE_REQUIRES_OTP) {
        // Unrecognised device: backend sent a NEW_DEVICE OTP — go verify it.
        setOnboarding({ email: trimmedEmail, flow: "login-device" });
        router.push("/verify-email");
        return;
      }
      if (code === "EMAIL_NOT_VERIFIED") {
        setOnboarding({ email: trimmedEmail, flow: "signup" });
        router.push("/verify-email");
        return;
      }
      setError(describeApiError(err));
    }
  }

  return (
    <OnboardingShell>
      
      <Link href="/" className="inline-flex items-center self-start hover:opacity-80" style={{ gap: "12px" }}>
        <Image src="/icons/arrow-left.svg" alt="" width={20} height={20} />
        <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#121212" }}>Back</span>
      </Link>

      
      <Image
        src="/images/logo-icon-3d7b24.png"
        alt="RentBuyStay"
        width={76}
        height={64}
        style={{ width: "76px", height: "64px" }}
      />

      
      <div className="flex flex-col items-center" style={{ gap: "8px" }}>
        <h1
          style={{
            fontSize: "24px",
            lineHeight: "40px",
            fontWeight: 600,
            color: "#121212",
            textAlign: "center",
          }}
        >
          Welcome back
        </h1>
        <p
          style={{
            fontSize: "16px",
            lineHeight: "24px",
            fontWeight: 400,
            color: "#807E7E",
            textAlign: "center",
          }}
        >
          Sign in to continue to your account.
        </p>
      </div>

      
      <div className="flex flex-col" style={{ gap: "16px" }}>
        
        <div className="flex flex-col" style={{ gap: "8px" }}>
          <label
            style={{
              fontSize: "14px",
              lineHeight: "24px",
              fontWeight: 500,
              color: "#121212",
              letterSpacing: "-0.02em",
              textAlign: "left",
            }}
          >
            Email
          </label>
          <div
            className="flex items-center"
            style={{ background: "#F6F6F6", borderRadius: "12px", padding: "8px 16px", height: "48px" }}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address here"
              className="w-full outline-none bg-transparent"
              style={{
                fontSize: "14px",
                lineHeight: "24px",
                fontWeight: 400,
                color: "#121212",
                letterSpacing: "-0.02em",
                textAlign: "left",
              }}
            />
          </div>
        </div>

        
        <div className="flex flex-col" style={{ gap: "16px" }}>
          
          <div className="flex flex-col" style={{ gap: "8px" }}>
            <label
              style={{
                fontSize: "14px",
                lineHeight: "24px",
                fontWeight: 500,
                color: "#121212",
                letterSpacing: "-0.02em",
                textAlign: "left",
              }}
            >
              Password
            </label>
            <div
              className="flex items-center justify-between"
              style={{ background: "#F6F6F6", borderRadius: "12px", padding: "8px 16px", height: "48px" }}
            >
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password here"
                className="flex-1 outline-none bg-transparent"
                style={{
                  fontSize: "14px",
                  lineHeight: "24px",
                  fontWeight: 400,
                  color: "#121212",
                  letterSpacing: "-0.02em",
                  textAlign: "left",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="shrink-0 hover:opacity-70"
                style={{ width: "24px", height: "24px", background: "none", border: "none", padding: 0 }}
              >
                <Image src={showPassword ? "/icons/eye-show.svg" : "/icons/eye-hide.svg"} alt="" width={24} height={24} />
              </button>
            </div>
          </div>

          
          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer" style={{ gap: "8px" }}>
              <span
                aria-hidden="true"
                className="shrink-0 flex items-center justify-center"
                style={{
                  width: "24px",
                  height: "24px",
                  border: "1.5px solid #807E7E",
                  borderRadius: "5px",
                  background: remember ? "#305E82" : "transparent",
                  borderColor: remember ? "#305E82" : "#807E7E",
                }}
              >
                {remember && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7L6 10L11 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <input
                type="checkbox"
                className="sr-only"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span
                style={{
                  fontSize: "16px",
                  lineHeight: "24px",
                  fontWeight: 400,
                  color: "#807E7E",
                }}
              >
                Remember me
              </span>
            </label>
            <Link
              href="/forgot-password"
              style={{
                fontSize: "16px",
                lineHeight: "24px",
                fontWeight: 500,
                color: "#305E82",
                textAlign: "right",
              }}
              className="hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>
      </div>

      
      <div className="flex flex-col" style={{ gap: "16px" }}>
        {error && (
          <p
            role="alert"
            style={{
              fontSize: "14px",
              lineHeight: "20px",
              fontWeight: 500,
              color: "#E30045",
              textAlign: "left",
            }}
          >
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleSignIn}
          disabled={!canSignIn}
          className="flex items-center justify-center text-white hover:opacity-90 transition-opacity"
          style={{
            width: "100%",
            height: "48px",
            padding: "8px 24px",
            gap: "8px",
            background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
            border: "1px solid rgba(120,158,187,0.5)",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: 500,
            opacity: canSignIn ? 1 : 0.5,
            cursor: canSignIn ? "pointer" : "not-allowed",
          }}
        >
          {isLoading ? "Signing in…" : "Sign In"}
        </button>

        
        <p
          className="text-center"
          style={{
            fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
            fontSize: "16px",
            lineHeight: "24px",
            fontWeight: 400,
            color: "#807E7E",
          }}
        >
          Don&rsquo;t have an account yet?{" "}
          <Link href="/sign-up" style={{ fontWeight: 500, color: "#305E82" }}>
            Register here
          </Link>
        </p>
      </div>
    </OnboardingShell>
  );
}
