import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useJobs } from '@/contexts/JobContext';
import { useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

export default function ProfileSettings() {
  const { company = {}, updateCompany, isLoading } = useJobs();
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();
  
  useEffect(() => {
    if (!isLoading) {
      reset({
        firstName: company?.name?.split(' ')[0] || '',
        lastName: company?.name?.split(' ')[1] || '',
        email: company?.contactEmail || '',
        phone: company?.phone || ''
      });
    }
  }, [company, reset, isLoading]);

  const onSubmit = async (data) => {
    try {
      const updatedName = `${data.firstName} ${data.lastName}`;
      await updateCompany({
        name: updatedName,
        contactEmail: data.email,
        phone: data.phone
      });
      toast({
        title: "Profile updated",
        description: "Your changes have been saved",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    }
  };

  if (isLoading) return <div className="p-8">Loading profile data...</div>;

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center gap-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src="/avatar.jpg" />
          <AvatarFallback>
            {company?.name?.split(' ').map(n => n[0]).join('') || 'AD'}
          </AvatarFallback>
        </Avatar>
        <div>
          <Button variant="outline" className="mr-3">Upload Photo</Button>
          <Button variant="ghost" className="text-red-500">Remove</Button>
          <p className="text-sm text-muted-foreground mt-2">JPG, GIF or PNG. Max size 2MB</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>First Name</Label>
            <Input {...register("firstName")} placeholder="John" />
          </div>
          <div>
            <Label>Last Name</Label>
            <Input {...register("lastName")} placeholder="Doe" />
          </div>
        </div>

        <div>
          <Label>Email</Label>
          <Input {...register("email")} type="email" placeholder="john@company.com" />
        </div>

        <div>
          <Label>Phone Number</Label>
          <Input {...register("phone")} placeholder="+1 (555) 000-0000" />
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Button variant="outline">Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}