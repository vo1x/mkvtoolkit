export interface VideoTrack {
  trackId: number;
  language: string;
  title: string;
  codec: string | null;
  isDV: boolean;
  isHDR: boolean;
  isAVC: boolean;
  isSDR: boolean;
  hdrType: string;
  quality: string;
  bitDepth?: string;
}

export interface AudioTrack {
  trackId: number;
  title: string;
  channels: number;
  language: string;
  codec: string | null;
  bitrate: number;
  audioType: string;
  channelConfig: string;
}

export interface SubtitleTrack {
  trackId: number;
  isSDH: string;
  title: string;
  language: string;
}

export interface ExtractedMediaInfo {
  fileName: string;
  filePath: string;
  ottSource: string | null;
  downloadType: string | null;
  videoTracks: VideoTrack[];
  audioTracks: AudioTrack[];
  subtitleTracks: SubtitleTrack[];
}

export interface FileInfo {
  oldFilePath: string;
  newFileName: string;
}

export interface RenameTracksPayload {
  filePath: string;
  tracks: { trackId: number; newTitle: string }[];
}

export interface AddPropsPayload {
  filePath: string;
  muxedBy: string;
  telegramChannel: string;
}
