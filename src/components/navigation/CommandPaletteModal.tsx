import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  Terminal, 
  Moon, 
  Sun, 
  LayoutDashboard, 
  Globe, 
  PhoneCall, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX, 
  FileSpreadsheet, 
  FileText, 
  BrainCircuit, 
  Activity, 
  ShieldAlert, 
  Sparkles, 
  ArrowRight, 
  CornerDownLeft, 
  X,
  Radio,
  Layers,
  Zap,
  Mic,
  Command
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export interface CommandItem {
  id: string;
  title: string;
  category: 'Navigation' | 'Actions' | 'Global PoPs' | 'Theme & Display';
  shortcut?: string;
  icon: React.ReactNode;
  keywords?: string[];
  action: () => void;
}

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewMode: 'showcase' | 'admin';
  setViewMode: (mode: 'showcase' | 'admin') => void;
  onLaunchDemo: () => void;
  isFullWidth: boolean;
  setIsFullWidth: (val: boolean) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  viewMode,
  setViewMode,
  onLaunchDemo,
  isFullWidth,
  setIsFullWidth
}) => {
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const scrollToSection = (id: string) => {
    setViewMode('showcase');
    onClose();
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        const yOffset = -90;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 100);
  };

  const commands: CommandItem[] = useMemo(() => [
    // Primary Actions
    {
      id: 'action-launch-demo',
      title: 'Launch Live IVR Simulator',
      category: 'Actions',
      shortcut: '⌘D',
      icon: <PhoneCall className="w-4 h-4 text-emerald-400" />,
      keywords: ['call', 'voice', 'gemini', 'simulator', 'demo', 'test', 'microphone'],
      action: () => {
        onClose();
        onLaunchDemo();
      }
    },
    {
      id: 'action-toggle-view',
      title: viewMode === 'showcase' ? 'Switch to Enterprise Admin Console' : 'Switch to 3D Showcase View',
      category: 'Actions',
      shortcut: '⌘J',
      icon: viewMode === 'showcase' ? <LayoutDashboard className="w-4 h-4 text-purple-400" /> : <Globe className="w-4 h-4 text-cyan-400" />,
      keywords: ['admin', 'workspace', 'console', 'analytics', 'switch', 'view'],
      action: () => {
        onClose();
        setViewMode(viewMode === 'showcase' ? 'admin' : 'showcase');
      }
    },
    {
      id: 'action-voice-cloning',
      title: 'Neural Voice Cloning Studio (30s Audio Sample)',
      category: 'Actions',
      shortcut: '30s',
      icon: <Mic className="w-4 h-4 text-purple-400" />,
      keywords: ['voice', 'cloning', 'clone', 'synthetic', 'sample', 'audio', 'record', 'admin', 'profile'],
      action: () => {
        onClose();
        setViewMode('admin');
      }
    },
    {
      id: 'action-toggle-theme',
      title: `Switch Theme to ${theme === 'cyber-dark' ? 'Deep Space Blue' : 'Cyber Dark'}`,
      category: 'Theme & Display',
      shortcut: '⌘T',
      icon: theme === 'cyber-dark' ? <Moon className="w-4 h-4 text-purple-400" /> : <Terminal className="w-4 h-4 text-cyan-400" />,
      keywords: ['theme', 'dark', 'light', 'cyber', 'space', 'color', 'palette'],
      action: () => {
        onClose();
        toggleTheme();
      }
    },
    {
      id: 'action-toggle-width',
      title: isFullWidth ? 'Fit to Standard Max Width' : 'Expand to Full Window Canvas',
      category: 'Theme & Display',
      shortcut: '⌘W',
      icon: isFullWidth ? <Minimize2 className="w-4 h-4 text-cyan-400" /> : <Maximize2 className="w-4 h-4 text-cyan-400" />,
      keywords: ['width', 'screen', 'expand', 'fit', 'container', 'full'],
      action: () => {
        onClose();
        setIsFullWidth(!isFullWidth);
      }
    },

    // Navigation Items
    {
      id: 'nav-problem',
      title: 'Legacy IVR vs AI (Problem Statement)',
      category: 'Navigation',
      icon: <ShieldAlert className="w-4 h-4 text-rose-400" />,
      keywords: ['problem', 'legacy', 'ivr', 'dropoff', 'dtmf', 'comparison'],
      action: () => scrollToSection('problem')
    },
    {
      id: 'nav-architecture',
      title: 'System Architecture (5 Autonomous Subsystems)',
      category: 'Navigation',
      icon: <Layers className="w-4 h-4 text-blue-400" />,
      keywords: ['architecture', 'subsystems', 'stack', 'specs', 'cloud', 'latency'],
      action: () => scrollToSection('architecture')
    },
    {
      id: 'nav-pipeline',
      title: '6-Step Real-Time NLU Pipeline',
      category: 'Navigation',
      icon: <BrainCircuit className="w-4 h-4 text-cyan-400" />,
      keywords: ['pipeline', 'nlu', 'asr', 'audio', 'tts', 'transformer', 'flow'],
      action: () => scrollToSection('pipeline')
    },
    {
      id: 'nav-demo',
      title: 'Live In-Browser IVR Studio Simulator',
      category: 'Navigation',
      shortcut: 'Demo',
      icon: <PhoneCall className="w-4 h-4 text-emerald-400" />,
      keywords: ['demo', 'studio', 'interactive', 'radar', 'refund', 'tracking', 'flights'],
      action: () => scrollToSection('demo')
    },
    {
      id: 'nav-analytics',
      title: 'Global Operations & 3D Holographic Globe',
      category: 'Navigation',
      icon: <Globe className="w-4 h-4 text-blue-400" />,
      keywords: ['analytics', 'globe', 'pops', 'latency', 'streams', 'sentiment', 'd3'],
      action: () => scrollToSection('analytics')
    },
    {
      id: 'nav-pricing',
      title: 'ROI Calculator & Cost Transformation',
      category: 'Navigation',
      icon: <Activity className="w-4 h-4 text-amber-400" />,
      keywords: ['pricing', 'roi', 'calculator', 'savings', 'cost', 'economics', 'enterprise'],
      action: () => scrollToSection('pricing')
    },

    // Global PoPs
    {
      id: 'pop-sf',
      title: 'Edge Hub: San Francisco (14,290 calls/hr)',
      category: 'Global PoPs',
      icon: <Radio className="w-4 h-4 text-cyan-400" />,
      keywords: ['san francisco', 'us-west', 'edge', 'pop', 'hub'],
      action: () => scrollToSection('analytics')
    },
    {
      id: 'pop-ny',
      title: 'Edge Hub: New York (22,410 calls/hr)',
      category: 'Global PoPs',
      icon: <Radio className="w-4 h-4 text-cyan-400" />,
      keywords: ['new york', 'us-east', 'edge', 'pop', 'hub'],
      action: () => scrollToSection('analytics')
    },
    {
      id: 'pop-london',
      title: 'Edge Hub: London (18,800 calls/hr)',
      category: 'Global PoPs',
      icon: <Radio className="w-4 h-4 text-cyan-400" />,
      keywords: ['london', 'europe', 'edge', 'pop', 'hub'],
      action: () => scrollToSection('analytics')
    },
    {
      id: 'pop-tokyo',
      title: 'Edge Hub: Tokyo (12,980 calls/hr)',
      category: 'Global PoPs',
      icon: <Radio className="w-4 h-4 text-cyan-400" />,
      keywords: ['tokyo', 'asia', 'edge', 'pop', 'hub'],
      action: () => scrollToSection('analytics')
    }
  ], [viewMode, theme, isFullWidth]);

  // Filter commands by search query
  const filteredCommands = useMemo(() => {
    if (!searchQuery.trim()) return commands;
    const query = searchQuery.toLowerCase().trim();
    return commands.filter(item => {
      const matchTitle = item.title.toLowerCase().includes(query);
      const matchCategory = item.category.toLowerCase().includes(query);
      const matchKeywords = item.keywords?.some(kw => kw.toLowerCase().includes(query));
      return matchTitle || matchCategory || matchKeywords;
    });
  }, [commands, searchQuery]);

  // Adjust selected index bounds
  useEffect(() => {
    if (selectedIndex >= filteredCommands.length) {
      setSelectedIndex(Math.max(0, filteredCommands.length - 1));
    }
  }, [filteredCommands.length, selectedIndex]);

  // Handle arrow navigation and enter key inside modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + Math.max(1, filteredCommands.length)) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Scroll active item into view
  useEffect(() => {
    const activeEl = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-[#070B24] border border-cyan-500/40 rounded-3xl shadow-2xl shadow-cyan-950/80 overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Top Header & Search Input */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-800 bg-[#090E2E]/90">
          <Search className="w-5 h-5 text-cyan-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, jump to section, or search features..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent text-white placeholder-slate-400 font-sans text-sm focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 mr-2 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-300 hover:text-white cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Command Items List */}
        <div 
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 space-y-1 max-h-[460px] scrollbar-thin scrollbar-thumb-slate-800"
        >
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Sparkles className="w-8 h-8 text-cyan-400/50 mx-auto" />
              <p className="text-sm font-mono text-slate-300">No commands matching &ldquo;{searchQuery}&rdquo;</p>
              <p className="text-xs text-slate-500">Try searching for &quot;simulator&quot;, &quot;theme&quot;, &quot;pipeline&quot;, or &quot;roi&quot;</p>
            </div>
          ) : (
            filteredCommands.map((item, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <div
                  key={item.id}
                  data-index={idx}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/60 shadow-lg shadow-cyan-950/40'
                      : 'text-slate-300 hover:bg-slate-900/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className={`p-2 rounded-xl transition-colors ${
                      isSelected ? 'bg-cyan-500/30 text-cyan-200' : 'bg-slate-900 text-slate-400'
                    }`}>
                      {item.icon}
                    </div>
                    <div className="truncate">
                      <div className="font-mono text-xs sm:text-sm font-semibold truncate flex items-center gap-2">
                        <span>{item.title}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.shortcut && (
                      <kbd className="hidden sm:inline-block px-2 py-0.5 rounded-lg bg-slate-900/90 border border-slate-700/80 text-[10px] font-mono text-slate-300 font-bold shadow-inner">
                        {item.shortcut}
                      </kbd>
                    )}
                    {isSelected && (
                      <CornerDownLeft className="w-3.5 h-3.5 text-cyan-400 animate-in fade-in" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Bottom Keyboard Shortcuts Legend */}
        <div className="px-4 py-2.5 bg-[#050819] border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-200">↑↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-200">↵</kbd> Select
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-200">ESC</kbd> Close
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-cyan-300/80">
            <Command className="w-3.5 h-3.5" />
            <span>Power User Palette</span>
          </div>
        </div>
      </div>
    </div>
  );
};
