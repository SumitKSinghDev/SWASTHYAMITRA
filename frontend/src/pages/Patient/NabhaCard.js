import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { QrCode, Download, Share2, Phone, Mail, MapPin, Calendar, Shield, Copy, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import QRCode from 'qrcode.react';
import { useTranslation } from '../../hooks/useTranslation';

const PatientNabhaCard = () => {
  const { user } = useSelector((state) => state.auth);
  const [copied, setCopied] = useState(false);
  const [qrRefreshKey, setQrRefreshKey] = useState(0);
  const { t } = useTranslation();

  // Generate unique QR code data for each user
  const generateQRData = () => {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const userId = user?._id || 'demo-user';
    const refreshKey = qrRefreshKey;
    
    // Create a more complex QR code structure
    const qrData = {
      nabhaId: user?.nabhaId || 'NABHA815959NTQF',
      userId: userId,
      timestamp: timestamp,
      randomId: randomId,
      refreshKey: refreshKey,
      randomSuffix: randomSuffix,
      version: '1.0',
      type: 'NABHA_QR'
    };
    
    return {
      nabhaId: user?.nabhaId || 'NABHA815959NTQF',
      userId: userId,
      timestamp: timestamp,
      randomId: randomId,
      refreshKey: refreshKey,
      qrCode: JSON.stringify(qrData),
      qrCodeSimple: `${user?.nabhaId || 'NABHA815959NTQF'}-${randomId}-${timestamp}-${refreshKey}`,
      name: `${user?.firstName || 'Demo'} ${user?.lastName || 'User'}`,
      phone: user?.phone || '9876543210',
      email: user?.email || 'demo@code4care.com',
      dateOfBirth: user?.dateOfBirth || '1990-01-01',
      gender: user?.gender || 'male',
      address: user?.address || {
        street: '123 Main Street',
        city: 'Amritsar',
        state: 'Punjab',
        pincode: '143001'
      }
    };
  };

  const nabhaData = generateQRData();


  const handleCopyNabhaId = () => {
    navigator.clipboard.writeText(nabhaData.qrCode);
    setCopied(true);
    toast.success('QR Code data copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCard = () => {
    // In a real app, this would generate and download a PDF
    toast.info('Card download feature coming soon!');
  };

  const handleShareCard = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My NABHA Health Card',
        text: `NABHA ID: ${nabhaData.nabhaId}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(`NABHA ID: ${nabhaData.nabhaId}`);
      toast.success('NABHA ID copied to clipboard!');
    }
  };

  const handlePrintCard = () => {
    window.print();
  };

  const handleRefreshQR = () => {
    setQrRefreshKey(prev => prev + 1);
    toast.success('QR Code refreshed successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('nabha_health_card_title')}</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">{t('digital_health_identity')}</p>
        </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={handlePrintCard}
                        className="btn btn-outline flex items-center space-x-2"
                      >
                        <QrCode size={16} />
                        <span>{t('print')}</span>
                      </button>
                      <button
                        onClick={handleDownloadCard}
                        className="btn btn-outline flex items-center space-x-2"
                      >
                        <Download size={16} />
                        <span>{t('download')}</span>
                      </button>
                      <button
                        onClick={handleShareCard}
                        className="btn btn-outline flex items-center space-x-2"
                      >
                        <Share2 size={16} />
                        <span>{t('share')}</span>
                      </button>
                    </div>
      </div>

      {/* NABHA Card */}
      <div className="max-w-2xl mx-auto">
        <div className="nabha-card">
          {/* Card Header */}
          <div className="nabha-card-header">
            <div>
              <h4 className="nabha-card-title">{t('nabha_health_card_title')}</h4>
              <p className="text-sm text-primary-600">{t('national_health_authority')}</p>
            </div>
            <div className="text-right">
              <span className="nabha-card-id">{nabhaData.nabhaId}</span>
                          <button
                            onClick={handleCopyNabhaId}
                            className="flex items-center space-x-1 text-xs text-primary-600 hover:text-primary-700 mt-1"
                          >
                            {copied ? <Check size={12} /> : <Copy size={12} />}
                            <span>{copied ? t('copied') : t('copy_id')}</span>
                          </button>
            </div>
          </div>

          {/* Card Content */}
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-primary-800 mb-2">
                  {nabhaData.name}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <Phone size={16} className="text-primary-600" />
                    <span className="text-sm text-primary-700">{nabhaData.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail size={16} className="text-primary-600" />
                    <span className="text-sm text-primary-700">{nabhaData.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar size={16} className="text-primary-600" />
                    <span className="text-sm text-primary-700">
                      DOB: {new Date(nabhaData.dateOfBirth).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield size={16} className="text-primary-600" />
                    <span className="text-sm text-primary-700 capitalize">
                      {nabhaData.gender}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* QR Code */}
              <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center shadow-sm p-2">
                <QRCode
                  value={nabhaData.qrCode}
                  size={80}
                  level="M"
                  includeMargin={false}
                  renderAs="svg"
                />
              </div>
            </div>

            {/* Address */}
            <div className="pt-4 border-t border-primary-200">
              <div className="flex items-start space-x-3">
                <MapPin size={16} className="text-primary-600 mt-1" />
                <div>
                  <p className="text-sm font-medium text-primary-800">{t('address')}</p>
                  <p className="text-sm text-primary-700">
                    {nabhaData.address?.street || '123 Main Street'}, {nabhaData.address?.city || 'Amritsar'}
                  </p>
                  <p className="text-sm text-primary-700">
                    {nabhaData.address?.state || 'Punjab'} - {nabhaData.address?.pincode || '143001'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Scanner Section */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">QR Code Scanner</h3>
        </div>
        <div className="card-content">
          <div className="text-center">
            <div className="w-48 h-48 bg-white rounded-xl flex items-center justify-center shadow-sm mx-auto mb-4 p-4">
              <QRCode
                value={nabhaData.qrCode}
                size={200}
                level="M"
                includeMargin={true}
                renderAs="svg"
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {t('scan_qr_code_access_records')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
              QR Code #{nabhaData.refreshKey + 1} • {t('generated')} {new Date(nabhaData.timestamp).toLocaleTimeString()}
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">{t('qr_code_information')}</h4>
              <div className="space-y-2">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>{t('simple_id')}:</strong> <span className="font-mono font-bold">{nabhaData.qrCodeSimple}</span>
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>{t('generated')}:</strong> {new Date(nabhaData.timestamp).toLocaleString()}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>{t('random_id')}:</strong> {nabhaData.randomId}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>{t('refresh_count')}:</strong> {nabhaData.refreshKey}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                  {t('healthcare_providers_scan')}
                </p>
              </div>
            </div>
            <div className="flex justify-center space-x-3">
              <button
                onClick={handleRefreshQR}
                className="btn btn-outline btn-sm flex items-center space-x-2"
              >
                <QrCode size={16} />
                <span>{t('refresh_qr')}</span>
              </button>
              <button
                onClick={handleCopyNabhaId}
                className="btn btn-outline btn-sm flex items-center space-x-2"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? t('copied') : t('copy_qr_data')}</span>
              </button>
              <button
                onClick={handleDownloadCard}
                className="btn btn-primary btn-sm flex items-center space-x-2"
              >
                <Download size={16} />
                <span>{t('download_card')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Card Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <QrCode size={20} className="text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">{t('digital_identity')}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('unique_health_identifier')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Shield size={20} className="text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">{t('secure_access')}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('encrypted_secure_access')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar size={20} className="text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">{t('lifetime_validity')}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('valid_for_lifetime')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">How to Use Your NABHA Card</h3>
        </div>
        <div className="card-content">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Show at Healthcare Facilities</h4>
                <p className="text-sm text-gray-600">
                  Present your NABHA ID or QR code at hospitals, clinics, and pharmacies for instant access to your medical records.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Access Digital Records</h4>
                <p className="text-sm text-gray-600">
                  Healthcare providers can instantly access your medical history, prescriptions, and test results using your NABHA ID.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Emergency Situations</h4>
                <p className="text-sm text-gray-600">
                  In emergencies, your NABHA ID helps medical staff quickly access critical health information to provide appropriate care.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientNabhaCard;