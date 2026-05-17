import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  ShieldAlert, 
  FileText, 
  Sparkles, 
  X, 
  Info, 
  AlertTriangle, 
  CheckCircle, 
  Volume2, 
  VolumeX, 
  ChevronLeft,
  Loader2,
  Scan,
  Maximize2
} from 'lucide-react';
import { explainImage } from '../services/api';
import { cn } from '../lib/utils';
import PageTransition from '../components/shared/PageTransition';

type Mode = 'explain' | 'scam' | 'form';

interface ScamResult {
  verdict: string;
  scamProbability: number;
  whatThisIs: string;
  whyVerdict: string;
  redFlags: string[];
  whatToDo: string[];
  simpleExplanation: string;
  summary: string;
  voiceResponse: string;
}

interface FormField {
  label: string;
  instruction: string;
  example: string;
  importance: 'Required' | 'Optional';
  box_2d: [number, number, number, number];
}

interface FormResult {
  formName: string;
  whoNeedsIt: string;
  fields: FormField[];
  requiredDocuments: string[];
  warnings: string[];
  voiceInstructions: string;
}

export default function LiveScanner() {
  const [mode, setMode] = useState<Mode>('explain');
  const [language, setLanguage] = useState('English');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scamResult, setScamResult] = useState<ScamResult | null>(null);
  const [formResult, setFormResult] = useState<FormResult | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCapturedImage, setLastCapturedImage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  const languages = [
    { name: 'English', native: 'English' },
    { name: 'Telugu', native: 'తెలుగు' },
    { name: 'Hindi', native: 'हिन्दी' }
  ];

  useEffect(() => {
    synthesisRef.current = window.speechSynthesis;
    return () => synthesisRef.current?.cancel();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        setError(null);
      }
    } catch (err) {
      setError("Camera access denied. Please enable camera permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const runAnalysis = async () => {
    if (!videoRef.current || isLoading) return;
    
    setIsLoading(true);
    setScamResult(null);
    setFormResult(null);
    setExplanation(null);
    setError(null);

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
    setLastCapturedImage(dataUrl);
    const base64 = dataUrl.split(',')[1];

    try {
      const result = await explainImage(base64, 'image/jpeg', language, mode);
      if (mode === 'scam') setScamResult(result);
      else if (mode === 'form') setFormResult(result);
      else setExplanation(result.explanation);
      
      // Auto-speak if summary exists
      speakResponse(result.voiceResponse || result.voiceInstructions || result.explanation);
    } catch (err: any) {
      setError(err.message || "Analysis failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const speakResponse = (text: string) => {
    if (!text || !synthesisRef.current) return;
    synthesisRef.current.cancel();
    
    const cleanText = text.includes('# Voice Response') 
      ? text.split('# Voice Response')[1].trim().replace(/[#*]/g, '')
      : text.replace(/[#*]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = synthesisRef.current.getVoices();
    
    if (language === 'Hindi') {
      utterance.lang = 'hi-IN';
      utterance.voice = voices.find(v => v.lang.startsWith('hi')) || null;
    } else if (language === 'Telugu') {
      utterance.lang = 'te-IN';
      utterance.voice = voices.find(v => v.lang.startsWith('te')) || null;
    } else {
      utterance.lang = 'en-US';
      utterance.voice = voices.find(v => v.lang.startsWith('en')) || null;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    synthesisRef.current.speak(utterance);
  };

  return (
    <PageTransition>
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Full Screen Camera Feed */}
        <div className="relative flex-grow overflow-hidden">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover grayscale-[0.2] brightness-[0.9]"
          />

          {/* Futuristic HUD Overlays */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Corners */}
            <div className="absolute top-10 left-10 w-20 h-20 border-t-2 border-l-2 border-white/30" />
            <div className="absolute top-10 right-10 w-20 h-20 border-t-2 border-r-2 border-white/30" />
            <div className="absolute bottom-10 left-10 w-20 h-20 border-b-2 border-l-2 border-white/30" />
            <div className="absolute bottom-10 right-10 w-20 h-20 border-b-2 border-r-2 border-white/30" />
            
            {/* Scanning Line */}
            {isLoading && (
              <motion.div 
                className="absolute left-0 right-0 h-0.5 bg-brand-accent/50 shadow-[0_0_15px_var(--color-brand-accent)]"
                initial={{ top: "0%" }}
                animate={{ top: "100%" }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
            )}

            {/* Form Fields Overlays */}
            <AnimatePresence>
              {mode === 'form' && formResult?.fields.map((field, idx) => {
                const [ymin, xmin, ymax, xmax] = field.box_2d;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute border-2 border-brand-accent bg-brand-accent/10 flex flex-col justify-end"
                    style={{
                      top: `${ymin / 10}%`,
                      left: `${xmin / 10}%`,
                      width: `${(xmax - xmin) / 10}%`,
                      height: `${(ymax - ymin) / 10}%`,
                    }}
                  >
                    <div className="absolute -top-8 left-0 bg-brand-accent text-brand-950 text-[10px] font-black px-2 py-1 uppercase whitespace-nowrap flex items-center gap-1">
                      <motion.div 
                        animate={{ x: [-2, 2, -2] }} 
                        transition={{ repeat: Infinity, duration: 1 }}
                      >
                        →
                      </motion.div>
                      {field.label}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Quick Help Overlay */}
          <AnimatePresence>
            {!scamResult && !formResult && !explanation && !isLoading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div className="bg-black/50 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-center max-w-xs">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Scan className="w-6 h-6 text-brand-accent" />
                  </div>
                  <p className="text-white/80 text-xs font-medium">Point camera at an object, form, or document and tap the scan button below.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upper Controls */}
          <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
            <button 
              onClick={() => window.history.back()}
              className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white border border-white/10 hover:bg-white/20 transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="flex flex-col items-end gap-4 text-white">
              <div className="flex bg-black/40 backdrop-blur-xl p-1 rounded-2xl border border-white/10">
                {languages.map(lang => (
                  <button
                    key={lang.name}
                    onClick={() => setLanguage(lang.name)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                      language === lang.name ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white"
                    )}
                  >
                    {lang.native}
                  </button>
                ))}
              </div>
              <div className="bg-black/40 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Live Feed Active
              </div>
            </div>
          </div>

          {/* Bottom Results Panel */}
          <div className="absolute bottom-32 left-0 right-0 p-6 flex flex-col items-center pointer-events-none">
            <AnimatePresence>
              {scamResult && (
                <motion.div 
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 50, opacity: 0 }}
                  className="w-full max-w-lg pointer-events-auto"
                >
                  <div className={cn(
                    "editorial-card p-6 shadow-2xl relative border-l-8",
                    scamResult.verdict.includes('✅') ? "border-green-500" : scamResult.verdict.includes('⚠️') ? "border-yellow-500" : "border-red-500"
                  )}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <h3 className="font-display text-2xl font-black">{scamResult.verdict}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Probability</p>
                        <p className="text-xl font-black">{scamResult.scamProbability}%</p>
                      </div>
                    </div>
                    
                    <p className="text-sm font-bold text-neutral-800 mb-2">{scamResult.whatThisIs}</p>
                    <p className="text-xs text-neutral-600 mb-6">{scamResult.whyVerdict}</p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                       <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase text-red-500">Red Flags</p>
                          {scamResult.redFlags.map((s, i) => (
                            <div key={i} className="text-[10px] font-bold py-1 border-b border-neutral-100 border-dashed">• {s}</div>
                          ))}
                       </div>
                       <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase text-green-500">What to Do</p>
                          {scamResult.whatToDo.map((s, i) => (
                            <div key={i} className="text-[10px] font-bold py-1 border-b border-neutral-100 border-dashed">• {s}</div>
                          ))}
                       </div>
                    </div>

                    <div className="bg-neutral-50 p-3 rounded-xl mb-6">
                        <p className="text-[10px] font-black uppercase text-neutral-400 mb-1">Simple Explanation</p>
                        <p className="text-xs text-neutral-700 leading-relaxed italic">{scamResult.simpleExplanation}</p>
                    </div>
                    
                    <div className="mt-4 flex gap-3">
                      <button 
                        onClick={() => speakResponse(scamResult.voiceResponse)}
                        className="flex-1 btn-primary !bg-brand-950 !py-3 text-xs flex items-center justify-center gap-2"
                      >
                        <Volume2 className="w-4 h-4" /> Listen Again
                      </button>
                      <button 
                        onClick={() => { setScamResult(null); setLastCapturedImage(null); }}
                        className="btn-outline !py-3 !px-4 text-xs"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {formResult && (
                <motion.div 
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 50, opacity: 0 }}
                  className="w-full max-w-lg pointer-events-auto"
                >
                  <div className="editorial-card p-6 bg-brand-950 text-white shadow-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <Scan className="text-brand-accent" />
                      <h3 className="font-display text-xl font-bold">{formResult.formName}</h3>
                    </div>
                    <p className="text-white/60 text-xs mb-6">{formResult.whoNeedsIt}</p>
                    
                    <div className="space-y-3 mb-6">
                      {formResult.fields.slice(0, 3).map((f, i) => (
                        <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center justify-between">
                          <div className="flex-1 mr-4">
                            <p className="text-[10px] font-black uppercase text-brand-accent">{f.label}</p>
                            <p className="text-xs font-medium">{f.instruction}</p>
                            <p className="text-[9px] text-white/40 italic mt-1">Ex: {f.example}</p>
                          </div>
                          <div className="text-[10px] font-black px-2 py-1 bg-white/10 rounded-lg h-fit">{f.importance}</div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                       <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase text-white/40">Required Docs</p>
                          {formResult.requiredDocuments.map((d, i) => (
                            <p key={i} className="text-[10px] text-brand-accent font-bold">• {d}</p>
                          ))}
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase text-white/40">Warnings</p>
                          {formResult.warnings.map((w, i) => (
                            <p key={i} className="text-[10px] text-red-400 font-bold">• {w}</p>
                          ))}
                       </div>
                    </div>

                    <div className="flex gap-3">
                      <button 
                        onClick={() => speakResponse(formResult.voiceInstructions)}
                        className="flex-1 btn-primary !bg-white !text-brand-950 !py-3 text-xs flex items-center justify-center gap-2"
                      >
                        <Volume2 className="w-4 h-4" /> Listen Directions
                      </button>
                      <button 
                        onClick={() => { setFormResult(null); setLastCapturedImage(null); }}
                        className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition-all"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {explanation && (
                <motion.div 
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 50, opacity: 0 }}
                  className="w-full max-w-lg pointer-events-auto"
                >
                  <div className="editorial-card p-6 bg-white shadow-2xl max-h-[50vh] overflow-y-auto">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="font-display text-xl font-bold">AI Analysis</h3>
                        <button onClick={() => { setExplanation(null); setLastCapturedImage(null); }} className="p-2 hover:bg-neutral-100 rounded-full"><X className="w-4 h-4"/></button>
                     </div>
                     <div className="prose prose-sm text-neutral-600 mb-6">
                        {explanation.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                     </div>
                     <button 
                        onClick={() => speakResponse(explanation)}
                        className="w-full btn-primary !bg-brand-950 !py-4 text-xs flex items-center justify-center gap-2"
                      >
                        <Volume2 className="w-4 h-4" /> Hear Explanation
                      </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Global Controls */}
        <div className="bg-black/90 backdrop-blur-3xl border-t border-white/10 px-8 py-10">
          <div className="max-w-4xl mx-auto grid grid-cols-4 gap-6 items-center">
            {/* Mode Switcher */}
            <div className="col-span-3 flex bg-white/5 p-1.5 rounded-3xl border border-white/10">
              <button 
                onClick={() => setMode('explain')} 
                className={cn(
                  "flex-1 py-4 rounded-2xl flex flex-col items-center gap-2 transition-all",
                  mode === 'explain' ? "bg-white text-black shadow-xl" : "text-white/40 hover:text-white"
                )}
              >
                <Sparkles className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Explain</span>
              </button>
              <button 
                onClick={() => setMode('scam')} 
                className={cn(
                  "flex-1 py-4 rounded-2xl flex flex-col items-center gap-2 transition-all",
                  mode === 'scam' ? "bg-red-500 text-white shadow-xl shadow-red-500/20" : "text-white/40 hover:text-white"
                )}
              >
                <ShieldAlert className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Safe/Scam</span>
              </button>
              <button 
                onClick={() => setMode('form')} 
                className={cn(
                  "flex-1 py-4 rounded-2xl flex flex-col items-center gap-2 transition-all",
                  mode === 'form' ? "bg-brand-accent text-brand-950 shadow-xl shadow-brand-accent/20" : "text-white/40 hover:text-white"
                )}
              >
                <FileText className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Form Guide</span>
              </button>
            </div>

            {/* Main Action Button */}
            <button 
              onClick={runAnalysis}
              disabled={isLoading}
              className="w-20 h-20 bg-brand-accent rounded-full flex items-center justify-center border-8 border-white/10 active:scale-95 transition-all shadow-2xl relative"
            >
              {isLoading ? (
                <Loader2 className="w-8 h-8 text-brand-950 animate-spin" />
              ) : (
                <Maximize2 className="w-8 h-8 text-brand-950" />
              )}
              {isLoading && (
                <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-white animate-spin" />
              )}
            </button>
          </div>
        </div>

        {/* Floating Voice Indicator */}
        <AnimatePresence>
          {isSpeaking && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="fixed bottom-40 right-8 w-16 h-16 bg-brand-accent rounded-full flex items-center justify-center shadow-2xl z-[100]"
            >
              <div className="flex gap-1">
                {[1, 2, 3, 2, 1].map((h, i) => (
                  <motion.div 
                    key={i}
                    className="w-1 bg-brand-950 rounded-full"
                    animate={{ height: [8, 20, 8] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
