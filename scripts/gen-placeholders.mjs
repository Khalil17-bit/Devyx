import sharp from "sharp";

const names = [
  "nexus-cover.webp",
  "zenith-cover.webp",
  "leadbot-cover.webp",
  "erp-sync-cover.webp",
];

async function generate() {
  for (const name of names) {
    const label = name.replace(".webp", "").toUpperCase();
    const svg = `
      <svg width="800" height="450" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#0a0c10"/>
        <path d="M0 0 L800 450 M800 0 L0 450" stroke="#1f2937" stroke-width="1"/>
        <rect x="40" y="40" width="720" height="370" fill="none" stroke="#2563eb" stroke-width="1.5" stroke-dasharray="8 4"/>
        <text x="50%" y="48%" font-family="monospace" font-size="28" font-weight="bold" fill="#60a5fa" text-anchor="middle">
          DEVYX // ${label}
        </text>
        <text x="50%" y="58%" font-family="monospace" font-size="14" fill="#9ca3af" text-anchor="middle">
          CASE STUDY PREVIEW ARCHIVE
        </text>
      </svg>
    `;
    await sharp(Buffer.from(svg)).webp().toFile(`public/images/projects/${name}`);
    console.log(`Generated: public/images/projects/${name}`);
  }
}

generate().catch(console.error);
