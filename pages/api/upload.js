import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { mongooseConnect } from '@/lib/mongoose';

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
});

const cloudinaryStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'images',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        use_filename: true,
        unique_filename: true,
    },
});

const upload = multer({ storage: cloudinaryStorage });

export default async function handle(req, res) {
    await mongooseConnect();

    try {
        const uploader = async (path) => cloudinary.uploader.upload(path);
        const uploadMiddleware = upload.array('file', 10); // Максимальна кількість файлів і їх поле

        uploadMiddleware(req, res, async (err) => {
            if (err) {
                console.error('Помилка завантаження файлу:', err);
                return res.status(400).json({ error: 'Помилка завантаження файлу' });
            }

            const links = [];
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ error: 'Файли не були завантажені.' });
            }
            for (const file of req.files) {
                const link = file.path;
                links.push(link);
            }

            return res.json({ links });
        });
    } catch (error) {
        console.error('Помилка сервера:', error);
        return res.status(500).json({ error: 'Помилка сервера' });
    }
}

export const config = {
    api: { bodyParser: false },
};



