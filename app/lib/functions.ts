export const filterNullableObject = (obj: Record<string, unknown>): Record<string, unknown> => {
  return Object.entries(obj).reduce<Record<string, unknown>>((previousObject, [key, value]) => {
    if (value) previousObject[key] = value;
    return previousObject;
  }, {});
};