import { motion } from 'motion/react';
import { Globe, Sparkles, Languages as LangIcon, CheckCircle2 } from 'lucide-react';
import PageTransition from '../components/shared/PageTransition';

export default function Languages() {
  const regions = [
    { 
      name: 'English', 
      native: 'English',
      desc: 'Universal clarity for global users. Precise, technical but accessible data distillation.',
      script: 'The quick brown fox jumps over the lazy dog.'
    },
    { 
      name: 'Telugu', 
      native: 'తెలుగు', 
      desc: 'Customized for South Indian regional contexts. Focus on clear phonetic reading.',
      script: 'త్వరిత గోధుమ రంగు నక్క సోమరి కుక్క మీదుగా దూకుతుంది.'
    },
    { 
      name: 'Hindi', 
      native: 'हिन्दी', 
      desc: 'Widespread Indian support. Natural vocabulary choice for cross-generational understanding.',
      script: 'तेज़ भूरी लोमड़ी आलसी कुत्ते के ऊपर से कूद जाती है।'
    }
  ];

  return (
    <PageTransition>
      <div className="pt-40 pb-20 px-6 max-w-7xl mx-auto">
        <div className="max-w-3xl mb-20">
          <div className="pill-accent mb-6 w-fit">
            <LangIcon className="w-3 h-3" />
            <span>Global Coverage</span>
          </div>
          <h1 className="font-display text-5xl lg:text-7xl font-black mb-8 leading-tight">Universal <br /> Understanding.</h1>
          <p className="text-xl text-neutral-500 leading-relaxed">
            Language should never be a barrier to safety or knowledge. We've optimized our models specifically for the nuance of regional Indian dialects alongside global English.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {regions.map((region, i) => (
            <motion.div 
              key={region.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="editorial-card p-10 group"
            >
               <div className="flex justify-between items-start mb-10">
                  <div className="w-16 h-16 bg-neutral-50 rounded-2xl flex items-center justify-center group-hover:bg-brand-950 group-hover:text-white transition-all">
                    <Globe className="w-8 h-8" />
                  </div>
                  <span className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">{region.name}</span>
               </div>
               <h3 className="font-display text-4xl mb-4">{region.native}</h3>
               <p className="text-neutral-500 text-sm leading-relaxed mb-10">{region.desc}</p>
               
               <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-100">
                  <p className="text-xs text-neutral-400 font-mono mb-4 uppercase tracking-tighter">Script Sample</p>
                  <p className="text-lg font-medium text-brand-950">{region.script}</p>
               </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-32 editorial-card p-1 bg-neutral-100">
           <div className="bg-white p-12 md:p-20 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/20 blur-[100px] -z-10" />
              <div className="max-w-2xl mx-auto">
                 <Sparkles className="w-12 h-12 text-brand-accent mx-auto mb-8" />
                 <h2 className="font-display text-4xl font-bold mb-6">More languages arriving soon.</h2>
                 <p className="text-neutral-500 mb-10">We are currently training our accessibility models to support Kannada, Tamil, and Malayalam by late 2026.</p>
                 <div className="flex justify-center gap-6 text-xs font-black text-neutral-300 uppercase tracking-[0.3em]">
                   <span>Tamil</span>
                   <span>•</span>
                   <span>Kannada</span>
                   <span>•</span>
                   <span>Malayalam</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </PageTransition>
  );
}
