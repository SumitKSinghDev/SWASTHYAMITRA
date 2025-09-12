import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  Heart, 
  Droplets, 
  Thermometer, 
  Shield, 
  Baby, 
  Eye, 
  Brain, 
  Stethoscope,
  ArrowRight,
  Search,
  Filter,
  BookOpen,
  Phone
} from 'lucide-react';

const HEALTH_PROBLEMS = [
  {
    id: 'diarrhea',
    title: 'Diarrhea & Water-borne Diseases',
    icon: Droplets,
    color: 'blue',
    severity: 'high',
    symptoms: ['Frequent loose stools', 'Dehydration', 'Stomach cramps', 'Nausea'],
    causes: ['Contaminated water', 'Poor hygiene', 'Food poisoning', 'Viral infections'],
    prevention: [
      'Drink only boiled or filtered water',
      'Wash hands frequently with soap',
      'Avoid street food during monsoon',
      'Keep food covered and refrigerated'
    ],
    homeRemedies: [
      'Oral Rehydration Solution (ORS)',
      'Banana and rice diet',
      'Coconut water for hydration',
      'Avoid dairy products temporarily'
    ],
    whenToConsult: 'If diarrhea persists for more than 2 days, or if there are signs of severe dehydration',
    relatedSpecializations: ['general_practice', 'pediatrics'],
    emergency: false
  },
  {
    id: 'seasonal_flu',
    title: 'Seasonal Flu & Cold',
    icon: Thermometer,
    color: 'red',
    severity: 'medium',
    symptoms: ['Fever', 'Cough', 'Runny nose', 'Body aches', 'Headache'],
    causes: ['Viral infections', 'Weather changes', 'Weak immunity', 'Close contact with infected'],
    prevention: [
      'Get annual flu vaccination',
      'Wash hands regularly',
      'Avoid touching face',
      'Stay away from sick people'
    ],
    homeRemedies: [
      'Rest and plenty of fluids',
      'Warm salt water gargle',
      'Steam inhalation',
      'Honey and ginger tea'
    ],
    whenToConsult: 'If fever is high (>101°F) or persists for more than 3 days',
    relatedSpecializations: ['general_practice', 'family_medicine'],
    emergency: false
  },
  {
    id: 'skin_infections',
    title: 'Skin Infections & Rashes',
    icon: Shield,
    color: 'purple',
    severity: 'medium',
    symptoms: ['Itchy rashes', 'Redness', 'Swelling', 'Blisters', 'Dry patches'],
    causes: ['Fungal infections', 'Allergic reactions', 'Poor hygiene', 'Contact with irritants'],
    prevention: [
      'Keep skin clean and dry',
      'Use mild soaps',
      'Wear loose cotton clothes',
      'Avoid sharing personal items'
    ],
    homeRemedies: [
      'Apply coconut oil for dryness',
      'Cold compress for itching',
      'Oatmeal bath for irritation',
      'Keep affected area clean and dry'
    ],
    whenToConsult: 'If rash spreads rapidly or becomes infected',
    relatedSpecializations: ['dermatology', 'general_practice'],
    emergency: false
  },
  {
    id: 'malnutrition',
    title: 'Malnutrition & Nutritional Deficiencies',
    icon: Heart,
    color: 'green',
    severity: 'high',
    symptoms: ['Weakness', 'Weight loss', 'Hair loss', 'Brittle nails', 'Poor concentration'],
    causes: ['Inadequate diet', 'Poverty', 'Lack of awareness', 'Digestive disorders'],
    prevention: [
      'Balanced diet with all food groups',
      'Regular meals',
      'Include fruits and vegetables',
      'Adequate protein intake'
    ],
    homeRemedies: [
      'Nutrient-rich foods like eggs, milk, nuts',
      'Green leafy vegetables',
      'Fortified foods',
      'Regular meal timing'
    ],
    whenToConsult: 'If symptoms persist despite dietary changes',
    relatedSpecializations: ['general_practice', 'pediatrics'],
    emergency: false
  },
  {
    id: 'respiratory',
    title: 'Respiratory Problems',
    icon: Stethoscope,
    color: 'orange',
    severity: 'high',
    symptoms: ['Cough', 'Shortness of breath', 'Chest pain', 'Wheezing'],
    causes: ['Air pollution', 'Smoking', 'Allergies', 'Infections'],
    prevention: [
      'Avoid smoking and secondhand smoke',
      'Use air purifiers indoors',
      'Wear masks in polluted areas',
      'Regular exercise for lung health'
    ],
    homeRemedies: [
      'Steam inhalation',
      'Warm fluids',
      'Honey and lemon',
      'Deep breathing exercises'
    ],
    whenToConsult: 'If breathing difficulty is severe or persistent',
    relatedSpecializations: ['general_practice', 'cardiology'],
    emergency: true
  },
  {
    id: 'maternal_health',
    title: 'Maternal & Child Health Issues',
    icon: Baby,
    color: 'pink',
    severity: 'high',
    symptoms: ['Pregnancy complications', 'Child development issues', 'Nutritional needs'],
    causes: ['Lack of prenatal care', 'Poor nutrition', 'Infections', 'Genetic factors'],
    prevention: [
      'Regular prenatal checkups',
      'Balanced nutrition during pregnancy',
      'Vaccination schedule for children',
      'Hygiene and sanitation'
    ],
    homeRemedies: [
      'Folic acid supplements',
      'Iron-rich foods',
      'Regular exercise (as advised)',
      'Adequate rest'
    ],
    whenToConsult: 'Regular checkups are essential during pregnancy and for child health',
    relatedSpecializations: ['gynecology', 'pediatrics'],
    emergency: false
  },
  {
    id: 'eye_problems',
    title: 'Eye Problems & Vision Issues',
    icon: Eye,
    color: 'yellow',
    severity: 'medium',
    symptoms: ['Blurred vision', 'Eye strain', 'Redness', 'Itching', 'Watery eyes'],
    causes: ['Excessive screen time', 'Poor lighting', 'Allergies', 'Age-related changes'],
    prevention: [
      'Follow 20-20-20 rule (every 20 minutes, look at something 20 feet away for 20 seconds)',
      'Proper lighting while reading',
      'Regular eye exercises',
      'Protective eyewear when needed'
    ],
    homeRemedies: [
      'Cold compress for tired eyes',
      'Eye exercises',
      'Adequate sleep',
      'Limit screen time'
    ],
    whenToConsult: 'If vision problems persist or worsen',
    relatedSpecializations: ['ophthalmology', 'general_practice'],
    emergency: false
  },
  {
    id: 'mental_health',
    title: 'Mental Health & Stress',
    icon: Brain,
    color: 'indigo',
    severity: 'high',
    symptoms: ['Anxiety', 'Depression', 'Mood swings', 'Sleep problems', 'Irritability'],
    causes: ['Stress', 'Trauma', 'Social isolation', 'Economic pressure'],
    prevention: [
      'Regular exercise and meditation',
      'Maintain social connections',
      'Healthy work-life balance',
      'Seek help when needed'
    ],
    homeRemedies: [
      'Deep breathing exercises',
      'Regular physical activity',
      'Adequate sleep',
      'Talk to trusted friends or family'
    ],
    whenToConsult: 'If symptoms interfere with daily life or persist for weeks',
    relatedSpecializations: ['psychiatry', 'general_practice'],
    emergency: false
  }
];

