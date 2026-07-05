/** Strip MongoDB `_id` before returning documents to application code. */
export function stripMongoId<T extends Record<string, unknown>>(
  doc: T
): Omit<T, "_id"> {
  const rest = { ...doc };
  delete rest._id;
  return rest as Omit<T, "_id">;
}