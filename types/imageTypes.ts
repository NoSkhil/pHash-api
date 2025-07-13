import type { Prisma } from "@prisma/client";
import type { Image as ImageType } from "@prisma/client";

type CreateImageRecord = Prisma.ImageCreateInput;
type Image = ImageType;


export {
    CreateImageRecord,
    Image
};