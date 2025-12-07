import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  label: string;
  completed: boolean;
  current?: boolean;
}

interface StepIndicatorProps {
  steps: Step[];
  className?: string;
}

export function StepIndicator({ steps, className }: StepIndicatorProps) {
  return (
    <div className={cn("flex items-center justify-between w-full", className)}>
      {steps.map((step, index) => (
        <div key={index} className="flex items-center flex-1">
          {/* Step circle */}
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                step.completed
                  ? "bg-secondary text-secondary-foreground"
                  : step.current
                  ? "bg-primary text-primary-foreground animate-pulse-glow"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {step.completed ? (
                <Check className="w-5 h-5" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <span
              className={cn(
                "mt-2 text-xs font-medium text-center max-w-[80px]",
                step.completed || step.current
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>

          {/* Connector line */}
          {index < steps.length - 1 && (
            <div className="flex-1 mx-2 mt-[-20px]">
              <div
                className={cn(
                  "h-1 rounded-full transition-all duration-500",
                  step.completed ? "bg-secondary" : "bg-muted"
                )}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
