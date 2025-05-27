import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useSubscription } from '@/lib/stripe/supabase';
import { STRIPE_PLANS } from '@/lib/stripe/config';
import { supabase } from '@/lib/supabase/client';
import { redirectToCheckout } from '@/lib/stripe/client';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { toast } from 'sonner';
import { LogOut, Save, Sparkles, AlertCircle, Settings, Bell, CreditCard } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Profile, PlanType } from '@/types/profile';

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const navigate = useNavigate();
  const { data: subscription } = useSubscription();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const handleUpdateProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Get profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          setProfile(profile as Profile);
        }
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    };
    handleUpdateProfile();
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profile) {
          setProfile(profile as Profile);
        }
      }
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setProfile(profile as Profile);
        }
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/sign-in');
      onOpenChange(false);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setIsSaving(true);

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      toast.error('Not authenticated');
      setIsSaving(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profile?.name,
          updated_at: new Date().toISOString(),
          metadata: { email_notifications: emailNotifications }
        })
        .eq('user_id', authUser.id);

      if (error) throw error;

      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpgradeSubscription = async (planId: PlanType) => {
    try {
      setIsLoading(true);
      await redirectToCheckout({ priceId: STRIPE_PLANS[planId].price });
    } catch (error) {
      console.error('Error upgrading subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadUserPreferences = async () => {
      if (profile) {
        // Get email notifications from user metadata since it's not in our schema
        const { data: { user: authUser } } = await supabase.auth.getUser();
        setEmailNotifications(authUser?.user_metadata?.email_notifications ?? true);
      }
    };
    loadUserPreferences();
  }, [profile]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
          <DialogDescription>
            Manage your account settings and preferences
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Account
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Subscription
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-4">
            <div className="flex items-center space-x-4 py-4">
              <Avatar>
                <AvatarImage src={profile?.metadata?.avatar_url} />
                <AvatarFallback>{profile?.name?.[0]?.toUpperCase() ?? profile?.email?.[0]?.toUpperCase() ?? 'UN'}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h4 className="text-sm font-medium leading-none">
                  {profile?.name || profile?.email}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {profile?.email}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  placeholder="Full name"
                  value={profile?.name || ''}
                  onChange={(e) => setProfile(prev => ({
                    ...prev!,
                    name: e.target.value
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Plan</Label>
                <Select
                  value={profile?.plan || 'free'}
                  onValueChange={(value) => {
                    const planType = value as PlanType;
                    setProfile(prev => ({ ...prev!, plan: planType }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleUpdateProfile}
                disabled={isSaving}
                className="w-full bg-[#8a63d2] hover:bg-[#7a53c2] flex items-center gap-2"
              >
                {isSaving ? (
                  <Settings className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSaving ? 'Saving...' : 'Save changes'}
              </Button>
              <Separator />
              <div className="space-y-2">
                <Label className="text-destructive">Danger Zone</Label>
                <Button
                  variant="destructive"
                  className="w-full flex items-center gap-2"
                  onClick={handleSignOut}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Settings className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                  {isLoading ? 'Signing out...' : 'Sign out'}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium leading-none">Current Plan</h4>
                  <p className="text-sm text-muted-foreground">
                    {subscription?.plan
                      ? `You are on the ${STRIPE_PLANS[subscription.plan].name} plan`
                      : 'You are on the free plan'}
                  </p>
                </div>
              </div>
              <Separator />
              {Object.entries(STRIPE_PLANS).map(([planId, plan]) => (
                <div
                  key={planId}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <h4 className="font-medium">{plan.name}</h4>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                    <Badge variant={planId === subscription?.plan ? 'default' : 'outline'}>
                      ${plan.price / 100}/month
                    </Badge>
                  </div>
                  {planId !== subscription?.plan && (
                    <Button
                      onClick={() => handleUpgradeSubscription(planId)}
                      disabled={isLoading}
                      className="bg-[#8a63d2] hover:bg-[#7a53c2] flex items-center gap-2"
                    >
                      {isLoading ? (
                        <Settings className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                      {isLoading ? 'Processing...' : 'Upgrade'}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates about your account via email
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              <Separator />
              <Button
                onClick={handleUpdateProfile}
                disabled={isSaving}
                className="w-full bg-[#8a63d2] hover:bg-[#7a53c2] flex items-center gap-2"
              >
                {isSaving ? (
                  <Settings className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSaving ? 'Saving...' : 'Save preferences'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
