'use client';

import { useState } from 'react';
import { X, Settings, Grid, Maximize, LayoutDashboard, Keyboard } from 'lucide-react';
import { SettingsModal } from './SettingsModal';
import type { StageLayout } from './meeting-types';

interface MoreMenuProps {
  layout: StageLayout;
  onLayoutChange: (l: StageLayout) => void;
  isHost: boolean;
  onlyHostCanShare: boolean;
  onToggleShareRestriction: () => void;
  onReportProblem: () => void;
}

/**
 * MoreMenu — overflow control bar button (⋯).
 * Contains: Settings, Layout toggle, Fullscreen, Share restriction (host), Keyboard shortcuts.
 */
export function MoreMenu({
  layout, onLayoutChange, isHost, onlyHostCanShare, onToggleShareRestriction, onReportProblem,
}: MoreMenuProps) {
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        id="more-menu-btn"
        onClick={() => setOpen((v) => !v)}
        className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-150 text-slate-300 hover:text-white hover:bg-white/8 ${open ? 'bg-white/10 text-white' : ''}`}
      >
        <span className="text-lg leading-none font-bold">⋯</span>
        <span className="text-[10px] hidden sm:block">More</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl py-1.5 min-w-[210px]">

            <MenuItem icon={<Settings size={15} />} label="Settings" onClick={() => { setSettingsOpen(true); setOpen(false); }} />

            <MenuItem
              icon={layout === 'grid' ? <LayoutDashboard size={15} /> : <Grid size={15} />}
              label={layout === 'grid' ? 'Speaker view' : 'Grid view'}
              onClick={() => { onLayoutChange(layout === 'grid' ? 'speaker' : 'grid'); setOpen(false); }}
            />

            <MenuItem icon={<Maximize size={15} />} label="Fullscreen" onClick={toggleFullscreen} />

            {isHost && (
              <>
                <div className="border-t border-white/5 my-1" />
                <MenuItem
                  icon={<span className="text-xs">🖥️</span>}
                  label={onlyHostCanShare ? 'Allow all to share screen' : 'Restrict screen share to host'}
                  onClick={() => { onToggleShareRestriction(); setOpen(false); }}
                />
              </>
            )}

            <div className="border-t border-white/5 my-1" />
            <MenuItem icon={<Keyboard size={15} />} label="Keyboard shortcuts" onClick={() => { setShortcutsOpen(true); setOpen(false); }} />
            <MenuItem icon={<span className="text-xs">⚠️</span>} label="Report a problem" onClick={() => { onReportProblem(); setOpen(false); }} />
          </div>
        </>
      )}

      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}

      {shortcutsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setShortcutsOpen(false)} />
          <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Keyboard Shortcuts</h3>
              <button onClick={() => setShortcutsOpen(false)}><X size={16} className="text-slate-400" /></button>
            </div>
            <div className="space-y-2 text-sm">
              {[
                ['Ctrl+D', 'Mute/unmute microphone'],
                ['Ctrl+E', 'Start/stop camera'],
                ['Ctrl+Shift+H', 'Raise/lower hand'],
                ['Ctrl+Shift+C', 'Open/close chat'],
                ['Esc', 'Close drawers / dialogs'],
              ].map(([key, desc]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-slate-400">{desc}</span>
                  <kbd className="px-2 py-0.5 rounded-md bg-slate-800 border border-white/10 text-xs text-slate-300 font-mono">{key}</kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-left"
    >
      <span className="text-slate-400">{icon}</span>
      {label}
    </button>
  );
}
