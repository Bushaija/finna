'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Download, Printer, Share2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import planningData from '@/constants/planning-data.json';
import { Activity } from '@/features/planning/schema/hiv/schemas';

interface PlanningRecord {
  id: string;
  facilityName: string;
  facilityType: string;
  facilityDistrict: string;
  province: string;
  program: string;
  fiscalYear: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  activities: Activity[];
}

export default function PlanDetails() {
  const router = useRouter();
  const params = useParams();
  const planId = params.id as string;
  
  const [plan, setPlan] = useState<PlanningRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Fetch plan data from the JSON file
    const foundPlan = planningData.find(plan => plan.id === planId);
    
    if (foundPlan) {
      setPlan(foundPlan as PlanningRecord);
    } else {
      // Handle if plan not found
      alert('Plan not found');
      router.push('/planning');
    }
    
    setIsLoading(false);
  }, [planId, router]);
  
  // Helper functions
  const calculateQuarterTotal = (quarter: 'amountQ1' | 'amountQ2' | 'amountQ3' | 'amountQ4') => {
    return plan?.activities.reduce((sum, activity) => sum + (activity[quarter] || 0), 0) || 0;
  };
  
  const calculateTotalBudget = () => {
    return plan?.activities.reduce((sum, activity) => sum + (activity.totalBudget || 0), 0) || 0;
  };
  
  const formatCurrency = (amount: number | undefined) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };
  
  const getStatusBadge = (status: string) => {
    const statusText = status.replace('_', ' ');
    switch (status.toLowerCase()) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">{statusText}</Badge>;
      case 'pending_approval':
        return <Badge className="bg-yellow-100 text-yellow-800">{statusText}</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-100 text-blue-800">{statusText}</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">{statusText}</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{statusText}</Badge>;
    }
  };
  
  const calculateCategoryTotals = () => {
    if (!plan) return {};
    
    return plan.activities.reduce((acc, activity) => {
      const category = activity.activityCategory;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += activity.totalBudget || 0;
      return acc;
    }, {} as Record<string, number>);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Helper functions to calculate amounts safely
  const calculateCategoryTotalForQuarter = (activities: Activity[], quarter: 'amountQ1' | 'amountQ2' | 'amountQ3' | 'amountQ4') => {
    return activities.reduce((sum, a) => sum + (a[quarter] || 0), 0);
  };
  
  if (isLoading || !plan) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const categoryTotals = calculateCategoryTotals();
  const totalBudget = calculateTotalBudget();
  
  // Calculate percentage for each quarter
  const q1Percentage = Math.round((calculateQuarterTotal('amountQ1') / totalBudget) * 100) || 0;
  const q2Percentage = Math.round((calculateQuarterTotal('amountQ2') / totalBudget) * 100) || 0;
  const q3Percentage = Math.round((calculateQuarterTotal('amountQ3') / totalBudget) * 100) || 0;
  const q4Percentage = Math.round((calculateQuarterTotal('amountQ4') / totalBudget) * 100) || 0;

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto py-6 px-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.push('/planning')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Fiscal Year Plan: {plan.fiscalYear}</h1>
                <p className="text-gray-500">{plan.facilityName} {plan.facilityType} • {plan.program} Program</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" /> Export
              </Button>
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" /> Print
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" /> Share
              </Button>
              <Button onClick={() => router.push(`/planning/edit/${plan.id}`)}>
                <Edit className="h-4 w-4 mr-2" /> Edit Plan
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">
        {/* Plan Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="col-span-2">
            <CardHeader className="pb-2">
              <CardTitle>Plan Overview</CardTitle>
              <CardDescription>Comprehensive financial information for {plan.fiscalYear}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4">
                <div>
                  <p className="text-sm text-gray-500">Facility</p>
                  <p className="font-medium">{plan.facilityName} {plan.facilityType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{plan.facilityDistrict}, {plan.province}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Program</p>
                  <p className="font-medium">{plan.program}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div>{getStatusBadge(plan.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium">{formatDate(plan.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium">{formatDate(plan.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Financial Summary</CardTitle>
              <CardDescription>Total budget allocation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">{formatCurrency(totalBudget)}</div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Q1 (Jul-Sep)</span>
                    <span>{q1Percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${q1Percentage}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Q2 (Oct-Dec)</span>
                    <span>{q2Percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${q2Percentage}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Q3 (Jan-Mar)</span>
                    <span>{q3Percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${q3Percentage}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Q4 (Apr-Jun)</span>
                    <span>{q4Percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${q4Percentage}%` }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="col-span-1">
            <CardHeader className="pb-2">
              <CardTitle>Budget by Category</CardTitle>
              <CardDescription>Distribution by activity type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(categoryTotals).map(([category, amount]) => {
                  const percentage = Math.round((amount / totalBudget) * 100);
                  return (
                    <div key={category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium truncate" title={category}>{category}</span>
                        <span>{formatCurrency(amount)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{percentage}% of total budget</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-2">
            <CardHeader className="pb-2">
              <CardTitle>Quarterly Budget Allocation</CardTitle>
              <CardDescription>Detailed quarterly breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Q1 (Jul-Sep)</p>
                  <p className="text-xl font-bold">{formatCurrency(calculateQuarterTotal('amountQ1'))}</p>
                  <p className="text-xs text-gray-500">{q1Percentage}% of total</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Q2 (Oct-Dec)</p>
                  <p className="text-xl font-bold">{formatCurrency(calculateQuarterTotal('amountQ2'))}</p>
                  <p className="text-xs text-gray-500">{q2Percentage}% of total</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Q3 (Jan-Mar)</p>
                  <p className="text-xl font-bold">{formatCurrency(calculateQuarterTotal('amountQ3'))}</p>
                  <p className="text-xs text-gray-500">{q3Percentage}% of total</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Q4 (Apr-Jun)</p>
                  <p className="text-xl font-bold">{formatCurrency(calculateQuarterTotal('amountQ4'))}</p>
                  <p className="text-xs text-gray-500">{q4Percentage}% of total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Financial Information */}
        <Tabs defaultValue="activities" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="activities">Activities & Budget</TabsTrigger>
            <TabsTrigger value="quarterly">Quarterly Distribution</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Breakdown</TabsTrigger>
          </TabsList>
          
          <TabsContent value="activities" className="space-y-4">
            <Card>
              <CardHeader className="pb-0">
                <CardTitle>Activities & Budget Allocation</CardTitle>
                <CardDescription>Detailed view of all activities in the plan</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[250px]">Activity</TableHead>
                        <TableHead className="min-w-[150px]">Category</TableHead>
                        <TableHead className="min-w-[80px]">Frequency</TableHead>
                        <TableHead className="min-w-[120px]">Unit Cost</TableHead>
                        <TableHead className="min-w-[120px]">Total Budget</TableHead>
                        <TableHead className="min-w-[200px]">Comment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {plan.activities.map((activity) => (
                        <TableRow key={activity.id}>
                          <TableCell className="font-medium">
                            {activity.activity}
                            <div className="text-sm text-muted-foreground">{activity.typeOfActivity}</div>
                          </TableCell>
                          <TableCell>{activity.activityCategory}</TableCell>
                          <TableCell>{activity.frequency}</TableCell>
                          <TableCell>{formatCurrency(activity.unitCost)}</TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(activity.totalBudget)}
                          </TableCell>
                          <TableCell>{activity.comment}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={4} className="text-right font-bold">
                          Total Budget:
                        </TableCell>
                        <TableCell className="font-bold">
                          {formatCurrency(calculateTotalBudget())}
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="quarterly" className="space-y-4">
            <Card>
              <CardHeader className="pb-0">
                <CardTitle>Quarterly Budget Distribution</CardTitle>
                <CardDescription>Activity counts and amounts by quarter</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[250px]">Activity</TableHead>
                        <TableHead className="min-w-[80px]">Q1 Count</TableHead>
                        <TableHead className="min-w-[100px]">Q1 Amount</TableHead>
                        <TableHead className="min-w-[80px]">Q2 Count</TableHead>
                        <TableHead className="min-w-[100px]">Q2 Amount</TableHead>
                        <TableHead className="min-w-[80px]">Q3 Count</TableHead>
                        <TableHead className="min-w-[100px]">Q3 Amount</TableHead>
                        <TableHead className="min-w-[80px]">Q4 Count</TableHead>
                        <TableHead className="min-w-[100px]">Q4 Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {plan.activities.map((activity) => (
                        <TableRow key={activity.id}>
                          <TableCell className="font-medium">
                            {activity.activity}
                            <div className="text-sm text-muted-foreground">{activity.typeOfActivity}</div>
                          </TableCell>
                          <TableCell>{activity.countQ1}</TableCell>
                          <TableCell>{formatCurrency(activity.amountQ1)}</TableCell>
                          <TableCell>{activity.countQ2}</TableCell>
                          <TableCell>{formatCurrency(activity.amountQ2)}</TableCell>
                          <TableCell>{activity.countQ3}</TableCell>
                          <TableCell>{formatCurrency(activity.amountQ3)}</TableCell>
                          <TableCell>{activity.countQ4}</TableCell>
                          <TableCell>{formatCurrency(activity.amountQ4)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell className="font-bold">Quarter Totals:</TableCell>
                        <TableCell></TableCell>
                        <TableCell className="font-bold">{formatCurrency(calculateQuarterTotal('amountQ1'))}</TableCell>
                        <TableCell></TableCell>
                        <TableCell className="font-bold">{formatCurrency(calculateQuarterTotal('amountQ2'))}</TableCell>
                        <TableCell></TableCell>
                        <TableCell className="font-bold">{formatCurrency(calculateQuarterTotal('amountQ3'))}</TableCell>
                        <TableCell></TableCell>
                        <TableCell className="font-bold">{formatCurrency(calculateQuarterTotal('amountQ4'))}</TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="detailed" className="space-y-4">
            <Card>
              <CardHeader className="pb-0">
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>Detailed budget breakdown by category</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {Object.entries(categoryTotals).map(([category, amount]) => {
                  // Filter activities for this category
                  const categoryActivities = plan.activities.filter(a => a.activityCategory === category);
                  const categoryPercentage = Math.round((amount / totalBudget) * 100);
                  
                  return (
                    <div key={category} className="mb-8">
                      <div className="mb-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-bold">{category}</h3>
                          <div className="text-lg font-bold">{formatCurrency(amount)}</div>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>{categoryActivities.length} activities</span>
                          <span>{categoryPercentage}% of total budget</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${categoryPercentage}%` }}></div>
                        </div>
                      </div>
                      
                      <div className="rounded-md border overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Activity</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead className="text-right">Q1</TableHead>
                              <TableHead className="text-right">Q2</TableHead>
                              <TableHead className="text-right">Q3</TableHead>
                              <TableHead className="text-right">Q4</TableHead>
                              <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {categoryActivities.map((activity) => (
                              <TableRow key={activity.id}>
                                <TableCell className="font-medium">{activity.activity}</TableCell>
                                <TableCell>{activity.typeOfActivity}</TableCell>
                                <TableCell className="text-right">{formatCurrency(activity.amountQ1 || 0)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(activity.amountQ2 || 0)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(activity.amountQ3 || 0)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(activity.amountQ4 || 0)}</TableCell>
                                <TableCell className="text-right font-medium">{formatCurrency(activity.totalBudget || 0)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                          <TableFooter>
                            <TableRow>
                              <TableCell colSpan={2} className="text-right font-bold">Category Total:</TableCell>
                              <TableCell className="text-right font-bold">
                                {formatCurrency(calculateCategoryTotalForQuarter(categoryActivities, 'amountQ1'))}
                              </TableCell>
                              <TableCell className="text-right font-bold">
                                {formatCurrency(calculateCategoryTotalForQuarter(categoryActivities, 'amountQ2'))}
                              </TableCell>
                              <TableCell className="text-right font-bold">
                                {formatCurrency(calculateCategoryTotalForQuarter(categoryActivities, 'amountQ3'))}
                              </TableCell>
                              <TableCell className="text-right font-bold">
                                {formatCurrency(calculateCategoryTotalForQuarter(categoryActivities, 'amountQ4'))}
                              </TableCell>
                              <TableCell className="text-right font-bold">{formatCurrency(amount)}</TableCell>
                            </TableRow>
                          </TableFooter>
                        </Table>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
              <CardFooter className="border-t pt-6">
                <div className="w-full flex justify-between items-center">
                  <span className="text-lg font-bold">Total Plan Budget:</span>
                  <span className="text-2xl font-bold">{formatCurrency(totalBudget)}</span>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
