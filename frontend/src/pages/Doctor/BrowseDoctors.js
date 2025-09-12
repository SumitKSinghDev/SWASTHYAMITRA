import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Stethoscope, Heart, Baby, Bone, Eye, Brain, Ear, Shield, User, Activity } from 'lucide-react';

const SPECIALIZATIONS = [
  { value: 'general_practice', label: 'General Physician', icon: Stethoscope, color: 'blue' },
  { value: 'gynecology', label: 'Gynecologist', icon: User, color: 'pink' },
  { value: 'pediatrics', label: 'Pediatrician', icon: Baby, color: 'green' },
  { value: 'orthopedics', label: 'Orthopedic', icon: Bone, color: 'orange' },
  { value: 'dermatology', label: 'Dermatology', icon: Shield, color: 'purple' },
  { value: 'cardiology', label: 'Cardiology', icon: Heart, color: 'red' },
  { value: 'psychiatry', label: 'Psychiatry', icon: Brain, color: 'indigo' },
  { value: 'ent', label: 'ENT', icon: Ear, color: 'teal' },
  { value: 'ophthalmology', label: 'Ophthalmology', icon: Eye, color: 'yellow' },
  { value: 'family_medicine', label: 'Family Medicine', icon: Activity, color: 'emerald' },
];

const SYMPTOM_CATEGORIES = [
  {
    category: 'General Health',
    symptoms: [
      { name: 'Fever & Cold', specializations: ['general_practice', 'family_medicine'] },
      { name: 'Headache', specializations: ['general_practice', 'family_medicine'] },
      { name: 'Fatigue', specializations: ['general_practice', 'family_medicine'] },
      { name: 'Digestive Issues', specializations: ['general_practice', 'family_medicine'] },
    ]
  },
  {
    category: 'Women\'s Health',
    symptoms: [
      { name: 'Pregnancy Care', specializations: ['gynecology'] },
      { name: 'Menstrual Issues', specializations: ['gynecology'] },
      { name: 'Breast Health', specializations: ['gynecology'] },
      { name: 'Fertility', specializations: ['gynecology'] },
    ]
  },
  {
    category: 'Children\'s Health',
    symptoms: [
      { name: 'Child Vaccination', specializations: ['pediatrics'] },
      { name: 'Growth Issues', specializations: ['pediatrics'] },
      { name: 'Child Fever', specializations: ['pediatrics', 'general_practice'] },
      { name: 'Behavioral Issues', specializations: ['pediatrics', 'psychiatry'] },
    ]
  },
  {
    category: 'Bone & Joint',
    symptoms: [
      { name: 'Back Pain', specializations: ['orthopedics', 'general_practice'] },
      { name: 'Joint Pain', specializations: ['orthopedics'] },
      { name: 'Sports Injury', specializations: ['orthopedics'] },
      { name: 'Arthritis', specializations: ['orthopedics', 'general_practice'] },
    ]
  },
  {
    category: 'Skin & Hair',
    symptoms: [
      { name: 'Skin Rashes', specializations: ['dermatology'] },
      { name: 'Acne', specializations: ['dermatology'] },
      { name: 'Hair Loss', specializations: ['dermatology'] },
      { name: 'Allergies', specializations: ['dermatology', 'general_practice'] },
    ]
  },
  {
    category: 'Heart & Lungs',
    symptoms: [
      { name: 'Chest Pain', specializations: ['cardiology', 'general_practice'] },
      { name: 'Breathing Issues', specializations: ['cardiology', 'general_practice'] },
      { name: 'High Blood Pressure', specializations: ['cardiology', 'general_practice'] },
      { name: 'Heart Palpitations', specializations: ['cardiology'] },
    ]
  },
  {
    category: 'Mental Health',
    symptoms: [
      { name: 'Anxiety', specializations: ['psychiatry', 'general_practice'] },
      { name: 'Depression', specializations: ['psychiatry'] },
      { name: 'Sleep Issues', specializations: ['psychiatry', 'general_practice'] },
      { name: 'Stress Management', specializations: ['psychiatry', 'general_practice'] },
    ]
  },
  {
    category: 'Eyes & Ears',
    symptoms: [
      { name: 'Vision Problems', specializations: ['ophthalmology'] },
      { name: 'Eye Pain', specializations: ['ophthalmology'] },
      { name: 'Hearing Issues', specializations: ['ent'] },
      { name: 'Ear Pain', specializations: ['ent'] },
    ]
  }
];

