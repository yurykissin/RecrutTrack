import { Candidate } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Briefcase } from "lucide-react";

interface CandidateCardProps {
  candidate: Candidate;
  onEdit: () => void;
  onDelete: () => void;
  onRefer: () => void;
}

export default function CandidateCard({
  candidate,
  onEdit,
  onDelete,
  onRefer
}: CandidateCardProps) {
  // Helper to display availability in a readable format
  const displayAvailability = (availability: string) => {
    switch (availability) {
      case "immediate": return "Immediate";
      case "2weeks": return "2 Weeks Notice";
      case "1month": return "1 Month Notice";
      case "3months": return "3+ Months";
      default: return availability;
    }
  };
  
  // Parse skills into array for display
  const skillsList = candidate.skills.split(",").map(skill => skill.trim());
  
  return (
    <Card className="overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">{candidate.fullName}</h3>
        <Badge variant={candidate.status === "Looking" ? "success" : "secondary"}>
          {candidate.status}
        </Badge>
      </div>
      
      <div className="p-6">
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-500">Current Role</p>
          <p className="mt-1 text-sm text-gray-900">{candidate.currentRole}</p>
        </div>
        
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-500">Contact</p>
          <p className="mt-1 text-sm text-gray-900">
            {candidate.email} | {candidate.phone}
          </p>
        </div>
        
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-500">Skills</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {skillsList.map((skill, index) => (
              <span key={index} className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100">
                {skill}
              </span>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-500">Experience</p>
          <p className="mt-1 text-sm text-gray-900">{candidate.experience} years</p>
        </div>
        
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-500">Availability</p>
          <p className="mt-1 text-sm text-gray-900">{displayAvailability(candidate.availability)}</p>
        </div>
        
        {candidate.notes && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-500">Notes</p>
            <p className="mt-1 text-sm text-gray-900">{candidate.notes}</p>
          </div>
        )}
      </div>
      
      <div className="px-6 py-3 bg-gray-50 flex justify-end">
        <Button 
          variant="ghost" 
          className="text-indigo-600 hover:text-indigo-900 font-medium mr-4"
          onClick={onEdit}
        >
          <Edit className="h-4 w-4 mr-1" /> Edit
        </Button>
        
        <Button 
          variant="ghost" 
          className="text-amber-600 hover:text-amber-900 font-medium mr-4"
          onClick={onRefer}
          disabled={candidate.status !== "Looking"}
        >
          <Briefcase className="h-4 w-4 mr-1" /> Refer
        </Button>
        
        <Button 
          variant="ghost" 
          className="text-red-600 hover:text-red-900 font-medium"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 mr-1" /> Delete
        </Button>
      </div>
    </Card>
  );
}
