import React from 'react';
import { Link } from 'react-router-dom';
import { 
  UserPlus, 
  Stethoscope, 
  FileText, 
  Syringe, 
  MapPin, 
  Pill, 
  MessageCircle, 
  Star,
  Shield,
  QrCode,
  Video,
  Phone,
  Download,
  Share2
} from 'lucide-react';

const Tutorials = () => {
  const tutorials = [
    {
      id: 1,
      title: 'Register & Create NABHA Card',
      icon: UserPlus,
      description: 'Sign up and generate your digital NABHA Health Card',
      steps: [
        'Visit the registration page',
        'Fill in your personal details',
        'Upload required documents',
        'Generate your unique NABHA ID',
        'Download your digital health card'
      ],
      color: 'blue',
      link: '/auth/register'
    },
    {
      id: 2,
      title: 'Book a Consultation',
      icon: Stethoscope,
      description: 'Choose a doctor and schedule a video or in-person visit',
      steps: [
        'Browse doctors by specialization',
        'Select your preferred doctor',
        'Choose appointment date and time',
        'Select consultation type (video/in-person)',
        'Confirm your booking'
      ],
      color: 'green',
      link: '/doctors'
    },
    {
      id: 3,
      title: 'Get Digital Prescription',
      icon: FileText,
      description: 'Access prescriptions online and share with pharmacies',
      steps: [
        'Complete your consultation',
        'Receive digital prescription',
        'View prescription in your NABHA card',
        'Share with pharmacy for medicine',
        'Track prescription history'
      ],
      color: 'purple',
      link: '/auth/login'
    },
    {
      id: 4,
      title: 'Book Government Vaccines',
      icon: Syringe,
      description: 'Book free vaccines at nearby health centers',
      steps: [
        'Browse available vaccines',
        'Select vaccination center',
        'Choose date and time slot',
        'Fill patient details',
        'Confirm vaccination booking'
      ],
      color: 'orange',
      link: '/vaccines'
    },
    {
      id: 5,
      title: 'Locate Health Centers',
      icon: MapPin,
      description: 'Find nearest ASHA worker centers and mini health centers',
      steps: [
        'Enable location access',
        'Browse nearby health centers',
        'Filter by center type',
        'View center details and services',
        'Get directions to center'
      ],
      color: 'red',
      link: '/health-centers'
    },
    {
      id: 6,
      title: 'Order Medicines Online',
      icon: Pill,
      description: 'Order medicines with pickup or home delivery',
      steps: [
        'Upload prescription or browse medicines',
        'Select pharmacy',
        'Choose delivery option',
        'Add delivery address',
        'Complete payment and order'
      ],
      color: 'indigo',
      link: '/auth/login'
    },
    {
      id: 7,
      title: 'AI Health Assistant',
      icon: MessageCircle,
      description: 'Get instant health guidance and symptom checking',
      steps: [
        'Access AI Health Assistant',
        'Select your language preference',
        'Describe your symptoms',
        'Get preliminary guidance',
        'Book consultation if needed'
      ],
      color: 'teal',
      link: '/health-assistant'
    },
    {
      id: 8,
      title: 'Rate & Review',
      icon: Star,
      description: 'Give feedback after consultation to improve services',
      steps: [
        'Complete your consultation',
        'Rate doctor and services',
        'Write detailed feedback',
        'Submit your review',
        'Help other patients choose'
      ],
      color: 'yellow',
      link: '/auth/login'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      green: 'bg-green-100 text-green-700 border-green-200',
      purple: 'bg-purple-100 text-purple-700 border-purple-200',
      orange: 'bg-orange-100 text-orange-700 border-orange-200',
      red: 'bg-red-100 text-red-700 border-red-200',
      indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      teal: 'bg-teal-100 text-teal-700 border-teal-200',
      yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Complete Tutorial Guide
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Step-by-step tutorials to help you use all SwasthyaMitra features effectively. 
            Available in English, Hindi, and Punjabi.
          </p>
        </div>

        {/* Quick Access Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Link to="/auth/register" className="bg-white rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow">
            <UserPlus className="mx-auto mb-2 text-blue-600" size={24} />
            <span className="text-sm font-medium text-gray-700">Register</span>
          </Link>
          <Link to="/doctors" className="bg-white rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow">
            <Stethoscope className="mx-auto mb-2 text-green-600" size={24} />
            <span className="text-sm font-medium text-gray-700">Find Doctors</span>
          </Link>
          <Link to="/vaccines" className="bg-white rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow">
            <Syringe className="mx-auto mb-2 text-orange-600" size={24} />
            <span className="text-sm font-medium text-gray-700">Book Vaccines</span>
          </Link>
          <Link to="/health-assistant" className="bg-white rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow">
            <MessageCircle className="mx-auto mb-2 text-teal-600" size={24} />
            <span className="text-sm font-medium text-gray-700">AI Assistant</span>
          </Link>
        </div>

        {/* Tutorials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tutorials.map((tutorial) => {
            const IconComponent = tutorial.icon;
            return (
              <div key={tutorial.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${getColorClasses(tutorial.color)}`}>
                    <IconComponent size={24} />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {tutorial.id}. {tutorial.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4">
                    {tutorial.description}
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    {tutorial.steps.map((step, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs flex items-center justify-center font-medium">
                          {index + 1}
                        </div>
                        <span className="text-sm text-gray-600">{step}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Link 
                    to={tutorial.link}
                    className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${getColorClasses(tutorial.color)} hover:opacity-80`}
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Resources */}
        <div className="mt-16 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Additional Resources
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <Shield className="mx-auto mb-3 text-green-600" size={32} />
              <h3 className="font-semibold text-gray-900 mb-2">Security & Privacy</h3>
              <p className="text-sm text-gray-600">
                Your health data is encrypted and secure. Learn about our privacy policies and data protection measures.
              </p>
            </div>
            
            <div className="text-center">
              <QrCode className="mx-auto mb-3 text-blue-600" size={32} />
              <h3 className="font-semibold text-gray-900 mb-2">NABHA Card Benefits</h3>
              <p className="text-sm text-gray-600">
                Your NABHA card provides access to all healthcare services and maintains your complete health history.
              </p>
            </div>
            
            <div className="text-center">
              <Phone className="mx-auto mb-3 text-purple-600" size={32} />
              <h3 className="font-semibold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-sm text-gray-600">
                Need help? Contact our support team anytime. We're here to assist you with any questions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tutorials;


