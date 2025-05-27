import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { PolicyFormData } from '../types';

interface ReviewFormProps {
  form: UseFormReturn<PolicyFormData>;
}

export function ReviewForm({ form }: ReviewFormProps) {
  const { watch } = form;
  const formData = watch();

  const sections = [
    {
      title: 'Organization Details',
      fields: [
        { label: 'Organization Name', value: formData.organizationName },
        { label: 'Website', value: formData.website || 'Not provided' },
        { label: 'Industry Sector', value: formData.industrySector },
        { label: 'Organization Size', value: formData.organizationSize },
        {
          label: 'Geographic Operations',
          value: formData.geographicOperations?.join(', ') || 'None selected',
        },
      ],
    },
    {
      title: 'Policy Selection',
      fields: [
        {
          label: 'Selected Policies',
          value: formData.selectedPolicies?.join(', ') || 'None selected',
        },
        {
          label: 'Regulations',
          value: formData.regulations?.join(', ') || 'None selected',
        },
        {
          label: 'Standards',
          value: formData.standards?.join(', ') || 'None selected',
        },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <Card key={section.title}>
          <CardHeader>
            <CardTitle className="text-lg">{section.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              {section.fields.map((field) => (
                <div key={field.label} className="grid grid-cols-2 gap-2">
                  <dt className="font-medium text-gray-500">{field.label}:</dt>
                  <dd>{field.value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
