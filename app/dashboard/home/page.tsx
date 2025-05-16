"use client"
import React, { useEffect, useMemo, useState } from "react";
import { useOnboardingStore } from '@/store/onboarding-store';
import { useRouter } from 'next/navigation';
import { DashboardCard } from '@/components/dashboard-card';
import facilitiesData from '@/constants/facilities-data.json';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

// Define types for the facilities data
type Program = {
  name: string;
  status: boolean;
}

type FacilityData = {
  program: string;
  "facility-type": string;
  hospitals: string[];
  "health-centers": string[];
};

// Skeleton component for health center cards
const HealthCenterCardSkeleton = () => {
  return (
    <Card className="w-full p-4 space-y-4">
      <div className="flex flex-row gap-2">
        <Skeleton className="w-[40px] h-[40px] rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-[180px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
      </div>
      <Skeleton className="h-0.5 w-full my-2" />
      <div className="pt-2 space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-[80px]" />
          <Skeleton className="h-4 w-[60px]" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-[40px]" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-[90px]" />
          <Skeleton className="h-4 w-[40px]" />
        </div>
      </div>
      <div className="pt-4 flex justify-between">
        <Skeleton className="h-9 w-[100px] rounded-md" />
        <Skeleton className="h-9 w-[70px] rounded-md" />
      </div>
    </Card>
  );
};

const MainPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [facilityPrograms, setFacilityPrograms] = useState<Program[]>([]);
  const [healthCenters, setHealthCenters] = useState<string[]>([]);

  const reportingPeriodOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [
      { value: `Q1 FY ${currentYear}`, label: `Q1 FY ${currentYear}` },
      { value: `Q2 FY ${currentYear}`, label: `Q2 FY ${currentYear}` },
      { value: `Q3 FY ${currentYear + 1}`, label: `Q3 FY ${currentYear + 1}` },
      { value: `Q4 FY ${currentYear + 1}`, label: `Q4 FY ${currentYear + 1}` },
    ];
  }, []);
  const [reportingPeriod, setReportingPeriod] = useState(reportingPeriodOptions[0]?.value || "");

  
  // Pagination state
  const pageSize = 4; // Number of health centers per page
  const [currentPage, setCurrentPage] = useState(1);
  const [isChangingPage, setIsChangingPage] = useState(false);
  
  const { 
    isCompleted, 
    completedAt, 
    province, 
    district, 
    hospital,
    name,
    email
  } = useOnboardingStore();
 
  // Function to find facility data based on hospital name
  const getFacilityData = () => {
    if (!hospital) return;

    // Convert both to lowercase and trim for comparison to handle case sensitivity and whitespace
    const normalizedHospital = hospital.toLowerCase().trim();
    
    // Get all programs available for this hospital
    const programsForHospital: Program[] = [];
    const allHealthCenters: string[] = [];
    
    facilitiesData.forEach((facility: FacilityData) => {
      const hospitalExists = facility.hospitals.some(
        h => h.toLowerCase().trim() === normalizedHospital
      );
      
      if (hospitalExists) {
        // Add this program to the list
        programsForHospital.push({
          name: facility.program.toUpperCase(),
          status: true
        });
        
        // Add health centers for this hospital program
        allHealthCenters.push(...facility["health-centers"]);
      }
    });
    
    // Remove duplicates from health centers array
    const uniqueHealthCenters = [...new Set(allHealthCenters)];
    
    setFacilityPrograms(programsForHospital);
    setHealthCenters(uniqueHealthCenters);
  };

  useEffect(() => {
    // Add a small delay to ensure store is hydrated
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (!isCompleted) {
        router.push('/');
      } else {
        getFacilityData();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [isCompleted, router, hospital]);

  // Show loading state while checking onboarding status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  // Get paginated health centers
  const paginatedHealthCenters = healthCenters.slice(
    (currentPage - 1) * pageSize, 
    currentPage * pageSize
  );

  // Calculate total pages
  const totalPages = Math.ceil(healthCenters.length / pageSize);

  // Handle page changes
  const handlePageChange = (page: number) => {
    if (page === currentPage) return;
    
    // Show skeleton loading state
    setIsChangingPage(true);
    
    // Scroll to the health centers section for better UX
    const healthCentersSection = document.getElementById('health-centers-section');
    if (healthCentersSection) {
      healthCentersSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Add a small delay to simulate loading and show skeleton
    setTimeout(() => {
      setCurrentPage(page);
      setIsChangingPage(false);
    }, 500); // 500ms delay to show skeleton loading state
  };

  // Debug information
  console.log('Onboarding State:', {
    isCompleted,
    completedAt,
    province,
    district,
    hospital,
    name,
    email
  });

  return (
    <div className="p-4">
      {/* <Card className="p-6 max-w-2xl mx-auto mb-8">
        <h1 className="text-2xl font-bold mb-6">Welcome to Your Dashboard</h1>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{name || 'N/A'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{email || 'N/A'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Onboarding Completed</p>
              <p className="font-medium">
                {completedAt ? new Date(completedAt).toLocaleString() : 'N/A'}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Province</p>
              <p className="font-medium capitalize">{province || 'N/A'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">District</p>
              <p className="font-medium capitalize">{district || 'N/A'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Hospital</p>
              <p className="font-medium capitalize">{hospital || 'N/A'}</p>
            </div>
          </div>
          
          <div className="mt-8 pt-4 border-t border-gray-200">
            <button 
              onClick={handleResetOnboarding}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
            >
              Reset Onboarding (Dev Only)
            </button>
          </div>
        </div>
      </Card> */}
      <div className="flex flex-col gap-8">
        <DashboardCard 
          healthFacilityType={"Hospital"}
          healthFacilityName={hospital}
          district={district}
          programs={facilityPrograms}
          reportingPeriodOptions={reportingPeriodOptions}
        />
      
        {healthCenters.length > 0 && (
          <>
            <div id="health-centers-section" className="flex flex-col gap-6">
              <h2 className="text-xl font-semibold">Associated Health Centers</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {isChangingPage ? (
                  // Show skeleton cards while changing page
                  Array.from({ length: pageSize }).map((_, index) => (
                    <HealthCenterCardSkeleton key={index} />
                  ))
                ) : (
                  // Show actual health center cards
                  paginatedHealthCenters.map((center, index) => (
                    <DashboardCard 
                      key={`${currentPage}-${index}`}
                      reportingPeriod={reportingPeriod}
                      healthFacilityType={"Health Center"}
                      healthFacilityName={center}
                      district={district}
                      programs={facilityPrograms}
                      reportingPeriodOptions={reportingPeriodOptions}
                    />
                  ))
                )}
              </div>
              
              {totalPages > 1 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          aria-disabled={currentPage === 1}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalPages }).map((_, index) => {
                        const page = index + 1;
                        // Show first page, last page, and pages around the current page
                        if (
                          page === 1 || 
                          page === totalPages || 
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink 
                                isActive={currentPage === page}
                                onClick={() => handlePageChange(page)}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }
                        
                        // Show ellipsis for skipped pages
                        if (
                          (page === 2 && currentPage > 3) || 
                          (page === totalPages - 1 && currentPage < totalPages - 2)
                        ) {
                          return (
                            <PaginationItem key={`ellipsis-${page}`}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                        
                        return null;
                      })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          aria-disabled={currentPage === totalPages}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* {hospital && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard 
            healthFacilityType={"Hospital"}
            healthFacilityName={hospital}
            district={district}
            programs={facilityPrograms}
          />
          
          {healthCenters.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Associated Health Centers</h2>
              <ul className="space-y-2 max-h-[400px] overflow-y-auto">
                {healthCenters.map((center, index) => (
                  <li key={index} className="capitalize text-sm px-3 py-2 bg-gray-50 rounded-md">
                    {center}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )} */}
    </div>
  );
};

export default MainPage;

