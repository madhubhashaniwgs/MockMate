const API_ORIGIN = import.meta.env.VITE_API_URL;

export const resolveImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (/^(https?:)?\/\//.test(imagePath) || imagePath.startsWith("data:")) {
    return imagePath;
  }
  return `${API_ORIGIN}${imagePath}`;
};
