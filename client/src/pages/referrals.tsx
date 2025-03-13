import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ReferralFilters from "@/components/referrals/referral-filters";
import ReferralsTable from "@/components/referrals/referrals-table";
import ReferralModal from "@/components/modals/referral-modal";
import { Candidate, Position, ReferralWithDetails, InsertReferral } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format";
import { CheckCircle, DollarSign, HandshakeIcon } from "lucide-react";

export default function Referrals() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: referrals = [], isLoading } = useQuery<ReferralWithDetails[]>({
    queryKey: ['/api/referrals'],
  });
  
  const { data: candidates = [] } = useQuery<Candidate[]>({
    queryKey: ['/api/candidates'],
  });
  
  const { data: positions = [] } = useQuery<Position[]>({
    queryKey: ['/api/positions'],
  });
  
  const deleteReferralMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/referrals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/referrals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      toast({
        title: "Referral deleted",
        description: "The referral has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting referral",
        description: error.message || "There was an error deleting the referral.",
        variant: "destructive",
      });
    },
  });
  
  const updateReferralMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertReferral> }) => {
      const res = await apiRequest("PUT", `/api/referrals/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/referrals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      toast({
        title: "Referral updated",
        description: "The referral has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating referral",
        description: error.message || "There was an error updating the referral.",
        variant: "destructive",
      });
    },
  });
  
  const handleAddReferral = () => {
    setIsModalOpen(true);
  };
  
  const handleDeleteReferral = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this referral?")) {
      await deleteReferralMutation.mutate(id);
    }
  };
  
  const handleUpdateReferralStatus = async (id: number, status: string, feeEarned?: number) => {
    const updateData: Partial<InsertReferral> = { status };
    if (status === "Hired" && feeEarned) {
      updateData.feeEarned = feeEarned;
    }
    await updateReferralMutation.mutate({ id, data: updateData });
  };
  
  // Filter referrals based on search and filters
  const filteredReferrals = referrals.filter((referral) => {
    // Search query filter
    const matchesSearch = 
      searchQuery === "" || 
      referral.candidate.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      referral.position.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      referral.position.company.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = 
      statusFilter === "all" || 
      referral.status.toLowerCase() === statusFilter.toLowerCase();
    
    // Company filter
    const matchesCompany = 
      companyFilter === "all" || 
      referral.position.company.toLowerCase() === companyFilter.toLowerCase();
    
    // Date filter
    let matchesDate = true;
    const referralDate = new Date(referral.referralDate);
    const now = new Date();
    
    if (dateFilter === "30days") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      matchesDate = referralDate >= thirtyDaysAgo;
    } else if (dateFilter === "90days") {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(now.getDate() - 90);
      matchesDate = referralDate >= ninetyDaysAgo;
    } else if (dateFilter === "year") {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      matchesDate = referralDate >= startOfYear;
    }
    
    return matchesSearch && matchesStatus && matchesCompany && matchesDate;
  });
  
  // Calculate referral stats
  const totalReferrals = referrals.length;
  const successfulReferrals = referrals.filter(r => r.status === "Hired").length;
  const totalFeesEarned = referrals
    .filter(r => r.status === "Hired" && r.feeEarned)
    .reduce((sum, r) => sum + (r.feeEarned || 0), 0);
  
  // Get unique companies for filter
  const companies = Array.from(new Set(referrals.map(r => r.position.company)));
  
  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Referrals</h1>
          <p className="text-gray-600">Track your referrals and their statuses</p>
        </div>
        <Button onClick={handleAddReferral}>
          <Plus className="mr-2 h-4 w-4" /> Add Referral
        </Button>
      </div>
      
      {/* Referral Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
              <HandshakeIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-gray-500 text-sm">Total Referrals</h3>
              <p className="text-2xl font-semibold text-gray-900">{totalReferrals}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-gray-500 text-sm">Successful Referrals</h3>
              <p className="text-2xl font-semibold text-gray-900">{successfulReferrals}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <DollarSign className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-gray-500 text-sm">Total Fees Earned</h3>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalFeesEarned)}</p>
            </div>
          </div>
        </Card>
      </div>
      
      <ReferralFilters
        onSearchChange={setSearchQuery}
        onStatusChange={setStatusFilter}
        onCompanyChange={setCompanyFilter}
        onDateChange={setDateFilter}
        companies={companies}
      />
      
      <ReferralsTable
        referrals={filteredReferrals}
        isLoading={isLoading}
        onDelete={handleDeleteReferral}
        onUpdateStatus={handleUpdateReferralStatus}
      />
      
      {isModalOpen && (
        <ReferralModal
          positions={positions.filter(p => p.status === "Open")}
          candidates={candidates.filter(c => c.status === "Looking")}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
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
