import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface KPICardProps {
  title: string
  value: string
  icon: LucideIcon
  description?: string
  trend?: string
  trendUp?: boolean
  variant?: "default" | "warning"
}

export function KPICard({ title, value, icon: Icon, description, trend, trendUp, variant = "default" }: KPICardProps) {
  return (
    <Card className={cn(variant === "warning" && "border-yellow-500/50")}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={cn("h-4 w-4", variant === "warning" ? "text-yellow-500" : "text-muted-foreground")} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        {trend && (
          <div className="flex items-center gap-1 mt-1">
            {trendUp !== undefined &&
              (trendUp ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              ))}
            <span
              className={cn(
                "text-xs",
                trendUp === true && "text-green-500",
                trendUp === false && "text-red-500",
                trendUp === undefined && "text-muted-foreground",
              )}
            >
              {trend}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
