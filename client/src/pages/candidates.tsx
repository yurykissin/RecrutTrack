import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CandidateFilters from "@/components/candidates/candidate-filters";
import CandidateCard from "@/components/candidates/candidate-card";
import CandidateModal from "@/components/modals/candidate-modal";
import ReferralModal from "@/components/modals/referral-modal";
import { Candidate, InsertCandidate, Position } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Pagination from "@/components/ui/pagination";

export default function Candidates() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [skillFilter, setSkillFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: candidates = [], isLoading } = useQuery<Candidate[]>({
    queryKey: ['/api/candidates'],
  });
  
  const { data: positions = [] } = useQuery<Position[]>({
    queryKey: ['/api/positions'],
  });
  
  const createCandidateMutation = useMutation({
    mutationFn: async (candidateData: InsertCandidate) => {
      const res = await apiRequest("POST", "/api/candidates", candidateData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/candidates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      toast({
        title: "Candidate created",
        description: "The candidate has been successfully created.",
      });
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error creating candidate",
        description: error.message || "There was an error creating the candidate.",
        variant: "destructive",
      });
    },
  });
  
  const updateCandidateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertCandidate> }) => {
      const res = await apiRequest("PUT", `/api/candidates/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/candidates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      toast({
        title: "Candidate updated",
        description: "The candidate has been successfully updated.",
      });
      setIsModalOpen(false);
      setSelectedCandidate(null);
    },
    onError: (error) => {
      toast({
        title: "Error updating candidate",
        description: error.message || "There was an error updating the candidate.",
        variant: "destructive",
      });
    },
  });
  
  const deleteCandidateMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/candidates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/candidates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      toast({
        title: "Candidate deleted",
        description: "The candidate has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting candidate",
        description: error instanceof Error && error.message ? 
          error.message : 
          "The candidate may have associated referrals and cannot be deleted.",
        variant: "destructive",
      });
    },
  });
  
  const handleAddCandidate = () => {
    setSelectedCandidate(null);
    setIsModalOpen(true);
  };
  
  const handleEditCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
  };
  
  const handleDeleteCandidate = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this candidate?")) {
      await deleteCandidateMutation.mutate(id);
    }
  };
  
  const handleReferCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsReferralModalOpen(true);
  };
  
  const handleSaveCandidate = async (candidateData: InsertCandidate) => {
    if (selectedCandidate) {
      await updateCandidateMutation.mutate({ id: selectedCandidate.id, data: candidateData });
    } else {
      await createCandidateMutation.mutate(candidateData);
    }
  };
  
  // Filter candidates based on search and filters
  const filteredCandidates = candidates.filter((candidate) => {
    // Search query filter
    const matchesSearch = 
      searchQuery === "" || 
      candidate.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.currentRole.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = 
      statusFilter === "all" || 
      candidate.status.toLowerCase() === statusFilter.toLowerCase();
    
    // Skill filter
    const matchesSkill = 
      skillFilter === "all" || 
      candidate.skills.toLowerCase().includes(skillFilter.toLowerCase());
    
    // Availability filter
    const matchesAvailability = 
      availabilityFilter === "all" || 
      candidate.availability.toLowerCase() === availabilityFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesSkill && matchesAvailability;
  });
  
  // Get unique skills and availability for filters
  const allSkills = candidates
    .flatMap(c => c.skills.split(","))
    .map(s => s.trim())
    .filter((s, i, arr) => arr.indexOf(s) === i);
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
          <p className="text-gray-600">Manage potential candidates for referrals</p>
        </div>
        <Button onClick={handleAddCandidate}>
          <Plus className="mr-2 h-4 w-4" /> Add Candidate
        </Button>
      </div>
      
      <CandidateFilters
        onSearchChange={setSearchQuery}
        onStatusChange={setStatusFilter}
        onSkillChange={setSkillFilter}
        onAvailabilityChange={setAvailabilityFilter}
        skills={allSkills}
      />
      
      {isLoading ? (
        <div className="mt-8 text-center">Loading candidates...</div>
      ) : paginatedCandidates.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {paginatedCandidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                onEdit={() => handleEditCandidate(candidate)}
                onDelete={() => handleDeleteCandidate(candidate.id)}
                onRefer={() => handleReferCandidate(candidate)}
              />
            ))}
          </div>
          
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredCandidates.length}
              itemsPerPage={itemsPerPage}
            />
          )}
        </>
      ) : (
        <div className="mt-8 text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No candidates found matching your criteria.</p>
        </div>
      )}
      
      {isModalOpen && (
        <CandidateModal
          candidate={selectedCandidate}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCandidate(null);
          }}
          onSave={handleSaveCandidate}
          isSubmitting={createCandidateMutation.isPending || updateCandidateMutation.isPending}
        />
      )}
      
      {isReferralModalOpen && selectedCandidate && (
        <ReferralModal
          candidate={selectedCandidate}
          positions={positions.filter(p => p.status === "Open")}
          isOpen={isReferralModalOpen}
          onClose={() => {
            setIsReferralModalOpen(false);
            setSelectedCandidate(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['/api/referrals'] });
            queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
            queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
          }}
        />
      )}
    </div>
  );
}
