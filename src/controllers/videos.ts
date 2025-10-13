import { Request, Response } from 'express';
import fs from 'fs';
import { serveVideo } from '@services/video';

export const streamVideo = async (req: Request, res: Response) => {
  try {
    const data = await serveVideo(req.params.videoId, req.headers.range);

    if (data.partialContent) {
      const { start, end, fileSize, chunksize, filePath } = data;
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize?.toString(),
        'Content-Type': 'video/mp4',
      });

      const fileStream = fs.createReadStream(filePath, { start, end });
      fileStream.pipe(res);
    } else {
      // Full file
      res.writeHead(200, {
        'Content-Length': data.fileSize.toString(),
        'Content-Type': 'video/mp4',
      });
      fs.createReadStream(data.filePath).pipe(res);
    }
  } catch (error) {
    console.error('Video stream error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
