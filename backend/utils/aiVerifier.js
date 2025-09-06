/**
 * aiVerifier.js
 * Simulates AI verification for uploaded images.
 * Returns a score (0-100) representing task completion.
 */

const verifyImage = async (imageUrl) => {
  // Simulate AI processing delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate AI score (random for demo)
  const aiScore = Math.floor(Math.random() * 51) + 50; // 50-100%
  const verified = aiScore >= 75; // Consider 75+ as verified

  return {
    fileUrl: imageUrl,
    aiScore,
    verified,
  };
};

module.exports = { verifyImage };
