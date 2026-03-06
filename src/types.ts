export interface TOTPEntry {
  id: string;
  name: string;
  secret: string;
  issuer?: string;
  createdAt: number;
}

export interface VaultData {
  entries: TOTPEntry[];
}
