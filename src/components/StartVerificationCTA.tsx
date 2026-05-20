"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import StartVerificationModal from "./StartVerificationModal";

export default function StartVerificationCTA() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center self-start text-white hover:opacity-90 transition-opacity cursor-pointer"
        style={{
          gap: "8px",
          padding: "8px 0",
          fontSize: "15px",
          lineHeight: "24px",
          fontWeight: 500,
          background: "none",
          border: "none",
        }}
      >
        <span>Start Verification</span>
        <Image src="/icons/dash/arrow-right-white.svg" alt="" width={20} height={20} />
      </button>
      <StartVerificationModal
        open={open}
        onClose={() => setOpen(false)}
        onProceed={() => router.push("/dashboard/verification")}
      />
    </>
  );
}
