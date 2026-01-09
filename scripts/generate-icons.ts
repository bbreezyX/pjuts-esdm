import sharp from "sharp";
import path from "path";
import fs from "fs";

const SOURCE_LOGO = path.join(process.cwd(), "public", "logo-esdm.png");
const ICONS_DIR = path.join(process.cwd(), "public", "icons");

// PWA icon sizes required for manifest.json
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Apple touch icon size
const APPLE_TOUCH_ICON_SIZE = 180;

async function generateIcons() {
    // Ensure icons directory exists
    if (!fs.existsSync(ICONS_DIR)) {
        fs.mkdirSync(ICONS_DIR, { recursive: true });
    }

    console.log("🎨 Generating PWA icons from logo-esdm.png...\n");

    // Generate PWA icons for manifest.json
    for (const size of ICON_SIZES) {
        const outputPath = path.join(ICONS_DIR, `icon-${size}x${size}.png`);

        await sharp(SOURCE_LOGO)
            .resize(size, size, {
                fit: "contain",
                background: { r: 0, g: 51, b: 102, alpha: 1 }, // #003366
            })
            .png()
            .toFile(outputPath);

        console.log(`✅ Generated: icons/icon-${size}x${size}.png`);
    }

    // Generate Apple Touch Icon (180x180)
    const appleTouchIconPath = path.join(process.cwd(), "public", "apple-touch-icon.png");

    await sharp(SOURCE_LOGO)
        .resize(APPLE_TOUCH_ICON_SIZE, APPLE_TOUCH_ICON_SIZE, {
            fit: "contain",
            background: { r: 0, g: 51, b: 102, alpha: 1 }, // #003366
        })
        .png()
        .toFile(appleTouchIconPath);

    console.log(`✅ Generated: apple-touch-icon.png (${APPLE_TOUCH_ICON_SIZE}x${APPLE_TOUCH_ICON_SIZE})`);

    console.log("\n🎉 All PWA icons generated successfully!");
}

generateIcons().catch(console.error);
