import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { OrganizationDetailsForm } from '@/components/policy/forms/OrganizationDetailsForm';
import { PolicySelectionForm } from '@/components/policy/forms/PolicySelectionForm';
import { ReviewForm } from '@/components/policy/forms/ReviewForm';
import { PolicyFormData, policySchema } from './types';

interface CreatePolicyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreatePolicyModal({ open, onOpenChange, onSuccess }: CreatePolicyModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('policies');
  
  const form = useForm<PolicyFormData>({
    resolver: zodResolver(policySchema),
    defaultValues: {
      organizationName: '',
      website: '',
      industrySector: '',
      organizationSize: '',
      geographicOperations: [],
      regulations: [],
      standards: [],
      selectedPolicies: [],
    },
  });
  
  // Watch form values
  const selectedPolicies = form.watch('selectedPolicies') || [];
  
  // Ensure arrays are always initialized
  const formValues = form.watch();
  if (!formValues.regulations) form.setValue('regulations', []);
  if (!formValues.standards) form.setValue('standards', []);
  if (!formValues.selectedPolicies) form.setValue('selectedPolicies', []);

  const onSubmit = async (data: PolicyFormData) => {
    try {
      setIsSubmitting(true);
      console.log('Form submitted:', data);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleNext = () => {
    if (activeTab === 'policies' && selectedPolicies.length === 0) {
      form.setError('selectedPolicies', {
        type: 'manual',
        message: 'Please select at least one policy type',
      });
      return;
    }
    
    if (activeTab === 'policies') setActiveTab('organization');
    else if (activeTab === 'organization') setActiveTab('review');
  };
  
  const handleBack = () => {
    if (activeTab === 'organization') setActiveTab('policies');
    else if (activeTab === 'review') setActiveTab('organization');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl z-[100] bg-white">
        <DialogHeader>
          <DialogTitle>Create New Policy</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger 
                  value="policies"
                  disabled={isSubmitting}
                >
                  Policy Type
                </TabsTrigger>
                <TabsTrigger 
                  value="organization" 
                  disabled={isSubmitting || !selectedPolicies.length}
                >
                  Organization
                </TabsTrigger>
                <TabsTrigger 
                  value="review" 
                  disabled={isSubmitting || !selectedPolicies.length}
                >
                  Review
                </TabsTrigger>
              </TabsList>
              <TabsContent value="policies">
                <PolicySelectionForm form={form} disabled={isSubmitting} />
              </TabsContent>
              <TabsContent value="organization">
                <OrganizationDetailsForm form={form} disabled={isSubmitting} />
              </TabsContent>
              <TabsContent value="review">
                <ReviewForm form={form} />
              </TabsContent>
            </Tabs>
            <div className="flex justify-between">
              <div>
                {activeTab !== 'policies' && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleBack}
                    disabled={isSubmitting}
                  >
                    Back
                  </Button>
                )}
              </div>
              <div className="flex space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                {activeTab !== 'review' ? (
                  <Button 
                    type="button" 
                    onClick={handleNext}
                    disabled={isSubmitting}
                  >
                    Next
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Generate Policies'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}