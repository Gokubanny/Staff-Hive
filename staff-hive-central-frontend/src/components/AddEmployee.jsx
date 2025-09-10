import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { useData } from "@/contexts/DataContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function AddEmployee({ isOpen, onClose, editingEmployee }) {
  const { addEmployee, updateEmployee } = useData();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    position: "",
    department: "",
    salary: "",
  });

  useEffect(() => {
    if (editingEmployee) {
      setFormData({
        name: editingEmployee.name,
        email: editingEmployee.email,
        position: editingEmployee.position,
        department: editingEmployee.department || "",
        salary: editingEmployee.salary || "",
      });
    } else {
      setFormData({ name: "", email: "", position: "", department: "", salary: "" });
    }
  }, [editingEmployee]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const employeeData = {
      ...formData,
      salary: parseFloat(formData.salary) || 0,
    };
    
    if (editingEmployee) {
      updateEmployee(editingEmployee.id, employeeData);
      toast({
        title: "Employee updated",
        description: "Employee information has been updated successfully.",
      });
    } else {
      addEmployee(employeeData);
      toast({
        title: "Employee added",
        description: "New employee has been added successfully.",
      });
    }
    
    setFormData({ name: "", email: "", position: "", department: "", salary: "" });
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded bg-white p-6 space-y-4">
          <Dialog.Title className="text-xl font-bold">
            {editingEmployee ? "Edit Employee" : "Add Employee"}
          </Dialog.Title>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              type="text"
              placeholder="Position"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              required
            />
            <Input
              type="text"
              placeholder="Department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              required
            />
            <Input
              type="number"
              placeholder="Salary"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              min="0"
              step="0.01"
              required
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 text-white">
                {editingEmployee ? "Update" : "Save"}
              </Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}



