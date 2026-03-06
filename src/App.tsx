import { useState, useEffect } from "react";
import { EntryCard } from "./components/EntryCard";
import { EntryForm } from "./components/EntryForm";
import { loadVault, saveVault } from "./core/storage";
import type { TOTPEntry, VaultData } from "./types";

type View = "main" | "add" | "edit";

export default function App() {
  const [view, setView] = useState<View>("main");
  const [vault, setVault] = useState<VaultData>({ entries: [] });
  const [editingEntry, setEditingEntry] = useState<TOTPEntry | null>(null);

  useEffect(() => {
    loadVault().then(setVault);
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
    await saveVault(nextVault);
    setVault(nextVault);
    setEditingEntry(null);
    setView("main");
  };

  const handleDeleteEntry = async (id: string) => {
    const nextEntries = vault.entries.filter((e) => e.id !== id);
    const nextVault = { ...vault, entries: nextEntries };
    await saveVault(nextVault);
    setVault(nextVault);
  };

  if (view === "add" || view === "edit") {
    return (
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
    );
  }

  const entries = vault.entries;

  return (
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
  );
}
