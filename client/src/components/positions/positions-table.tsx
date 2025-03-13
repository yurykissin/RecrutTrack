import { Position } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, UserPlus } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import Pagination from "@/components/ui/pagination";
import { useState } from "react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

interface PositionsTableProps {
  positions: Position[];
  isLoading: boolean;
  onEdit: (position: Position) => void;
  onDelete: (id: number) => void;
}

export default function PositionsTable({
  positions,
  isLoading,
  onEdit,
  onDelete
}: PositionsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const positionsPerPage = 10;
  
  // Calculate pagination
  const indexOfLastPosition = currentPage * positionsPerPage;
  const indexOfFirstPosition = indexOfLastPosition - positionsPerPage;
  const currentPositions = positions.slice(indexOfFirstPosition, indexOfLastPosition);
  const totalPages = Math.ceil(positions.length / positionsPerPage);
  
  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <p>Loading positions...</p>
      </div>
    );
  }
  
  if (positions.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <p className="text-gray-500">No positions found. Add your first position using the button above.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Salary Range</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Added</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPositions.map((position) => (
              <TableRow key={position.id}>
                <TableCell className="font-medium">{position.title}</TableCell>
                <TableCell>{position.company}</TableCell>
                <TableCell>{position.location}</TableCell>
                <TableCell>
                  {formatCurrency(position.salaryMin)} - {formatCurrency(position.salaryMax)}
                </TableCell>
                <TableCell>
                  <Badge variant={position.status === "Open" ? "success" : "secondary"}>
                    {position.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(position.dateAdded)}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(position)}
                      title="Edit"
                    >
                      <Edit className="h-4 w-4 text-indigo-600 hover:text-indigo-900" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(position.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-red-600 hover:text-red-900" />
                    </Button>
                    <Link href="/candidates">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Add referral"
                      >
                        <UserPlus className="h-4 w-4 text-amber-600 hover:text-amber-900" />
                      </Button>
                    </Link>
                  </div>
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
          totalItems={positions.length}
          itemsPerPage={positionsPerPage}
        />
      )}
    </div>
  );
}
