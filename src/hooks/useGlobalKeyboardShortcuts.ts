import { useEffect } from 'react';

interface UseGlobalShortcutsOptions {
  onOpenCommandPalette: () => void;
  onCloseCommandPalette: () => void;
  isCommandPaletteOpen: boolean;
  onToggleTheme?: () => void;
  onLaunchDemo?: () => void;
  onToggleViewMode?: () => void;
}

export function useGlobalKeyboardShortcuts({
  onOpenCommandPalette,
  onCloseCommandPalette,
  isCommandPaletteOpen,
  onToggleTheme,
  onLaunchDemo,
  onToggleViewMode,
}: UseGlobalShortcutsOptions) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCmdOrCtrl = isMac ? event.metaKey : event.ctrlKey;

      // 1. Cmd+K or Ctrl+K: Toggle Command Palette
      if (isCmdOrCtrl && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (isCommandPaletteOpen) {
          onCloseCommandPalette();
        } else {
          onOpenCommandPalette();
        }
        return;
      }

      // 2. Escape: Close Command Palette and broadcast close event for any active modal
      if (event.key === 'Escape') {
        if (isCommandPaletteOpen) {
          event.preventDefault();
          onCloseCommandPalette();
        }
        // Broadcast to any active modals/drawers in the DOM
        window.dispatchEvent(new CustomEvent('app:close-modals'));
        return;
      }

      // If user is currently typing in an input or textarea, don't trigger single-key or standard input shortcuts
      const activeTag = document.activeElement?.tagName.toLowerCase();
      const isInputFocused = activeTag === 'input' || activeTag === 'textarea' || (document.activeElement as HTMLElement)?.isContentEditable;

      if (isInputFocused && !isCmdOrCtrl) {
        return;
      }

      // 3. Cmd+D or Ctrl+D: Jump to live simulator
      if (isCmdOrCtrl && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        onLaunchDemo?.();
        return;
      }

      // 4. Cmd+J or Ctrl+J: Toggle view mode
      if (isCmdOrCtrl && event.key.toLowerCase() === 'j') {
        event.preventDefault();
        onToggleViewMode?.();
        return;
      }

      // 5. Cmd+T or Ctrl+T: Toggle theme
      if (isCmdOrCtrl && event.shiftKey && event.key.toLowerCase() === 't') {
        event.preventDefault();
        onToggleTheme?.();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    onOpenCommandPalette,
    onCloseCommandPalette,
    isCommandPaletteOpen,
    onToggleTheme,
    onLaunchDemo,
    onToggleViewMode
  ]);
}
