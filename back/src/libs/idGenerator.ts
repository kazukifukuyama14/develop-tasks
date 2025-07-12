import { ulid } from "ulid";

/**
 * ULIDを生成
 * - 例) 01JYV2ZV1ESBT6KZY5WNE4A4JR
 */
export const generateUlid = () => {
  return ulid();
};
