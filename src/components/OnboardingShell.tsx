import Image from "next/image";

export default function OnboardingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex bg-white" style={{ width: "100%", height: "100vh", minHeight: "640px" }}>
      
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
