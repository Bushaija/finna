'use client';

import { useEffect } from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Input } from "@/components/ui/input";
import { Activity, calculateQuarterAmount } from '../../schema/malaria/schema';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { planSchema } from '../../schema/malaria/schema';
import { formatCurrency } from '../../utils';

interface PlanActivityRowProps {
    activity: Activity;
    index: number;
    form: UseFormReturn<z.infer<typeof planSchema>>;
    // isSubCategory: boolean;
};

export function PlanActivityRow({ activity, index, form }: PlanActivityRowProps) {
    const { watch, setValue } = form;

    // for category with special index -1, we don't need to watch or update
    const isReadyOnly = index === -1;

    // watch for changes to recalculate derived values
    const frequency = isReadyOnly ? 0 : watch(`activities.${index}.frequency`);
    const unitCost = isReadyOnly ? 0 : watch(`activities.${index}.unitCost`);
    const quantity = isReadyOnly ? 0 : watch(`activities.${index}.quantity`);
    const amountQ1 = isReadyOnly ? 0 : watch(`activities.${index}.amountQ1`);
    const amountQ2 = isReadyOnly ? 0 : watch(`activities.${index}.amountQ2`);
    const amountQ3 = isReadyOnly ? 0 : watch(`activities.${index}.amountQ3`);
    const amountQ4 = isReadyOnly ? 0 : watch(`activities.${index}.amountQ4`);
    const totalBudget = isReadyOnly ? 0 : watch(`activities.${index}.annualBudget`);

    useEffect(() => {
        if (isReadyOnly) return;

        const amountQ1 = calculateQuarterAmount(frequency || 0, unitCost || 0, quantity || 0);
        const amountQ2 = calculateQuarterAmount(frequency || 0, unitCost || 0, quantity || 0);
        const amountQ3 = calculateQuarterAmount(frequency || 0, unitCost || 0, quantity || 0);
        const amountQ4 = calculateQuarterAmount(frequency || 0, unitCost || 0, quantity || 0);

        setValue(`activities.${index}.amountQ1`, amountQ1);
        setValue(`activities.${index}.amountQ2`, amountQ2);
        setValue(`activities.${index}.amountQ3`, amountQ3);
        setValue(`activities.${index}.amountQ4`, amountQ4);

        const totalBudget = amountQ1 + amountQ2 + amountQ3 + amountQ4;
        setValue(`activities.${index}.annualBudget`, totalBudget);
    }, [frequency, unitCost, quantity, setValue, index, isReadyOnly]);

    return (
        <TableRow>
            <TableCell className="align-top">{activity.activity}</TableCell>
            <TableCell className="align-top">{activity.activityDescription}</TableCell>
            <TableCell>
                <Input
                    type="number"
                    min="0"
                    className="w-[100px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    {...form.register(`activities.${index}.quantity`, { 
                        valueAsNumber: true,
                        min: 0,
                        validate: value => value >= 0 || "Quantity cannot be negative"
                    })}
                    disabled={isReadyOnly}
                />
            </TableCell>
            <TableCell>
                <Input
                    type="number"
                    min="1"
                    className="w-[100px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    {...form.register(`activities.${index}.frequency`, { 
                        valueAsNumber: true,
                        min: 1,
                        validate: value => value >= 1 || "Frequency must be at least 1"
                    })}
                    disabled={isReadyOnly}
                />
            </TableCell>
            <TableCell>
                <Input
                    type="number"
                    min="1"
                    className="w-[100px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    {...form.register(`activities.${index}.unitCost`, { 
                        valueAsNumber: true,
                        min: 1,
                        validate: value => value >= 1 || "Unit cost must be at least 1"
                    })}
                    disabled={isReadyOnly}
                />
            </TableCell>
            <TableCell className="text-center">{formatCurrency(amountQ1)}</TableCell>
            <TableCell className="text-center">{formatCurrency(amountQ2)}</TableCell>
            <TableCell className="text-center">{formatCurrency(amountQ3)}</TableCell>
            <TableCell className="text-center">{formatCurrency(amountQ4)}</TableCell>
            <TableCell className="text-center">{formatCurrency(totalBudget)}</TableCell>
            <TableCell>
                <Input
                    className="w-full"
                    placeholder="Add a comment..."
                    {...form.register(`activities.${index}.comment`)}
                    disabled={isReadyOnly}
                />
            </TableCell>
        </TableRow>
    );
}
