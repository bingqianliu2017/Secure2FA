import type { VaultData } from "../types";

const VAULT_FILE = "Secure2FA/vault.json";

/**
 * 加载 vault（从 JSON 文件）
 * 桌面版：AppData/{identifier}/Secure2FA/vault.json
 */
export async function loadVault(): Promise<VaultData> {
  try {
    const { readTextFile, exists, mkdir, BaseDirectory } = await import("@tauri-apps/plugin-fs");

    const dirExists = await exists("Secure2FA", { baseDir: BaseDirectory.AppData });
    if (!dirExists) {
      await mkdir("Secure2FA", { baseDir: BaseDirectory.AppData, recursive: true });
      return { entries: [] };
    }

    const fileExists = await exists(VAULT_FILE, { baseDir: BaseDirectory.AppData });
    if (!fileExists) return { entries: [] };

    const raw = await readTextFile(VAULT_FILE, { baseDir: BaseDirectory.AppData });
    return JSON.parse(raw) as VaultData;
  } catch (e) {
    console.warn("[Secure2FA] loadVault 失败（可能不在 Tauri 环境）:", e);
    return { entries: [] };
  }
}

/**
 * 保存 vault 到 JSON 文件
 */
export async function saveVault(data: VaultData): Promise<void> {
  try {
    const { writeTextFile, mkdir, exists, BaseDirectory } = await import("@tauri-apps/plugin-fs");

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
    throw e;
  }
}
