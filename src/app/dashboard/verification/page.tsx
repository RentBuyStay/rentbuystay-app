"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import VerifyPhoneModal from "@/components/VerifyPhoneModal";

type StepStatus = "completed" | "pending";

type StepAction =
  | { kind: "link"; label: string; href: string }
  | { kind: "modal"; label: string; modal: "phone" };

type Step = {
  number: number;
  title: string;
  status: StepStatus;
  body: React.ReactNode;
  action?: StepAction;
};

function buildSteps(phoneVerified: boolean): Step[] {
  return [
    {
      number: 1,
      title: "Email Verification",
      status: "completed",
      body: (
        <>
          Your email address{" "}
          <span style={{ color: "#305E82", fontWeight: 500 }}>olaitanbadejo@email.com</span>
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
          Verify your phone number{" "}
          <span style={{ color: "#305E82", fontWeight: 500 }}>+234 801 234 5678</span>
        </>
      ),
      action: phoneVerified
        ? undefined
        : { kind: "modal", label: "Verify Now", modal: "phone" },
    },
    {
      number: 3,
      title: "Identity Verification",
      status: "pending",
      body: <>Verify your ID with a valid government-issued ID, powered by Qore ID.</>,
      action: { kind: "link", label: "Start ID Verification", href: "/dashboard/verification/id" },
    },
  ];
}

export default function VerificationPage() {
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);

  useEffect(() => {
    setPhoneVerified(localStorage.getItem("rbs-dashboard-verified") === "1");
  }, []);

  const steps = buildSteps(phoneVerified);

  return (
    <>
    <div className="flex flex-col" style={{ gap: "24px" }}>

      <div
        className="flex items-center justify-between"
        style={{
          padding: "32px 24px",
          borderRadius: "20px",
          border: "1px solid #F6F6F6",
          background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
        }}
      >
        <div className="flex items-center" style={{ gap: "16px" }}>
          <Image
            src="/icons/dash/qore-shield.svg"
            alt=""
            width={80}
            height={80}
            style={{ width: "80px", height: "80px" }}
          />
          <div className="flex flex-col" style={{ gap: "8px" }}>
            <h2
              style={{
                fontSize: "24px",
                lineHeight: "32px",
                fontWeight: 600,
                color: "#FFFFFF",
              }}
            >
              Qore ID Verification
            </h2>
            <p
              style={{
                fontSize: "12px",
                lineHeight: "24px",
                fontWeight: 400,
                color: "rgba(255,255,255,0.8)",
                whiteSpace: "pre-line",
              }}
            >
              Complete identity verification to unlock full platform{"\n"}
              trust badges and priority listing placement.
            </p>
          </div>
        </div>

        <span
          className="inline-flex items-center justify-center"
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
        style={{
          width: "100%",
          padding: "40px 24px",
          border: "1px solid #F6F6F6",
          borderRadius: "20px",
          background: "#FFFFFF",
        }}
      >
        <div className="flex flex-col" style={{ gap: "32px" }}>
          {steps.map((step, i) => (
            <div key={step.number} className="flex flex-col" style={{ gap: "32px" }}>
              <StepRow step={step} onModalOpen={(m) => m === "phone" && setPhoneModalOpen(true)} />
              {i < steps.length - 1 && (
                <hr style={{ border: "none", borderTop: "1px solid #F6F6F6", margin: 0 }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>

    <VerifyPhoneModal
      open={phoneModalOpen}
      onClose={() => setPhoneModalOpen(false)}
      onVerified={() => setPhoneVerified(true)}
    />
    </>
  );
}

function StepRow({ step, onModalOpen }: { step: Step; onModalOpen: (m: "phone") => void }) {
  return (
    <div className="flex items-center justify-between" style={{ gap: "16px" }}>
      <div className="flex items-start" style={{ gap: "16px" }}>
        <NumberCircle number={step.number} status={step.status} />
        <div className="flex flex-col" style={{ gap: "8px" }}>
          <div className="flex items-center" style={{ gap: "8px" }}>
            <span
              style={{
                fontSize: "16px",
                lineHeight: "24px",
                fontWeight: 600,
                color: "#121212",
              }}
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
          </div>
          <p
            style={{
              fontSize: "14px",
              lineHeight: "24px",
              fontWeight: 400,
              color: "#807E7E",
            }}
          >
            {step.body}
          </p>
        </div>
      </div>


      {step.status === "completed" ? (
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
      ) : step.action?.kind === "modal" ? (
        (() => {
          const action = step.action;
          return (
            <button
              type="button"
              onClick={() => onModalOpen(action.modal)}
              className="flex items-center hover:opacity-80 shrink-0"
              style={{ gap: "8px", background: "none", border: "none", padding: 0, cursor: "pointer" }}
            >
              <span
                style={{
                  fontSize: "14px",
                  lineHeight: "24px",
                  fontWeight: 500,
                  color: "#305E82",
                }}
              >
                {action.label}
              </span>
              <Image src="/icons/dash/arrow-right-blue.svg" alt="" width={20} height={20} />
            </button>
          );
        })()
      ) : step.action?.kind === "link" ? (
        <Link
          href={step.action.href}
          className="flex items-center hover:opacity-80 shrink-0"
          style={{ gap: "8px" }}
        >
          <span
            style={{
              fontSize: "14px",
              lineHeight: "24px",
              fontWeight: 500,
              color: "#305E82",
            }}
          >
            {step.action.label}
          </span>
          <Image src="/icons/dash/arrow-right-blue.svg" alt="" width={20} height={20} />
        </Link>
      ) : null}
    </div>
  );
}

function NumberCircle({ number, status }: { number: number; status: StepStatus }) {
  const completed = status === "completed";
  return (
    <div
      className="flex items-center justify-center shrink-0"
      style={{
        width: "34px",
        height: "32px",
        borderRadius: "100px",
        background: completed ? "#CCF0D8" : "#FFF7E9",
        border: `1px solid ${completed ? "#14AE5C" : "#EA651A"}`,
        color: completed ? "#14AE5C" : "#EA651A",
        fontSize: "16px",
        lineHeight: "24px",
        fontWeight: 600,
      }}
    >
      {number}
    </div>
  );
}
