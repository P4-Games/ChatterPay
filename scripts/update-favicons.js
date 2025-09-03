const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuración de tamaños de favicon
const faviconSizes = {
  // Android Chrome
  'android-chrome-36x36.png': 36,
  'android-chrome-48x48.png': 48,
  'android-chrome-72x72.png': 72,
  'android-chrome-96x96.png': 96,
  'android-chrome-144x144.png': 144,
  'android-chrome-192x192.png': 192,
  'android-chrome-196x196.png': 196,
  'android-chrome-256x256.png': 256,
  'android-chrome-384x384.png': 384,
  'android-chrome-512x512.png': 512,
  
  // Apple Touch Icons
  'apple-57x57-touch-icon.png': 57,
  'apple-60x60-touch-icon.png': 60,
  'apple-72x72-touch-icon.png': 72,
  'apple-76x76-touch-icon.png': 76,
  'apple-114x114-touch-icon.png': 114,
  'apple-120x120-touch-icon.png': 120,
  'apple-144x144-touch-icon.png': 144,
  'apple-152x152-touch-icon.png': 152,
  'apple-180x180-touch-icon.png': 180,
  
  // Apple Touch Icons (precomposed)
  'apple-touch-icon-57x57-precomposed.png': 57,
  'apple-touch-icon-60x60-precomposed.png': 60,
  'apple-touch-icon-72x72-precomposed.png': 72,
  'apple-touch-icon-76x76-precomposed.png': 76,
  'apple-touch-icon-114x114-precomposed.png': 114,
  'apple-touch-icon-120x120-precomposed.png': 120,
  'apple-touch-icon-144x144-precomposed.png': 144,
  'apple-touch-icon-152x152-precomposed.png': 152,
  'apple-touch-icon-180x180-precomposed.png': 180,
  
  // Apple Touch Icons (default)
  'apple-touch-icon-57x57.png': 57,
  'apple-touch-icon-60x60.png': 60,
  'apple-touch-icon-72x72.png': 72,
  'apple-touch-icon-76x76.png': 76,
  'apple-touch-icon-114x114.png': 114,
  'apple-touch-icon-120x120.png': 120,
  'apple-touch-icon-144x144.png': 144,
  'apple-touch-icon-152x152.png': 152,
  'apple-touch-icon-180x180.png': 180,
  'apple-touch-icon.png': 180,
  'apple-touch-icon-precomposed.png': 180,
  
  // Standard favicons
  'favicon-16x16.png': 16,
  'favicon-32x32.png': 32,
  
  // Microsoft Tiles
  'mstile-70x70.png': 70,
  'mstile-150x150.png': 150,
  'mstile-310x150.png': 310,
  'mstile-310x310.png': 310,
};

async function generateFavicons(sourceImagePath, outputDir) {
  try {
    console.log('🚀 Iniciando generación de favicons...');
    console.log(`📁 Imagen fuente: ${sourceImagePath}`);
    console.log(`📁 Directorio de salida: ${outputDir}`);
    
    // Verificar que la imagen fuente existe
    if (!fs.existsSync(sourceImagePath)) {
      throw new Error(`La imagen fuente no existe: ${sourceImagePath}`);
    }
    
    // Crear directorio de salida si no existe
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    // Generar cada tamaño de favicon
    for (const [filename, size] of Object.entries(faviconSizes)) {
      try {
        const outputPath = path.join(outputDir, filename);
        
        await sharp(sourceImagePath)
          .resize(size, size, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .png()
          .toFile(outputPath);
        
        console.log(`✅ Generado: ${filename} (${size}x${size})`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error generando ${filename}:`, error.message);
        errorCount++;
      }
    }
    
    // Generar favicon.ico (16x16, 32x32, 48x48)
    try {
      const icoOutputPath = path.join(outputDir, 'favicon.ico');
      await sharp(sourceImagePath)
        .resize(32, 32, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(icoOutputPath);
      
      console.log('✅ Generado: favicon.ico');
      successCount++;
    } catch (error) {
      console.error('❌ Error generando favicon.ico:', error.message);
      errorCount++;
    }
    
    console.log('\n🎉 Generación completada!');
    console.log(`✅ Exitosos: ${successCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    
  } catch (error) {
    console.error('💥 Error general:', error.message);
    process.exit(1);
  }
}

// Función principal
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('📖 Uso: node update-favicons.js <ruta-imagen-fuente> [directorio-salida]');
    console.log('');
    console.log('📝 Ejemplos:');
    console.log('  node update-favicons.js ./mi-logo.png');
    console.log('  node update-favicons.js ./mi-logo.svg ./public/assets/images/favicon');
    console.log('');
    console.log('💡 La imagen fuente debe ser PNG, JPG, SVG o WebP');
    console.log('💡 Si no especificas directorio de salida, se usará: ./public/assets/images/favicon');
    process.exit(1);
  }
  
  const sourceImagePath = args[0];
  const outputDir = args[1] || './public/assets/images/favicon';
  
  await generateFavicons(sourceImagePath, outputDir);
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { generateFavicons, faviconSizes };
