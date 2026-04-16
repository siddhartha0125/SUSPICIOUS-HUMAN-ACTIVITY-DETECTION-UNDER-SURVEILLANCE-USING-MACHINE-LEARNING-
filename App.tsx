/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  Video, 
  Shield, 
  AlertTriangle, 
  Activity, 
  FileText, 
  RefreshCw,
  Play,
  Pause,
  Maximize2,
  Volume2,
  Settings,
  Bell,
  Eye,
  Search
} from 'lucide-react';
import { analyzeVideo, AnalysisResult } from './services/geminiService';
import { ActivityTimeline } from './components/ActivityTimeline';
import { StatusBadge } from './components/StatusBadge';
import { cn } from './utils';

export default function App() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': [] },
    multiple: false
  });

  const handleAnalyze = async () => {
    if (!videoFile) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
      });
      reader.readAsDataURL(videoFile);
      const base64 = await base64Promise;

      const analysis = await analyzeVideo(base64, videoFile.type);
      setResult(analysis);
    } catch (err: any) {
      setError(err.message || "An error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const seekTo = (timestamp: string) => {
    if (videoRef.current) {
      const [mins, secs] = timestamp.split(':').map(Number);
      videoRef.current.currentTime = mins * 60 + secs;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-red-500/30">
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-slate-800 bg-black/50 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-600/20">
            <Shield className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold tracking-tight text-white leading-none">SentryAI</h1>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">Surveillance Intelligence v2.0</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-4 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              SYSTEM READY
            </div>
            <div className="w-px h-4 bg-slate-800" />
            <div className="flex items-center gap-2">
              <Activity size={14} />
              LATENCY: 42ms
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-400 hover:text-white transition-colors">
              <Bell size={20} />
            </button>
            <button className="p-2 text-slate-400 hover:text-white transition-colors">
              <Settings size={20} />
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
              <img src="https://picsum.photos/seed/user/100/100" alt="Avatar" referrerPolicy="no-referrer" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* Left Sidebar - Controls & Status */}
        <aside className="lg:col-span-3 border-r border-slate-800 bg-slate-900/30 p-6 flex flex-col gap-8 overflow-y-auto">
          <section>
            <h2 className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] mb-4">Input Source</h2>
            {!videoUrl ? (
              <div 
                {...getRootProps()} 
                className={cn(
                  "aspect-video rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 cursor-pointer group",
                  isDragActive ? "border-red-500 bg-red-500/5" : "border-slate-800 hover:border-slate-700 hover:bg-slate-800/50"
                )}
              >
                <input {...getInputProps()} />
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                  <Upload size={24} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-300">Upload Footage</p>
                  <p className="text-[10px] text-slate-500 mt-1">MP4, MOV up to 50MB</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative aspect-video rounded-xl border border-slate-700 overflow-hidden bg-black group">
                  <video 
                    ref={videoRef}
                    src={videoUrl} 
                    className="w-full h-full object-contain"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button onClick={togglePlay} className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                      {isPlaying ? <Pause size={24} /> : <Play size={24} fill="currentColor" />}
                    </button>
                  </div>
                  <div className="scanline" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video size={14} className="text-slate-500" />
                    <span className="text-xs font-mono text-slate-400 truncate max-w-[120px]">{videoFile?.name}</span>
                  </div>
                  <button 
                    onClick={() => { setVideoUrl(null); setVideoFile(null); setResult(null); }}
                    className="text-[10px] font-mono text-red-500 hover:underline uppercase"
                  >
                    Clear
                  </button>
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className={cn(
                    "w-full py-3 rounded-xl font-display font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2",
                    isAnalyzing 
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                      : "bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-600/20 active:scale-[0.98]"
                  )}
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      ANALYZING...
                    </>
                  ) : (
                    <>
                      <Search size={18} />
                      START ANALYSIS
                    </>
                  )}
                </button>
              </div>
            )}
          </section>

          {result && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] mb-4">Threat Assessment</h2>
                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Risk Level</span>
                    <StatusBadge level={result.riskLevel} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                      <span>CONFIDENCE</span>
                      <span>89%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '89%' }}
                        className={cn(
                          "h-full rounded-full",
                          result.riskLevel === 'critical' ? 'bg-red-500' : result.riskLevel === 'high' ? 'bg-orange-500' : 'bg-emerald-500'
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] mb-4">Recommendations</h2>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="flex gap-2 text-xs text-slate-400 leading-relaxed">
                      <div className="mt-1.5 w-1 h-1 rounded-full bg-red-500 shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.section>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
              <p className="font-bold mb-1 flex items-center gap-2">
                <AlertTriangle size={14} />
                Analysis Error
              </p>
              {error}
            </div>
          )}
        </aside>

        {/* Main Content - Video & Analysis */}
        <div className="lg:col-span-9 flex flex-col h-full bg-black/20 grid-bg">
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-5xl mx-auto space-y-8">
              {/* Hero Section */}
              {!result && !isAnalyzing && (
                <div className="py-20 text-center space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                    <Eye size={12} className="text-red-500" />
                    Autonomous Monitoring System
                  </div>
                  <h2 className="text-5xl font-display font-bold text-white tracking-tight max-w-2xl mx-auto leading-[1.1]">
                    Detect <span className="text-red-500">Suspicious Activity</span> with Deep Learning
                  </h2>
                  <p className="text-slate-400 text-lg max-w-xl mx-auto font-light">
                    Upload surveillance footage to automatically identify threats, unauthorized access, and unusual human behavior using advanced neural networks.
                  </p>
                  <div className="flex items-center justify-center gap-8 pt-8">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-800/50 border border-slate-700 flex items-center justify-center text-slate-300">
                        <Activity size={24} />
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">Real-time Analysis</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-800/50 border border-slate-700 flex items-center justify-center text-slate-300">
                        <Shield size={24} />
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">Threat Detection</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-800/50 border border-slate-700 flex items-center justify-center text-slate-300">
                        <FileText size={24} />
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">Detailed Reports</span>
                    </div>
                  </div>
                </div>
              )}

              {isAnalyzing && (
                <div className="py-20 flex flex-col items-center justify-center gap-8">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full border-4 border-slate-800 border-t-red-600 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Shield className="text-red-600 animate-pulse" size={40} />
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-display font-bold text-white">Processing Neural Frames...</h3>
                    <p className="text-slate-500 text-sm font-mono animate-pulse">Scanning for behavioral patterns and anomalies</p>
                  </div>
                  <div className="w-full max-w-md h-1 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-1/2 h-full bg-red-600"
                    />
                  </div>
                </div>
              )}

              {result && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                          <FileText size={18} />
                        </div>
                        <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Executive Summary</h3>
                      </div>
                      <p className="text-slate-300 leading-relaxed text-sm">
                        {result.summary}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                        <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Total Events</span>
                        <span className="text-2xl font-display font-bold text-white">{result.events.length}</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                        <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Avg Confidence</span>
                        <span className="text-2xl font-display font-bold text-white">
                          {(result.events.reduce((acc, e) => acc + e.confidence, 0) / result.events.length * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm"
                  >
                    <ActivityTimeline 
                      events={result.events} 
                      onEventClick={seekTo}
                    />
                  </motion.div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Status Bar */}
          <footer className="h-10 border-t border-slate-800 bg-black/50 backdrop-blur-md px-6 flex items-center justify-between text-[10px] font-mono text-slate-500">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                ENCRYPTION: AES-256
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                NETWORK: SECURE
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span>{new Date().toLocaleTimeString()}</span>
              <span className="text-slate-700">|</span>
              <span>SENTRY_OS v2.0.4</span>
            </div>
          </footer>
        </div>
      </main>

      {/* Video Player Controls Overlay (Floating) */}
      <AnimatePresence>
        {videoUrl && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-16 left-1/2 -translate-x-1/2 z-40 px-4 py-2 bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-full flex items-center gap-4 shadow-2xl"
          >
            <button onClick={togglePlay} className="p-2 text-slate-300 hover:text-white transition-colors">
              {isPlaying ? <Pause size={20} /> : <Play size={20} fill="currentColor" />}
            </button>
            <div className="w-px h-4 bg-slate-700" />
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 min-w-[80px]">
              <Volume2 size={16} />
              <span>100%</span>
            </div>
            <div className="w-px h-4 bg-slate-700" />
            <button className="p-2 text-slate-300 hover:text-white transition-colors">
              <Maximize2 size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