const HealthProblems = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProblem, setSelectedProblem] = useState(null);
  const navigate = useNavigate();

  const categories = [
    { value: 'all', label: 'All Problems' },
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'emergency', label: 'Emergency Cases' }
  ];

  const filteredProblems = HEALTH_PROBLEMS.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         problem.symptoms.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || 
                           (selectedCategory === 'emergency' ? problem.emergency : problem.severity === selectedCategory);
    
    return matchesSearch && matchesCategory;
  });

  const handleConsultDoctor = (specializations) => {
    // Navigate to doctors page with specialization filter
    const specialization = specializations[0];
    navigate(`/doctors?specialization=${specialization}`);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityLabel = (severity) => {
    switch (severity) {
      case 'high': return 'High Priority';
      case 'medium': return 'Medium Priority';
      case 'low': return 'Low Priority';
      default: return 'Normal';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Common Health Problems in Nabha
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Learn about common health issues in our region, their prevention, home remedies, 
          and when to consult a doctor. Get quick access to specialized healthcare.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="card-content">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                className="input pl-10"
                placeholder="Search health problems or symptoms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="input"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Health Problems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProblems.map((problem) => {
          const IconComponent = problem.icon;
          return (
            <div key={problem.id} className="card hover:shadow-lg transition-shadow cursor-pointer"
                 onClick={() => setSelectedProblem(problem)}>
              <div className="card-content">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-${problem.color}-100 flex items-center justify-center`}>
                    <IconComponent className={`w-6 h-6 text-${problem.color}-600`} />
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(problem.severity)}`}>
                      {getSeverityLabel(problem.severity)}
                    </span>
                    {problem.emergency && (
                      <div className="mt-1">
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-600">
                          Emergency
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {problem.title}
                </h3>

                <div className="space-y-2 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Common Symptoms:</p>
                    <p className="text-sm text-gray-600">
                      {problem.symptoms.slice(0, 3).join(', ')}
                      {problem.symptoms.length > 3 && ` +${problem.symptoms.length - 3} more`}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    className="btn btn-outline btn-sm flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProblem(problem);
                    }}
                  >
                    <BookOpen size={14} />
                    Learn More
                  </button>
                  <button 
                    className="btn btn-primary btn-sm flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConsultDoctor(problem.relatedSpecializations);
                    }}
                  >
                    <Phone size={14} />
                    Consult Doctor
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Problem Detail Modal */}
      {selectedProblem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 rounded-lg bg-${selectedProblem.color}-100 flex items-center justify-center`}>
                    <selectedProblem.icon className={`w-8 h-8 text-${selectedProblem.color}-600`} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedProblem.title}
                    </h2>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`px-3 py-1 text-sm rounded-full ${getSeverityColor(selectedProblem.severity)}`}>
                        {getSeverityLabel(selectedProblem.severity)}
                      </span>
                      {selectedProblem.emergency && (
                        <span className="px-3 py-1 text-sm rounded-full bg-red-100 text-red-600">
                          Emergency Case
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProblem(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Symptoms */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                      <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
                      Symptoms
                    </h3>
                    <ul className="space-y-1">
                      {selectedProblem.symptoms.map((symptom, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center">
                          <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                          {symptom}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Causes</h3>
                    <ul className="space-y-1">
                      {selectedProblem.causes.map((cause, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                          {cause}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Prevention & Remedies */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                      <Shield className="w-5 h-5 text-green-500 mr-2" />
                      Prevention
                    </h3>
                    <ul className="space-y-1">
                      {selectedProblem.prevention.map((tip, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Home Remedies</h3>
                    <ul className="space-y-1">
                      {selectedProblem.homeRemedies.map((remedy, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                          {remedy}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* When to Consult */}
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  When to Consult a Doctor
                </h3>
                <p className="text-sm text-yellow-700 mb-4">
                  {selectedProblem.whenToConsult}
                </p>
                <button
                  onClick={() => handleConsultDoctor(selectedProblem.relatedSpecializations)}
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <Stethoscope size={16} />
                  <span>Find a Doctor</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <div className="card-content text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Need Immediate Help?
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/doctors')}
              className="btn btn-primary flex items-center justify-center space-x-2"
            >
              <Stethoscope size={16} />
              <span>Find a Doctor</span>
            </button>
            <button 
              onClick={() => navigate('/pharmacies')}
              className="btn btn-outline flex items-center justify-center space-x-2"
            >
              <BookOpen size={16} />
              <span>Find a Pharmacy</span>
            </button>
            <button 
              onClick={() => navigate('/tutorials')}
              className="btn btn-outline flex items-center justify-center space-x-2"
            >
              <BookOpen size={16} />
              <span>Health Tutorials</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthProblems;
