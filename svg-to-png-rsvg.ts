import { execSync } from 'child_process';
import { existsSync } from 'fs';

export function convertSvgToPngWithRsvg(svgPath: string, pngPath: string, width: number = 800): void {
  try {
    // Try using rsvg-convert (part of librsvg, commonly available on macOS via Homebrew)
    const command = `rsvg-convert --width=${width} --format=png --output="${pngPath}" "${svgPath}"`;
    execSync(command, { stdio: 'inherit' });
    console.log(`Converted ${svgPath} -> ${pngPath} using rsvg-convert`);
  } catch (error) {
    console.error('rsvg-convert failed, trying alternative...');
    
    try {
      // Fallback: try using ImageMagick convert command
      const command2 = `convert -density 150 "${svgPath}" "${pngPath}"`;
      execSync(command2, { stdio: 'inherit' });
      console.log(`Converted ${svgPath} -> ${pngPath} using ImageMagick`);
    } catch (error2) {
      console.error('ImageMagick also failed. Available options:');
      console.error('1. Install rsvg-convert: brew install librsvg');
      console.error('2. Install ImageMagick: brew install imagemagick');
      console.error('3. Use online SVG to PNG converter');
      throw new Error('No SVG conversion tools available');
    }
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('Usage: npx ts-node svg-to-png-rsvg.ts <input.svg> <output.png> [width]');
    process.exit(1);
  }
  
  const [svgPath, pngPath, widthStr] = args;
  const width = widthStr ? parseInt(widthStr) : 800;
  
  if (!existsSync(svgPath)) {
    console.error(`Input file ${svgPath} does not exist`);
    process.exit(1);
  }
  
  try {
    convertSvgToPngWithRsvg(svgPath, pngPath, width);
    console.log('Conversion complete!');
  } catch (error) {
    console.error('Failed:', (error as Error).message);
    process.exit(1);
  }
}