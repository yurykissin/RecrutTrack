import { Card } from "@/components/ui/card";
import { ArrowUp } from "lucide-react";
import React from "react";
import { Link } from "wouter";

interface StatsCardProps {
  title: string;
  value: string;
  change: number | null;
  icon: React.ReactNode;
  iconColor: string;
  iconBgColor: string;
  changePrefix?: string;
  linkTo?: string;  // Optional link path
}

export default function StatsCard({
  title,
  value,
  change,
  icon,
  iconColor,
  iconBgColor,
  changePrefix = "",
  linkTo
}: StatsCardProps) {
  const CardContent = () => (
    <>
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${iconBgColor} ${iconColor}`}>
          {icon}
        </div>
        <div className="ml-4">
          <h3 className="text-gray-500 text-sm">{title}</h3>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
      {change !== null && (
        <div className="mt-4">
          <div className="flex items-center text-sm">
            <span className="text-green-500 flex items-center">
              <ArrowUp className="h-3 w-3 mr-1" /> {changePrefix}{change}
            </span>
            <span className="text-gray-500 ml-2">from last month</span>
          </div>
        </div>
      )}
    </>
  );

  if (linkTo) {
    return (
      <Link href={linkTo}>
        <Card className="p-6 cursor-pointer hover:shadow-md hover:border-primary/50 transition-all duration-200 group">
          <CardContent />
          <div className="mt-3 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Click to view details →
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <Card className="p-6">
      <CardContent />
    </Card>
  );
}
