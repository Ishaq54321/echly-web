export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-[#f9fafc] overflow-hidden">
      {/* Premium SaaS gradient background (matches login) */}
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <div
          className="absolute"
          style={{
            top: "-15%",
            right: "-5%",
            width: "900px",
            height: "900px",
            background:
              "radial-gradient(circle, rgba(70,110,255,0.45) 0%, rgba(70,110,255,0.22) 35%, rgba(70,110,255,0.08) 55%, transparent 70%)",
            filter: "blur(35px)",
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: "-20%",
            left: "-10%",
            width: "850px",
            height: "850px",
            background:
              "radial-gradient(circle, rgba(70,110,255,0.32) 0%, rgba(70,110,255,0.15) 40%, transparent 70%)",
            filter: "blur(30px)",
          }}
        />
        <div
          className="absolute"
          style={{
            top: "45%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "700px",
            height: "700px",
            background:
              "radial-gradient(circle, rgba(70,110,255,0.18) 0%, transparent 65%)",
            filter: "blur(20px)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')",
          }}
        />
      </div>
      <div className="w-full min-h-screen flex flex-col items-center pt-[8vh] px-4 pb-12">
        {children}
      </div>
    </div>
  );
}
