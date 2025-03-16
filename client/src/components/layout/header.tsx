import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <div className="md:hidden bg-indigo-800 text-white w-full h-16 fixed top-0 left-0 z-10 flex items-center justify-between px-4">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="mr-2 text-white hover:bg-indigo-700"
        >
          <Menu className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">WAYO</h1>
      </div>
      <div>
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
          U
        </div>
      </div>
    </div>
  );
}
