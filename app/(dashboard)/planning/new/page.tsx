'use client';

import React from 'react';
import { useSearchParams } from "next/navigation"
import { PlanTable } from '@/features/planning/components/hiv/PlanTable';
import { CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { usePlanningMetadataStore } from '@/store/planning-metadata';
import { useOnboardingStore } from '@/store/onboarding-store';

export default function HIVNewPlan() {
  const searchParams = useSearchParams();
  const { selectedProgram, selectedFiscalYear, facilityName, facilityDistrict, facilityType } = usePlanningMetadataStore();
  const { 
    province, 
  } = useOnboardingStore();
  const facility = searchParams.get('facility');
  const isHospital = facility !== 'health-centers';

  return (
    <div className="space-y-6">
      <section>
        <CardHeader>
          <div className="flex flex-col gap-2 mb-4">
            <p>{facilityType}: {facilityName}</p>
            <p>{"District: "}{" "}{facilityDistrict}{","}{" "}{province}</p>
            <p>Period: {selectedFiscalYear}</p>
            <p>Program: {selectedProgram}{" "}{"Program"}</p>
          </div>
          <CardDescription>
            Plan activities and allocate budgets across quarters.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-auto mb-4">
          <PlanTable isHospital={isHospital} />
        </CardContent>
      </section>
    </div>
  );
}