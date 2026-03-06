interface TitleBarProps {
  onCloseClick?: () => void;
}

async function getWindow() {
  const { getCurrentWindow } = await import("@tauri-apps/api/window");
  return getCurrentWindow();
}

export function TitleBar({ onCloseClick }: TitleBarProps) {
  const handleMinimize = async () => {
    try {
      const win = await getWindow();
      await win.minimize();
    } catch {
      /* not in Tauri */
    }
  };

  const handleMaximize = async () => {
    try {
      const win = await getWindow();
      await win.toggleMaximize();
    } catch {
      /* not in Tauri */
    }
  };

  const handleClose = () => {
    if (onCloseClick) {
      onCloseClick();
    } else {
      getWindow().then((win) => win.close()).catch(() => {});
    }
  };

  return (
    <div className="titlebar" data-tauri-drag-region>
      <span className="titlebar-title">Secure2FA</span>
      <div className="titlebar-controls">
        <button
          type="button"
          className="titlebar-btn"
          onClick={handleMinimize}
          title="最小化"
          aria-label="最小化"
        >
          <svg width="10" height="1" viewBox="0 0 10 1">
            <rect width="10" height="1" fill="currentColor" />
          </svg>
        </button>
        <button
          type="button"
          className="titlebar-btn"
          onClick={handleMaximize}
          title="最大化"
          aria-label="最大化"
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <rect x="1" y="1" width="8" height="8" stroke="currentColor" strokeWidth="1" fill="none" />
          </svg>
        </button>
        <button
          type="button"
          className="titlebar-btn titlebar-btn-close"
          onClick={handleClose}
          title="关闭"
          aria-label="关闭"
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        </button>
      </div>
    </div>
  );
}
