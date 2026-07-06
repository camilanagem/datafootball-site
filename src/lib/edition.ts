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

// Confederações das seleções (o campo `liga` vira a confederação no export).
// Serve pra separar seleções de clubes no diretório.
export const CONFEDERATIONS = ["UEFA", "CONMEBOL", "CONCACAF", "CAF", "AFC", "OFC"];

export function isNationalTeam(liga: string | undefined | null): boolean {
  return CONFEDERATIONS.includes((liga || "").toUpperCase());
}

// Seleções que trocaram de handle no Instagram durante a Copa: as duas contas
// (antiga + atual) acumularam histórico nos dados, então o diretório listava a mesma
// seleção 2x. Mapa handle-antigo → handle-canônico (o que está hoje no
// accounts_worldcup.yaml) pra colapsar tudo numa seleção só. Revisar pós-Copa.
export const HANDLE_ALIASES: Record<string, string> = {
  "nz_football": "nzallwhites",
  "hns.family": "hns_cff",
  "lesverts.faf": "fafalgeria_officiel",
  "iraq.nt": "iraqnt_en",
  "jfa_samuraiblue": "japanfootballassociation",
  "equipedefootcotedivoire": "fif.ci",
  "bafanabafana": "bafanabafanaofficial",
};

export function canonicalHandle(handle: string | undefined | null): string {
  const h = (handle || "").trim();
  return HANDLE_ALIASES[h] ?? h;
}
