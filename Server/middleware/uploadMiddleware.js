const multer = require("multer");
const path = require("path");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith("video/");

    return {
      folder: "soandita",
      resource_type: isVideo ? "video" : "image",
      allowed_formats: [
        // ── Images ──
        "jpg", "jpeg", "png", "webp", "gif", "jfif",
        "heic", "heif", "avif", "bmp", "tiff", "tif", "svg",
        // ── Videos ──
        "mp4", "mov", "webm", "3gp", "avi", "mkv", "m4v",
      ],
      // Apply transformations only for images, not videos
      ...(isVideo
        ? {}
        : {
            transformation: [
              { width: 1200, crop: "limit", quality: "auto" },
            ],
          }),
    };
  },
});

// ── Allowed extensions & MIME types (images + videos) ──
const allowedExtensions =
  /jpeg|jpg|png|webp|gif|jfif|heic|heif|avif|bmp|tiff|tif|svg|mp4|mov|webm|3gp|avi|mkv|m4v/;

const allowedMimeTypes =
  /image\/jpeg|image\/png|image\/webp|image\/gif|image\/heic|image\/heif|image\/avif|image\/bmp|image\/tiff|image\/svg\+xml|video\/mp4|video\/quicktime|video\/webm|video\/3gpp|video\/x-msvideo|video\/x-matroska|video\/x-m4v/;

const fileFilter = (req, file, cb) => {
  const extname = allowedExtensions.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedMimeTypes.test(file.mimetype);

  if (extname || mimetype) {
    cb(null, true);
  } else {
    cb(
      new multer.MulterError(
        "LIMIT_UNEXPECTED_FILE",
        "Only image files (jpg, png, webp, gif, heic, avif, etc.) and video files (mp4, mov, webm, etc.) are allowed"
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
});

module.exports = upload;

