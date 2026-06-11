import Image from "next/image";

export default function OnboardingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex bg-white w-full min-h-screen lg:h-screen">
      {/* Form column — full width on mobile (single column, no side image),
          fixed 740px on desktop. Padding matches Figma: 16px on mobile. */}
      <div className="w-full lg:w-[740px] lg:max-w-[740px] lg:shrink-0 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex flex-col w-full gap-8 lg:gap-10 px-4 py-12 md:px-10 lg:px-[140px] lg:py-[120px]">
          {children}
        </div>
      </div>

      {/* Side image — desktop only */}
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
