"use client";

const steps = [{ label: "Workspace" }, { label: "Setup" }];

export interface StepIndicatorProps {
  currentStep: number;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-4 mb-8" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={steps.length}>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = currentStep === stepNumber;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.label} className="flex items-center">
            <span
              className={`block shrink-0 rounded-full transition-all duration-150 ease-out ${
                isActive ? "w-3 h-3 bg-[#9FE870] shadow-[0_0_8px_rgba(159,232,112,0.4)]" : "w-3 h-3 bg-[#DADDDD]"
              }`}
              aria-current={isActive ? "step" : undefined}
            />
            {!isLast && (
              <div className="h-[2px] w-20 bg-gray-200 shrink-0 mx-0" aria-hidden />
            )}
          </div>
        );
      })}
    </div>
  );
}
