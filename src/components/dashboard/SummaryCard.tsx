
import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type SummaryCardProps = {
  title: string;
  value: string;
  description?: string;
  trend?: {
    value: number;
    label: string;
  };
  icon?: ReactNode;
  variant?: "default" | "income" | "expense" | "balance";
  className?: string;
};

export default function SummaryCard({ 
  title, 
  value, 
  description, 
  trend, 
  icon,
  variant = "default",
  className
}: SummaryCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "income":
        return {
          bg: "bg-emerald-50 dark:bg-emerald-950/30",
          border: "border-emerald-100 dark:border-emerald-900",
          iconBg: "bg-emerald-100 dark:bg-emerald-900",
          iconColor: "text-emerald-600 dark:text-emerald-400"
        };
      case "expense":
        return {
          bg: "bg-red-50 dark:bg-red-950/30",
          border: "border-red-100 dark:border-red-900",
          iconBg: "bg-red-100 dark:bg-red-900",
          iconColor: "text-red-600 dark:text-red-400"
        };
      case "balance":
        return {
          bg: "bg-blue-50 dark:bg-blue-950/30",
          border: "border-blue-100 dark:border-blue-900",
          iconBg: "bg-blue-100 dark:bg-blue-900",
          iconColor: "text-blue-600 dark:text-blue-400"
        };
      default:
        return {
          bg: "bg-white dark:bg-zinc-950",
          border: "border-border",
          iconBg: "bg-zinc-100 dark:bg-zinc-800",
          iconColor: "text-zinc-600 dark:text-zinc-400"
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Card className={cn("border transition-all hover:shadow-sm", styles.bg, styles.border, className)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {title}
          </CardTitle>
          {icon && (
            <div className={cn("p-2 rounded-full", styles.iconBg)}>
              <div className={styles.iconColor}>{icon}</div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        
        {(description || trend) && (
          <div className="flex mt-1 items-center text-sm">
            {trend && (
              <div className={cn(
                "mr-2 px-1.5 py-0.5 rounded text-xs font-medium",
                trend.value > 0 
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-400" 
                  : trend.value < 0
                    ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400"
                    : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400"
              )}>
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </div>
            )}
            
            {description && (
              <CardDescription className="text-xs text-muted-foreground">
                {description}
              </CardDescription>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
