import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  Image as ImageIcon, 
  FileText, 
  Camera as CameraIcon, 
  X, 
  RefreshCcw, 
  RotateCcw,
  Loader2, 
  Sparkles, 
  AlertCircle, 
  Volume2, 
  VolumeX, 
  Send,
  ShieldCheck,
  CheckCircle2,
  ChevronLeft,
  History as HistoryIcon
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { explainImage, chatMessage } from '../services/api';
import { cn } from '../lib/utils';
import PageTransition from '../components/shared/PageTransition';

export default function Scanner() {
  const [file, setFile] = useState<{ type: string; name: string } | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant', text: string }[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [language, setLanguage] = useState('English');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [history, setHistory] = useState<{ id: string, name: string, date: string, preview: string, result: string }[]>([]);
  
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('scan_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const saveToHistory = (newResult: string, previewUrl: string, fileName: string) => {
    const entry = {
      id: Date.now().toString(),
      name: fileName,
      date: new Date().toLocaleDateString(),
      preview: previewUrl,
      result: newResult
    };
    setHistory(prev => {
      const updated = [entry, ...prev].slice(0, 10);
      localStorage.setItem('scan_history', JSON.stringify(updated));
      return updated;
    });
  };

  const languages = [
    { name: 'English', native: 'English' },
    { name: 'Telugu', native: 'తెలుగు' },
    { name: 'Hindi', native: 'हिन्दी' }
  ];

  useEffect(() => {
    synthesisRef.current = window.speechSynthesis;
    if (synthesisRef.current) {
      synthesisRef.current.onvoiceschanged = () => {
        synthesisRef.current?.getVoices();
      };
    }
    return () => synthesisRef.current?.cancel();
  }, []);

  const toggleSpeech = () => {
    if (isSpeaking) {
      synthesisRef.current?.cancel();
      setIsSpeaking(false);
    } else {
      if (result) {
        let textToRead = result;
        const voiceSectionMatch = result.match(/# Voice Response\s*\n*([\s\S]+)$/i);
        if (voiceSectionMatch) {
          textToRead = voiceSectionMatch[1].trim();
        }
        const utterance = new SpeechSynthesisUtterance(textToRead.replace(/[#*]/g, ''));
        const voices = synthesisRef.current?.getVoices() || [];
        
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

        utterance.rate = 0.95;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        setIsSpeaking(true);
        synthesisRef.current?.speak(utterance);
      }
    }
  };

  const startCamera = async () => {
    setIsCameraActive(true);
    setPreview(null);
    setFile(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      setError("Unable to access camera. Please check permissions.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setPreview(dataUrl);
      setFile({ type: 'image/jpeg', name: 'captured-photo.jpg' });
      stopCamera();
    }
  };

  const processFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/') && selectedFile.type !== 'application/pdf') {
        setError("Please upload an image (PNG, JPG) or a PDF document.");
        return;
    }
    setFile({ type: selectedFile.type, name: selectedFile.name });
    setError(null);
    setResult(null);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async () => {
    if (!preview || !file) return;
    setIsLoading(true);
    setError(null);
    try {
      const base64 = preview.split(',')[1];
      const res = await explainImage(base64, file.type, language);
      setResult(res.explanation);
      saveToHistory(res.explanation, preview, file.name);
      const assistantGreeting = language === 'Telugu' 
        ? "నేను దీనిని మీ కోసం విశ్లేషించాను!" : language === 'Hindi' 
        ? "मैंने आपके लिए इसका विश्लेषण किया है!" : "I've analyzed this for you!";
      setChatMessages([{ role: 'assistant', text: assistantGreeting }]);
      setTimeout(() => document.getElementById('analysis-result')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;
    const userMessage = chatInput;
    setChatInput('');
    const updatedMessages = [...chatMessages, { role: 'user' as const, text: userMessage }];
    setChatMessages(updatedMessages);
    setIsChatLoading(true);
    try {
      const res = await chatMessage(updatedMessages, language);
      setChatMessages(prev => [...prev, { role: 'assistant', text: res.text }]);
    } catch (err: any) {
      setChatMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I couldn't process that." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const reset = () => {
    setFile(null); setPreview(null); setResult(null); setError(null);
    setChatMessages([]);
  };

  return (
    <PageTransition>
      <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
           <div className="w-12 h-12 bg-brand-950 rounded-2xl flex items-center justify-center text-white">
              <CameraIcon className="w-6 h-6" />
           </div>
           <h1 className="font-display text-4xl lg:text-6xl font-black">AI Scanner</h1>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Recent History Sidebar */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <div className="editorial-card p-6 bg-neutral-50 h-full border-none">
              <h3 className="font-display text-xl font-bold mb-6 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-neutral-300" />
                Recent Scans
              </h3>
              {history.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-neutral-100">
                    <HistoryIcon className="w-5 h-5 text-neutral-200" />
                  </div>
                  <p className="text-[10px] uppercase font-black tracking-widest text-neutral-300">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map(item => (
                    <button 
                      key={item.id}
                      onClick={() => {
                        setResult(item.result);
                        setPreview(item.preview);
                        setFile({ type: 'image/jpeg', name: item.name });
                        setTimeout(() => document.getElementById('analysis-result')?.scrollIntoView({ behavior: 'smooth' }), 100);
                      }}
                      className="w-full text-left p-3 rounded-2xl bg-white border border-neutral-100 hover:border-brand-accent hover:shadow-md transition-all group"
                    >
                      <div className="aspect-video rounded-xl overflow-hidden mb-3 bg-neutral-50">
                        <img src={item.preview} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" />
                      </div>
                      <p className="text-xs font-bold text-brand-950 truncate mb-1">{item.name}</p>
                      <p className="text-[10px] text-neutral-400">{item.date}</p>
                    </button>
                  ))}
                  <button 
                    onClick={() => { setHistory([]); localStorage.removeItem('scan_history'); }}
                    className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-neutral-300 hover:text-red-400 transition-colors"
                  >
                    Clear History
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main Control Area */}
          <div className="lg:col-span-9 order-1 lg:order-2">
            <div className="editorial-card p-1 bg-neutral-100 mb-12 shadow-2xl">
              <div className="editorial-card bg-white p-8 md:p-12">
                <div className="flex flex-col items-center mb-10">
                  <p className="text-xs font-black text-neutral-300 uppercase tracking-[0.3em] mb-4">Analysis Context</p>
                  <div className="flex p-1.5 bg-neutral-100 rounded-[2rem] w-full max-w-md">
                    {languages.map((lang) => (
                      <button
                        key={lang.name}
                        onClick={() => setLanguage(lang.name)}
                        className={cn(
                          "flex-1 py-3 px-4 rounded-[1.5rem] text-sm font-bold transition-all flex flex-col items-center",
                          language === lang.name ? "bg-white text-brand-950 shadow-xl scale-105" : "text-neutral-400 hover:text-neutral-600"
                        )}
                      >
                        <span className="text-[10px] uppercase tracking-wider mb-1 opacity-50">{lang.name}</span>
                        <span className="text-lg font-display leading-none">{lang.native}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="min-h-[400px]">
                  <AnimatePresence mode="wait">
                    {!preview && !isCameraActive ? (
                      <motion.div key="choice" className="grid md:grid-cols-2 gap-6 h-full">
                         <div 
                           onClick={() => fileInputRef.current?.click()}
                           onDragOver={handleDragOver}
                           onDragEnter={handleDragEnter}
                           onDragLeave={handleDragLeave}
                           onDrop={handleDrop}
                           className={cn(
                             "editorial-card bg-neutral-50 border-2 border-dashed p-12 text-center cursor-pointer transition-all group flex flex-col items-center justify-center",
                             isDragging ? "border-brand-accent bg-brand-purple/10 scale-[1.02]" : "border-neutral-200 hover:border-brand-accent hover:bg-neutral-100"
                           )}
                         >
                            <Upload className={cn(
                              "w-12 h-12 mb-6 transition-all",
                              isDragging ? "text-brand-950 scale-110" : "text-neutral-300 group-hover:scale-110 group-hover:text-brand-950"
                            )} />
                            <h3 className="font-display text-2xl mb-2">
                              {isDragging ? "Drop to Upload" : "Upload Content"}
                            </h3>
                            <p className="text-neutral-400 text-sm">
                              {isDragging ? "Quick analysis ready" : "Images or PDF documents"}
                            </p>
                            <input type="file" ref={fileInputRef} onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }} className="hidden" accept="image/*,application/pdf" />
                         </div>
                         <div 
                           onClick={startCamera}
                           className="editorial-card bg-brand-950 text-white p-12 text-center cursor-pointer hover:bg-brand-800 transition-all group flex flex-col items-center justify-center"
                         >
                            <CameraIcon className="w-12 h-12 text-brand-accent mb-6 group-hover:rotate-12 transition-all" />
                            <h3 className="font-display text-2xl mb-2">Live Camera</h3>
                            <p className="text-white/40 text-sm">Scan objects in real-time</p>
                         </div>
                      </motion.div>
                    ) : isCameraActive ? (
                      <motion.div key="camera-view" className="relative bg-brand-950 rounded-editorial aspect-video overflow-hidden">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        <div className="absolute inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-brand-950 to-transparent">
                          <div className="flex justify-center items-center gap-8">
                            <button onClick={stopCamera} className="p-4 bg-white/10 backdrop-blur rounded-full text-white hover:bg-white/20 transition-all">
                              <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button onClick={capturePhoto} className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-8 border-white/20 shadow-2xl active:scale-95 transition-all">
                              <div className="w-14 h-14 rounded-full border-4 border-brand-950" />
                            </button>
                            <div className="w-14" />
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div key="preview-view" className="space-y-8">
                         <div className="editorial-card aspect-video relative bg-neutral-50 flex items-center justify-center border-none overflow-hidden">
                            {file?.type === 'application/pdf' ? (
                              <div className="text-center p-20">
                                <FileText className="w-24 h-24 text-neutral-200 mx-auto mb-6" />
                                <p className="font-display text-2xl font-bold">{file.name}</p>
                              </div>
                            ) : (
                              <div className="relative w-full h-full">
                                <img src={preview!} alt="Preview" className="w-full h-full object-contain" />
                                {isLoading && (
                                  <motion.div 
                                    className="absolute left-0 right-0 h-1 bg-brand-accent shadow-[0_0_20px_var(--color-brand-accent)] z-20"
                                    initial={{ top: "0%" }}
                                    animate={{ top: "100%" }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                  />
                                )}
                              </div>
                            )}
                            <button onClick={reset} className="absolute top-6 right-6 p-4 bg-white shadow-2xl rounded-2xl hover:bg-brand-950 hover:text-white transition-all">
                               <RefreshCcw className="w-5 h-5" />
                            </button>
                         </div>
                         <button onClick={handleUpload} disabled={isLoading} className="w-full btn-primary flex items-center justify-center gap-3 py-6 text-xl shadow-2xl shadow-brand-950/20 relative overflow-hidden group">
                            {isLoading && (
                              <motion.div 
                                className="absolute inset-0 bg-brand-accent/20 z-0"
                                initial={{ x: "-100%" }}
                                animate={{ x: "200%" }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                              />
                            )}
                            <span className="relative z-10 flex items-center gap-3">
                              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                              {isLoading ? "Consulting AI..." : "Begin Deep Scan"}
                            </span>
                         </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {error && <div className="mt-8 p-6 bg-red-50 border border-red-100 rounded-[2rem] flex gap-4 text-red-800"><AlertCircle className="w-6 h-6" /><p className="font-semibold">{error}</p></div>}
              </div>
            </div>
          </div>
        </div>

        {/* Results Area */}
        <AnimatePresence>
          {result && (
            <motion.div id="analysis-result" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
               <div className="grid lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-8 space-y-12">
                     <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-neutral-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/20 blur-[100px] -z-10" />
                        <div className="markdown-body">
                          <ReactMarkdown>{result}</ReactMarkdown>
                        </div>
                     </div>
                  </div>

                  <div className="lg:col-span-4 space-y-8">
                     <div className="editorial-card p-8 bg-brand-950 text-white relative">
                        <div className="pill-accent !bg-brand-accent !text-brand-950 mb-6 w-fit">
                          <Volume2 className="w-3 h-3" />
                          <span>Voice Intelligence</span>
                        </div>
                        <h3 className="font-display text-2xl mb-4">Voice Summary</h3>
                        <p className="text-white/40 text-sm leading-relaxed mb-8">Hear a simplified natural language summary in {language}.</p>
                        <button 
                          onClick={toggleSpeech}
                          className={cn(
                            "w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all",
                            isSpeaking ? "bg-brand-accent text-brand-950" : "bg-white/10 hover:bg-white text-white hover:text-brand-950"
                          )}
                        >
                          {isSpeaking ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                          {isSpeaking ? "Mute Now" : "Play Summary"}
                        </button>
                     </div>

                     <div className="editorial-card p-1 bg-neutral-100">
                        <div className="bg-white p-8 rounded-editorial-smaller">
                           <div className="flex items-center gap-4 mb-8">
                              <div className="w-10 h-10 bg-brand-accent rounded-xl flex items-center justify-center text-brand-950"><Send className="w-5 h-5" /></div>
                              <h4 className="font-display text-xl font-bold">Follow-up</h4>
                           </div>
                           <div className="space-y-4 max-h-[300px] overflow-y-auto mb-6 custom-scrollbar pr-2 leading-relaxed">
                              {chatMessages.map((msg, i) => (
                                <div key={i} className={cn("p-4 rounded-2xl text-xs", msg.role === 'user' ? "bg-neutral-100 text-brand-950 font-bold ml-4" : "bg-brand-purple/30 text-purple-950 mr-4")}>
                                   {msg.text}
                                </div>
                              ))}
                              {isChatLoading && <div className="p-4"><Loader2 className="w-4 h-4 animate-spin text-brand-accent" /></div>}
                              <div ref={chatEndRef} />
                           </div>
                           <form onSubmit={handleChatSubmit} className="relative">
                              <input 
                                value={chatInput} 
                                onChange={(e) => setChatInput(e.target.value)}
                                className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-6 py-4 text-xs outline-none focus:border-brand-accent transition-all"
                                placeholder="Details? Next steps?"
                              />
                           </form>
                        </div>
                     </div>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
