export function extractSymbols(text: string): string[] {
  const regex = /\$([A-Za-z0-9]+)/g;
  const matches = text.match(regex);
  if (!matches) return [];
  return matches.map((match) => match.slice(1)); // remove $ symbol
}

export function solToLamports(amount: string | number | null): bigint {
  if (amount === '' || amount === null || amount === undefined || isNaN(Number(amount))) {
    return BigInt(0);
  }
  // Ensure string, then multiply and round to avoid floating point issues
  return BigInt(Math.round(Number(amount) * 1_000_000_000));
}