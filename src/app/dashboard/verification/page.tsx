"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import VerifyPhoneModal from "@/components/VerifyPhoneModal";
import DojahVerifyButton from "@/components/DojahVerifyButton";
import { useGetMeQuery } from "@/services/meApi";
import type { MeResponse } from "@/services/types";

type StepStatus = "completed" | "pending";

type StepAction =
  | { kind: "link"; label: string; href: string }
  | { kind: "modal"; label: string; modal: "phone" }
  | { kind: "custom"; component: React.ReactNode };

type Step = {
  number: number;
  title: string;
  status: StepStatus;
  body: React.ReactNode;
  action?: StepAction;
};

function buildSteps(me?: MeResponse): Step[] {
  const emailVerified = me?.verification?.email?.verified ?? true;
  const email = me?.email || "";
  
  const phoneVerified = me?.verification?.phone?.verified ?? false;
  const phoneNumber = me?.profile?.phoneNumber || "";

  const identityVerified = me?.verification?.identity?.verified ?? false;

  return [
    {
      number: 1,
      title: "Email Verification",
      status: emailVerified ? "completed" : "pending",
      body: (
        <>
          Your email address{" "}
          <span style={{ color: "#305E82", fontWeight: 500 }}>{email}</span>
          {" "}has been confirmed.
        </>
      ),
    },
    {
      number: 2,
      title: "Phone Number Verification",
      status: phoneVerified ? "completed" : "pending",
      body: (
        <>
          {phoneNumber ? (
            <>
              Verify your phone number{" "}
              <span style={{ color: "#305E82", fontWeight: 500 }}>{phoneNumber}</span>
            </>
          ) : (
            <>No phone number configured in profile.</>
          )}
        </>
      ),
      action: phoneVerified
        ? undefined
        : phoneNumber
        ? { kind: "modal", label: "Verify Now", modal: "phone" }
        : { kind: "link", label: "Update Profile", href: "/dashboard/profile" },
    },
    {
      number: 3,
      title: "Identity Verification",
      status: identityVerified ? "completed" : "pending",
      body: <>Verify your ID with a valid government-issued ID, powered by Dojah.</>,
      action: identityVerified
        ? undefined
        : { kind: "custom", component: <DojahVerifyButton /> },
    },
  ];
}

