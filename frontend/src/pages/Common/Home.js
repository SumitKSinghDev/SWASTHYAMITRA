import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowRight, PlayCircle, ShieldCheck, Stethoscope, QrCode, MessageCircle, Syringe, MapPin, Pill, AlertTriangle } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import LanguageSelector from '../../components/Common/LanguageSelector';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { t } = useTranslation();

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

      {/* Language Selector - Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageSelector variant="home" />
      </div>

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
            "{t('healthcare_at_fingertips')}"
          </p>
          <p className="mt-2 text-gray-600 max-w-3xl mx-auto">
            {t('swasthyamitra_description')}
          </p>
          <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            {t('telemedicine_platform')}
          </p>

          {/* Quick badges */}
          <div className="mt-6 flex items-center justify-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-primary-700 ring-1 ring-primary-100">
              <ShieldCheck size={14} /> {t('secure')}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-green-700 ring-1 ring-green-100">
              <Stethoscope size={14} /> {t('verified_doctors')}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-amber-700 ring-1 ring-amber-100">
              <QrCode size={14} /> {t('nabha_card')}
            </span>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to="/auth/register" className="btn btn-primary group">
              {t('create_account')}
              <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link to="/auth/login" className="btn btn-outline">
              {t('sign_in')}
            </Link>
            <button onClick={handleBookDoctor} className="btn btn-outline group">
              {t('book_doctor')}
              <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button onClick={handleHealthAssistant} className="btn btn-outline group">
              {t('ai_health_assistant')}
              <MessageCircle size={16} className="ml-2" />
            </button>
            <button onClick={handleVaccineBooking} className="btn btn-outline group">
              {t('book_vaccines')}
              <Syringe size={16} className="ml-2" />
            </button>
            <Link to="/tutorials" className="btn btn-ghost inline-flex items-center">
              <PlayCircle size={18} className="mr-2" /> {t('learn_how_it_works')}
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
            <h3 className="text-lg font-semibold text-gray-900">{t('book_appointments')}</h3>
            <p className="mt-2 text-gray-600">{t('video_consultations')}</p>
            <Link to="/doctors" className="mt-4 inline-flex items-center text-primary-700 hover:text-primary-800">
              {t('explore_doctors')} <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>

          <div className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
            <div className="w-10 h-10 rounded-lg bg-green-100 text-green-700 flex items-center justify-center mb-3">
              <QrCode size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{t('digital_prescriptions')}</h3>
            <p className="mt-2 text-gray-600">{t('access_prescriptions')}</p>
            <Link to="/auth/login" className="mt-4 inline-flex items-center text-green-700 hover:text-green-800">
              {t('view_samples')} <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>

          <div className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
            <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center mb-3">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{t('health_records')}</h3>
            <p className="mt-2 text-gray-600">{t('medical_history_organized')}</p>
            <Link to="/auth/register" className="mt-4 inline-flex items-center text-rose-700 hover:text-rose-800">
              {t('get_started')} <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="relative max-w-6xl mx-auto px-6 py-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{t('complete_healthcare_services')}</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            {t('comprehensive_healthcare')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
              <Syringe size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{t('government_vaccines')}</h3>
            <p className="mt-2 text-gray-600">{t('book_free_vaccines')}</p>
            <button onClick={handleVaccineBooking} className="mt-4 inline-flex items-center text-blue-700 hover:text-blue-800">
              {t('book_now')} <ArrowRight size={16} className="ml-1" />
            </button>
          </div>

          <div className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
            <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center mb-3">
              <MapPin size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{t('locate_health_centers')}</h3>
            <p className="mt-2 text-gray-600">{t('find_nearest_centers')}</p>
            <button onClick={handleHealthCenters} className="mt-4 inline-flex items-center text-orange-700 hover:text-orange-800">
              {t('find_centers')} <ArrowRight size={16} className="ml-1" />
            </button>
          </div>

          <div className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
              <Pill size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{t('medicine_orders')}</h3>
            <p className="mt-2 text-gray-600">{t('order_medicines_online')}</p>
            <button onClick={handleMedicineOrder} className="mt-4 inline-flex items-center text-purple-700 hover:text-purple-800">
              {t('order_now')} <ArrowRight size={16} className="ml-1" />
            </button>
          </div>

          <div className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
            <div className="w-10 h-10 rounded-lg bg-red-100 text-red-700 flex items-center justify-center mb-3">
              <AlertTriangle size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{t('common_health_issues')}</h3>
            <p className="mt-2 text-gray-600">{t('learn_health_problems')}</p>
            <button onClick={handleHealthProblems} className="mt-4 inline-flex items-center text-red-700 hover:text-red-800">
              {t('learn_more')} <ArrowRight size={16} className="ml-1" />
            </button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative max-w-6xl mx-auto px-6 pb-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 text-center">{t('how_it_works')}</h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: '1', title: t('register_step'), text: t('create_account_nabha') },
              { step: '2', title: t('choose_doctor'), text: t('pick_specialization') },
              { step: '3', title: t('consult'), text: t('video_appointment') },
              { step: '4', title: t('prescription'), text: t('receive_digital_rx') },
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
        <p>© {new Date().getFullYear()} SWASTHYAMITRA. {t('all_rights_reserved')}</p>
      </footer>
    </div>
  );
};

export default Home;
