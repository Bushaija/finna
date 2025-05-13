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
import { PlanActivityRow } from './PlanActivityRow';
import { PlanGeneralTotalRow } from './PlanGeneralTotalRow';
import { 
  Activity, 
  Plan, 
  generateDefaultActivities,
  planSchema,
  createEmptyActivity
} from '../../schema/hiv/schemas';
import { HEALTH_CENTER_ACTIVITIES } from '@/constants/hiv-data/healthCenterActivities';
import { HOSPITAL_ACTIVITIES } from '@/constants/hiv-data/hospitalActivities';
import { useRouter } from 'next/navigation';

interface PlanTableProps {
  isHospital?: boolean;
  initialActivities?: Activity[];
  isEdit?: boolean;
  planId?: string;
}

export function PlanTable({ 
  isHospital = false, 
  initialActivities,
  isEdit = false,
  planId
}: PlanTableProps) {
  const router = useRouter();
  const activityCategories = isHospital ? HOSPITAL_ACTIVITIES : HEALTH_CENTER_ACTIVITIES;
  
  const form = useForm<Plan>({
    resolver: zodResolver(planSchema) as any,
    defaultValues: {
      activities: initialActivities || generateDefaultActivities(isHospital)
    }
  });
  
  const { watch, handleSubmit } = form;
  const activities = watch('activities');
  
  // Function to organize activities by category
  const organizeActivitiesByCategory = () => {
    const categorizedActivities: Record<string, Activity[]> = {};
    
    activities.forEach(activity => {
      const category = activity.activityCategory;
      if (!categorizedActivities[category]) {
        categorizedActivities[category] = [];
      }
      categorizedActivities[category].push(activity);
    });
    
    return categorizedActivities;
  };
  
  const categorizedActivities = organizeActivitiesByCategory();
  
  // Find index of an activity in the full activities array
  const getActivityIndex = (activity: Activity) => {
    return activities.findIndex(
      a => a.activityCategory === activity.activityCategory && 
           a.typeOfActivity === activity.typeOfActivity &&
           a.activity === activity.activity
    );
  };
  
  const onSubmit: SubmitHandler<any> = (data) => {
    console.log('Form submitted:', data as Plan);
    // Here you would typically save this data to your backend
    alert('Plan saved successfully!');
    
    // If we're editing an existing plan, redirect back to the planning list
    if (isEdit) {
      router.push('/planning');
    }
  };
  
  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="rounded-md border overflow-auto">
          <Table className="min-w-max">
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead className="w-[160px]">Activity Category</TableHead>
                <TableHead className="w-[200px]">Type of Activity</TableHead>
                <TableHead className="w-[80px]">Frequency</TableHead>
                <TableHead className="w-[80px]">Unit Cost</TableHead>
                <TableHead className="w-[80px]">Count Q1<br/>(Jul-Sep)</TableHead>
                <TableHead className="w-[80px]">Count Q2<br/>(Oct-Dec)</TableHead>
                <TableHead className="w-[80px]">Count Q3<br/>(Jan-Mar)</TableHead>
                <TableHead className="w-[80px]">Count Q4<br/>(Apr-Jun)</TableHead>
                <TableHead className="w-[80px]">Amount<br/>Q1</TableHead>
                <TableHead className="w-[80px]">Amount<br/>Q2</TableHead>
                <TableHead className="w-[80px]">Amount<br/>Q3</TableHead>
                <TableHead className="w-[80px]">Amount<br/>Q4</TableHead>
                <TableHead className="w-[100px]">Total Budget</TableHead>
                <TableHead className="w-[160px]">Comment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(activityCategories).map(([category, entries]) => {
                // First, render the category row
                const categoryActivities = categorizedActivities[category] || [];
                const firstCategoryActivity = categoryActivities[0] || createEmptyActivity(category, '');
                
                // Calculate category totals
                const categoryTotals = {
                  activityCategory: category,
                  typeOfActivity: '',
                  activity: '',
                  frequency: 0,
                  unitCost: 0,
                  countQ1: 0,
                  countQ2: 0,
                  countQ3: 0,
                  countQ4: 0,
                  amountQ1: categoryActivities.reduce((sum, act) => sum + (act.amountQ1 || 0), 0),
                  amountQ2: categoryActivities.reduce((sum, act) => sum + (act.amountQ2 || 0), 0),
                  amountQ3: categoryActivities.reduce((sum, act) => sum + (act.amountQ3 || 0), 0),
                  amountQ4: categoryActivities.reduce((sum, act) => sum + (act.amountQ4 || 0), 0),
                  totalBudget: categoryActivities.reduce((sum, act) => sum + (act.totalBudget || 0), 0),
                  comment: ''
                };
                
                return (
                  <React.Fragment key={category}>
                    {/* Category Row */}
                    <PlanActivityRow
                      activity={categoryTotals}
                      index={-1} // Special index to indicate this is a category row
                      form={form}
                      isSubCategory={false}
                    />
                    
                    {/* Activity Rows */}
                    {entries.map((entry, entryIndex) => {
                      const activity = categoryActivities.find(
                        a => a.typeOfActivity === entry.typeOfActivity && a.activity === entry.activity
                      ) || createEmptyActivity(category, entry.typeOfActivity, entry.activity);
                      
                      return (
                        <PlanActivityRow
                          key={`${category}-${entry.typeOfActivity}-${entryIndex}`}
                          activity={activity}
                          index={getActivityIndex(activity)}
                          form={form}
                          isSubCategory={true}
                        />
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </TableBody>
            <TableFooter>
              <PlanGeneralTotalRow activities={activities} />
            </TableFooter>
          </Table>
        </div>
        
        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push('/planning')}
          >
            Cancel
          </Button>
          <Button type="submit">{isEdit ? 'Update Plan' : 'Save Plan'}</Button>
        </div>
      </form>
    </FormProvider>
  );
} 