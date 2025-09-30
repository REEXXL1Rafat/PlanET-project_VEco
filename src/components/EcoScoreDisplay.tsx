import { cn } from "@/lib/utils";

interface EcoScoreDisplayProps {
  score: number; // 0-100
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export const EcoScoreDisplay = ({ 
  score, 
  size = "md", 
  showLabel = true,
  className 
}: EcoScoreDisplayProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-accent";
    if (score >= 40) return "text-warning";
    return "text-destructive";
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return "bg-success/10 border-success/20";
    if (score >= 60) return "bg-accent/10 border-accent/20";
    if (score >= 40) return "bg-warning/10 border-warning/20";
    return "bg-destructive/10 border-destructive/20";
  };

  const sizeClasses = {
    sm: "h-12 w-12 text-lg",
    md: "h-20 w-20 text-3xl",
    lg: "h-32 w-32 text-5xl",
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Poor";
  };

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div
        className={cn(
          "rounded-full border-2 flex items-center justify-center font-bold",
          sizeClasses[size],
          getScoreBackground(score),
          getScoreColor(score)
        )}
      >
        {score}
      </div>
      {showLabel && (
        <span className={cn("text-sm font-medium", getScoreColor(score))}>
          {getScoreLabel(score)}
        </span>
      )}
    </div>
  );
};
