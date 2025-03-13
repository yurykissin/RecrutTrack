import { Link } from "wouter";
import { BarChart, Briefcase, Cog, HandshakeIcon, UserIcon } from "lucide-react";

interface SidebarProps {
  currentPath: string;
}

export default function Sidebar({ currentPath }: SidebarProps) {
  const isActive = (path: string) => currentPath === path;
  
  return (
    <div className="bg-indigo-800 text-white w-64 flex-shrink-0 hidden md:flex md:flex-col">
      <div className="p-4">
        <h1 className="text-2xl font-bold">RecrutTrack</h1>
        <p className="text-indigo-200 text-sm">Recruitment & Referral Management</p>
      </div>
      <nav className="mt-5 flex-1">
        <Link href="/">
          <a className={`flex items-center py-3 px-4 ${isActive("/") ? "bg-indigo-900" : "hover:bg-indigo-700"}`}>
            <BarChart className="w-5 h-5" />
            <span className="ml-3">Dashboard</span>
          </a>
        </Link>
        <Link href="/positions">
          <a className={`flex items-center py-3 px-4 ${isActive("/positions") ? "bg-indigo-900" : "hover:bg-indigo-700"}`}>
            <Briefcase className="w-5 h-5" />
            <span className="ml-3">Open Positions</span>
          </a>
        </Link>
        <Link href="/candidates">
          <a className={`flex items-center py-3 px-4 ${isActive("/candidates") ? "bg-indigo-900" : "hover:bg-indigo-700"}`}>
            <UserIcon className="w-5 h-5" />
            <span className="ml-3">Candidates</span>
          </a>
        </Link>
        <Link href="/referrals">
          <a className={`flex items-center py-3 px-4 ${isActive("/referrals") ? "bg-indigo-900" : "hover:bg-indigo-700"}`}>
            <HandshakeIcon className="w-5 h-5" />
            <span className="ml-3">Referrals</span>
          </a>
        </Link>
        <Link href="/settings">
          <a className={`flex items-center py-3 px-4 ${isActive("/settings") ? "bg-indigo-900" : "hover:bg-indigo-700"}`}>
            <Cog className="w-5 h-5" />
            <span className="ml-3">Settings</span>
          </a>
        </Link>
      </nav>
      <div className="p-4 bg-indigo-900">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
            U
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">User</p>
            <p className="text-xs text-indigo-300">user@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
