import React, { useState, useEffect } from 'react';
import axiosClient from '@/api/axiosClient';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface Department {
  id: string;
  name: string;
}

interface DepartmentSelectProps {
  onValueChange: (value: string) => void;
  value: string;
  isPublic?: boolean;
}

const DepartmentSelect: React.FC<DepartmentSelectProps> = ({ onValueChange, value, isPublic = false }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const url = isPublic ? '/public/departments' : '/departments';
        const response = await axiosClient.get(url);
        setDepartments(response.data);
      } catch (error) {
        console.error('Failed to fetch departments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, [isPublic]);

  return (
    <div>
      <Label htmlFor="department">
        Department <span className="text-red-500">*</span>
      </Label>
      <Select onValueChange={onValueChange} value={value} disabled={loading}>
        <SelectTrigger id="department" className="w-full mt-1">
          <SelectValue placeholder={loading ? "Loading..." : "Select a department"} />
        </SelectTrigger>
        <SelectContent>
          {departments.map((dept) => (
            <SelectItem key={dept.id} value={dept.id}>
              {dept.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default DepartmentSelect;
