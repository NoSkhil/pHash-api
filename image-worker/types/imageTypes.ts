import type { Prisma } from "@prisma/client";
import type { Image as ImageType, ImageVerification as ImageVerificationType } from "@prisma/client";
import { Image_Format as Prisma_Image_Format_Enum } from "@prisma/client";
import type { Image_Format as Prisma_Image_Format_Type} from "@prisma/client";


type CreateImageRecord = Prisma.ImageCreateInput;
type Image = ImageType;
type ImageVerification = ImageVerificationType;
type CreateImageVerificationRecord = Prisma.ImageVerificationUncheckedCreateInput;


const Image_Format_Enum = Prisma_Image_Format_Enum;
type Image_Format_Type = Prisma_Image_Format_Type;



export {
    CreateImageRecord,
    Image,
    Image_Format_Enum,
    Image_Format_Type,
    ImageVerification,
    CreateImageVerificationRecord
};