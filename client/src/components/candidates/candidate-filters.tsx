import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface CandidateFiltersProps {
  onSearchChange: (query: string) => void;
  onStatusChange: (status: string) => void;
  onSkillChange: (skill: string) => void;
  onAvailabilityChange: (availability: string) => void;
  skills: string[];
}

export default function CandidateFilters({
  onSearchChange,
  onStatusChange,
  onSkillChange,
  onAvailabilityChange,
  skills
}: CandidateFiltersProps) {
  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <div className="flex flex-wrap gap-4">
        <div className="w-full md:w-64">
          <label htmlFor="candidate-search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              id="candidate-search"
              className="pl-10"
              placeholder="Search candidates..."
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
        
        <div className="w-full md:w-40">
          <label htmlFor="candidate-status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <Select onValueChange={onStatusChange} defaultValue="all">
            <SelectTrigger id="candidate-status">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="looking">Looking</SelectItem>
              <SelectItem value="placed">Placed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full md:w-40">
          <label htmlFor="candidate-skill" className="block text-sm font-medium text-gray-700 mb-1">
            Skills
          </label>
          <Select onValueChange={onSkillChange} defaultValue="all">
            <SelectTrigger id="candidate-skill">
              <SelectValue placeholder="All Skills" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Skills</SelectItem>
              {skills.map((skill) => (
                <SelectItem key={skill} value={skill.toLowerCase()}>
                  {skill}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full md:w-40">
          <label htmlFor="candidate-availability" className="block text-sm font-medium text-gray-700 mb-1">
            Availability
          </label>
          <Select onValueChange={onAvailabilityChange} defaultValue="all">
            <SelectTrigger id="candidate-availability">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="immediate">Immediate</SelectItem>
              <SelectItem value="2weeks">2 Weeks</SelectItem>
              <SelectItem value="1month">1 Month</SelectItem>
              <SelectItem value="3months">3+ Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
