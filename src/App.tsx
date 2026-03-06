import { useState, useEffect } from "react";
import { EntryCard } from "./components/EntryCard";
import { EntryForm } from "./components/EntryForm";
import { TitleBar } from "./components/TitleBar";
import { CloseConfirmDialog } from "./components/CloseConfirmDialog";
import { loadVault, saveVault } from "./core/storage";
import type { TOTPEntry, VaultData } from "./types";

type View = "main" | "add" | "edit";

export default function App() {
  const [view, setView] = useState<View>("main");
  const [vault, setVault] = useState<VaultData>({ entries: [] });
  const [editingEntry, setEditingEntry] = useState<TOTPEntry | null>(null);
  const [showCloseDialog, setShowCloseDialog] = useState(false);

  const handleMinimizeToTray = async () => {
    setShowCloseDialog(false);
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("minimize_to_tray"); // 原子操作：显示托盘 + 隐藏窗口
    } catch {
      /* not in Tauri */
    }
  };

  const handleQuit = async () => {
    setShowCloseDialog(false);
    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      await getCurrentWindow().destroy();
    } catch {
      /* not in Tauri */
    }
  };

  useEffect(() => {
    loadVault().then(setVault);
    // 启动时窗口为 hidden，待首次渲染后再显示，避免白屏
    const show = async () => {
      try {
        const { getCurrentWindow } = await import("@tauri-apps/api/window");
        const { invoke } = await import("@tauri-apps/api/core");
        await getCurrentWindow().show();
        await invoke("hide_tray"); // 窗口可见时隐藏托盘，仅保留任务栏
      } catch {
        /* not in Tauri */
      }
    };
    show();
  }, []);

  const handleSaveEntry = async (name: string, secret: string) => {
    let nextEntries: TOTPEntry[];
    if (editingEntry) {
      nextEntries = vault.entries.map((e) =>
        e.id === editingEntry.id
          ? { ...e, name, secret, issuer: "GitHub" }
          : e
      );
    } else {
      const newEntry: TOTPEntry = {
        id: crypto.randomUUID(),
        name,
        secret,
        issuer: "GitHub",
        createdAt: Date.now(),
      };
      nextEntries = [...vault.entries, newEntry];
    }

    const nextVault = { ...vault, entries: nextEntries };
    try {
      await saveVault(nextVault);
      setVault(nextVault);
      setEditingEntry(null);
      setView("main");
    } catch (e) {
      console.error("保存失败:", e);
      alert("保存失败，请检查应用是否有写入权限: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  const handleDeleteEntry = async (id: string) => {
    const nextEntries = vault.entries.filter((e) => e.id !== id);
    const nextVault = { ...vault, entries: nextEntries };
    try {
      await saveVault(nextVault);
      setVault(nextVault);
    } catch (e) {
      console.error("删除保存失败:", e);
      alert("保存失败: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  if (view === "add" || view === "edit") {
    return (
      <div className="app-wrapper">
        <TitleBar onCloseClick={() => setShowCloseDialog(true)} />
        <div className="app">
        <EntryForm
          entry={view === "edit" ? editingEntry : null}
          onSave={handleSaveEntry}
          onCancel={() => {
            setEditingEntry(null);
            setView("main");
          }}
        />
        </div>
      {showCloseDialog && (
        <CloseConfirmDialog
          onMinimizeToTray={handleMinimizeToTray}
          onQuit={handleQuit}
          onCancel={() => setShowCloseDialog(false)}
        />
      )}
      </div>
    );
  }

  const entries = vault.entries;

  return (
    <div className="app-wrapper">
      <TitleBar onCloseClick={() => setShowCloseDialog(true)} />
      <div className="app">
      <header className="app-header">
        <h1>Secure2FA</h1>
        <button
          type="button"
          className="btn-add"
          onClick={() => setView("add")}
        >
          + 添加
        </button>
      </header>

      <main className="app-main">
        {entries.length === 0 ? (
          <div className="empty-state">
            <p>暂无 2FA 账号</p>
            <p className="empty-hint">点击下方按钮添加 GitHub 2FA</p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setView("add")}
            >
              + 添加 GitHub 2FA
            </button>
          </div>
        ) : (
          <div className="entry-list">
            {entries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onEdit={() => {
                  setEditingEntry(entry);
                  setView("edit");
                }}
                onDelete={() => handleDeleteEntry(entry.id)}
              />
            ))}
          </div>
        )}
      </main>
      </div>
      {showCloseDialog && (
        <CloseConfirmDialog
          onMinimizeToTray={handleMinimizeToTray}
          onQuit={handleQuit}
          onCancel={() => setShowCloseDialog(false)}
        />
      )}
    </div>
  );
}
