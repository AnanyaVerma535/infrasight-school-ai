import { Layout } from '@/components/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin, Clock, Building2 } from 'lucide-react';

export default function Contact() {
  const { t } = useLanguage();

  const contactInfo = [
    {
      icon: MapPin,
      title: t('contact.address'),
      content: ['Infrasight Headquarters', 'Education Technology Center', 'New Delhi, India 110001'],
    },
    {
      icon: Mail,
      title: 'Email',
      content: ['support@infrasight.edu.in', 'info@infrasight.edu.in'],
    },
    {
      icon: Phone,
      title: t('contact.phone'),
      content: ['+91 11 1234 5678', '+91 98765 43210'],
    },
    {
      icon: Clock,
      title: t('contact.hours'),
      content: [t('contact.mondayFriday'), 'Saturday: 10AM - 2PM', 'Sunday: Closed'],
    },
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent">
              <Building2 className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">{t('contact.title')}</h1>
          <p className="text-muted-foreground">{t('contact.subtitle')}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {contactInfo.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {item.content.map((line, lineIndex) => (
                      <p key={lineIndex} className="text-sm text-muted-foreground">
                        {line}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Map Section */}
        <Card>
          <CardHeader>
            <CardTitle>Find Us</CardTitle>
            <CardDescription>Visit our office for in-person support</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video rounded-lg bg-muted flex items-center justify-center overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.003719321594!2d77.2090212!3d28.6139391!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd371d9e77d7%3A0x7e3f3c5d1c9e0d0a!2sConnaught%20Place%2C%20New%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Office Location"
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <div className="flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold">Email Support</h3>
                <p className="text-sm text-muted-foreground">
                  Get responses within 24 hours
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/20 bg-accent/5">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <div className="flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                    <Phone className="h-6 w-6 text-accent" />
                  </div>
                </div>
                <h3 className="font-semibold">Phone Support</h3>
                <p className="text-sm text-muted-foreground">
                  Available during business hours
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <div className="flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold">Office Visit</h3>
                <p className="text-sm text-muted-foreground">
                  Schedule an appointment first
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
