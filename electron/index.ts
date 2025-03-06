import { join } from 'path';
import path from 'path';
import { exec } from 'child_process';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';

import { BrowserWindow, app, ipcMain, IpcMainEvent, nativeTheme, dialog, IpcMainInvokeEvent } from 'electron';
import isDev from 'electron-is-dev';

import {
  VideoTrack,
  AudioTrack,
  SubtitleTrack,
  ExtractedMediaInfo,
  FileInfo,
  RenameTracksPayload,
  AddPropsPayload
} from './types';

const height = 720;
const width = 1280;
let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width,
    height,
    frame: false,
    show: true,
    resizable: true,
    fullscreenable: true,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const port = process.env.PORT || 3000;
  const url = isDev ? `http://localhost:${port}` : join(__dirname, '../dist-vite/index.html');

  if (isDev) {
    mainWindow?.loadURL(url);
  } else {
    mainWindow?.loadFile(url);
  }

  ipcMain.on('minimize', () => {
    mainWindow?.isMinimized() ? mainWindow.restore() : mainWindow?.minimize();
  });

  ipcMain.on('maximize', () => {
    mainWindow?.isMaximized() ? mainWindow.restore() : mainWindow?.maximize();
  });

  ipcMain.on('close', () => {
    mainWindow?.close();
  });

  nativeTheme.themeSource = 'dark';
}

app.whenReady().then((): void => {
  createWindow();

  app.on('activate', (): void => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', (): void => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('dialog:openFile', async (): Promise<string[]> => {
  if (!mainWindow) return [];
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Video Files', extensions: ['mkv', 'mp4'] }]
  });
  return result.filePaths;
});

