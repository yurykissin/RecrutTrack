import { Card } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";

export default function Settings() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your application preferences</p>
      </div>
      <Card className="p-6 flex items-center">
        <SettingsIcon className="h-8 w-8 text-gray-400 mr-4" />
        <p className="text-gray-500">Settings content will be implemented in a future update.</p>
      </Card>
    </div>
  );
}
