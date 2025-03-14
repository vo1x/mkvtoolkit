import { LANGUAGE_MAP, COMMON_MUXER } from '../constants';

const generateAudioTrackTitle = (track) => {
  const language = track.language
    ? `${track.language.charAt(0).toUpperCase() + track.language.slice(1)} (US)`
    : 'English (US)';
  const format = track.audioType || 'AAC';
  const channels = track.channelConfig || '2.0';
  const bitrate = track.bitrate ? `${track.bitrate} kbps` : '';

  return `${language} | ${format} ${channels}${bitrate ? ' | ' + bitrate : ''} | ${COMMON_MUXER}`;
};

const generateHdrString = (track) => {
  const hdrInfo = [];
  if (track.isDV) hdrInfo.push('DV');
  if (track.isHDR) hdrInfo.push('HDR');
  if (track.isSDR) hdrInfo.push('SDR');
  return hdrInfo.length > 0 ? `${hdrInfo.join('+')}` : null;
};

const generateVideoTrackTitle = (track, fileInfo) => {
  const quality = track.quality;
  const source = fileInfo.ottSource;
  const downloadType = fileInfo.downloadType;
  const codec = track.codec;
  const hdrString = generateHdrString(track);

  const titleParts = [];

  if (quality) titleParts.push(quality);
  if (source) titleParts.push(source);
  if (downloadType) titleParts.push(downloadType);
  if (codec) titleParts.push(codec.toUpperCase());
  if (hdrString) titleParts.push(hdrString);
  if (COMMON_MUXER) titleParts.push(COMMON_MUXER);

  return titleParts.join(' | ');
};

const generateSubtitleTrackTitle = (track) => {
  const languageData = track.language in LANGUAGE_MAP ? LANGUAGE_MAP[track.language] : 'Unknown';
  const sdh = track.isSDH === 'Yes' ? ' SDH' : '';

  return `${languageData}${sdh} | ${COMMON_MUXER}`;
};

const formatTracksForRenaming = (tracks = [], generateTitleFn, fileInfo = null) => {
  if (!tracks || !Array.isArray(tracks) || tracks.length === 0) {
    return [];
  }

  return tracks.map((track) => {
    if (!track.trackId) {
      console.warn('Track missing trackId:', track);
    }

    const generatedTitle = fileInfo ? generateTitleFn(track, fileInfo) : generateTitleFn(track);

    const newTitle = track.newTitle || generatedTitle;

    return {
      trackId: track.trackId,
      newTitle: newTitle
    };
  });
};

export const renameMultipleTracks = async (fileInfo) => {
  try {
    const audioTracks = formatTracksForRenaming(fileInfo.audioTracks, generateAudioTrackTitle);

    const videoTracks = formatTracksForRenaming(fileInfo.videoTracks, generateVideoTrackTitle, fileInfo);

    const subtitleTracks = formatTracksForRenaming(fileInfo.subtitleTracks, generateSubtitleTrackTitle);

    const tracksToRename = [...videoTracks, ...audioTracks, ...subtitleTracks];

    const result = await window.Main.renameTracks({
      filePath: fileInfo.filePath,
      tracks: tracksToRename
    });

    if (result.success) {
      console.log(result.message);
      return result.message;
    } else {
      throw new Error(result.error || 'Unknown error during track renaming');
    }
  } catch (err) {
    return `Error renaming tracks for file ${fileInfo.fileName}: ${err.message}`;
  }
};
