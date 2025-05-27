import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';

const industrySectors = [
  'Technology',
  'Healthcare',
  'Finance',
  'Manufacturing',
  'Retail',
  'Education',
  'Government',
  'Other',
];

const organizationSizes = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1000+',
];

const regions = [
  'North America',
  'South America',
  'Europe',
  'Asia',
  'Africa',
  'Oceania',
];

import { PolicyFormData } from '../types';

interface OrganizationDetailsFormProps {
  form: UseFormReturn<PolicyFormData>;
}

export function OrganizationDetailsForm({ form }: OrganizationDetailsFormProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="organizationName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Organization Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter organization name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="website"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Website (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="https://example.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="industrySector"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Industry Sector</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry sector" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {industrySectors.map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="organizationSize"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Organization Size</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select organization size" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {organizationSizes.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size} employees
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="geographicOperations"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Geographic Operations</FormLabel>
            <FormControl>
              <MultiSelect
                placeholder="Select regions"
                options={regions.map((region) => ({
                  label: region,
                  value: region,
                }))}
                selected={field.value}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
