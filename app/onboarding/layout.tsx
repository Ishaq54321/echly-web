import "./onboarding.css";
import { RootProviders } from "@/components/providers/RootProviders";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // RootProviders supplies WorkspaceProvider so onboarding/page.tsx's
  // useWorkspace() call resolves. Previously inherited from the root layout.
  return (
    <RootProviders>
      <div className="ob-host">{children}</div>
    </RootProviders>
  );
}