const BrowseDoctors = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [q, setQ] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [sort, setSort] = useState('rating');
  const [order, setOrder] = useState('desc');
  const [selectedSymptom, setSelectedSymptom] = useState('');
  const [showSymptomSelector, setShowSymptomSelector] = useState(false);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

  const fetchDoctors = async (resetPage = false) => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page: resetPage ? 1 : page,
        limit: 12,
        sort,
        order,
        isVerified: true,
      };
      if (q) params.q = q;
      if (specialization) params.specialization = specialization;

      const { data } = await axios.get(`${API_BASE}/doctors`, { params });
      setDoctors(data?.data?.doctors || []);
      setTotalPages(data?.data?.pagination?.totalPages || 1);
      if (resetPage) setPage(1);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specialization, sort, order]);

  useEffect(() => {
    fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDoctors(true);
  };

  const handleSymptomSelect = (symptom) => {
    setSelectedSymptom(symptom.name);
    setShowSymptomSelector(false);
    // Find the first specialization for this symptom
    const firstSpecialization = symptom.specializations[0];
    setSpecialization(firstSpecialization);
    fetchDoctors(true);
  };

  const clearSymptomSelection = () => {
    setSelectedSymptom('');
    setSpecialization('');
    fetchDoctors(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find a Doctor</h1>
        <p className="text-gray-600">Browse verified doctors by specialization and experience</p>
      </div>

      {/* Symptom Selector */}
      <div className="card">
        <div className="card-content">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Select Your Health Issue</h3>
            {selectedSymptom && (
              <button
                onClick={clearSymptomSelection}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear Selection
              </button>
            )}
          </div>
          
          {selectedSymptom ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">
                <strong>Selected:</strong> {selectedSymptom}
              </p>
              <p className="text-sm text-green-600 mt-1">
                Showing doctors specialized in this area
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {SYMPTOM_CATEGORIES.map((category) => (
                <div key={category.category} className="space-y-2">
                  <h4 className="font-medium text-gray-700 text-sm">{category.category}</h4>
                  <div className="space-y-1">
                    {category.symptoms.map((symptom) => (
                      <button
                        key={symptom.name}
                        onClick={() => handleSymptomSelect(symptom)}
                        className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors"
                      >
                        {symptom.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-content flex flex-col md:flex-row gap-4">
          <form className="flex-1 flex gap-3" onSubmit={handleSearch}>
            <input
              type="text"
              className="input flex-1"
              placeholder="Search by name..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select
              className="input"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
            >
              <option value="">All Specializations</option>
              {SPECIALIZATIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="rating">Top Rated</option>
              <option value="experience">Experience</option>
              <option value="fee">Consultation Fee</option>
            </select>
            <select className="input" value={order} onChange={(e) => setOrder(e.target.value)}>
              <option value="desc">High to Low</option>
              <option value="asc">Low to High</option>
            </select>
            <button className="btn btn-primary" type="submit">Search</button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center text-gray-600">Loading...</div>
        ) : error ? (
          <div className="col-span-full text-center text-red-600">{error}</div>
        ) : doctors.length === 0 ? (
          <div className="col-span-full text-center text-gray-600">No doctors found.</div>
        ) : (
          doctors.map((d) => {
            const spec = SPECIALIZATIONS.find(s => s.value === d.specialization);
            const IconComponent = spec?.icon || Stethoscope;
            const colorClass = spec?.color || 'blue';
            
            return (
              <div key={d._id} className="card hover:shadow-lg transition-shadow">
                <div className="card-content">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full bg-${colorClass}-100 flex items-center justify-center`}>
                      <IconComponent className={`w-6 h-6 text-${colorClass}-700`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Dr. {d?.userId?.firstName} {d?.userId?.lastName}
                      </h3>
                      <p className="text-sm text-gray-600 capitalize">{d.specialization.replaceAll('_', ' ')}</p>
                      <p className="text-xs text-gray-500">{d.experience} yrs • ⭐ {d.rating?.average?.toFixed?.(1) || 0} ({d.rating?.count || 0})</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Fee: ₹{d.consultationFee}
                    </div>
                    <div className="flex gap-2">
                      <button className="btn btn-outline btn-sm">View Profile</button>
                      <button className="btn btn-primary btn-sm">Book Appointment</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {doctors.length > 0 && (
        <div className="flex items-center justify-center gap-3">
          <button
            className="btn btn-outline btn-sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <button
            className="btn btn-outline btn-sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default BrowseDoctors;


