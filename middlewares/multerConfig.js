import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "imgUploads");
  },
  filename: (req, file, cb) => {
    cb(null, `file-${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Allow images for any field
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  }
  // Allow videos for fields named 'videoFile' or 'videoThumbnail'
  else if (
    (file.fieldname === "videoFile" || file.fieldname === "videoThumbnail") &&
    file.mimetype.startsWith("video/")
  ) {
    cb(null, true);
  }
  // Allow PDF/DOC/DOCX for fields named 'pdfSpec' or 'prescriptionFile'
  else if (
    (file.fieldname === "pdfSpec" || file.fieldname === "prescriptionFile") &&
    (file.mimetype === "application/pdf" ||
     file.mimetype === "application/msword" ||
     file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
  ) {
    cb(null, true);
  }
  else {
    cb(new Error(`File type not allowed for field "${file.fieldname}"`), false);
  }
};

const multerConfig = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for videos/pdfs
});

export default multerConfig;