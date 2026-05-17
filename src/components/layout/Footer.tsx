import { Sparkles, Globe, HelpCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-950 text-white pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-16 mb-20">
           <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-950">
                  <Sparkles className="w-7 h-7" />
                </div>
                <span className="font-display text-3xl font-bold tracking-tight">Explain My World</span>
              </div>
              <p className="text-white/40 max-w-sm leading-relaxed mb-8">
                Making the complex simple, the mysterious understood, and the digital accessible for every human on Earth.
              </p>
              <div className="flex gap-4">
                 <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-brand-950 transition-all cursor-pointer">
                    <Globe className="w-4 h-4" />
                 </div>
                 <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-brand-950 transition-all cursor-pointer">
                    <HelpCircle className="w-4 h-4" />
                 </div>
              </div>
           </div>

           <div>
              <h5 className="font-bold uppercase tracking-widest text-[10px] mb-8 text-white/30">Platform</h5>
              <ul className="space-y-4 text-white/60 font-medium">
                 <li><a href="#" className="hover:text-white transition-colors">AI Scanner</a></li>
                 <li><a href="#" className="hover:text-white transition-colors">Document Analysis</a></li>
                 <li><a href="#" className="hover:text-white transition-colors">Voice Assistant</a></li>
                 <li><a href="#" className="hover:text-white transition-colors">API for Developers</a></li>
              </ul>
           </div>

           <div>
              <h5 className="font-bold uppercase tracking-widest text-[10px] mb-8 text-white/30">Company</h5>
              <ul className="space-y-4 text-white/60 font-medium">
                 <li><a href="#" className="hover:text-white transition-colors">About Story</a></li>
                 <li><a href="#" className="hover:text-white transition-colors">Accessibility Charter</a></li>
                 <li><a href="#" className="hover:text-white transition-colors">Safety & Ethics</a></li>
                 <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
              </ul>
           </div>
        </div>

        <div className="border-t border-white/10 pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
           <p className="text-xs text-white/20">© 2026 Explain My World AI. All rights reserved.</p>
           <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-white/20">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Settings</a>
           </div>
        </div>
      </div>
    </footer>
  );
}
