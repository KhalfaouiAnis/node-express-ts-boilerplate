import { prisma } from 'database';
import path from 'path';
import fs from 'fs';

export const serveVideo = async (videoId: string, range?: string) => {
  if (!videoId) {
    throw new Error('Invalid video ID');
  }

  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: { url: true },
  });

  if (!video) {
    throw new Error('Video not found');
  }

  const filePath = path.join(process.cwd(), video.url);

  if (!fs.existsSync(filePath)) {
    throw new Error('Video file not found');
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;

  if (range) {
    // Partial content (for seeking)
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;

    return { start, end, fileSize, chunksize, filePath, partialContent: true };
  } else {
    return {
      partialContent: false,
      fileSize,
      filePath,
    };
  }
};
