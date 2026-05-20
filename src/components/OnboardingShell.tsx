import Image from "next/image";

// Shared split layout used by every Property Owner onboarding/auth screen
// (sign-up, verify-email, log-in, forgot-password, reset-password).
// Figma frame is 1440x1024 (or 1123 for the longer signup) — left form column 740 wide
// with form at x:140 y:120 w:460; right image card x:740 y:24 w:676 h:976 r:20.
//
// In the browser we anchor the image to the viewport (h: 100vh, never scrolls),
// and let the form column scroll internally if its content exceeds the viewport.

export default function OnboardingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex bg-white" style={{ width: "100%", height: "100vh", minHeight: "640px" }}>
      {/* LEFT FORM COLUMN — Figma x:0 to 740. Form inside at x:140 y:120 w:460.
          Scrollable so long forms don't push the image off. */}
      <div
        className="overflow-y-auto"
        style={{ width: "740px", maxWidth: "740px", flexShrink: 0 }}
      >
        <div
          className="flex flex-col"
          style={{
            paddingLeft: "140px",
            paddingRight: "140px",
            paddingTop: "120px",
            paddingBottom: "120px",
            width: "100%",
            gap: "40px",
          }}
        >
          {children}
        </div>
      </div>

      {/* RIGHT IMAGE COLUMN — Figma Desktop-10 (x:740 y:24 w:676 h:976 r:20 bg #F0F2F2).
          Locked to viewport height so the image NEVER scrolls. Hidden on < lg viewports. */}
      <div
        className="flex-1 hidden lg:block"
        style={{ padding: "24px", paddingLeft: "0", height: "100vh" }}
      >
        <div
          className="relative overflow-hidden bg-[#F0F2F2] h-full"
          style={{ borderRadius: "20px" }}
        >
          <Image
            src="/images/onboarding-side.png"
            alt=""
            fill
            sizes="(min-width: 1024px) 50vw, 0px"
            style={{ objectFit: "cover", objectPosition: "center" }}
            priority
          />
          {/* Dark gradient overlay — Figma fill_IWGEVJ (bottom-to-top fade) */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.96) 6%, rgba(0,0,0,0.94) 11%, rgba(0,0,0,0.91) 14%, rgba(0,0,0,0.84) 26%, rgba(0,0,0,0.5) 57%, rgba(102,102,102,0) 82%)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
