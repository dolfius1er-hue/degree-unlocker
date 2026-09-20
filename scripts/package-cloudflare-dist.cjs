const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

async function createDistZip() {
  const distDir = path.join(process.cwd(), 'dist');
  const outputFile = path.join(process.cwd(), 'cloudflare-pages-dist.zip');

  if (!fs.existsSync(distDir)) {
    console.error('❌ Le dossier "dist" n\'existe pas. Veuillez exécuter "npm run build" d\'abord.');
    process.exit(1);
  }

  const zip = new JSZip();

  function addFolderToZip(currentPath, zipFolder) {
    const files = fs.readdirSync(currentPath);
    for (const file of files) {
      const fullPath = path.join(currentPath, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        const subFolder = zipFolder.folder(file);
        addFolderToZip(fullPath, subFolder);
      } else {
        const fileData = fs.readFileSync(fullPath);
        zipFolder.file(file, fileData);
      }
    }
  }

  console.log('📦 Création de l\'archive "cloudflare-pages-dist.zip" depuis dist/...');
  addFolderToZip(distDir, zip);

  const content = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(outputFile, content);

  console.log(`✅ Fichier prêt : ${outputFile} (${(content.length / 1024 / 1024).toFixed(2)} MB)`);
  console.log('👉 Vous pouvez glisser-déposer "cloudflare-pages-dist.zip" directement dans Cloudflare Pages !');
}

createDistZip().catch((err) => {
  console.error(err);
  process.exit(1);
});
