import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PositionFilters from "@/components/positions/position-filters";
import PositionsTable from "@/components/positions/positions-table";
import PositionModal from "@/components/modals/position-modal";
import { Position, InsertPosition } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Positions() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: positions = [], isLoading } = useQuery<Position[]>({
    queryKey: ['/api/positions'],
  });
  
  const createPositionMutation = useMutation({
    mutationFn: async (positionData: InsertPosition) => {
      const res = await apiRequest("POST", "/api/positions", positionData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/positions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      toast({
        title: "Position created",
        description: "The position has been successfully created.",
      });
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error creating position",
        description: error.message || "There was an error creating the position.",
        variant: "destructive",
      });
    },
  });
  
  const updatePositionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertPosition> }) => {
      const res = await apiRequest("PUT", `/api/positions/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/positions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      toast({
        title: "Position updated",
        description: "The position has been successfully updated.",
      });
      setIsModalOpen(false);
      setSelectedPosition(null);
    },
    onError: (error) => {
      toast({
        title: "Error updating position",
        description: error.message || "There was an error updating the position.",
        variant: "destructive",
      });
    },
  });
  
  const deletePositionMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/positions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/positions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      toast({
        title: "Position deleted",
        description: "The position has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting position",
        description: error instanceof Error && error.message ? 
          error.message : 
          "The position may have associated referrals and cannot be deleted.",
        variant: "destructive",
      });
    },
  });
  
  const handleAddPosition = () => {
    setSelectedPosition(null);
    setIsModalOpen(true);
  };
  
  const handleEditPosition = (position: Position) => {
    setSelectedPosition(position);
    setIsModalOpen(true);
  };
  
  const handleDeletePosition = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this position?")) {
      await deletePositionMutation.mutate(id);
    }
  };
  
  const handleSavePosition = async (positionData: InsertPosition) => {
    if (selectedPosition) {
      await updatePositionMutation.mutate({ id: selectedPosition.id, data: positionData });
    } else {
      await createPositionMutation.mutate(positionData);
    }
  };
  
  // Filter positions based on search and filters
  const filteredPositions = positions.filter((position) => {
    // Search query filter
    const matchesSearch = 
      searchQuery === "" || 
      position.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      position.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      position.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = 
      statusFilter === "all" || 
      position.status.toLowerCase() === statusFilter.toLowerCase();
    
    // Company filter
    const matchesCompany = 
      companyFilter === "all" || 
      position.company.toLowerCase() === companyFilter.toLowerCase();
    
    // Location filter
    const matchesLocation = 
      locationFilter === "all" || 
      position.location.toLowerCase() === locationFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesCompany && matchesLocation;
  });
  
  // Get unique companies and locations for filters
  const companies = Array.from(new Set(positions.map(p => p.company)));
  const locations = Array.from(new Set(positions.map(p => p.location)));
  
  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Open Positions</h1>
          <p className="text-gray-600">Manage job openings and opportunities</p>
        </div>
        <Button onClick={handleAddPosition}>
          <Plus className="mr-2 h-4 w-4" /> Add Position
        </Button>
      </div>
      
      <PositionFilters
        onSearchChange={setSearchQuery}
        onStatusChange={setStatusFilter}
        onCompanyChange={setCompanyFilter}
        onLocationChange={setLocationFilter}
        companies={companies}
        locations={locations}
      />
      
      <PositionsTable
        positions={filteredPositions}
        isLoading={isLoading}
        onEdit={handleEditPosition}
        onDelete={handleDeletePosition}
      />
      
      {isModalOpen && (
        <PositionModal
          position={selectedPosition}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedPosition(null);
          }}
          onSave={handleSavePosition}
          isSubmitting={createPositionMutation.isPending || updatePositionMutation.isPending}
        />
      )}
    </div>
  );
}
