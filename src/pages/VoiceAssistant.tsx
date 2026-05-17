import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Volume2, 
  VolumeX, 
  Mic, 
  Settings, 
  ChevronRight, 
  Sparkles, 
  Globe, 
  Accessibility, 
  Play, 
  Pause, 
  RotateCcw,
  Square
} from 'lucide-react';
import PageTransition from '../components/shared/PageTransition';
import { cn } from '../lib/utils';

export default function VoiceAssistant() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('English');
  const [mode, setMode] = useState('Assistant');
  const [sampleText, setSampleText] = useState("I am here to help you understand anything around you. Just point the camera or upload a document, and I will explain it in simple terms.");
  
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    synthesisRef.current = window.speechSynthesis;
    const updateVoices = () => setVoices(synthesisRef.current?.getVoices() || []);
    updateVoices();
    if (synthesisRef.current) synthesisRef.current.onvoiceschanged = updateVoices;
    return () => synthesisRef.current?.cancel();
  }, []);

  const speak = (text: string) => {
    synthesisRef.current?.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (currentLanguage === 'Hindi') {
      utterance.lang = 'hi-IN';
      utterance.voice = voices.find(v => v.lang.startsWith('hi')) || null;
    } else if (currentLanguage === 'Telugu') {
      utterance.lang = 'te-IN';
      utterance.voice = voices.find(v => v.lang.startsWith('te')) || null;
    } else {
      utterance.lang = 'en-US';
      utterance.voice = voices.find(v => v.lang.startsWith('en')) || null;
    }

    if (mode === 'Slow') utterance.rate = 0.6;
    else if (mode === 'Calm') utterance.rate = 0.8;
    else utterance.rate = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    synthesisRef.current?.speak(utterance);
  };

  const stop = () => {
    synthesisRef.current?.cancel();
    setIsSpeaking(false);
  };

  const modes = [
    { name: 'Assistant', desc: 'Standard natural flow' },
    { name: 'Calm', desc: 'Softer, relaxed pacing' },
    { name: 'Slow', desc: 'Clear, steady reading' },
    { name: 'Accessibility', desc: 'High emphasis mode' }
  ];

  return (
    <PageTransition>
      <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Visualizer & Core Control */}
          <div className="lg:w-1/2 space-y-12">
            <div className="editorial-card h-[500px] bg-brand-950 flex flex-col items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--color-brand-accent)_0%,_transparent_70%)]" />
               </div>
               
               {/* Waveform Visualizer */}
               <div className="flex items-center gap-1 h-32 mb-12">
                  {[...Array(32)].map((_, i) => (
                    <motion.div 
                      key={i} 
                      className="w-1.5 bg-brand-accent rounded-full shadow-[0_0_20px_rgba(216,180,254,0.5)]"
                      animate={{ 
                        height: isSpeaking ? [10, Math.random() * 80 + 20, 10] : 4,
                        opacity: isSpeaking ? 1 : 0.2
                      }}
                      transition={{ 
                        duration: 0.5, 
                        repeat: Infinity, 
                        delay: i * 0.02,
                        ease: "linear"
                      }}
                    />
                  ))}
               </div>

               <div className="flex flex-col items-center z-10">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => isSpeaking ? stop() : speak(sampleText)}
                    className="w-28 h-28 bg-white rounded-full flex items-center justify-center text-brand-950 shadow-[0_0_80px_rgba(255,255,255,0.2)] active:scale-90 transition-all mb-8 relative"
                  >
                    <AnimatePresence mode="wait">
                      {isSpeaking ? (
                        <motion.div key="stop" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                           <Square className="w-12 h-12 fill-brand-950" />
                        </motion.div>
                      ) : (
                        <motion.div key="play" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                           <Play className="w-12 h-12 fill-brand-950 ml-2" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                  <motion.p 
                    animate={{ opacity: isSpeaking ? [0.5, 1, 0.5] : 1 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-white font-display text-lg italic tracking-wide"
                  >
                    {isSpeaking ? 'AI is speaking now...' : 'Tap to start preview'}
                  </motion.p>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               {modes.map(m => (
                 <button 
                   key={m.name}
                   onClick={() => setMode(m.name)}
                   className={cn(
                     "p-6 rounded-3xl text-left border transition-all",
                     mode === m.name ? "bg-brand-950 text-white border-brand-950 shadow-xl" : "bg-white text-neutral-500 border-neutral-100 hover:border-neutral-200"
                   )}
                 >
                   <h4 className="font-bold mb-1">{m.name}</h4>
                   <p className="text-[10px] uppercase font-black tracking-widest opacity-60">{m.desc}</p>
                 </button>
               ))}
            </div>
          </div>

          {/* Configuration & Showcase */}
          <div className="lg:w-1/2 space-y-12">
            <div>
               <div className="pill-accent mb-6 w-fit">
                 <Globe className="w-3 h-3" />
                 <span>Multilingual Support</span>
               </div>
               <h2 className="font-display text-5xl font-black text-brand-950 mb-6 leading-none">Voice Settings</h2>
               <p className="text-neutral-500 mb-10 text-lg">Customize how your AI assistant communicates with you. Optimized for clarity and comfort.</p>
            </div>

            <div className="space-y-6">
               <h4 className="font-black text-xs uppercase tracking-widest text-neutral-300">Selected Language</h4>
               <div className="flex flex-wrap gap-3">
                  {['English', 'Hindi', 'Telugu'].map(lang => (
                    <button 
                      key={lang}
                      onClick={() => {
                        setCurrentLanguage(lang);
                        if (lang === 'English') setSampleText("I am here to help you understand anything around you.");
                        else if (lang === 'Hindi') setSampleText("मैं आपके आस-पास की किसी भी चीज़ को समझने में आपकी मदद करने के लिए यहाँ हूँ।");
                        else if (lang === 'Telugu') setSampleText("మీ చుట్టూ ఉన్న దేనినైనా అర్థం చేసుకోవడానికి మీకు సహాయం చేయడానికి నేను ఇక్కడ ఉన్నాను.");
                      }}
                      className={cn(
                        "px-8 py-4 rounded-full font-bold text-sm transition-all",
                        currentLanguage === lang ? "bg-brand-purple text-purple-900 shadow-sm" : "bg-neutral-100 text-neutral-400 hover:bg-neutral-200"
                      )}
                    >
                      {lang}
                    </button>
                  ))}
               </div>
            </div>

            <div className="editorial-card p-10 bg-neutral-50 border-none">
               <div className="flex items-center gap-4 mb-8">
                  <Accessibility className="w-8 h-8 text-brand-950" />
                  <h3 className="font-display text-2xl font-bold">Accessibility Logic</h3>
               </div>
               <p className="text-neutral-500 leading-relaxed mb-8">
                 In "Accessibility" mode, our AI slows down significantly at key warnings and emphasizes action steps. Perfect for those with hearing sensitivities.
               </p>
               <div className="p-6 bg-white rounded-[2rem] border border-neutral-100 italic text-neutral-400 text-sm">
                  "Ensure you do not click the suspicious link in the email..."
                  <div className="h-px bg-neutral-100 w-full my-4" />
                  <span className="text-[10px] uppercase font-black text-brand-accent tracking-widest">Live Stress Visualization</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
