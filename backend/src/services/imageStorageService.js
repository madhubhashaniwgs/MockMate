const fs = require("fs");
const path = require("path");

const LOCAL_UPLOAD_DIR = path.join(__dirname, "../uploads/profile");

const useBlobStorage = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

const saveProfileImage = async (file) => {
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname || "")}`;

  if (useBlobStorage()) {
    const { put } = require("@vercel/blob");
    const blob = await put(`profile-images/${filename}`, file.buffer, {
      access: "public",
      contentType: file.mimetype,
      addRandomSuffix: false,
    });
    return blob.url;
  }

  fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
  await fs.promises.writeFile(path.join(LOCAL_UPLOAD_DIR, filename), file.buffer);
  return `/uploads/profile/${filename}`;
};

const deleteProfileImage = async (storedPath) => {
  if (!storedPath) return;

  if (storedPath.startsWith("http")) {
    try {
      const { del } = require("@vercel/blob");
      await del(storedPath);
    } catch {
      // Ignore blob deletion failures
    }
    return;
  }

  const filePath = path.join(LOCAL_UPLOAD_DIR, path.basename(storedPath));
  await fs.promises.unlink(filePath).catch(() => {});
};

module.exports = {
  saveProfileImage,
  deleteProfileImage,
};
