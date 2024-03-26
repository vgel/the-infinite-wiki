import _slugify from "slugify";

export const slugify = (text: string): string => {
  return _slugify(text.toLowerCase().trim(), "_");
};
