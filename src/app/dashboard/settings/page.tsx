"use client";

import Image from "next/image";
import { useState } from "react";

type View = "empty" | "password" | "notifications" | "help" | "deactivate";

type MenuItem = {
  view: View;
  label: string;
  icon: string;
  danger?: boolean;
};

const MENU: MenuItem[] = [
  { view: "password", label: "Change Password", icon: "/icons/dash/settings-lock.svg" },
  { view: "notifications", label: "Notification Preferences", icon: "/icons/dash/settings-notification.svg" },
  { view: "help", label: "Get Help", icon: "/icons/dash/settings-help.svg" },
  { view: "deactivate", label: "Deactivate Account", icon: "/icons/dash/settings-profile-delete.svg", danger: true },
];

export default function SettingsPage() {
  const [view, setView] = useState<View>("empty");

  return (
    <div
      className="flex"
      style={{
        margin: "-32px -40px",
        minHeight: "calc(100vh - 80px)",
      }}
    >

      <div
        className="flex flex-col shrink-0"
        style={{
          width: "516px",
          padding: "32px 24px 32px 40px",
          gap: "24px",
          borderRight: "2px solid #FAFAFA",
        }}
      >
        {MENU.map((item) => {
          const active = view === item.view;
          return (
            <button
              key={item.view}
              type="button"
              onClick={() => setView(item.view)}
              className="flex items-center hover:opacity-80"
              style={{
                gap: "16px",
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div
                className="flex items-center justify-center shrink-0"
                style={{
                  width: "48px",
                  height: "48px",
                  background: active ? "rgba(48,94,130,0.08)" : "#F6F6F6",
                  borderRadius: "100%",
                }}
              >
                <Image src={item.icon} alt="" width={20} height={20} />
              </div>
              <span
                style={{
                  fontSize: "16px",
                  lineHeight: "24px",
                  fontWeight: 500,
                  color: item.danger ? "#E30045" : "#121212",
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>


      <div className="flex-1" style={{ padding: "32px 40px" }}>
        {view === "empty" && <EmptyState />}
        {view === "password" && <ChangePassword onCancel={() => setView("empty")} />}
        {view === "notifications" && <NotificationPreferences />}
        {view === "help" && <GetHelp />}
        {view === "deactivate" && <Deactivate />}
      </div>
    </div>
  );
}


function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{ width: "100%", minHeight: "60vh", gap: "40px" }}
    >
      <Image src="/icons/dash/empty-state.svg" alt="" width={220} height={150} />
      <div className="flex flex-col items-center" style={{ gap: "16px", textAlign: "center" }}>
        <h2 style={{ fontSize: "20px", lineHeight: "24px", fontWeight: 600, color: "#121212" }}>
          Nothing to show yet
        </h2>
        <p style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#807E7E" }}>
          Click one of the menu items to take action.
        </p>
      </div>
    </div>
  );
}


function ChangePassword({ onCancel }: { onCancel: () => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  return (
    <div className="flex flex-col" style={{ width: "100%", maxWidth: "548px", gap: "24px" }}>
      <PasswordField label="Current Password" value={current} onChange={setCurrent} />
      <PasswordField label="New Password" value={next} onChange={setNext} />
      <PasswordField label="Confirm New Password" value={confirm} onChange={setConfirm} />

      <div className="flex items-center justify-end" style={{ gap: "16px", marginTop: "8px" }}>
        <button
          type="button"
          onClick={onCancel}
          className="hover:opacity-80"
          style={{
            height: "48px",
            padding: "8px 16px",
            background: "none",
            border: "none",
            fontSize: "14px",
            fontWeight: 500,
            color: "#121212",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          className="flex items-center justify-center text-white hover:opacity-90 transition-opacity"
          style={{
            height: "48px",
            padding: "8px 24px",
            background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
            border: "1px solid rgba(120,158,187,0.5)",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col" style={{ gap: "8px" }}>
      <label
        style={{
          fontSize: "14px",
          lineHeight: "24px",
          fontWeight: 500,
          color: "#121212",
          letterSpacing: "-0.02em",
        }}
      >
        {label}
      </label>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="********"
        className="outline-none"
        style={{
          background: "#F6F6F6",
          borderRadius: "12px",
          padding: "12px 16px",
          height: "48px",
          fontSize: "14px",
          lineHeight: "24px",
          fontWeight: 400,
          color: "#121212",
        }}
      />
    </div>
  );
}


type Pref = { key: string; title: string; subtitle: string; on: boolean };

const INITIAL_PREFS: Pref[] = [
  { key: "messages", title: "New Inquiries/Messages", subtitle: "Get instant email notifications when someone messages you", on: true },
  { key: "expiry", title: "Listing Expiry Reminders", subtitle: "Get notified 7 days before a listing expires", on: true },
  { key: "report", title: "Weekly Performance Report", subtitle: "Summary of views, leads, and conversion each week right in your mailbox", on: false },
  { key: "appointments", title: "Appointment Confirmations", subtitle: "When a seeker books or reschedules a viewing", on: true },
  { key: "renewal", title: "Subscription Renewal", subtitle: "Get notified 14 days before your subscription expires", on: true },
  { key: "promos", title: "Promotional Offers", subtitle: "Tips, offers, and platform updates", on: false },
];

function NotificationPreferences() {
  const [prefs, setPrefs] = useState<Pref[]>(INITIAL_PREFS);

  return (
    <div className="flex flex-col" style={{ width: "100%", maxWidth: "548px", gap: "24px" }}>
      {prefs.map((p) => (
        <div
          key={p.key}
          className="flex items-center justify-between"
          style={{
            height: "100px",
            padding: "24px",
            background: "#F6F6F6",
            borderRadius: "20px",
          }}
        >
          <div className="flex flex-col" style={{ gap: "8px", maxWidth: "calc(100% - 80px)" }}>
            <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 500, color: "#121212" }}>
              {p.title}
            </span>
            <span style={{ fontSize: "12px", lineHeight: "20px", fontWeight: 400, color: "#807E7E" }}>
              {p.subtitle}
            </span>
          </div>
          <Toggle
            on={p.on}
            onChange={(on) => setPrefs((ps) => ps.map((x) => (x.key === p.key ? { ...x, on } : x)))}
          />
        </div>
      ))}
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="shrink-0"
      style={{
        width: "40px",
        height: "20px",
        background: on ? "#FFAE00" : "#D9D9D9",
        borderRadius: "12px",
        border: "none",
        position: "relative",
        cursor: "pointer",
        transition: "background 0.15s",
        boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "3px",
          left: on ? "22px" : "4px",
          width: "14px",
          height: "14px",
          borderRadius: "100%",
          background: "#FFFFFF",
          boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
          transition: "left 0.15s",
        }}
      />
    </button>
  );
}


const HELP_ROWS = [
  {
    key: "email",
    title: "Email",
    subtitle: "info@rentbuystay.com",
    icon: "/icons/dash/help-sms.svg",
    iconBg: "#F4F7F9",
    href: "mailto:info@rentbuystay.com",
  },
  {
    key: "whatsapp",
    title: "Whatsapp",
    subtitle: "+234 812 345 6789",
    icon: "/icons/dash/help-whatsapp.svg",
    iconBg: "#EFFCF8",
    href: "https://wa.me/2348123456789",
  },
  {
    key: "faqs",
    title: "FAQs",
    subtitle: "Check out our Frequently Asked Questions",
    icon: "/icons/dash/help-faqs.svg",
    iconBg: "#F9F4FF",
    href: "/faqs",
  },
];

function GetHelp() {
  return (
    <div className="flex flex-col" style={{ width: "100%", maxWidth: "492px", gap: "120px" }}>

      <div className="flex flex-col" style={{ gap: "24px" }}>
        {HELP_ROWS.map((row) => (
          <a
            key={row.key}
            href={row.href}
            className="flex items-center justify-between hover:opacity-80"
            style={{ gap: "16px" }}
          >
            <div className="flex items-center" style={{ gap: "16px" }}>
              <div
                className="flex items-center justify-center shrink-0"
                style={{
                  width: "48px",
                  height: "48px",
                  background: row.iconBg,
                  borderRadius: "100%",
                }}
              >
                <Image src={row.icon} alt="" width={20} height={20} />
              </div>
              <div className="flex flex-col" style={{ gap: "8px" }}>
                <span
                  style={{
                    fontSize: "16px",
                    lineHeight: "21px",
                    fontWeight: 500,
                    color: "#131313",
                    letterSpacing: "0.02em",
                  }}
                >
                  {row.title}
                </span>
                <span
                  style={{
                    fontSize: "14px",
                    lineHeight: "24px",
                    fontWeight: 400,
                    color: "#807E7E",
                  }}
                >
                  {row.subtitle}
                </span>
              </div>
            </div>
            <Image src="/icons/dash/arrow-right-blue.svg" alt="" width={20} height={20} />
          </a>
        ))}
      </div>


      <div className="flex flex-col" style={{ gap: "24px", width: "156px" }}>
        <h3
          style={{
            fontSize: "16px",
            lineHeight: "24px",
            fontWeight: 600,
            color: "#305E82",
            textTransform: "capitalize",
          }}
        >
          Follow us
        </h3>
        <Image
          src="/icons/dash/help-socials.svg"
          alt="Social media"
          width={156}
          height={32}
        />
      </div>
    </div>
  );
}

function Deactivate() {
  return <EmptyState />;
}
