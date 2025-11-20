import React from 'react';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className, 
  title, 
  subtitle,
  action 
}) => {
  return (
    <div className={clsx(
      'bg-card text-card-foreground rounded-xl border shadow-sm p-6 animate-fade-in-up',
      className
    )}>
      {(title || subtitle || action) && (
        <div className="mb-4 flex items-center justify-between">
          <div>
            {title && <h3 className="text-xl font-bold text-foreground">{title}</h3>}
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  trend,
  className
}) => {
  return (
    <div className={clsx(
      'bg-card text-card-foreground rounded-xl border shadow-sm p-6 animate-fade-in-up',
      'hover:shadow-md transition-shadow duration-300',
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {trend && (
            <div className={clsx(
              'mt-2 text-sm font-medium flex items-center',
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            )}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span className="ml-1">{Math.abs(trend.value).toFixed(1)}%</span>
            </div>
          )}
        </div>
        <div className="ml-4 p-3 bg-primary/10 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  );
};