ipcMain.handle(
  'extract-media-info',
  async (_event: IpcMainInvokeEvent, filePath: string): Promise<ExtractedMediaInfo> => {
    console.log(filePath);
    return new Promise((resolve, reject) => {
      ffmpeg(filePath).ffprobe((err, metadata) => {
        if (err) {
          reject(`Error extracting metadata for ${filePath}: ${err.message}`);
        } else {
          const fileName = path.basename(filePath).toUpperCase();

          const source =
            ['AMZN', 'NF', 'DSNP', 'HULU', 'HMAX', 'ATVP', 'HBO'].find((src) => fileName.includes(src)) || null;

          const downloadType =
            ['WEB-DL', 'WEBRIP', 'BLURAY', 'BDRIP', 'BRRIP', 'DVDRIP', 'HDTV', 'WEBDL'].find((src) =>
              fileName.includes(src)
            ) || null;

          const extractedInfo: ExtractedMediaInfo = {
            fileName: filePath.split('\\').pop() || '',
            filePath: filePath,
            ottSource: source,
            downloadType,
            videoTracks: [],
            audioTracks: [],
            subtitleTracks: []
          };

          if (metadata.streams) {
            metadata.streams.forEach((stream) => {
              if (stream.codec_type === 'video') {
                const videoInfo: VideoTrack = {
                  trackId: stream?.index,
                  language: stream.tags?.language || 'Unknown',
                  title: stream.tags?.title || 'Untitled',
                  codec: stream?.codec_name || null,

                  isDV:
                    stream?.side_data_type === 'DOVI configuration record' ||
                    (stream?.hdrFormat?.includes('Dolby Vision') &&
                      stream?.dv_version_major === 1 &&
                      stream?.dv_profile === 8),

                  isHDR:
                    stream?.color_transfer?.trim().toLowerCase() === 'smpte2084' ||
                    (stream?.color_primaries?.trim().toLowerCase() === 'bt2020' &&
                      stream?.color_space?.trim().toLowerCase() === 'bt2020nc'),

                  isAVC: stream?.is_avc ? true : false,
                  isSDR:
                    stream?.color_transfer?.trim().toLowerCase() === 'bt709' &&
                    stream?.color_primaries?.trim().toLowerCase() === 'bt709' &&
                    !(
                      stream?.color_transfer?.trim().toLowerCase() === 'smpte2084' ||
                      stream?.color_primaries?.trim().toLowerCase() === 'bt2020'
                    ),
                  hdrType: '',
                  quality: '',
                  bitDepth: undefined
                };

                console.log('HDR Check:', stream?.color_transfer, stream?.color_primaries, stream?.color_space);
                console.log(
                  'isDV Check:',
                  stream?.side_data_type,
                  stream?.hdrFormat,
                  stream?.dv_version_major,
                  stream?.dv_profile
                );
                console.log(videoInfo.isHDR);

                console.log(stream?.color_transfer);
                console.log(stream?.color_primaries);
                console.log(stream?.color_space);

                console.log(JSON.stringify(stream, null, 2));

                let hdrType = '';

                if (stream.side_data_list) {
                  for (let sideData of stream.side_data_list) {
                    if (sideData.side_data_type === 'Mastering display metadata') {
                      hdrType = 'HDR';
                      if (stream.transfer_characteristics) {
                        const tc = stream.transfer_characteristics;
                        if (tc === 'arib-std-b67') {
                          hdrType = 'HLG';
                        } else if (tc === 'smpte2084') {
                          hdrType = 'HDR10';
                        }
                      }
                    }
                    if (sideData.side_data_type === 'Content light level metadata') {
                      hdrType = 'HDR10';
                    }
                  }
                }
                videoInfo.hdrType = hdrType;

                const height = stream?.height ?? 0;
                if (!height) videoInfo.quality = 'Unknown';

                let resolution = '';
                if (height <= 480) resolution = '480p';
                else if (height <= 720) resolution = '720p';
                else if (height <= 1080) resolution = '1080p';
                else if (height <= 1440) resolution = '1440p';
                else if (height <= 2160) resolution = '2160p';
                else if (height <= 4320) resolution = '8K';
                else resolution = `${height}p`;

                videoInfo.quality = resolution;

                if (stream.bits_per_raw_sample) {
                  videoInfo.bitDepth = `${stream.bits_per_raw_sample}-bit`;
                } else if (stream.bits_per_sample) {
                  videoInfo.bitDepth = `${stream.bits_per_sample}-bit`;
                }
                extractedInfo.videoTracks.push(videoInfo);
              }

              if (stream.codec_type === 'audio') {
                const audioInfo: AudioTrack = {
                  trackId: stream?.index,
                  title: stream.tags?.title || 'Untitled',
                  channels: stream?.channels ?? 0,
                  language: stream.tags?.language || 'Unknown',
                  codec: stream.codec_name || null,
                  bitrate: stream?.bit_rate ? parseInt(stream.bit_rate) / 1000 : 0,
                  audioType: '',
                  channelConfig: ''
                };

                let audioFormat = '';
                const codecName: string | null = stream.codec_name ?? '';
                if (!codecName) audioFormat = 'Unknown';

                if (codecName.toLowerCase().includes('ac-3') || codecName.toLowerCase() === 'ac3') {
                  audioFormat = 'DD';
                } else if (codecName.toLowerCase() === 'eac3' || codecName.toLowerCase().includes('eac-3')) {
                  audioFormat = 'DDP';
                } else if (codecName.toLowerCase().includes('dts')) {
                  if (codecName.toLowerCase().includes('hd') || codecName.toLowerCase().includes('ma')) {
                    audioFormat = 'DTS-HD MA';
                  } else {
                    audioFormat = 'DTS';
                  }
                } else if (codecName.toLowerCase().includes('truehd')) {
                  audioFormat = 'TrueHD';
                } else if (codecName.toLowerCase().includes('aac')) {
                  audioFormat = 'AAC';
                } else if (codecName.toLowerCase().includes('opus')) {
                  audioFormat = 'OPUS';
                } else if (codecName.toLowerCase().includes('flac')) {
                  audioFormat = 'FLAC';
                } else if (codecName.toLowerCase().includes('mp3')) {
                  audioFormat = 'MP3';
                }

                audioInfo.audioType = audioFormat;

                let channelConfig = '';

                if (stream?.channels === 1) {
                  channelConfig = '1.0';
                } else if (stream?.channels === 2) {
                  channelConfig = '2.0';
                } else if (stream?.channels === 6) {
                  channelConfig = '5.1';
                } else if (stream?.channels === 8) {
                  channelConfig = '7.1';
                } else {
                  channelConfig = `${stream?.channels}.0`;
                }

                audioInfo.channelConfig = channelConfig;

                extractedInfo.audioTracks.push(audioInfo);
              }

              if (stream.codec_type === 'subtitle') {
                const subtitleInfo: SubtitleTrack = {
                  trackId: stream?.index,
                  isSDH: stream.tags?.SDH || 'No',
                  title: stream.tags?.title || 'Untitled',
                  language: stream.tags?.language || 'Unknown'
                };
                extractedInfo.subtitleTracks.push(subtitleInfo);
              }
            });
          }

          resolve(extractedInfo);
        }
      });
    });
  }
);

