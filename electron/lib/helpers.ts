export const getResolutionLabel = (height: number): string => {
  if (!height) return 'Unknown';
  if (height <= 480) return '480p';
  if (height <= 720) return '720p';
  if (height <= 1080) return '1080p';
  if (height <= 1440) return '1440p';
  if (height <= 2160) return '2160p';
  if (height <= 4320) return '8K';
  return `${height}p`;
};

