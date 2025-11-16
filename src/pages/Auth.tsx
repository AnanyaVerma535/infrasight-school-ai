import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { ScanEye, Globe, Loader2, Shield, Users } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'officer' | 'citizen'>('citizen');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Fetch user role and redirect accordingly
      const fetchUserRole = async () => {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        
        if (data?.role === 'officer') {
          navigate('/officer-dashboard', { replace: true });
        } else {
          navigate('/citizen-dashboard', { replace: true });
        }
      };
      fetchUserRole();
    }
  }, [user, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: t('common.success'),
          description: language === 'en' ? 'Login successful!' : 'लॉगिन सफल!',
        });
      } else {
        const redirectUrl = `${window.location.origin}/`;
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          // Insert user role
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({ user_id: data.user.id, role: selectedRole });

          if (roleError) {
            console.error('Error inserting role:', roleError);
            toast({
              title: t('common.error'),
              description: 'Failed to set user role',
              variant: 'destructive',
            });
            return;
          }

          toast({
            title: t('common.success'),
            description: language === 'en' 
              ? 'Account created successfully! You can now login.' 
              : 'खाता सफलतापूर्वक बनाया गया! अब आप लॉगिन कर सकते हैं।',
          });
          setIsLogin(true);
        }
      }
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Title */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg">
              <ScanEye className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {t('auth.title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('auth.subtitle')}
          </p>
        </div>

        {/* Auth Card */}
        <Card className="border-2">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              {isLogin ? t('auth.login') : t('auth.signup')}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? (language === 'en' ? 'Enter your credentials to continue' : 'जारी रखने के लिए अपनी साख दर्ज करें')
                : (language === 'en' ? 'Create a new account to get started' : 'शुरू करने के लिए एक नया खाता बनाएं')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t('auth.fullName')}</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
                    className="transition-all focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="transition-all focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="transition-all focus:ring-2 focus:ring-primary"
                />
              </div>

              {!isLogin && (
                <div className="space-y-3">
                  <Label>Select Role</Label>
                  <RadioGroup value={selectedRole} onValueChange={(value) => setSelectedRole(value as 'officer' | 'citizen')}>
                    <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent cursor-pointer">
                      <RadioGroupItem value="citizen" id="citizen" />
                      <Label htmlFor="citizen" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Users className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Citizen</div>
                          <div className="text-xs text-muted-foreground">Report issues and check status</div>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent cursor-pointer">
                      <RadioGroupItem value="officer" id="officer" />
                      <Label htmlFor="officer" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Shield className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Officer</div>
                          <div className="text-xs text-muted-foreground">Verify and manage reports</div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              <Button
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('common.loading')}
                  </>
                ) : (
                  isLogin ? t('auth.loginButton') : t('auth.signupButton')
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
                <span className="font-semibold text-primary">
                  {isLogin ? t('auth.signup') : t('auth.login')}
                </span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Language Toggle */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="gap-2"
          >
            <Globe className="h-4 w-4" />
            {language === 'en' ? 'हिंदी' : 'English'}
          </Button>
        </div>
      </div>
    </div>
  );
}
