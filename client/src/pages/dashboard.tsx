import { useQuery } from "@tanstack/react-query";
import StatsCard from "@/components/dashboard/stats-card";
import ActivityItem from "@/components/dashboard/activity-item";
import { 
  BarChart, 
  Briefcase, 
  DollarSign, 
  HandshakeIcon, 
  UserIcon 
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format";
import { Activity } from "@shared/schema";

interface DashboardStats {
  openPositions: number;
  activeCandidates: number;
  referralsMade: number;
  feesEarned: number;
  monthlyChange: {
    openPositions: number;
    activeCandidates: number;
    referralsMade: number;
    feesEarned: number;
  };
}

export default function Dashboard() {
  const { data: stats, isLoading: isLoadingStats } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: activities, isLoading: isLoadingActivities } = useQuery<Activity[]>({
    queryKey: ['/api/activities?limit=5'],
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your recruitment activities</p>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Open Positions"
          value={isLoadingStats ? "Loading..." : stats?.openPositions.toString() || "0"}
          change={isLoadingStats ? null : (stats?.monthlyChange.openPositions ?? null)}
          icon={<Briefcase />}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-100"
          linkTo="/positions"
        />
        
        <StatsCard
          title="Active Candidates"
          value={isLoadingStats ? "Loading..." : stats?.activeCandidates.toString() || "0"}
          change={isLoadingStats ? null : (stats?.monthlyChange.activeCandidates ?? null)}
          icon={<UserIcon />}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          linkTo="/candidates"
        />
        
        <StatsCard
          title="Referrals Made"
          value={isLoadingStats ? "Loading..." : stats?.referralsMade.toString() || "0"}
          change={isLoadingStats ? null : (stats?.monthlyChange.referralsMade ?? null)}
          icon={<HandshakeIcon />}
          iconColor="text-amber-600"
          iconBgColor="bg-amber-100"
          linkTo="/referrals"
        />
        
        <StatsCard
          title="Fees Earned"
          value={isLoadingStats ? "Loading..." : formatCurrency(stats?.feesEarned || 0)}
          change={isLoadingStats ? null : (stats?.monthlyChange.feesEarned ?? null)}
          changePrefix="$"
          icon={<DollarSign />}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
          linkTo="/referrals"
        />
      </div>

      {/* Recent Activity */}
      <Card className="mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-4">
          {isLoadingActivities ? (
            <div className="py-4 text-center">Loading recent activities...</div>
          ) : activities && activities.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </ul>
          ) : (
            <div className="py-4 text-center text-gray-500">No recent activities</div>
          )}
        </div>
      </Card>
    </div>
  );
}
