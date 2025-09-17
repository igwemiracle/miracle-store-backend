const multer = require('multer');
const path = require('path');

// 1. Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // folder to save uploads
  },
  filename: function (req, file, cb) {
    // unique filename: timestamp + original extension
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// 2. File filter (optional): accept only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = allowedTypes.test(file.mimetype);

  if (extName && mimeType) {
    return cb(null, true);
  } else {
    cb('Error: Images only!');
  }
};

// 3. Initialize upload middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // limit 5MB
  fileFilter: fileFilter
});

module.exports = upload;
