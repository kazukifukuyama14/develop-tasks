import { parseISO, format } from "date-fns";
import { ja } from "date-fns/locale";

export type DateLike = Date | string | number;

/**
 * 任意の日付入力 (DateLike) を Date オブジェクトに変換
 * - Date → そのまま返却
 * - string → ISO8601形式とみなして parseISO で変換
 * - number → 桁数で秒 (10桁) / ミリ秒 (13桁) を自動判定し Date に変換
 *
 * @param input 日付入力（Date | ISO文字列 | Unix timestamp）
 * @returns Date オブジェクト
 */
export const toDate = (input: DateLike): Date => {
  if (input instanceof Date) return input;
  if (typeof input === "string") return parseISO(input);

  if (typeof input === "number") {
    return input.toString().length === 10
      ? new Date(input * 1000)
      : new Date(input);
  }

  throw new Error(`Invalid date input: ${JSON.stringify(input)}`);
};

/**
 * 日付を 'yyyy/MM/dd (E)' 形式でフォーマット
 * - 日本語ロケールで曜日を `(金)` のように省略形で表示します。
 *
 * @param input 日付入力
 * @returns フォーマット済み文字列
 */
export const formatDate = (input: DateLike) =>
  format(toDate(input), "yyyy/MM/dd (E)", { locale: ja });
