import { ReactNode } from "react";
import { LucideIcon, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  children?: ReactNode;
  tooltip?: string;
  highlight?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

const variantStyles = {
  default: "",
  success: "border-l-4 border-l-[#00B87A]",
  warning: "border-l-4 border-l-[#F59E0B]",
  error: "border-l-4 border-l-[#E5294A]"
};

const variantIconStyles = {
  default: "bg-primary/10 text-primary",
  success: "bg-[#E8FAF3] text-[#00B87A]",
  warning: "bg-[#FEF3E2] text-[#F59E0B]",
  error: "bg-[#FDE8EC] text-[#E5294A]"
};

export function StatCard({ title, value, subtitle, icon: Icon, trend, className, children, tooltip, highlight, variant = 'default' }: StatCardProps) {
  return (
    <div className={cn(
      "card-premium p-2.5 sm:p-4",
      highlight && "ring-2 ring-primary/20 bg-primary/5",
      variantStyles[variant],
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-0.5 sm:space-y-1 min-w-0">
          <div className="flex items-center gap-1">
            <p className="stat-label truncate">{title}</p>
            {tooltip && (
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground/50 flex-shrink-0" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-xs">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <p className="stat-value truncate">{value}</p>
          {subtitle && (
            <p className="text-[10px] sm:text-sm text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div className={cn(
              "inline-flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-sm font-medium",
              trend.isPositive ? "text-[#00B87A]" : "text-[#E5294A]"
            )}>
              <span>{trend.isPositive ? "↑" : "↓"}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-muted-foreground font-normal hidden sm:inline">vs mes anterior</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn("w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0", variantIconStyles[variant])}>
            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
}

interface StatusBadgeProps {
  status: string;
  label?: string;
}

const statusConfig: Record<string, { className: string; label: string }> = {
  // English statuses (legacy)
  pending: { className: "status-pending", label: "Pendiente" },
  approved: { className: "status-approved", label: "Aprobado" },
  rejected: { className: "status-rejected", label: "Rechazado" },
  active: { className: "status-active", label: "Activo" },
  inactive: { className: "bg-secondary text-muted-foreground", label: "Inactivo" },
  completed: { className: "status-approved", label: "Completado" },
  under_review: { className: "bg-[#EEF0FC] text-[#5B6FE0] border border-[#C5CAFE]", label: "En revisión" },
  submitted: { className: "status-pending", label: "Enviada" },
  paid: { className: "bg-[#E8FAF3] text-[#00B87A] border border-[#B3EDD8]", label: "Pagada" },
  generated: { className: "bg-secondary text-muted-foreground border border-border", label: "Generada" },
  locked: { className: "bg-[#FEF3E2] text-[#F59E0B] border border-[#FDE08A]", label: "Bloqueada" },
  available: { className: "status-approved", label: "Disponible" },
  requested: { className: "bg-[#F4F0FA] text-primary border border-[#D4C8E8]", label: "Solicitada" },
  payed: { className: "bg-[#E8FAF3] text-[#00B87A] border border-[#B3EDD8]", label: "Pagada" },
  reverted: { className: "status-rejected", label: "Revertida" },
  sent: { className: "bg-[#E8FAF3] text-[#00B87A] border border-[#B3EDD8]", label: "Enviado" },
  failed: { className: "status-rejected", label: "Fallido" },
  paused: { className: "bg-secondary text-muted-foreground border border-border", label: "Pausado" },
  in_progress: { className: "bg-[#EEF0FC] text-[#5B6FE0] border border-[#C5CAFE]", label: "En progreso" },
  not_started: { className: "bg-secondary text-muted-foreground border border-border", label: "No iniciada" },
  active_subscription: { className: "bg-[#E8FAF3] text-[#00B87A] border border-[#B3EDD8]", label: "Suscripción activa" },
  cancelled: { className: "bg-secondary text-muted-foreground border border-border", label: "Cancelada" },
  refunded: { className: "bg-[#FEF3E2] text-[#F59E0B] border border-[#FDE08A]", label: "Reembolsada" },
  created: { className: "bg-[#EEF0FC] text-[#5B6FE0] border border-[#C5CAFE]", label: "Creada" },
  payment_pending: { className: "status-pending", label: "Pago pendiente" },
  
  // Spanish statuses (new data model)
  "activo": { className: "bg-[#E8FAF3] text-[#00B87A] border border-[#B3EDD8]", label: "Activo" },
  "pausado": { className: "bg-secondary text-muted-foreground border border-border", label: "Pausado" },
  "pagada": { className: "bg-[#E8FAF3] text-[#00B87A] border border-[#B3EDD8]", label: "Pagada" },
  "suscripción activa": { className: "bg-[#E8FAF3] text-[#00B87A] border border-[#B3EDD8]", label: "Suscripción activa" },
  "cancelada": { className: "bg-secondary text-muted-foreground border border-border", label: "Cancelada" },
  "pago fallido": { className: "bg-[#FDE8EC] text-[#E5294A] border border-[#F9B8C4]", label: "Pago fallido" },
  "reembolsada": { className: "bg-[#FEF3E2] text-[#F59E0B] border border-[#FDE08A]", label: "Reembolsada" },
  "por liberar": { className: "bg-[#FEF3E2] text-[#F59E0B] border border-[#FDE08A]", label: "Por liberar" },
  "disponible": { className: "bg-[#E8FAF3] text-[#00B87A] border border-[#B3EDD8]", label: "Disponible" },
  "revertida": { className: "bg-[#FDE8EC] text-[#E5294A] border border-[#F9B8C4]", label: "Revertida" },
  "pendiente": { className: "status-pending", label: "Pendiente" },
  "aprobado": { className: "status-approved", label: "Aprobado" },
  "rechazado": { className: "status-rejected", label: "Rechazado" },
  "automático": { className: "bg-[#EEF0FC] text-[#5B6FE0] border border-[#C5CAFE]", label: "Automático" },
  "en revisión": { className: "bg-[#EEF0FC] text-[#5B6FE0] border border-[#C5CAFE]", label: "En revisión" },
  "reunión agendada": { className: "bg-[#F4F0FA] text-primary border border-[#D4C8E8]", label: "Reunión agendada" },
  "enviado": { className: "bg-[#E8FAF3] text-[#00B87A] border border-[#B3EDD8]", label: "Enviado" },
  "falló": { className: "bg-[#FDE8EC] text-[#E5294A] border border-[#F9B8C4]", label: "Falló" }
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusConfig[status] || { className: "bg-secondary text-muted-foreground", label: status };
  return (
    <span className={cn("status-badge", config.className)}>
      {label || config.label}
    </span>
  );
}

interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ProgressBar({ value, max = 100, showLabel = false, size = "md" }: ProgressBarProps) {
  const percentage = Math.min(100, (value / max) * 100);
  const heights = { sm: "h-1", md: "h-2", lg: "h-3" };
  
  return (
    <div className="space-y-1">
      <div className={cn("w-full bg-secondary rounded-full overflow-hidden", heights[size])}>
        <div 
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-muted-foreground text-right">{Math.round(percentage)}%</p>
      )}
    </div>
  );
}

interface DataTableProps {
  headers: string[];
  children: ReactNode;
  className?: string;
}

export function DataTable({ headers, children, className }: DataTableProps) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="data-table">
        <thead>
          <tr className="border-b-2 border-border">
            {headers.map((header, i) => (
              <th key={i}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {children}
        </tbody>
      </table>
    </div>
  );
}

interface ActionButtonsProps {
  children: ReactNode;
  className?: string;
}

export function ActionButtons({ children, className }: ActionButtonsProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {children}
    </div>
  );
}

interface AlertCardProps {
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: LucideIcon;
}

const alertStyles = {
  warning: "bg-[#FEF3E2] border-[#FDE08A] text-[#F59E0B]",
  info: "bg-[#EEF0FC] border-[#C5CAFE] text-[#5B6FE0]",
  success: "bg-[#E8FAF3] border-[#B3EDD8] text-[#00B87A]",
  error: "bg-[#FDE8EC] border-[#F9B8C4] text-[#E5294A]"
};

export function AlertCard({ type, title, description, action, icon: Icon }: AlertCardProps) {
  return (
    <div className={cn("p-4 rounded-lg border flex items-start gap-3", alertStyles[type])}>
      {Icon && <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="font-medium">{title}</p>
        {description && <p className="text-sm opacity-80 mt-0.5">{description}</p>}
      </div>
      {action}
    </div>
  );
}