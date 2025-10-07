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
    if (score >= 60) return "text-primary";
    if (score >= 40) return "text-warning";
    return "text-destructive";
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return "bg-success/15 border-success/30 shadow-success/20";
    if (score >= 60) return "bg-primary/15 border-primary/30 shadow-primary/20";
    if (score >= 40) return "bg-warning/15 border-warning/30 shadow-warning/20";
    return "bg-destructive/15 border-destructive/30 shadow-destructive/20";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return "from-success/20 to-success/5";
    if (score >= 60) return "from-primary/20 to-primary/5";
    if (score >= 40) return "from-warning/20 to-warning/5";
    return "from-destructive/20 to-destructive/5";
  };

  const sizeClasses = {
    sm: "h-14 w-14 text-lg",
    md: "h-24 w-24 text-3xl",
    lg: "h-36 w-36 text-5xl",
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Poor";
  };

  // Calculate stroke offset for circular progress
  const radius = size === "lg" ? 68 : size === "md" ? 44 : 26;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (score / 100) * circumference;

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative">
        {/* Background circle */}
        <div
          className={cn(
            "relative rounded-full border-4 flex items-center justify-center font-bold shadow-lg transition-all duration-300 hover:scale-105",
            sizeClasses[size],
            getScoreBackground(score),
            getScoreColor(score)
          )}
        >
          {/* Gradient overlay */}
          <div className={cn(
            "absolute inset-0 rounded-full bg-gradient-to-br opacity-50",
            getScoreGradient(score)
          )} />
          
          {/* Score number */}
          <span className="relative z-10">{score}</span>
        </div>

        {/* Circular progress indicator */}
        <svg 
          className="absolute top-0 left-0 w-full h-full -rotate-90"
          style={{ filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.1))' }}
        >
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            className={cn("transition-all duration-1000", getScoreColor(score))}
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
            strokeLinecap="round"
            opacity="0.3"
          />
        </svg>
      </div>
      
      {showLabel && (
        <span className={cn(
          "text-sm font-bold tracking-wide uppercase",
          getScoreColor(score)
        )}>
          {getScoreLabel(score)}
        </span>
      )}
    </div>
  );
};
