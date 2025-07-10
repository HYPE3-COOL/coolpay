// Classic pattern-matching tweet analyzer for extracting key fields

export class ClassicTweetAnalyzer {
  /**
   * Analyze tweet text to extract creator, amount, token, and platform_account.
   * @param text The tweet content
   * @param platformAccount The platform's Twitter username (without @)
   */
  static analyze(
    text: string,
    platformAccount: string
  ): { creator: string; amount: number; token: string; platform_account: string } {
    // 1. Find all @mentions (case-insensitive)
    const mentionRegex = /@([a-zA-Z0-9_]+)/g;
    const mentions = Array.from(text.matchAll(mentionRegex)).map(m => m[1].toLowerCase());

    let creator = '';
    let platform_account = '';
    if (mentions.length === 2 && mentions.includes(platformAccount.toLowerCase())) {
      platform_account = mentions.find(m => m === platformAccount.toLowerCase()) || '';
      creator = mentions.find(m => m !== platformAccount.toLowerCase()) || '';
    }

    // 2. Find amount + token (e.g. 0.1 sol, 1 $SOL, 2 SoL, etc.)
    // Accepts: XXX sol, XXX $sol, XXX $SOL, etc. (case-insensitive, $ optional)
    const amountRegex = /([0-9]+(?:\.[0-9]+)?)\s*\$?sol\b/i; // match only first
    const amountMatch = amountRegex.exec(text);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
    const token = amountMatch ? 'SOL' : '';

    return { creator, amount, token, platform_account };
  }
}
