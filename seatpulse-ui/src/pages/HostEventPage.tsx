import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, FileText, Copy, CheckCircle2 } from 'lucide-react';

export default function HostEventPage() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const supportEmail = "seatpulsesupport@gmail.com";

  const emailSubject = "Organizer Account Request - SeatPulse";
  const emailTemplate = `Hello SeatPulse Team,

I would like to request Admin Access to host events on SeatPulse. Below are my verification details:

1. Full Name:
2. Organization / Company Name:
3. Contact Number:
4. Website / Social Media Link:
5. Types of events planned:
6. GSTIN / Business Registration No / PAN:

(Note: Please attach a scanned copy of your Business Registration or a Government ID for faster verification.)

Thank you,
[Your Name]`;

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(`To: ${supportEmail}\nSubject: ${emailSubject}\n\n${emailTemplate}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleOpenMailApp = () => {
    window.location.href = `mailto:${supportEmail}?subject=${encodeURIComponent(emailSubject)}`;
  };

  return (
    <div className="min-h-screen bg-[#07090E] font-sans text-white pb-24 selection:bg-[#E8D5B5]/30">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07090E]/90 backdrop-blur-md px-5 lg:px-16 h-16 flex items-center">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-5 pt-16">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold mb-6 text-white">
            Host Your Next Event on <span className="text-[#E8D5B5]">SeatPulse</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Join the premier platform built for high-concurrency ticket sales. We provide event organizers with powerful tools, interactive seat maps, and secure payment processing.
          </p>
        </div>

        <div className="bg-[#11131A] p-8 sm:p-12 rounded-3xl border border-white/10 shadow-xl relative overflow-hidden">
          <h2 className="text-2xl font-bold text-white mb-6">How to get started</h2>

          <div className="space-y-6 mb-10">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[#E8D5B5]/10 text-[#E8D5B5] flex items-center justify-center font-bold shrink-0">1</div>
              <div>
                <h4 className="text-white font-bold mb-1">Submit Verification Documents</h4>
                <p className="text-sm text-slate-400">To prevent fraud, all Organizers must provide business details (GSTIN/PAN) and organization links for manual review.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[#E8D5B5]/10 text-[#E8D5B5] flex items-center justify-center font-bold shrink-0">2</div>
              <div>
                <h4 className="text-white font-bold mb-1">Get Approved</h4>
                <p className="text-sm text-slate-400">Once verified, your account will be granted <span className="text-[#E8D5B5] font-mono text-xs">ADMIN</span> privileges, giving you full access to the Organizer Dashboard.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[#E8D5B5]/10 text-[#E8D5B5] flex items-center justify-center font-bold shrink-0">3</div>
              <div>
                <h4 className="text-white font-bold mb-1">Create & Sell</h4>
                <p className="text-sm text-slate-400">Set up your event details, map your seats, and instantly start selling tickets to your audience.</p>
              </div>
            </div>
          </div>

          <div className="bg-[#07090E] rounded-xl border border-white/10 p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm font-bold text-[#E8D5B5]">Application Template</p>
              <button
                onClick={handleCopyTemplate}
                className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
              >
                {copied ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copied ? 'Copied to Clipboard' : 'Copy Template'}
              </button>
            </div>
            <pre className="text-xs text-slate-400 whitespace-pre-wrap font-sans">
              {emailTemplate}
            </pre>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 text-center sm:text-left w-full">
              <p className="text-sm text-slate-400 mb-1">Ready to host?</p>
              <p className="text-lg font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                <Mail className="text-[#E8D5B5]" size={20} /> {supportEmail}
              </p>
            </div>

            <button
              onClick={handleOpenMailApp}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-[#E8D5B5] text-[#07090E] font-bold rounded-xl hover:bg-white transition-all shadow-lg"
            >
              <FileText size={18} />
              Open Email App
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}