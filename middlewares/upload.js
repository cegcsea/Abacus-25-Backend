import multer from 'multer';
import path from 'path';
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..' , 'images/'));
  },
  filename: (req, file, cb) => {
    cb(null, req.params.workshopPaymentId + '_' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

export default upload;