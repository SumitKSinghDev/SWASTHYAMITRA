import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowRight, PlayCircle, ShieldCheck, Stethoscope, QrCode, MessageCircle, Syringe, MapPin, Pill, AlertTriangle } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleBookDoctor = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      const role = user?.role || 'patient';
      navigate(`/dashboard/${role}`);
    }
  };

  const handleHealthAssistant = () => {
    navigate('/health-assistant');
  };

  const handleVaccineBooking = () => {
    navigate('/vaccines');
  };

  const handleHealthCenters = () => {
    navigate('/health-centers');
  };

  const handleMedicineOrder = () => {
    if (!isAuthenticated) {
      navigate('/auth/login');
    } else {
      navigate('/patient/medicine-orders');
    }
  };

  const handleHealthProblems = () => {
    navigate('/health-problems');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white to-gray-50">
      {/* Animated background blob */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary-200/40 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-green-200/40 blur-3xl animate-pulse" />

      {/* Hero */}
      <header className="relative max-w-6xl mx-auto px-6 pt-6 pb-6">
        <div className="text-center">
          <img
            src="/SWASTHYA.png"
            alt="SwasthyaMitra"
            className="mx-auto h-28 w-28 md:h-32 md:w-32 object-contain mb-1"
          />
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-green-700">
              SWASTHYAMITRA
            </span>
          </h1>
          <p className="mt-2 text-base md:text-lg font-medium text-gray-700">
            “Healthcare at Your Fingertips – For Every Village in Nabha”
          </p>
          <p className="mt-2 text-gray-600 max-w-3xl mx-auto">
            SwasthyaMitra connects rural patients with doctors through video consultations, NABHA Health Card,
            and digital prescriptions. Get vaccines, medicines, and reliable care without long travel.
          </p>
          <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Telemedicine platform for seamless patient care: book, consult, and manage health records.
          </p>

          {/* Quick badges */}
          <div className="mt-6 flex items-center justify-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-primary-700 ring-1 ring-primary-100">
              <ShieldCheck size={14} /> Secure
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-green-700 ring-1 ring-green-100">
              <Stethoscope size={14} /> Verified Doctors
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-amber-700 ring-1 ring-amber-100">
              <QrCode size={14} /> NABHA Card
            </span>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to="/auth/register" className="btn btn-primary group">
              Create Account
              <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link to="/auth/login" className="btn btn-outline">
              Sign In
            </Link>
            <button onClick={handleBookDoctor} className="btn btn-outline group">
              Book a Doctor
              <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button onClick={handleHealthAssistant} className="btn btn-outline group">
              AI Health Assistant
              <MessageCircle size={16} className="ml-2" />
            </button>
            <button onClick={handleVaccineBooking} className="btn btn-outline group">
              Book Vaccines
              <Syringe size={16} className="ml-2" />
            </button>
            <Link to="/tutorials" className="btn btn-ghost inline-flex items-center">
              <PlayCircle size={18} className="mr-2" /> Learn How It Works
            </Link>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="relative max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
            <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center mb-3">
              <Stethoscope size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Book Appointments</h3>
            <p className="mt-2 text-gray-600">Video or in-person consultations with verified doctors.</p>
            <Link to="/doctors" className="mt-4 inline-flex items-center text-primary-700 hover:text-primary-800">
              Explore Doctors <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>

          <div className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
            <div className="w-10 h-10 rounded-lg bg-green-100 text-green-700 flex items-center justify-center mb-3">
              <QrCode size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Digital Prescriptions</h3>
            <p className="mt-2 text-gray-600">Access prescriptions anywhere, anytime.</p>
            <Link to="/auth/login" className="mt-4 inline-flex items-center text-green-700 hover:text-green-800">
              View Samples <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>

          <div className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
            <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center mb-3">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Health Records</h3>
            <p className="mt-2 text-gray-600">Keep all your medical history organized securely.</p>
            <Link to="/auth/register" className="mt-4 inline-flex items-center text-rose-700 hover:text-rose-800">
              Get Started <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="relative max-w-6xl mx-auto px-6 py-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Complete Healthcare Services</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            From vaccination to medicine delivery, we provide comprehensive healthcare solutions for rural communities.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
              <Syringe size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Government Vaccines</h3>
            <p className="mt-2 text-gray-600">Book free vaccines like Polio, Hepatitis B, COVID booster.</p>
            <button onClick={handleVaccineBooking} className="mt-4 inline-flex items-center text-blue-700 hover:text-blue-800">
              Book Now <ArrowRight size={16} className="ml-1" />
            </button>
          </div>

          <div className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
            <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center mb-3">
              <MapPin size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Locate Health Centers</h3>
            <p className="mt-2 text-gray-600">Find nearest ASHA worker centers and mini health centers.</p>
            <button onClick={handleHealthCenters} className="mt-4 inline-flex items-center text-orange-700 hover:text-orange-800">
              Find Centers <ArrowRight size={16} className="ml-1" />
            </button>
          </div>

          <div className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
              <Pill size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Medicine Orders</h3>
            <p className="mt-2 text-gray-600">Order medicines online with pickup or home delivery.</p>
            <button onClick={handleMedicineOrder} className="mt-4 inline-flex items-center text-purple-700 hover:text-purple-800">
              Order Now <ArrowRight size={16} className="ml-1" />
            </button>
          </div>

          <div className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
            <div className="w-10 h-10 rounded-lg bg-red-100 text-red-700 flex items-center justify-center mb-3">
              <AlertTriangle size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Common Health Issues</h3>
            <p className="mt-2 text-gray-600">Learn about local health problems and prevention tips.</p>
            <button onClick={handleHealthProblems} className="mt-4 inline-flex items-center text-red-700 hover:text-red-800">
              Learn More <ArrowRight size={16} className="ml-1" />
            </button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative max-w-6xl mx-auto px-6 pb-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 text-center">How it works</h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: '1', title: 'Register', text: 'Create account and generate NABHA Card' },
              { step: '2', title: 'Choose Doctor', text: 'Pick a specialization and slot' },
              { step: '3', title: 'Consult', text: 'Video or in-person appointment' },
              { step: '4', title: 'Prescription', text: 'Receive digital Rx and records' },
            ].map((s) => (
              <div key={s.step} className="rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-600 text-white text-sm font-bold">
                  {s.step}
                </div>
                <h3 className="mt-3 font-semibold text-gray-900">{s.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative max-w-6xl mx-auto px-6 py-10 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} SWASTHYAMITRA. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
