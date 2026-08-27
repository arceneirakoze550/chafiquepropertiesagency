import React, { useState } from 'react';
import { Database, ShieldCheck, AlertCircle, ExternalLink, Key, CheckCircle2, Copy, X } from 'lucide-react';
import { isFirebaseConfigured, firebaseConfig } from '../../lib/firebase';

export const FirebaseStatusBanner: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const configured = isFirebaseConfigured();

  const envSample = `# Firebase Production Credentials
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:...
`;

  const copyEnv = () => {
    navigator.clipboard.writeText(envSample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div 
        id="firebase-status-badge"
        className={`px-3 py-1.5 text-xs font-medium flex items-center gap-2 border transition-all cursor-pointer ${
          configured
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
        }`}
        onClick={() => setShowModal(true)}
        title="Click to view Firebase Configuration & Status"
      >
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${configured ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${configured ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
        </span>
        <Database className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">
          {configured ? `Cloud Firestore Connected (${firebaseConfig.projectId})` : 'Cloud Database Ready (Click for Config)'}
        </span>
        <span className="sm:hidden">
          {configured ? 'Live DB' : 'DB Ready'}
        </span>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${configured ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {configured ? 'Firebase Live Connected' : 'Firebase Production Database Setup'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {configured ? 'Operating with verified Firestore & Cloud Storage' : 'Full dual-mode architecture: seamlessly reads & writes to Firestore when env keys are added'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-sm text-slate-600">
              {configured ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 space-y-2">
                  <div className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Firebase Live Connection Active</span>
                  </div>
                  <p className="text-xs text-emerald-700">
                    Project ID: <strong className="font-mono">{firebaseConfig.projectId}</strong>
                  </p>
                  <p className="text-xs text-emerald-700">
                    All property listings, reservations, inquiries, and image uploads sync with live Firebase Firestore & Storage.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 space-y-2">
                  <div className="flex items-center gap-2 font-medium">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Environment Variables Setup Guide</span>
                  </div>
                  <p className="text-xs text-amber-800">
                    To connect your own Firebase project in production or Vercel, copy the environment variables below into your <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">.env</code> or Vercel Project Settings.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Required Environment Variables (.env / Vercel)
                  </label>
                  <button
                    onClick={copyEnv}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
                  >
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy Template'}
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 text-slate-100 text-xs rounded-lg font-mono overflow-x-auto">
                  {envSample}
                </pre>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <h4 className="font-medium text-slate-900 text-xs uppercase tracking-wider">
                  Firebase Console Quick Checklist:
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700">
                  <li>Go to <strong className="text-slate-900">Firebase Console</strong> &gt; Create Project &gt; Add Web App</li>
                  <li>Enable <strong className="text-slate-900">Firestore Database</strong> in Production Mode</li>
                  <li>Enable <strong className="text-slate-900">Firebase Storage</strong> for image uploads</li>
                  <li>Enable <strong className="text-slate-900">Authentication</strong> (Email/Password)</li>
                  <li>Deploy the generated <code className="font-mono text-indigo-600">firestore.rules</code> and <code className="font-mono text-indigo-600">storage.rules</code> provided in this project</li>
                </ol>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800 transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
