import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'hi';

interface Translations {
  [key: string]: {
    en: string;
    hi: string;
  };
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Translations = {
  // Navigation
  'nav.dashboard': { en: 'Dashboard', hi: 'डैशबोर्ड' },
  'nav.classify': { en: 'Classify', hi: 'वर्गीकरण' },
  'nav.feedback': { en: 'Feedback', hi: 'प्रतिक्रिया' },
  'nav.contact': { en: 'Contact', hi: 'संपर्क करें' },
  'nav.logout': { en: 'Logout', hi: 'लॉगआउट' },
  
  // Auth
  'auth.title': { en: 'Infrasight', hi: 'इन्फ्रासाइट' },
  'auth.subtitle': { en: 'School Infrastructure Monitoring System', hi: 'स्कूल बुनियादी ढांचा निगरानी प्रणाली' },
  'auth.login': { en: 'Login', hi: 'लॉगिन' },
  'auth.signup': { en: 'Sign Up', hi: 'साइन अप' },
  'auth.email': { en: 'Email', hi: 'ईमेल' },
  'auth.password': { en: 'Password', hi: 'पासवर्ड' },
  'auth.fullName': { en: 'Full Name', hi: 'पूरा नाम' },
  'auth.noAccount': { en: "Don't have an account?", hi: 'खाता नहीं है?' },
  'auth.hasAccount': { en: 'Already have an account?', hi: 'पहले से खाता है?' },
  'auth.loginButton': { en: 'Login to Account', hi: 'खाते में लॉगिन करें' },
  'auth.signupButton': { en: 'Create Account', hi: 'खाता बनाएं' },
  
  // Dashboard
  'dashboard.welcome': { en: 'Welcome back', hi: 'वापसी पर स्वागत है' },
  'dashboard.overview': { en: 'Infrastructure Overview', hi: 'बुनियादी ढांचे का अवलोकन' },
  'dashboard.totalReports': { en: 'Total Reports', hi: 'कुल रिपोर्ट' },
  'dashboard.goodCondition': { en: 'Good Condition', hi: 'अच्छी स्थिति' },
  'dashboard.needsAttention': { en: 'Needs Attention', hi: 'ध्यान देने की आवश्यकता' },
  'dashboard.recentReports': { en: 'Recent Reports', hi: 'हालिया रिपोर्ट' },
  'dashboard.noReports': { en: 'No reports yet', hi: 'अभी तक कोई रिपोर्ट नहीं' },
  'dashboard.startClassifying': { en: 'Start classifying infrastructure to see reports here', hi: 'यहां रिपोर्ट देखने के लिए बुनियादी ढांचे का वर्गीकरण शुरू करें' },
  
  // Classify
  'classify.title': { en: 'Infrastructure Classification', hi: 'बुनियादी ढांचे का वर्गीकरण' },
  'classify.subtitle': { en: 'Upload or capture images for AI-powered analysis', hi: 'AI-संचालित विश्लेषण के लिए छवियां अपलोड या कैप्चर करें' },
  'classify.upload': { en: 'Upload Image', hi: 'छवि अपलोड करें' },
  'classify.capture': { en: 'Capture from Camera', hi: 'कैमरे से कैप्चर करें' },
  'classify.analyzing': { en: 'Analyzing...', hi: 'विश्लेषण कर रहे हैं...' },
  'classify.result': { en: 'Classification Result', hi: 'वर्गीकरण परिणाम' },
  'classify.confidence': { en: 'Confidence', hi: 'विश्वास' },
  'classify.type': { en: 'Infrastructure Type', hi: 'बुनियादी ढांचे का प्रकार' },
  'classify.description': { en: 'Description', hi: 'विवरण' },
  'classify.saveReport': { en: 'Save Report', hi: 'रिपोर्ट सहेजें' },
  'classify.location': { en: 'Location (optional)', hi: 'स्थान (वैकल्पिक)' },
  
  // Feedback
  'feedback.title': { en: 'Send Feedback', hi: 'प्रतिक्रिया भेजें' },
  'feedback.subtitle': { en: 'Help us improve Infrasight', hi: 'इन्फ्रासाइट को बेहतर बनाने में हमारी मदद करें' },
  'feedback.name': { en: 'Your Name', hi: 'आपका नाम' },
  'feedback.email': { en: 'Your Email', hi: 'आपका ईमेल' },
  'feedback.subject': { en: 'Subject', hi: 'विषय' },
  'feedback.message': { en: 'Message', hi: 'संदेश' },
  'feedback.submit': { en: 'Submit Feedback', hi: 'प्रतिक्रिया सबमिट करें' },
  'feedback.success': { en: 'Feedback submitted successfully!', hi: 'प्रतिक्रिया सफलतापूर्वक सबमिट की गई!' },
  
  // Contact
  'contact.title': { en: 'Contact Us', hi: 'हमसे संपर्क करें' },
  'contact.subtitle': { en: 'Get in touch with our team', hi: 'हमारी टीम से संपर्क करें' },
  'contact.address': { en: 'Address', hi: 'पता' },
  'contact.phone': { en: 'Phone', hi: 'फोन' },
  'contact.hours': { en: 'Working Hours', hi: 'कार्य के घंटे' },
  'contact.mondayFriday': { en: 'Monday - Friday: 9AM - 6PM', hi: 'सोमवार - शुक्रवार: सुबह 9 बजे - शाम 6 बजे' },
  
  // Common
  'common.loading': { en: 'Loading...', hi: 'लोड हो रहा है...' },
  'common.error': { en: 'Error', hi: 'त्रुटि' },
  'common.success': { en: 'Success', hi: 'सफलता' },
  'common.cancel': { en: 'Cancel', hi: 'रद्द करें' },
  'common.save': { en: 'Save', hi: 'सहेजें' },
  'common.delete': { en: 'Delete', hi: 'हटाएं' },
  'common.edit': { en: 'Edit', hi: 'संपादित करें' },
  'common.view': { en: 'View', hi: 'देखें' },
  
  // Classification types
  'type.good': { en: 'Good', hi: 'अच्छा' },
  'type.average': { en: 'Average', hi: 'औसत' },
  'type.bad': { en: 'Bad', hi: 'खराब' },
  'type.classroom': { en: 'Classroom', hi: 'कक्षा' },
  'type.toilet': { en: 'Toilet', hi: 'शौचालय' },
  'type.playground': { en: 'Playground', hi: 'खेल का मैदान' },
  'type.building': { en: 'Building', hi: 'भवन' },
  'type.other': { en: 'Other', hi: 'अन्य' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'hi' ? 'hi' : 'en') as Language;
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[language] || translation.en || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
