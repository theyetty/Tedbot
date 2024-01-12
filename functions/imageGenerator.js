const { createCanvas, loadImage } = require('canvas');
const path = require('path');

async function generateRankImage(rank, tier, username) {
    const imagePath = path.join(__dirname, '..', 'rank_images', `${rank.toLowerCase()}.png`);
    const baseImage = await loadImage(imagePath);
  
    const canvas = createCanvas(baseImage.width, baseImage.height);
    const context = canvas.getContext('2d');
  
    // Draw the base image
    context.drawImage(baseImage, 0, 0);
  
    // Function to draw centered text
    function drawCenteredText(text, font, fillStyle, y) {
        context.font = font;
        context.fillStyle = fillStyle;
        const textWidth = context.measureText(text).width;
        const x = (canvas.width - textWidth) / 2;
        context.fillText(text, x, y);
    }

    // Add username text
    drawCenteredText(username, 'bold 50px Arial', 'black', 100);

    // Add rank text
    drawCenteredText(rank, 'bold 30px Arial', 'black', 150); // Adjust y position as needed

    if (!tier) { tier = '0' };
    // Add tier text
    drawCenteredText(`Tier ${tier}`, 'bold 30px Arial', 'black', 200); // Adjust y position as needed
  
    return canvas.toBuffer();
  }

module.exports = { generateRankImage };