export default function VerificationPage() {
  const { data: me, isLoading } = useGetMeQuery();
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#305E82]" />
      </div>
    );
  }

  const steps = buildSteps(me);
  const phoneNumber = me?.profile?.phoneNumber;

  return (
    <>
    <div className="flex flex-col" style={{ gap: "24px" }}>

      <div
        className="flex items-center justify-between gap-3 rounded-[20px] p-4 md:px-6 md:py-8"
        style={{
          border: "1px solid #F6F6F6",
          background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
        }}
      >
        <div className="flex items-center min-w-0" style={{ gap: "12px" }}>
          <Image
            src="/icons/dash/qore-shield.svg"
            alt=""
            width={80}
            height={80}
            className="w-10 h-10 md:w-20 md:h-20 shrink-0"
          />
          <div className="flex flex-col min-w-0" style={{ gap: "8px" }}>
            <div className="flex items-center flex-wrap" style={{ gap: "8px" }}>
              <h2
                className="text-base md:text-2xl leading-6 md:leading-8"
                style={{ fontWeight: 600, color: "#FFFFFF" }}
              >
                Identity Verification
              </h2>
              {/* In Progress — inline next to the title on mobile */}
              <span
                className="md:hidden inline-flex items-center justify-center shrink-0"
                style={{
                  padding: "2px 8px",
                  background: "#FFF7E9",
                  color: "#EA651A",
                  borderRadius: "16px",
                  fontSize: "10px",
                  lineHeight: "18px",
                  fontWeight: 500,
                }}
              >
                In Progress
              </span>
            </div>
            <p
              className="text-[11px] md:text-xs leading-[18px] md:leading-6"
              style={{ fontWeight: 400, color: "rgba(255,255,255,0.8)" }}
            >
              Complete identity verification to unlock full platform trust badges and
              priority listing placement.
            </p>
          </div>
        </div>

        {/* In Progress — far right on desktop */}
        <span
          className="hidden md:inline-flex items-center justify-center shrink-0"
          style={{
            padding: "2px 12px",
            background: "#FFF7E9",
            color: "#EA651A",
            borderRadius: "16px",
            fontSize: "12px",
            lineHeight: "18px",
            fontWeight: 500,
          }}
        >
          In Progress
        </span>
      </div>


      <div className="flex flex-col" style={{ gap: "8px" }}>
        <h3
          style={{
            fontSize: "16px",
            lineHeight: "32px",
            fontWeight: 500,
            color: "#121212",
          }}
        >
          Verification Steps
        </h3>
        <p
          style={{
            fontSize: "12px",
            lineHeight: "24px",
            fontWeight: 400,
            color: "#807E7E",
          }}
        >
          Complete all steps to get your verified badge and start using our platform.
        </p>
      </div>


      <div
        className="w-full rounded-[20px] px-4 py-6 md:px-6 md:py-10"
        style={{
          border: "1px solid #F6F6F6",
          background: "#FFFFFF",
        }}
      >
        <div className="flex flex-col gap-6 md:gap-8">
          {steps.map((step, i) => (
            <div key={step.number} className="flex flex-col gap-6 md:gap-8">
              <StepRow step={step} onModalOpen={(m) => m === "phone" && setPhoneModalOpen(true)} />
              {i < steps.length - 1 && (
                <hr style={{ border: "none", borderTop: "1px solid #F6F6F6", margin: 0 }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>

    {phoneModalOpen && (
      <VerifyPhoneModal
        open={phoneModalOpen}
        onClose={() => setPhoneModalOpen(false)}
        phoneNumber={phoneNumber}
      />
    )}
    </>
  );
}

function StepRow({ step, onModalOpen }: { step: Step; onModalOpen: (m: "phone") => void }) {
  const completed = step.status === "completed";

  const completedBadge = (
    <span
      className="inline-flex items-center justify-center shrink-0"
      style={{
        padding: "2px 8px",
        background: "#ECFDF3",
        color: "#027A48",
        borderRadius: "16px",
        fontSize: "12px",
        lineHeight: "18px",
        fontWeight: 500,
      }}
    >
      Completed
    </span>
  );

  let actionEl: React.ReactNode = null;
  if (step.action?.kind === "modal") {
    const action = step.action;
    actionEl = (
      <button
        type="button"
        onClick={() => onModalOpen(action.modal)}
        className="flex items-center hover:opacity-80 shrink-0"
        style={{ gap: "8px", background: "none", border: "none", padding: 0, cursor: "pointer" }}
      >
        <span style={{ fontSize: "14px", lineHeight: "24px", fontWeight: 500, color: "#305E82" }}>
          {action.label}
        </span>
        <Image src="/icons/dash/arrow-right-blue.svg" alt="" width={20} height={20} />
      </button>
    );
  } else if (step.action?.kind === "link") {
    actionEl = (
      <Link
        href={step.action.href}
        className="flex items-center hover:opacity-80 shrink-0"
        style={{ gap: "8px" }}
      >
        <span style={{ fontSize: "14px", lineHeight: "24px", fontWeight: 500, color: "#305E82" }}>
          {step.action.label}
        </span>
        <Image src="/icons/dash/arrow-right-blue.svg" alt="" width={20} height={20} />
      </Link>
    );
  } else if (step.action?.kind === "custom") {
    actionEl = <>{step.action.component}</>;
  }

  return (
    <div className="flex items-start md:items-center justify-between" style={{ gap: "16px" }}>
      <div className="flex items-start min-w-0" style={{ gap: "16px" }}>
        <NumberCircle number={step.number} status={step.status} />
        <div className="flex flex-col min-w-0" style={{ gap: "8px" }}>
          <div className="flex items-center flex-wrap" style={{ gap: "8px" }}>
            <span
              className="text-sm md:text-base"
              style={{ lineHeight: "24px", fontWeight: 600, color: "#121212" }}
            >
              {step.title}
            </span>
            {step.status === "pending" && (
              <span
                className="inline-flex items-center justify-center"
                style={{
                  padding: "2px 8px",
                  background: "#FFF7E9",
                  color: "#EA651A",
                  borderRadius: "16px",
                  fontSize: "12px",
                  lineHeight: "18px",
                  fontWeight: 500,
                }}
              >
                Not Done
              </span>
            )}
            {/* Completed badge — inline next to the title on mobile */}
            {completed && <span className="md:hidden">{completedBadge}</span>}
          </div>
          <p
            className="text-xs md:text-sm leading-5 md:leading-6"
            style={{ fontWeight: 400, color: "#807E7E" }}
          >
            {step.body}
          </p>
          {/* Action — below the body on mobile */}
          {actionEl && <div className="md:hidden">{actionEl}</div>}
        </div>
      </div>

      {/* Right column — desktop only */}
      {completed ? (
        <span className="hidden md:inline-flex">{completedBadge}</span>
      ) : actionEl ? (
        <div className="hidden md:flex">{actionEl}</div>
      ) : null}
    </div>
  );
}

function NumberCircle({ number, status }: { number: number; status: StepStatus }) {
  const completed = status === "completed";
  return (
    <div
      className="flex items-center justify-center shrink-0 w-6 h-6 md:w-[34px] md:h-8 text-xs md:text-base"
      style={{
        borderRadius: "100px",
        background: completed ? "#CCF0D8" : "#FFF7E9",
        border: `1px solid ${completed ? "#14AE5C" : "#EA651A"}`,
        color: completed ? "#14AE5C" : "#EA651A",
        lineHeight: "24px",
        fontWeight: 600,
      }}
    >
      {number}
    </div>
  );
}
