import { motion } from 'motion/react';
import { ArrowRight, Camera, Globe, Volume2, FileText, ChevronRight, CheckCircle2, Sparkles, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageTransition from '../components/shared/PageTransition';

export default function Home() {
  return (
    <PageTransition>
      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="pill-accent w-fit mb-6">
              <Zap className="w-3 h-3 fill-purple-900" />
              <span>Futuristic Multimodal AI</span>
            </div>
            <h1 className="font-display text-6xl lg:text-8xl font-black text-brand-950 mb-8 leading-[0.95] tracking-tighter">
              Understand <br /> 
              <span className="text-neutral-300">Anything</span> <br /> 
              Around You.
            </h1>
            <p className="text-xl text-neutral-500 max-w-lg mb-10 leading-relaxed">
              Upload screenshots, scan documents, analyze forms, decode confusing interfaces, and hear explanations in your own language instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/live-scanner" className="btn-primary group flex items-center justify-center gap-3">
                Live AI Scanner
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/scanner" className="btn-outline flex items-center justify-center gap-3">
                <Camera className="w-5 h-5" />
                Upload & Scan
              </Link>
            </div>
          </motion.div>

          <motion.div 
            className="relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <div className="relative z-10 editorial-card rotate-3 translate-x-10 aspect-video bg-neutral-900 overflow-hidden shadow-2xl">
               <div className="absolute inset-0 bg-gradient-to-tr from-brand-950 to-neutral-700 opacity-50" />
               <div className="p-8 h-full flex flex-col justify-end text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle2 className="w-6 h-6 text-brand-accent" />
                    <span className="font-display text-2xl">Analysis Complete</span>
                  </div>
                  <div className="h-2 w-full bg-white/20 rounded-full mb-2">
                    <motion.div 
                      className="h-full bg-brand-accent rounded-full" 
                      initial={{ width: 0 }}
                      animate={{ width: "80%" }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
               </div>
            </div>
            <div className="absolute top-0 right-0 z-20 editorial-card -rotate-2 -translate-x-10 -translate-y-10 w-2/3 p-6 bg-brand-purple shadow-xl">
               <h3 className="font-display text-xl mb-2 text-purple-950">Multilingual Voice</h3>
               <p className="text-sm text-purple-900/60 font-medium">Listening to Telugu translation...</p>
               <div className="mt-4 flex gap-1 items-end h-8">
                  {[...Array(12)].map((_, i) => (
                    <motion.div 
                      key={i} 
                      className="w-1 bg-purple-900 rounded-full"
                      animate={{ height: ["20%", "100%", "20%"] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
                    />
                  ))}
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Marquee Social Proof */}
      <div className="border-y border-neutral-100 py-10 overflow-hidden whitespace-nowrap bg-neutral-50">
        <div className="inline-block animate-marquee uppercase text-sm font-bold tracking-[0.3em] text-neutral-300">
          Intelligent Scanner &nbsp;•&nbsp; Multilingual AI &nbsp;•&nbsp; Voice Assistant &nbsp;•&nbsp; Accessibility First &nbsp;•&nbsp; Document Intelligence &nbsp;•&nbsp; 
          Intelligent Scanner &nbsp;•&nbsp; Multilingual AI &nbsp;•&nbsp; Voice Assistant &nbsp;•&nbsp; Accessibility First &nbsp;•&nbsp; Document Intelligence &nbsp;•&nbsp; 
        </div>
      </div>

      {/* Feature Grid */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
           <h2 className="font-display text-4xl lg:text-6xl font-black mb-6">Designed for Everyone.</h2>
           <p className="text-neutral-500 max-w-2xl mx-auto text-lg">
             Empowering users with intelligent visual understanding and voice support.
           </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
           <div className="editorial-card p-10 h-full flex flex-col justify-between hover:translate-y-[-8px] transition-transform bg-neutral-50 border-none">
              <div>
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-10">
                   <Globe className="w-7 h-7 text-brand-950" />
                </div>
                <h3 className="font-display text-3xl font-black mb-6">Multilingual Intelligence</h3>
                <p className="text-neutral-500 leading-relaxed">
                  Bridge communication gaps with native support for English, Hindi, and Telugu.
                </p>
              </div>
              <div className="mt-10 flex gap-2">
                 <span className="pill-accent uppercase">EN</span>
                 <span className="pill-accent uppercase">HI</span>
                 <span className="pill-accent uppercase">TE</span>
              </div>
           </div>

           <div className="editorial-card p-10 h-full flex flex-col justify-between hover:translate-y-[-8px] transition-transform bg-brand-purple border-none">
              <div>
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-10">
                   <Volume2 className="w-7 h-7 text-brand-950" />
                </div>
                <h3 className="font-display text-3xl font-black mb-6">Voice Assistant</h3>
                <p className="text-purple-900/60 leading-relaxed font-medium">
                  Experience natural text-to-speech built for everyone. Especially optimized for the elderly.
                </p>
              </div>
              <div className="mt-10">
                 <div className="flex gap-1 items-end h-8">
                    {[1, 2, 3, 4, 5].map(i => <motion.div key={i} className="flex-1 bg-purple-900/10 rounded-full relative overflow-hidden" animate={{ height: ["40%", "100%", "40%"] }} transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }} />)}
                 </div>
              </div>
           </div>

           <div className="editorial-card p-10 h-full flex flex-col justify-between hover:translate-y-[-8px] transition-transform bg-brand-950 text-white border-none">
              <div>
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-10">
                   <FileText className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-display text-3xl font-black mb-6">Document Intelligence</h3>
                <p className="text-white/50 leading-relaxed">
                  Analyze complex forms and legal notices. Distills dense documentation into actionable points.
                </p>
              </div>
              <div className="mt-10">
                 <div className="p-4 bg-white/10 rounded-2xl flex items-center gap-4">
                    <CheckCircle2 className="w-5 h-5 text-brand-accent" />
                    <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">Simplified Logic Engine</span>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Accessibility Focus */}
      <section id="accessibility" className="py-24 px-6 bg-brand-purple/20">
         <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
            <div className="lg:w-1/2">
               <h2 className="font-display text-5xl lg:text-7xl font-black mb-8 leading-[0.9] tracking-tighter">Technology <br /> built with <br /> <span className="text-purple-400">Empathy.</span></h2>
               <p className="text-lg text-neutral-600 leading-relaxed mb-10 max-w-lg">
                  We believe innovation is only truly revolutionary when it's accessible to everyone.
               </p>
               <ul className="space-y-6 mb-10">
                 {[
                   { title: "Elderly Care", desc: "Large targets and clear voice feedback." },
                   { title: "No Jargon Zone", desc: "Technical terms translated to everyday talk." },
                   { title: "Visual Aid", desc: "High contrast UI for better readability." }
                 ].map(item => (
                    <li key={item.title} className="flex gap-4">
                       <div className="w-6 h-6 bg-brand-950 rounded-full flex-shrink-0 mt-1 flex items-center justify-center">
                          <ChevronRight className="w-4 h-4 text-white" />
                       </div>
                       <div>
                          <h5 className="font-bold text-brand-950 mb-1">{item.title}</h5>
                          <p className="text-sm text-neutral-500">{item.desc}</p>
                       </div>
                    </li>
                 ))}
               </ul>
            </div>
            <div className="lg:w-1/2 relative flex justify-center">
               <div className="editorial-card aspect-square bg-white shadow-2xl p-12 flex flex-col justify-center items-center text-center max-w-md">
                  <div className="w-24 h-24 bg-brand-purple rounded-full flex items-center justify-center mb-8 relative">
                    <motion.div 
                      className="absolute inset-0 rounded-full border-4 border-brand-accent" 
                      animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }} 
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <Volume2 className="w-10 h-10 text-brand-950" />
                  </div>
                  <h3 className="font-display text-3xl font-black mb-4 italic">"It just explains it perfectly."</h3>
                  <p className="text-neutral-400 max-w-xs mx-auto">— Grandma Shanti, User</p>
               </div>
            </div>
         </div>
      </section>

      {/* Demo Examples Grid */}
      <section id="demo-examples" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
           <div className="max-w-xl">
              <h2 className="font-display text-4xl lg:text-6xl font-black mb-6">See it in action.</h2>
              <p className="text-neutral-500 text-lg">Explore how Explain My World decodes various real-life scenarios instantly.</p>
           </div>
           <Link to="/scanner" className="btn-outline">View All Use Cases</Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
           {[
             { title: "Bank Form", cat: "Documents", img: "https://images.unsplash.com/photo-1554224155-1696413575b9?auto=format&fit=crop&q=80&w=400" },
             { title: "Medicine Label", cat: "Health", img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400" },
             { title: "Error Message", cat: "Technical", img: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=400" },
             { title: "Public Notice", cat: "General", img: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=400" }
           ].map((item, i) => (
             <motion.div 
               key={item.title}
               whileHover={{ y: -10 }}
               className="editorial-card group cursor-pointer"
             >
                <div className="aspect-[4/5] relative overflow-hidden bg-neutral-100">
                   <img src={item.img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                   <div className="absolute inset-0 bg-brand-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-950">
                        <ArrowRight className="w-6 h-6" />
                      </div>
                   </div>
                </div>
                <div className="p-6">
                   <p className="text-[10px] font-black uppercase tracking-widest text-neutral-300 mb-2">{item.cat}</p>
                   <h4 className="font-display text-xl font-bold">{item.title}</h4>
                </div>
             </motion.div>
           ))}
        </div>
      </section>
    </PageTransition>
  );
}
