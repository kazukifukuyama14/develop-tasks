export function handleError(
  error: unknown,
  options?: { defaultMessage?: string }
) {
  // エラー処理ロジックをカスタマイズ
  console.error(options?.defaultMessage || "An error occurred.", error);
  // オプションで、ユーザーにトーストやアラートを表示s
}
