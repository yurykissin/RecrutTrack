import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface PositionFiltersProps {
  onSearchChange: (query: string) => void;
  onStatusChange: (status: string) => void;
  onCompanyChange: (company: string) => void;
  onLocationChange: (location: string) => void;
  companies: string[];
  locations: string[];
}

export default function PositionFilters({
  onSearchChange,
  onStatusChange,
  onCompanyChange,
  onLocationChange,
  companies,
  locations
}: PositionFiltersProps) {
  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <div className="flex flex-wrap gap-4">
        <div className="w-full md:w-64">
          <label htmlFor="position-search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              id="position-search"
              className="pl-10"
              placeholder="Search positions..."
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
        
        <div className="w-full md:w-40">
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <Select onValueChange={onStatusChange} defaultValue="all">
            <SelectTrigger id="status-filter">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full md:w-40">
          <label htmlFor="company-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Company
          </label>
          <Select onValueChange={onCompanyChange} defaultValue="all">
            <SelectTrigger id="company-filter">
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
          <label htmlFor="location-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <Select onValueChange={onLocationChange} defaultValue="all">
            <SelectTrigger id="location-filter">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location} value={location.toLowerCase()}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
