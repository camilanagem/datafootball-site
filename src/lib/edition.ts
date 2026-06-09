// Edição do índice. Durante o torneio de seleções (8/jun–20/jul/2026) o site
// cobre 48 seleções no lugar dos 57 clubes — reverte sozinho pela data.
// (espelha COPA_INICIO/COPA_FIM do pipeline em ../../daily_cron.py)
const T_START = Date.UTC(2026, 5, 8); // 8 jun 2026
const T_END = Date.UTC(2026, 6, 21); // 21 jul 2026 (exclusivo)

export type Edition = {
  isTournament: boolean;
  accountCount: number;
};

export function getEdition(now: Date = new Date()): Edition {
  const t = now.getTime();
  const isTournament = t >= T_START && t < T_END;
  return {
    isTournament,
    accountCount: isTournament ? 48 : 57,
  };
}
