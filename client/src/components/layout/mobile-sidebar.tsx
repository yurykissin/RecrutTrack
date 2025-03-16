import { Link } from "wouter";
import { BarChart, Briefcase, Cog, HandshakeIcon, UserIcon, X } from "lucide-react";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
}

export default function MobileSidebar({ isOpen, onClose, currentPath }: MobileSidebarProps) {
  const isActive = (path: string) => currentPath === path;
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-20 md:hidden">
      <div className="bg-indigo-800 text-white w-64 h-full overflow-y-auto">
        <div className="p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">WAYO</h1>
          <button onClick={onClose} className="text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="mt-5">
          <Link href="/">
            <a className={`flex items-center py-3 px-4 ${isActive("/") ? "bg-indigo-900" : "hover:bg-indigo-700"}`} onClick={onClose}>
              <BarChart className="w-5 h-5" />
              <span className="ml-3">Dashboard</span>
            </a>
          </Link>
          <Link href="/positions">
            <a className={`flex items-center py-3 px-4 ${isActive("/positions") ? "bg-indigo-900" : "hover:bg-indigo-700"}`} onClick={onClose}>
              <Briefcase className="w-5 h-5" />
              <span className="ml-3">Open Positions</span>
            </a>
          </Link>
          <Link href="/candidates">
            <a className={`flex items-center py-3 px-4 ${isActive("/candidates") ? "bg-indigo-900" : "hover:bg-indigo-700"}`} onClick={onClose}>
              <UserIcon className="w-5 h-5" />
              <span className="ml-3">Candidates</span>
            </a>
          </Link>
          <Link href="/referrals">
            <a className={`flex items-center py-3 px-4 ${isActive("/referrals") ? "bg-indigo-900" : "hover:bg-indigo-700"}`} onClick={onClose}>
              <HandshakeIcon className="w-5 h-5" />
              <span className="ml-3">Referrals</span>
            </a>
          </Link>
          <Link href="/settings">
            <a className={`flex items-center py-3 px-4 ${isActive("/settings") ? "bg-indigo-900" : "hover:bg-indigo-700"}`} onClick={onClose}>
              <Cog className="w-5 h-5" />
              <span className="ml-3">Settings</span>
            </a>
          </Link>
        </nav>
      </div>
    </div>
  );
}