ipcMain.handle(
  'rename-files',
  async (
    _event: IpcMainInvokeEvent,
    filesInfo: FileInfo[]
  ): Promise<{ success: boolean; results?: string[]; error?: any }> => {
    const renamePromises = filesInfo.map((fileInfo) => {
      const oldFilePath = fileInfo.oldFilePath;
      const newFilePath = path.join(path.dirname(oldFilePath), fileInfo.newFileName);

      return new Promise<string>((resolve, reject) => {
        fs.rename(oldFilePath, newFilePath, (err) => {
          if (err) {
            reject(`Failed to rename ${oldFilePath}: ${err.message}`);
          } else {
            resolve(`Successfully renamed ${oldFilePath} to ${newFilePath}`);
          }
        });
      });
    });

    try {
      const results = await Promise.all(renamePromises);
      return { success: true, results };
    } catch (error) {
      return { success: false, error };
    }
  }
);

ipcMain.handle(
  'add-props',
  async (_event: IpcMainInvokeEvent, { filePath, muxedBy, telegramChannel }: AddPropsPayload): Promise<string> => {
    console.log(`Triggered props`);

    const resolvedFilePath = path.resolve(filePath);

    const modifiedFilePath = path.resolve(
      path.dirname(resolvedFilePath),
      path.basename(resolvedFilePath, '.mkv') + '_modified.mkv'
    );

    try {
      await new Promise<void>((resolve, reject) => {
        ffmpeg(resolvedFilePath)
          .input(resolvedFilePath)
          .output(modifiedFilePath)
          .outputOptions([
            `-metadata`,
            `Muxed_By=${muxedBy}`,
            `-metadata`,
            `Telegram_channel=${telegramChannel}`,
            `-codec`,
            `copy`
          ])
          .on('end', () => {
            console.log('FFmpeg processing finished');
            resolve();
          })
          .on('error', (err) => {
            console.error('FFmpeg error:', err);
            reject(err);
          })
          .run();
      });

      fs.unlinkSync(resolvedFilePath);
      console.log(`Original file deleted: ${resolvedFilePath}`);

      fs.renameSync(modifiedFilePath, resolvedFilePath);
      console.log(`Modified file renamed to: ${resolvedFilePath}`);

      return 'Properties added and file renamed successfully';
    } catch (error) {
      console.error('Error adding properties:', error);
      throw new Error('Failed to add custom properties');
    }
  }
);

ipcMain.handle(
  'rename-tracks',
  async (
    _event: IpcMainInvokeEvent,
    { filePath, tracks }: RenameTracksPayload
  ): Promise<{ success: boolean; message?: string; details?: any; error?: string }> => {
    try {
      if (!filePath || !tracks || !Array.isArray(tracks) || tracks.length === 0) {
        throw new Error('Invalid input: filePath and tracks array are required');
      }

      const resolvedFilePath = path.resolve(filePath);
      console.log(`Processing file: ${resolvedFilePath}`);

      if (!resolvedFilePath.endsWith('.mkv')) {
        throw new Error('Invalid file type. Only MKV files are supported');
      }

      const mkvpropeditPath = isDev
        ? path.join(app.getAppPath(), 'resources', 'mkvpropedit.exe')
        : path.join(process.resourcesPath, 'resources/mkvpropedit.exe');
      let commandParts = [`"${mkvpropeditPath}" "${resolvedFilePath}"`];

      for (const { trackId, newTitle } of tracks) {
        if (trackId === undefined || !newTitle) {
          console.warn(`Skipping track with invalid trackId or newTitle: ${JSON.stringify({ trackId, newTitle })}`);
          continue;
        }

        const mkvTrackNumber = trackId + 1;

        const safeTitle = newTitle.replace(/"/g, '\\"');
        commandParts.push(`--edit track:${mkvTrackNumber} --set "name=${safeTitle}"`);
      }

      const command = commandParts.join(' ');
      console.log(`Executing command: ${command}`);

      const result = await executeCommand(command);
      console.log(`Successfully renamed ${tracks.length} track(s)`);
      return {
        success: true,
        message: `${tracks.length} track(s) renamed successfully`,
        details: result
      };
    } catch (error: any) {
      console.error(`Error renaming tracks: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }
);

function executeCommand(command: string): Promise<string> {
  console.log(command);
  return new Promise<string>((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Command execution error: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        reject(error);
        return;
      }

      if (stderr && !stderr.includes('The changes are written to the file')) {
        console.warn(`Command warning: ${stderr}`);
      }
      console.log(stdout);
      resolve(stdout || 'Command executed successfully');
    });
  });
}

ipcMain.on('message', (event: IpcMainEvent, message: any): void => {
  console.log(message);
  setTimeout(() => event.sender.send('message', 'common.hiElectron'), 500);
});
