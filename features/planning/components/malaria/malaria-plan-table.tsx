'use client';

import React from 'react';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableFooter,
  TableRow, 
  TableHead, 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlanActivityRow } from './malaria-plan-activity-row';
import { PlanGeneralTotalRow } from './malaria-general-total-row';
import { 
  Plan, 
  generateDefaultActivities,
  planSchema
} from '../../schema/malaria/schema';

interface PlanTableProps {
  isHospital?: boolean;
};

export function PlanTable({ isHospital = false }: PlanTableProps) {
  const form = useForm<Plan>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      activities: generateDefaultActivities(isHospital)
    }
  });
  
  const { watch, handleSubmit } = form;
  const activities = watch('activities');
  
  const onSubmit: SubmitHandler<Plan> = (data) => {
    console.log('Form submitted:', data);
    // Here you would typically save this data to your backend
    alert('Plan saved successfully!');
  };
  
  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="rounded-md border overflow-auto">
          <Table className="min-w-max">
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead className="w-[160px]">Activity</TableHead>
                <TableHead className="w-[200px]">Activity Description</TableHead>
                <TableHead className="w-[120px]">Quantity</TableHead>
                <TableHead className="w-[120px]">Frequency</TableHead>
                <TableHead className="w-[120px]">Unit Cost</TableHead>
                <TableHead className="w-[80px] text-center">Amount<br/>Q1</TableHead>
                <TableHead className="w-[80px] text-center">Amount<br/>Q2</TableHead>
                <TableHead className="w-[80px] text-center">Amount<br/>Q3</TableHead>
                <TableHead className="w-[80px] text-center">Amount<br/>Q4</TableHead>
                <TableHead className="w-[100px] text-center">Annual Budget</TableHead>
                <TableHead className="w-[160px] text-center">Comment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity, index) => (
                <PlanActivityRow 
                  key={activity.id || index}
                  activity={activity}
                  index={index}
                  form={form}
                />
              ))}
            </TableBody>
            <TableFooter>
              <PlanGeneralTotalRow activities={activities} />
            </TableFooter>
          </Table>
        </div>
        
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline">Cancel</Button>
          <Button type="submit">Save Plan</Button>
        </div>
      </form>
    </FormProvider>
  );
} 