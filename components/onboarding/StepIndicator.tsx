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
              className={`block shrink-0 rounded-full transition-all duration-300 ${
                isActive ? "w-2.5 h-2.5 bg-[#466EFF]" : "w-2 h-2 bg-gray-300"
              }`}
              aria-current={isActive ? "step" : undefined}
            />
            {!isLast && (
              <div className="h-[1px] w-16 bg-gray-200 shrink-0 mx-1" aria-hidden />
            )}
          </div>
        );
      })}
    </div>
  );
}
