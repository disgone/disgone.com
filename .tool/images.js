
import path from "path";
import fs from "fs";
import imagemin from "imagemin";
import webp from "imagemin-webp";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
    console.log('Starting...');

    function getDirectories(path) {
        const paths = fs
            .readdirSync(path, { withFileTypes: true })
            .filter((d) => d.isDirectory())
            .map((d) => `${path}\\${d.name}`);

        const nested = paths.reduce(
            (a, d) => a.concat(getDirectories(d)), []
        );

        return [path, ...nested];
    }

    const basePath = path.resolve(__dirname, '../content/blog');
    console.log(basePath);
    const directories = getDirectories(basePath);

    await Promise.all(
        directories.map(async (folder) => {
            imagemin([`${folder}/*.{jpg,jpeg}`], {
                destination: folder,
                plugins: [
                    webp({
                        quality: 90
                    })
                ]
            })
        })
    );
})().then(r => console.log('Image conversion complete!'));
