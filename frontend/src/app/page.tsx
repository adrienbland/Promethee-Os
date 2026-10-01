"use client";

import { useEffect, useState, useRef } from "react";
import { Search, Server, Activity, Terminal, Plus, Bell, Settings, Layers, History, Cpu, Menu, X, MessageSquare, Box, CheckCircle, AlertTriangle, Zap } from "lucide-react";
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from "framer-motion";

const ParticleOrb = dynamic(() => import('./ParticleOrb'), { ssr: false });
import PrometheeLogo from './PrometheeLogo';

interface Message {
  role: "user" | "ai";
  content: string;
}

export default function Home() {
  const [wsStatus, setWsStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "L'environnement est prêt. Que souhaitez-vous déployer aujourd'hui ?" }
  ]);
  const [wsRef, setWsRef] = useState<WebSocket | null>(null);
  const [serverStats, setServerStats] = useState<{running: number, stopped: number, list: {name: string, status: string, mem?: string}[]}>({ running: 0, stopped: 0, list: [] });
  const [showAllContainers, setShowAllContainers] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [thinkingStatus, setThinkingStatus] = useState("Prométhée réfléchit...");
  const [activeProject, setActiveProject] = useState("Projets/team builder");
  const [activeModel, setActiveModel] = useState("gemini-3.7-flash");
  const [isFullScreenChat, setIsFullScreenChat] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimer: NodeJS.Timeout;

    const connectWS = () => {
      const host = window.location.hostname;
      ws = new WebSocket(`ws://${host}:8005/ws`);
      
      ws.onopen = () => {
        setWsStatus("connected");
        setWsRef(ws);
        ws.send(JSON.stringify({ type: "ping" }));
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "status") {
            setThinkingStatus(data.data);
          } else if (data.type === "stream") {
            setMessages(prev => {
              const newMsgs = [...prev];
              const lastIndex = newMsgs.length - 1;
              if (lastIndex >= 0 && newMsgs[lastIndex].role === "ai") {
                newMsgs[lastIndex] = {
                  ...newMsgs[lastIndex],
                  content: newMsgs[lastIndex].content + data.data
                };
              } else {
                newMsgs.push({ role: "ai", content: data.data });
              }
              return newMsgs;
            });
          } else if (data.type === "final") {
            setIsLoading(false);
          } else if (data.type === "error") {
            setIsLoading(false);
            setMessages(prev => {
              const newMsgs = [...prev];
              const lastIndex = newMsgs.length - 1;
              if (lastIndex >= 0 && newMsgs[lastIndex].role === "ai" && !newMsgs[lastIndex].content) {
                newMsgs[lastIndex].content = "Erreur: " + data.data;
              } else {
                newMsgs.push({ role: "ai", content: "Erreur: " + data.data });
              }
              return newMsgs;
            });
          } else if (data.type === "server_stats") {
            setServerStats({
              running: data.data.containers_running,
              stopped: data.data.containers_stopped,
              list: data.data.containers_list || []
            });
          }
        } catch (e) {
          console.error(e);
        }
      };
      
      ws.onclose = () => {
        setWsStatus("disconnected");
        setWsRef(null);
        // Auto reconnect after 3 seconds
        reconnectTimer = setTimeout(connectWS, 3000);
      };
    };

    connectWS();

    return () => {
      clearTimeout(reconnectTimer);
      if (ws) ws.close();
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, thinkingStatus]);

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !wsRef || isLoading) return;
    
    setIsLoading(true);
    setMessages(prev => [...prev, { role: "user", content: prompt }]);
    setMessages(prev => [...prev, { role: "ai", content: "" }]);
    
    wsRef.send(JSON.stringify({ 
      type: "prompt", 
      data: prompt,
      project: activeProject,
      model: activeModel
    }));
    setPrompt("");
  };

  const visibleContainers = showAllContainers ? serverStats.list : serverStats.list.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans flex overflow-hidden relative selection:bg-purple-500/30">
      

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`group fixed lg:static inset-y-0 left-0 z-50 bg-gray-900/95 backdrop-blur-xl border-r border-white/5 transition-all duration-300 ease-in-out w-16 hover:w-72 flex flex-col h-full shrink-0 overflow-hidden ${isSidebarOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0"}`}>
        

        <div className="h-20 flex items-center px-4 border-b border-white/5 shrink-0 overflow-hidden whitespace-nowrap">
          <div className="w-8 h-8 shrink-0 rounded-xl bg-gradient-to-br from-purple-600/20 to-fuchsia-600/20 border border-purple-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.3)] text-fuchsia-400">
            <PrometheeLogo className="w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold tracking-widest text-white ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">PROMÉTHÉE</h1>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden ml-auto p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar py-6 px-3 flex flex-col gap-8 overflow-hidden whitespace-nowrap">
          

          <div className="flex-1">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Applications
            </h3>
            <div className="space-y-2">
              <button className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-white bg-purple-500/10 border border-purple-500/20 rounded-xl transition-all hover:bg-purple-500/20">
                <Server className="w-4 h-4 shrink-0 text-purple-400" /> 
                <span className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">Dashboard Principal</span>
              </button>
              <button className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                <Box className="w-4 h-4 shrink-0" /> 
                <span className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">Pterodactyl (Serveurs)</span>
              </button>
              <button className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                <Activity className="w-4 h-4 shrink-0" /> 
                <span className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">Monitoring (Proxmox)</span>
              </button>
              <button className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                <Layers className="w-4 h-4 shrink-0" /> 
                <span className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">Mes Sites Web</span>
              </button>
              <button className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                <Search className="w-4 h-4 shrink-0" /> 
                <span className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">Gestionnaire de Fichiers</span>
              </button>
            </div>
          </div>
        </div>
        

        <div className="p-3 border-t border-white/5 overflow-hidden whitespace-nowrap">
          <button className="w-full flex items-center px-3 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors text-sm font-medium">
            <Settings className="w-4 h-4 shrink-0" /> 
            <span className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">Paramètres Système</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full relative z-10 w-full overflow-hidden">
        

        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]" />
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[150px]" />
          <div className="absolute top-[60%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/10 blur-[120px]" />
        </div>

        <header className="relative z-20 w-full px-6 py-4 border-b border-white/5 bg-gray-950/80 backdrop-blur-xl flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden lg:block text-xs text-gray-500 font-mono">
              Workspace: <span className="text-purple-400">Homelab Infra</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 border border-white/5 text-xs font-mono">
              <div className={`w-2 h-2 rounded-full ${wsStatus === "connected" ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]" : wsStatus === "connecting" ? "bg-yellow-500 animate-pulse" : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"}`} />
              <span className={wsStatus === "connected" ? "text-green-400" : "text-red-400"}>
                {wsStatus.toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        <main className="relative z-10 flex-1 flex flex-col items-center justify-start gap-12 w-full px-6 md:px-12 xl:px-24 mx-auto overflow-y-auto pb-40 pt-16 lg:pt-24 transition-all duration-500">
          

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full min-h-[400px]">
          

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-black/50 border border-white/10 rounded-2xl p-5 backdrop-blur-md flex flex-col shadow-lg overflow-hidden h-[400px]"
          >
            <div className="flex items-center gap-2 mb-4 shrink-0">
              <Server className="w-5 h-5 text-blue-400" />
              <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest">ASUS Homelab</h2>
            </div>
            <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
              <div className="shrink-0">
                <div className="flex justify-between text-xs text-gray-400 mb-1 font-mono">
                  <span>CPU Usage</span>
                  <span>14%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '14%' }}></div>
                </div>
              </div>
              <div className="shrink-0">
                <div className="flex justify-between text-xs text-gray-400 mb-1 font-mono">
                  <span>RAM (32GB)</span>
                  <span>12GB / 32GB</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5">
                  <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '37%' }}></div>
                </div>
              </div>
              
              <div className="pt-2 mt-auto flex-1 flex flex-col overflow-hidden">
                <div className="text-xs text-gray-500 font-mono mb-2 shrink-0">
                  Containers: {serverStats.running} Running, {serverStats.stopped} Stopped
                </div>
                <div className="overflow-y-auto space-y-1 pr-1 flex-1 custom-scrollbar">
                  {visibleContainers.map((c, i) => (
                    <div key={i} className="flex justify-between items-center text-xs font-mono bg-white/5 px-2 py-1.5 rounded hover:bg-white/10 transition-colors cursor-default">
                      <span className="text-gray-300 truncate max-w-[100px]" title={c.name}>{c.name}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        {c.mem && c.mem !== "N/A" && <span className="text-cyan-300/80 text-[10px] border border-cyan-500/30 px-1 rounded bg-cyan-500/10">{c.mem}</span>}
                        <div className="flex items-center gap-1.5 w-16 justify-end">
                          <div className={`w-1.5 h-1.5 rounded-full ${c.status === 'running' ? 'bg-green-400 shadow-[0_0_5px_rgba(74,222,128,0.8)]' : 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)]'}`} />
                          <span className={c.status === 'running' ? 'text-green-400' : 'text-gray-500'}>{c.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {serverStats.list.length === 0 && (
                    <div className="text-gray-600 text-xs text-center italic mt-4">En attente de connexion...</div>
                  )}
                </div>
                {serverStats.list.length > 5 && (
                  <button 
                    onClick={() => setShowAllContainers(!showAllContainers)}
                    className="w-full mt-2 py-1.5 text-xs font-bold text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    {showAllContainers ? "Réduire" : `Voir les ${serverStats.list.length - 5} autres...`}
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="flex items-center justify-center relative h-[400px] w-full mx-auto"
          >
            <ParticleOrb />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="bg-black/50 border border-white/10 rounded-3xl p-6 backdrop-blur-md flex flex-col h-[400px] shadow-lg"
          >
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-green-400" />
                <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest">Activité Système</h2>
              </div>
              <span className="text-xs text-green-400 font-mono bg-green-400/10 border border-green-400/20 px-2 py-1 rounded-md animate-pulse">Live</span>
            </div>
            
            <div className="flex gap-2 mb-4 shrink-0 overflow-x-auto custom-scrollbar pb-1">
              {["Tous", "Erreur", "Système", "Docker", "Sécurité"].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 text-xs rounded-full border transition-all shrink-0 ${activeCategory === cat ? 'bg-purple-600/20 border-purple-500/50 text-purple-300' : 'bg-white/5 border-white/10 text-gray-500 hover:text-gray-300'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
              {[
                { time: "À l'instant", text: "Erreur 429: Quota Gemini 3.7 Flash dépassé.", icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", cat: "Erreur" },
                { time: "08:14 AM", text: "Accès God-Mode au Homelab accordé à Prométhée.", icon: Zap, color: "text-fuchsia-400", bg: "bg-fuchsia-500/10", border: "border-fuchsia-500/20", cat: "Sécurité" },
                { time: "Hier, 22:30", text: "Analyse de 'Master infra.md' terminée avec succès.", icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", cat: "Système" },
                { time: "Hier, 21:00", text: "Arrêt programmé du conteneur Pterodactyl.", icon: Server, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", cat: "Docker" },
                { time: "Hier, 19:45", text: "Démarrage du sous-système de logs.", icon: Activity, color: "text-gray-400", bg: "bg-white/5", border: "border-white/10", cat: "Système" }
              ].filter(action => activeCategory === "Tous" || action.cat === activeCategory).map((action, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${action.bg} ${action.border} transition-colors hover:brightness-110`}>
                  <div className={`mt-0.5 p-1.5 rounded-lg bg-black/40 ${action.color}`}>
                    <action.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-xs font-bold ${action.color} uppercase tracking-wider`}>
                        {action.icon === AlertTriangle ? "Erreur" : action.icon === Zap ? "Sécurité" : action.icon === Server ? "Docker" : action.icon === CheckCircle ? "Système" : "Info"}
                      </span>
                      <span className="text-gray-500 text-[10px] font-mono">{action.time}</span>
                    </div>
                    <div className="text-gray-300 text-sm leading-snug">{action.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="w-full mt-6 flex gap-6 max-h-[750px] shrink-0"
        >

          <div className="w-64 flex flex-col bg-black/40 border border-white/5 rounded-3xl backdrop-blur-md p-4 hidden md:flex h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <History className="w-4 h-4" /> Historique IA
              </h3>
              <button 
                onClick={() => setMessages([{ role: "ai", content: "Nouvelle discussion initialisée. Comment puis-je vous aider ?" }])}
                className="text-gray-400 hover:text-purple-400 transition-colors"
                title="Nouveau chat"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar">
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-white/5 rounded-xl transition-all truncate text-left">
                <MessageSquare className="w-4 h-4 shrink-0 text-fuchsia-400" /> Prométhée Init
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-500 hover:bg-white/5 rounded-xl transition-all truncate text-left">
                <MessageSquare className="w-4 h-4 shrink-0" /> Serveur Minecraft
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-500 hover:bg-white/5 rounded-xl transition-all truncate text-left">
                <MessageSquare className="w-4 h-4 shrink-0" /> Setup Base de Données
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center gap-3 mb-4 shrink-0 px-2">
              <Bell className="w-5 h-5 text-fuchsia-400" />
              <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest">Fil de discussion</h2>
            </div>
          
          <div className="flex-1 w-full bg-black/40 border border-white/5 rounded-3xl backdrop-blur-md p-4 md:p-6 overflow-y-auto custom-scrollbar shadow-inner flex flex-col gap-6 min-h-0">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl p-4 ${
                  msg.role === "user" 
                    ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] rounded-br-sm" 
                    : "bg-gray-900/80 border border-white/10 text-gray-300 shadow-lg rounded-bl-sm"
                }`}>
                  {!msg.content ? (
                    <div className="flex items-center gap-2 text-fuchsia-400 font-mono text-xs">
                      <div className="w-2 h-2 rounded-full bg-fuchsia-500 animate-ping"></div>
                      {thinkingStatus}
                    </div>
                  ) : (
                    <div className="prose prose-invert prose-sm max-w-none text-sm leading-relaxed prose-p:my-1 prose-pre:my-2 prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-code:text-fuchsia-300">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="w-full mt-4 shrink-0 flex flex-col gap-2">
            <div className="flex items-center gap-3 px-4">
              <select 
                value={activeProject} 
                onChange={e => setActiveProject(e.target.value)}
                className="bg-gray-900/60 border border-white/10 text-gray-400 text-xs rounded-full px-4 py-1.5 outline-none focus:border-purple-500/50 transition-colors cursor-pointer hover:bg-gray-800"
              >
                <option value="Tous les projets (Homelab)">📁 Racine du Homelab</option>
                <option value="Projets/team builder">📁 Projet: Team Builder</option>
                <option value="Projets/site_vitrine">📁 Projet: Site Vitrine</option>
              </select>

              <select 
                value={activeModel} 
                onChange={e => setActiveModel(e.target.value)}
                className="bg-gray-900/60 border border-white/10 text-gray-400 text-xs rounded-full px-4 py-1.5 outline-none focus:border-purple-500/50 transition-colors cursor-pointer hover:bg-gray-800"
              >
                <option value="gemini-3.7-flash">🧠 Gemini 3.7 Flash (Rapide)</option>
                <option value="gemini-3.1-pro-preview">🧠 Gemini 3.1 Pro (Intelligent)</option>
                <option value="gemini-3.5-flash">🧠 Gemini 3.5 Flash (Secours)</option>
              </select>
            </div>

            <div className="bg-gray-900/90 border border-purple-500/30 rounded-full backdrop-blur-xl flex items-center overflow-hidden hover:border-purple-500/70 transition-colors shadow-[0_10px_40px_rgba(0,0,0,0.5)] h-[60px]">
              <form onSubmit={handlePromptSubmit} className="flex-1 flex items-center w-full h-full px-6">
                <Terminal className="w-5 h-5 text-purple-400 mr-4 shrink-0" />
                <input 
                  type="text" 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Parlez à Prométhée..." 
                  className="flex-1 bg-transparent border-none outline-none text-white text-base font-medium placeholder:text-gray-500 h-full w-full focus:ring-0"
                />
                <button type="submit" className="ml-4 p-2.5 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 transition-all flex items-center justify-center shrink-0 shadow-lg">
                  <Search className="w-5 h-5 text-white" />
                </button>
              </form>
            </div>
          </div>
          </div>
        </motion.div>

      </main>
      
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02); 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(168,85,247,0.3); 
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(168,85,247,0.5); 
        }
      `}} />
    </div>
  );
}
