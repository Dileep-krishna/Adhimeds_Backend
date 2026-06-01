import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "imgUploads");
  },
  filename: (req, file, cb) => {
    cb(null, `image-${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Allow images for all fields (thumbnail, galleryImages, metaImage, etc.)
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  }
  // Allow PDF/DOC/DOCX but only for the field named 'prescriptionFile'
  else if (
    file.fieldname === "prescriptionFile" &&
    (file.mimetype === "application/pdf" ||
     file.mimetype === "application/msword" ||
     file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
  ) {
    cb(null, true);
  }
  else {
    cb(new Error("Only image files are allowed (or PDF/DOC for prescription)"), false);
  }
};

const multerConfig = multer({
  storage,
  fileFilter,
});

export default multerConfig;