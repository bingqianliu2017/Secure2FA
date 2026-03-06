import { useState } from "react";
import type { FormEvent } from "react";
import { isValidSecret, normalizeSecret } from "../core/totp";
import type { TOTPEntry } from "../types";

interface EntryFormProps {
  entry?: TOTPEntry | null;
  onSave: (name: string, secret: string) => void | Promise<void>;
  onCancel: () => void;
}

export function EntryForm({ entry, onSave, onCancel }: EntryFormProps) {
  const [name, setName] = useState(entry?.name ?? "GitHub");
  const [secret, setSecret] = useState(entry?.secret ?? "");
  const [showSecret, setShowSecret] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("请输入名称");
      return;
    }

    const normalizedSecret = normalizeSecret(secret);
    if (!normalizedSecret) {
      setError("请输入 Secret");
      return;
    }
    if (!isValidSecret(normalizedSecret)) {
      setError("Secret 格式错误，需为 Base32（如 XXXX XXXX XXXX XXXX）");
      return;
    }

    setLoading(true);
    try {
      await onSave(trimmedName, normalizedSecret);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="entry-form">
      <div className="form-header">
        <h2>{entry ? "编辑 GitHub 2FA" : "添加 GitHub 2FA"}</h2>
        <button type="button" className="btn-text" onClick={onCancel}>
          取消
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <label className="form-label">名称</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="如 GitHub"
          className="form-input"
          autoFocus
        />
        <label className="form-label">Secret（2FA 密钥，仅本地存储）</label>
        <div className="secret-input-wrapper">
          <input
            type={showSecret ? "text" : "password"}
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Base32 格式"
            className="form-input"
          />
          <button
            type="button"
            className="btn-icon-small"
            onClick={() => setShowSecret(!showSecret)}
            title={showSecret ? "隐藏" : "显示"}
          >
            {showSecret ? "🙈" : "👁"}
          </button>
        </div>
        <p className="form-hint">Base32 格式，如 XXXX XXXX XXXX XXXX</p>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary">
          保存
        </button>
      </form>
    </div>
  );
}
