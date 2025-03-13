import { Activity } from "@shared/schema";
import { 
  Briefcase, 
  DollarSign, 
  UserPlus,
  HandshakeIcon
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";

interface ActivityItemProps {
  activity: Activity;
}

export default function ActivityItem({ activity }: ActivityItemProps) {
  const getIconForActivity = () => {
    switch (activity.type) {
      case "candidate_added":
        return (
          <div className="bg-indigo-100 text-indigo-600 p-2 rounded-full">
            <UserPlus className="h-4 w-4" />
          </div>
        );
      case "position_added":
        return (
          <div className="bg-amber-100 text-amber-600 p-2 rounded-full">
            <Briefcase className="h-4 w-4" />
          </div>
        );
      case "referral_created":
        return (
          <div className="bg-green-100 text-green-600 p-2 rounded-full">
            <HandshakeIcon className="h-4 w-4" />
          </div>
        );
      case "referral_updated":
        return (
          <div className="bg-purple-100 text-purple-600 p-2 rounded-full">
            <DollarSign className="h-4 w-4" />
          </div>
        );
      default:
        return (
          <div className="bg-gray-100 text-gray-600 p-2 rounded-full">
            <Briefcase className="h-4 w-4" />
          </div>
        );
    }
  };
  
  const getTimeAgo = () => {
    return formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true });
  };
  
  // Determine the link based on activity type and related ID
  const getLinkForActivity = () => {
    switch (activity.type) {
      case "candidate_added":
        return "/candidates";
      case "position_added":
        return "/positions";
      case "referral_created":
      case "referral_updated":
        return "/referrals";
      default:
        return null;
    }
  };
  
  const linkTo = getLinkForActivity();
  
  const ActivityContent = () => (
    <div className="flex items-center">
      {getIconForActivity()}
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
        <p className="text-xs text-gray-500">{getTimeAgo()}</p>
      </div>
    </div>
  );
  
  if (linkTo) {
    return (
      <li className="py-3">
        <Link href={linkTo}>
          <div className="cursor-pointer hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors duration-200">
            <ActivityContent />
          </div>
        </Link>
      </li>
    );
  }
  
  return (
    <li className="py-3">
      <ActivityContent />
    </li>
  );
}
