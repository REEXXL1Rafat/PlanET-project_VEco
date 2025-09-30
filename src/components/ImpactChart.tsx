import { cn } from "@/lib/utils";
import { Leaf, Recycle, Factory, Zap } from "lucide-react";

interface ImpactChartProps {
  carbonEmissions: number; // 0-100
  recyclability: number; // 0-100
  ethicalSourcing: number; // 0-100
  energyConsumption: number; // 0-100
  className?: string;
}

const metrics = [
  {
    key: 'carbonEmissions',
    label: 'Carbon Emissions',
    icon: Leaf,
    description: 'CO2 footprint',
  },
  {
    key: 'recyclability',
    label: 'Recyclability',
    icon: Recycle,
    description: 'End-of-life impact',
  },
  {
    key: 'ethicalSourcing',
    label: 'Ethical Sourcing',
    icon: Factory,
    description: 'Fair trade & labor',
  },
  {
    key: 'energyConsumption',
    label: 'Energy Use',
    icon: Zap,
    description: 'Production efficiency',
  },
];

export const ImpactChart = ({
  carbonEmissions,
  recyclability,
  ethicalSourcing,
  energyConsumption,
  className,
}: ImpactChartProps) => {
  const values = {
    carbonEmissions,
    recyclability,
    ethicalSourcing,
    energyConsumption,
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-success";
    if (score >= 60) return "bg-accent";
    if (score >= 40) return "bg-warning";
    return "bg-destructive";
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-accent";
    if (score >= 40) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className={cn("space-y-4", className)}>
      {metrics.map((metric) => {
        const Icon = metric.icon;
        const score = values[metric.key as keyof typeof values];
        
        return (
          <div key={metric.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{metric.label}</p>
                  <p className="text-xs text-muted-foreground">{metric.description}</p>
                </div>
              </div>
              <span className={cn("text-sm font-bold", getScoreTextColor(score))}>
                {score}/100
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn("h-full transition-all duration-500", getScoreColor(score))}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
