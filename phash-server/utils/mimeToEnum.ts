import { Image_Format_Enum as Image_Format, Image_Format_Type } from "../types/imageTypes"

export const mimeToEnum: Record<string, Image_Format_Type> = {
  "image/jpeg": Image_Format.JPEG,
  "image/png": Image_Format.PNG,
  "image/webp": Image_Format.WEBP,
  "image/svg+xml": Image_Format.SVG,
};

export function getImageFormat(mimetype: string): Image_Format_Type | null {
  return mimeToEnum[mimetype] ?? null;
}
