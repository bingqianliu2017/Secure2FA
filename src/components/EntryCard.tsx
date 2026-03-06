import { useState } from "react";
import type { TOTPEntry } from "../types";
import { CodeDisplay } from "./CodeDisplay";

interface EntryCardProps {
  entry: TOTPEntry;
  onEdit: () => void;
  onDelete: () => void;
}

export function EntryCard({ entry, onEdit, onDelete }: EntryCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="entry-card">
      <div className="entry-header">
        <span className="entry-name">{entry.name}</span>
        <div className="entry-actions">
          <button
            type="button"
            className="btn-icon"
            onClick={onEdit}
            title="编辑"
            aria-label="编辑"
          >
            ✎
          </button>
          <div className="menu-wrapper">
            <button
              type="button"
              className="btn-icon"
              onClick={() => setShowMenu(!showMenu)}
              title="更多"
              aria-label="更多"
            >
              ⋮
            </button>
            {showMenu && (
              <>
                <div
                  className="menu-backdrop"
                  onClick={() => setShowMenu(false)}
                  aria-hidden="true"
                />
                <div className="menu-dropdown">
                  <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  onDelete();
                }}
                className="menu-item danger"
              >
                删除
              </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <CodeDisplay secret={entry.secret} />
    </div>
  );
}
