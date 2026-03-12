export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-[#FFFFFF] overflow-hidden">
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <div
          className="absolute"
          style={{
            top: "-15%",
            right: "-5%",
            width: "900px",
            height: "900px",
            background:
              "radial-gradient(circle, rgba(159,232,112,0.15) 0%, rgba(159,232,112,0.06) 50%, transparent 70%)",
            filter: "blur(40px)",
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
              "radial-gradient(circle, rgba(221,243,200,0.3) 0%, transparent 60%)",
            filter: "blur(35px)",
          }}
        />
      </div>
      <div className="w-full min-h-screen flex flex-col items-center justify-center px-4 py-12">
        {children}
      </div>
    </div>
  );
}
