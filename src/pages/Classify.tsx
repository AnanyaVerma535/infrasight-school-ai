import { useState, useRef } from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, Camera, Loader2, CheckCircle2, Image as ImageIcon } from 'lucide-react';

interface ClassificationResult {
  classification: string;
  confidence: number;
  infrastructure_type: string;
  description: string;
}

export default function Classify() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [classifying, setClassifying] = useState(false);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [location, setLocation] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClassify = async () => {
    if (!selectedImage) return;

    setClassifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('classify-infrastructure', {
        body: { imageBase64: selectedImage }
      });

      if (error) throw error;

      setResult(data);
      toast({
        title: t('common.success'),
        description: t('classify.result'),
      });
    } catch (error: any) {
      console.error('Classification error:', error);
      toast({
        title: t('common.error'),
        description: error.message || 'Failed to classify image',
        variant: 'destructive',
      });
    } finally {
      setClassifying(false);
    }
  };

  const handleSaveReport = async () => {
    if (!result || !selectedImage || !user) return;

    try {
      // Upload image to storage
      const fileName = `${user.id}/${Date.now()}.jpg`;
      const base64Data = selectedImage.split(',')[1];
      const blob = await fetch(selectedImage).then(res => res.blob());

      const { error: uploadError } = await supabase.storage
        .from('infrastructure-images')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('infrastructure-images')
        .getPublicUrl(fileName);

      // Save report to database
      const { error: insertError } = await supabase
        .from('infrastructure_reports')
        .insert({
          user_id: user.id,
          image_url: publicUrl,
          classification: result.classification,
          confidence_score: result.confidence,
          infrastructure_type: result.infrastructure_type,
          description: result.description,
          location: location || null,
        });

      if (insertError) throw insertError;

      toast({
        title: t('common.success'),
        description: 'Report saved successfully!',
      });

      // Reset form
      setSelectedImage(null);
      setResult(null);
      setLocation('');
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: t('common.error'),
        description: error.message || 'Failed to save report',
        variant: 'destructive',
      });
    }
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'Good':
        return 'bg-green-500 text-white';
      case 'Average':
        return 'bg-yellow-500 text-white';
      case 'Bad':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">{t('classify.title')}</h1>
          <p className="text-muted-foreground">{t('classify.subtitle')}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Image Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>{t('classify.upload')}</CardTitle>
              <CardDescription>
                Upload an image or capture from camera
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedImage ? (
                <div className="space-y-4">
                  <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-border">
                    <img 
                      src={selectedImage} 
                      alt="Selected" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSelectedImage(null);
                      setResult(null);
                    }}
                  >
                    Change Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-video rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary"
                  >
                    <ImageIcon className="h-12 w-12" />
                    <span className="text-sm font-medium">Click to select image</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Upload
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (fileInputRef.current) {
                          fileInputRef.current.setAttribute('capture', 'environment');
                          fileInputRef.current.click();
                        }
                      }}
                      className="gap-2"
                    >
                      <Camera className="h-4 w-4" />
                      Camera
                    </Button>
                  </div>
                </div>
              )}

              {selectedImage && !result && (
                <Button
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  onClick={handleClassify}
                  disabled={classifying}
                >
                  {classifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('classify.analyzing')}
                    </>
                  ) : (
                    'Analyze Infrastructure'
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card>
            <CardHeader>
              <CardTitle>{t('classify.result')}</CardTitle>
              <CardDescription>
                AI-powered classification results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Classification</Label>
                      <Badge className={`${getClassificationColor(result.classification)} text-lg px-4 py-2 mt-2`}>
                        {t(`type.${result.classification.toLowerCase()}`)}
                      </Badge>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">{t('classify.confidence')}</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${result.confidence}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold">{result.confidence}%</span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">{t('classify.type')}</Label>
                      <p className="mt-2 font-medium capitalize">
                        {t(`type.${result.infrastructure_type.toLowerCase()}`)}
                      </p>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">{t('classify.description')}</Label>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {result.description}
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="location">{t('classify.location')}</Label>
                      <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g., Main Building, 1st Floor"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-accent to-primary hover:opacity-90"
                    onClick={handleSaveReport}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {t('classify.saveReport')}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <ImageIcon className="h-16 w-16 mb-4 opacity-50" />
                  <p>Upload and analyze an image to see results</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
