import { ReferralWithDetails } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, Trash2, MoreHorizontal, Eye, CheckCircle } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import Pagination from "@/components/ui/pagination";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ReferralsTableProps {
  referrals: ReferralWithDetails[];
  isLoading: boolean;
  onDelete: (id: number) => void;
  onUpdateStatus: (id: number, status: string, feeEarned?: number) => void;
}

export default function ReferralsTable({
  referrals,
  isLoading,
  onDelete,
  onUpdateStatus
}: ReferralsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReferral, setSelectedReferral] = useState<ReferralWithDetails | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showFeeDialog, setShowFeeDialog] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [feeAmount, setFeeAmount] = useState<number | undefined>(undefined);
  
  const referralsPerPage = 10;
  
  // Calculate pagination
  const indexOfLastReferral = currentPage * referralsPerPage;
  const indexOfFirstReferral = indexOfLastReferral - referralsPerPage;
  const currentReferrals = referrals.slice(indexOfFirstReferral, indexOfLastReferral);
  const totalPages = Math.ceil(referrals.length / referralsPerPage);
  
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "Referred": return "bg-yellow-100 text-yellow-800";
      case "Interviewing": return "bg-blue-100 text-blue-800";
      case "Hired": return "bg-green-100 text-green-800";
      case "Rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  const handleStatusChange = (referral: ReferralWithDetails, status: string) => {
    setSelectedReferral(referral);
    setNewStatus(status);
    
    if (status === "Hired") {
      setShowFeeDialog(true);
    } else {
      setShowStatusDialog(true);
    }
  };
  
  const confirmStatusChange = () => {
    if (selectedReferral && newStatus) {
      onUpdateStatus(selectedReferral.id, newStatus);
      setShowStatusDialog(false);
      setSelectedReferral(null);
      setNewStatus("");
    }
  };
  
  const confirmFeeAndStatusChange = () => {
    if (selectedReferral && feeAmount !== undefined) {
      onUpdateStatus(selectedReferral.id, "Hired", feeAmount);
      setShowFeeDialog(false);
      setSelectedReferral(null);
      setFeeAmount(undefined);
    }
  };
  
  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <p>Loading referrals...</p>
      </div>
    );
  }
  
  if (referrals.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <p className="text-gray-500">No referrals found. Create your first referral using the button above.</p>
      </div>
    );
  }
  
  return (
    <>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Referral Date</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fee Earned</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentReferrals.map((referral) => (
                <TableRow key={referral.id}>
                  <TableCell className="font-medium">{referral.candidate.fullName}</TableCell>
                  <TableCell>{referral.position.title}</TableCell>
                  <TableCell>{referral.position.company}</TableCell>
                  <TableCell>{formatDate(referral.referralDate)}</TableCell>
                  <TableCell>
                    <Badge variant={referral.mode === "Placement" ? "secondary" : "default"} 
                           className={referral.mode === "Placement" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}>
                      {referral.mode}
                    </Badge>
                    {referral.mode === "Outsource" && referral.feeMonths && 
                      <span className="ml-2 text-xs text-gray-500">({referral.feeMonths} months)</span>
                    }
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusColor(referral.status)}>
                      {referral.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {referral.feeEarned ? formatCurrency(referral.feeEarned) : "--"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {referral.status !== "Referred" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(referral, "Referred")}>
                            <span className="mr-2">🔄</span> Mark as Referred
                          </DropdownMenuItem>
                        )}
                        {referral.status !== "Interviewing" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(referral, "Interviewing")}>
                            <span className="mr-2">📅</span> Mark as Interviewing
                          </DropdownMenuItem>
                        )}
                        {referral.status !== "Hired" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(referral, "Hired")}>
                            <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Mark as Hired
                          </DropdownMenuItem>
                        )}
                        {referral.status !== "Rejected" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(referral, "Rejected")}>
                            <span className="mr-2">❌</span> Mark as Rejected
                          </DropdownMenuItem>
                        )}
                        {/* Always show edit fee option for hired referrals */}
                        {referral.status === "Hired" && (
                          <DropdownMenuItem onClick={() => {
                            setSelectedReferral(referral);
                            setFeeAmount(referral.feeEarned || undefined);
                            setShowFeeDialog(true);
                          }}>
                            <span className="mr-2">💰</span> Edit Fee
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onDelete(referral.id)}>
                          <Trash2 className="mr-2 h-4 w-4 text-red-600" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={referrals.length}
            itemsPerPage={referralsPerPage}
          />
        )}
      </div>
      
      {/* Status Change Confirmation Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Referral Status</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to change the status of this referral to <strong>{newStatus}</strong>?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>Cancel</Button>
            <Button onClick={confirmStatusChange}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Fee Dialog */}
      <Dialog open={showFeeDialog} onOpenChange={setShowFeeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Referral Fee</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">
              {selectedReferral?.mode === "Outsource" ? 
                "Congratulations! Please enter the monthly fee for this outsourcing placement." :
                "Congratulations! Please enter the referral fee earned for this successful placement (typically one month's salary)."}
            </p>
            <div className="space-y-2">
              <Label htmlFor="fee-amount">
                {selectedReferral?.mode === "Outsource" ? "Monthly Fee Amount (₪)" : "One-Time Fee Amount (₪)"}
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">₪</span>
                </div>
                <Input
                  id="fee-amount"
                  type="number"
                  className="pl-7"
                  value={feeAmount || ""}
                  onChange={(e) => setFeeAmount(e.target.value === "" ? undefined : parseFloat(e.target.value))}
                  placeholder="e.g. 25000"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFeeDialog(false)}>Cancel</Button>
            <Button onClick={confirmFeeAndStatusChange} disabled={feeAmount === undefined}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
