import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon, Building, DollarSign, Bell, Languages } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Settings() {
  const { toast } = useToast();
  const [generalSettings, setGeneralSettings] = useState({
    companyName: "Your Company",
    email: "contact@example.com",
    phone: "05X-XXXXXXX",
    address: "Tel Aviv, Israel"
  });
  
  const [financialSettings, setFinancialSettings] = useState({
    defaultCurrency: "₪",
    defaultPlacementFeePercentage: 100, // 100% of monthly salary
    defaultOutsourceFeePercentage: 15,  // 15% of monthly salary
    defaultMinimumSalary: 15000,
    defaultMaximumSalary: 50000
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    applicationUpdates: true,
    newPositions: true,
    candidateStatusChanges: true,
    referralStatusChanges: true
  });
  
  const [localizationSettings, setLocalizationSettings] = useState({
    language: "he",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h"
  });
  
  const handleGeneralSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGeneralSettings({
      ...generalSettings,
      [e.target.name]: e.target.value
    });
  };
  
  const handleFinancialSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFinancialSettings({
      ...financialSettings,
      [e.target.name]: parseFloat(e.target.value)
    });
  };
  
  const handleNotificationSettingChange = (setting: string, value: boolean) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: value
    });
  };
  
  const handleLocalizationChange = (setting: string, value: string) => {
    setLocalizationSettings({
      ...localizationSettings,
      [setting]: value
    });
  };
  
  const saveSettings = () => {
    // In a real application, this would save to a database
    toast({
      title: "Settings saved",
      description: "Your settings have been successfully updated.",
    });
  };
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your application preferences</p>
      </div>
      
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="localization">Localization</TabsTrigger>
        </TabsList>
        
        {/* General Settings Tab */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2 text-gray-500" />
                Company Information
              </CardTitle>
              <CardDescription>
                Update your company details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input 
                    id="companyName" 
                    name="companyName"
                    value={generalSettings.companyName} 
                    onChange={handleGeneralSettingsChange} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Contact Email</Label>
                  <Input 
                    id="email" 
                    name="email"
                    type="email" 
                    value={generalSettings.email} 
                    onChange={handleGeneralSettingsChange} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Contact Phone</Label>
                  <Input 
                    id="phone" 
                    name="phone"
                    value={generalSettings.phone} 
                    onChange={handleGeneralSettingsChange} 
                    placeholder="05X-XXXXXXX"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input 
                    id="address" 
                    name="address"
                    value={generalSettings.address} 
                    onChange={handleGeneralSettingsChange} 
                  />
                </div>
              </div>
              
              <Button onClick={saveSettings} className="mt-4">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Financial Settings Tab */}
        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-gray-500" />
                Financial Settings
              </CardTitle>
              <CardDescription>
                Configure default financial parameters for positions and referrals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="defaultCurrency">Default Currency</Label>
                  <Select 
                    defaultValue={financialSettings.defaultCurrency}
                    onValueChange={(value) => handleLocalizationChange("defaultCurrency", value)}
                  >
                    <SelectTrigger id="defaultCurrency">
                      <SelectValue placeholder="Select Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="₪">Israeli Shekel (₪)</SelectItem>
                      <SelectItem value="$">US Dollar ($)</SelectItem>
                      <SelectItem value="€">Euro (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="defaultPlacementFeePercentage">
                    Default Placement Fee (% of monthly salary)
                  </Label>
                  <Input 
                    id="defaultPlacementFeePercentage" 
                    name="defaultPlacementFeePercentage"
                    type="number" 
                    value={financialSettings.defaultPlacementFeePercentage} 
                    onChange={handleFinancialSettingsChange} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="defaultOutsourceFeePercentage">
                    Default Outsource Fee (% markup)
                  </Label>
                  <Input 
                    id="defaultOutsourceFeePercentage" 
                    name="defaultOutsourceFeePercentage"
                    type="number" 
                    value={financialSettings.defaultOutsourceFeePercentage} 
                    onChange={handleFinancialSettingsChange} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="defaultMinimumSalary">Default Minimum Salary (₪/month)</Label>
                  <Input 
                    id="defaultMinimumSalary" 
                    name="defaultMinimumSalary"
                    type="number" 
                    value={financialSettings.defaultMinimumSalary} 
                    onChange={handleFinancialSettingsChange} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="defaultMaximumSalary">Default Maximum Salary (₪/month)</Label>
                  <Input 
                    id="defaultMaximumSalary" 
                    name="defaultMaximumSalary"
                    type="number" 
                    value={financialSettings.defaultMaximumSalary} 
                    onChange={handleFinancialSettingsChange} 
                  />
                </div>
              </div>
              
              <Button onClick={saveSettings} className="mt-4">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2 text-gray-500" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Control which notifications you receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications" className="font-medium">Email Notifications</Label>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => handleNotificationSettingChange("emailNotifications", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="applicationUpdates" className="font-medium">Application Updates</Label>
                    <p className="text-sm text-gray-500">Receive updates about new features</p>
                  </div>
                  <Switch
                    id="applicationUpdates"
                    checked={notificationSettings.applicationUpdates}
                    onCheckedChange={(checked) => handleNotificationSettingChange("applicationUpdates", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="newPositions" className="font-medium">New Positions</Label>
                    <p className="text-sm text-gray-500">Be notified when new positions are added</p>
                  </div>
                  <Switch
                    id="newPositions"
                    checked={notificationSettings.newPositions}
                    onCheckedChange={(checked) => handleNotificationSettingChange("newPositions", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="candidateStatusChanges" className="font-medium">Candidate Status Changes</Label>
                    <p className="text-sm text-gray-500">Be notified when candidate statuses change</p>
                  </div>
                  <Switch
                    id="candidateStatusChanges"
                    checked={notificationSettings.candidateStatusChanges}
                    onCheckedChange={(checked) => handleNotificationSettingChange("candidateStatusChanges", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="referralStatusChanges" className="font-medium">Referral Status Changes</Label>
                    <p className="text-sm text-gray-500">Be notified when referral statuses change</p>
                  </div>
                  <Switch
                    id="referralStatusChanges"
                    checked={notificationSettings.referralStatusChanges}
                    onCheckedChange={(checked) => handleNotificationSettingChange("referralStatusChanges", checked)}
                  />
                </div>
              </div>
              
              <Button onClick={saveSettings} className="mt-4">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Localization Tab */}
        <TabsContent value="localization">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Languages className="h-5 w-5 mr-2 text-gray-500" />
                Localization Settings
              </CardTitle>
              <CardDescription>
                Configure language and formatting preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select 
                    defaultValue={localizationSettings.language}
                    onValueChange={(value) => handleLocalizationChange("language", value)}
                  >
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="he">עברית (Hebrew)</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">العربية (Arabic)</SelectItem>
                      <SelectItem value="ru">Русский (Russian)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select 
                    defaultValue={localizationSettings.dateFormat}
                    onValueChange={(value) => handleLocalizationChange("dateFormat", value)}
                  >
                    <SelectTrigger id="dateFormat">
                      <SelectValue placeholder="Select Date Format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (Israeli)</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (US)</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timeFormat">Time Format</Label>
                  <Select 
                    defaultValue={localizationSettings.timeFormat}
                    onValueChange={(value) => handleLocalizationChange("timeFormat", value)}
                  >
                    <SelectTrigger id="timeFormat">
                      <SelectValue placeholder="Select Time Format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">24-hour (14:30)</SelectItem>
                      <SelectItem value="12h">12-hour (2:30 PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button onClick={saveSettings} className="mt-4">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
