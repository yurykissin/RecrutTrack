import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface ReferralFiltersProps {
  onSearchChange: (query: string) => void;
  onStatusChange: (status: string) => void;
  onCompanyChange: (company: string) => void;
  onDateChange: (date: string) => void;
  companies: string[];
}

export default function ReferralFilters({
  onSearchChange,
  onStatusChange,
  onCompanyChange,
  onDateChange,
  companies
}: ReferralFiltersProps) {
  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <div className="flex flex-wrap gap-4">
        <div className="w-full md:w-64">
          <label htmlFor="referral-search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              id="referral-search"
              className="pl-10"
              placeholder="Search referrals..."
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
        
        <div className="w-full md:w-40">
          <label htmlFor="referral-status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <Select onValueChange={onStatusChange} defaultValue="all">
            <SelectTrigger id="referral-status">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="referred">Referred</SelectItem>
              <SelectItem value="interviewing">Interviewing</SelectItem>
              <SelectItem value="hired">Hired</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full md:w-40">
          <label htmlFor="referral-company" className="block text-sm font-medium text-gray-700 mb-1">
            Company
          </label>
          <Select onValueChange={onCompanyChange} defaultValue="all">
            <SelectTrigger id="referral-company">
              <SelectValue placeholder="All Companies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company} value={company.toLowerCase()}>
                  {company}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full md:w-40">
          <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Date Range
          </label>
          <Select onValueChange={onDateChange} defaultValue="all">
            <SelectTrigger id="date-filter">
              <SelectValue placeholder="All Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
