const { createCanvas, loadImage } = require('canvas');
const path = require('path');

async function generateRankImage(rank, tier, username) {
    const imagePath = path.join(__dirname, '..', 'rank_images', `${rank.toLowerCase()}.png`);
    const baseImage = await loadImage(imagePath);
  
    const canvas = createCanvas(baseImage.width, baseImage.height);
    const context = canvas.getContext('2d');
  
    // Draw the base image
    context.drawImage(baseImage, 0, 0);
  
    // Add username text
    context.font = 'bold 30px Arial'; // Adjust font size as needed
    context.fillStyle = 'black'; // You can change the color if needed
    context.fillText(username, 150, 50); // Adjust position as needed
  
    // Add tier text
    context.font = 'bold 40px Arial';
    context.fillStyle = 'black'; // Example text color
    context.fillText(`Tier ${tier}`, 150, 100); // Adjust position as needed
  
    return canvas.toBuffer();
  }

module.exports = { generateRankImage };
