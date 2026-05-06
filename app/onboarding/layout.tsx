import "./onboarding.css";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="ob-host">
      {children}
    </div>
  );
}
