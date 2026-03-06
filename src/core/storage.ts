import type { VaultData } from "../types";

const VAULT_FILE = "Secure2FA/vault.json";

function isTauri() {
  return typeof (window as Window & { __TAURI__?: unknown }).__TAURI__ !== "undefined";
}

/**
 * 加载 vault（从 JSON 文件）
 * 桌面版：$APPDATA/Secure2FA/vault.json
 */
export async function loadVault(): Promise<VaultData> {
  if (!isTauri()) return { entries: [] };

  const { readTextFile, exists, BaseDirectory } = await import("@tauri-apps/plugin-fs");
  const { mkdir } = await import("@tauri-apps/plugin-fs");

  try {
    const dirExists = await exists("Secure2FA", { baseDir: BaseDirectory.AppData });
    if (!dirExists) {
      await mkdir("Secure2FA", { baseDir: BaseDirectory.AppData, recursive: true });
      return { entries: [] };
    }

    const fileExists = await exists(VAULT_FILE, { baseDir: BaseDirectory.AppData });
    if (!fileExists) return { entries: [] };

    const raw = await readTextFile(VAULT_FILE, { baseDir: BaseDirectory.AppData });
    return JSON.parse(raw) as VaultData;
  } catch {
    return { entries: [] };
  }
}

/**
 * 保存 vault 到 JSON 文件
 */
export async function saveVault(data: VaultData): Promise<void> {
  if (!isTauri()) return;

  const { writeTextFile, mkdir, exists, BaseDirectory } = await import("@tauri-apps/plugin-fs");

  try {
    const dirExists = await exists("Secure2FA", { baseDir: BaseDirectory.AppData });
    if (!dirExists) {
      await mkdir("Secure2FA", { baseDir: BaseDirectory.AppData, recursive: true });
    }

    await writeTextFile(
      VAULT_FILE,
      JSON.stringify(data, null, 2),
      { baseDir: BaseDirectory.AppData }
    );
  } catch (e) {
    console.error("saveVault failed:", e);
  }
}
