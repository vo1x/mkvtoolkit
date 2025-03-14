import React, { useState, useRef, useEffect } from 'react';
import { Edit, Save, FileVideo, RefreshCw, Check, X, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';

import { renameMultipleTracks } from '../../lib/trackUtils';

export const MediaInfo = ({ filesInfo }) => {
  if (!filesInfo) return null;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedFileNames, setGeneratedFileNames] = useState({});
  const [editableFileNames, setEditableFileNames] = useState({});
  const [isGeneratingNames, setIsGeneratingNames] = useState(false);
  const [isRenamingFiles, setIsRenamingFiles] = useState(false);
  const [showFileNameEditor, setShowFileNameEditor] = useState(false);
  const [renameSuccess, setRenameSuccess] = useState(false);

  // Form inputs for custom properties
  const [muxedBy, setMuxedBy] = useState('Ionicboy');
  const [telegramChannel, setTelegramChannel] = useState('t.me/HDCLovers');
  const [propsLoading, setPropsLoading] = useState(false);

  const handleBulkRename = async () => {
    setLoading(true);
    setError('');

    try {
      const renamePromises = filesInfo.map((fileInfo) => renameMultipleTracks(fileInfo));

      const results = await Promise.all(renamePromises);

      console.log('All tracks renamed:', results);
    } catch (err) {
      console.error('Error during bulk renaming:', err);
      setError('An error occurred during the renaming process');
    } finally {
      setLoading(false);
    }
  };

  const generateFileNames = () => {
    setIsGeneratingNames(true);
    try {
      const newNames = {};
      const editableNames = {};

      filesInfo.forEach((fileInfo) => {
        const formattedName = formatFileName(fileInfo);
        newNames[fileInfo.filePath] = formattedName;
        editableNames[fileInfo.filePath] = formattedName;
      });

      setGeneratedFileNames(newNames);
      setEditableFileNames(editableNames);
      setShowFileNameEditor(true);
    } catch (err) {
      console.error('Error generating file names:', err);
      setError('Failed to generate file names');
    } finally {
      setIsGeneratingNames(false);
    }
  };

  const confirmFileRenames = async () => {
    setIsRenamingFiles(true);
    setRenameSuccess(false);
    setError('');

    try {
      // Prepare the files info array
      const filesToRename = filesInfo
        .filter((fileInfo) => editableFileNames[fileInfo.filePath])
        .map((fileInfo) => ({
          oldPath: fileInfo.filePath,
          newName: editableFileNames[fileInfo.filePath]
        }));

      if (filesToRename.length === 0) {
        setError('No files selected for renaming');
        setIsRenamingFiles(false);
        return;
      }

      console.log('Files to rename:', filesToRename);

      // Create an array of promises for each file rename operation
      const renamePromises = filesToRename.map((file) => window.Main.renameFile(file));

      // Execute all rename operations concurrently
      const results = await Promise.allSettled(renamePromises);

      // Check for errors
      const succeeded = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
      const failed = results.filter(
        (r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)
      ).length;

      if (failed > 0) {
        setError(`${failed} file(s) failed to rename. ${succeeded} file(s) renamed successfully.`);
      } else {
        setRenameSuccess(true);
        setTimeout(() => {
          setRenameSuccess(false);
          setShowFileNameEditor(false);
          // You might want to refresh your files list here or navigate elsewhere
        }, 3000);
      }
    } catch (err) {
      console.error('Error during file renaming:', err);
      setError(`Unexpected error during file renaming: ${err.message}`);
    } finally {
      setIsRenamingFiles(false);
    }
  };

  const handleEditFileName = (filePath, newName) => {
    setEditableFileNames((prev) => ({
      ...prev,
      [filePath]: newName
    }));
  };

  const cancelRenaming = () => {
    setShowFileNameEditor(false);
    setEditableFileNames({});
    setGeneratedFileNames({});
  };

  const addCustomProperties = async () => {
    try {
      setPropsLoading(true);
      const addProps = filesInfo.map(async (fileInfo) => {
        const filePath = fileInfo.filePath;
        return await window.Main.addProps({ filePath, muxedBy, telegramChannel });
      });

      const results = await Promise.all(addProps);
      console.log('All properties updated:', results);
    } catch (error) {
      console.error('Error adding properties:', error);
      setError('Failed to add custom properties');
    } finally {
      setPropsLoading(false);
    }
  };

  if (!filesInfo || filesInfo.length <= 0) return null;

  return (
    <div className="flex flex-col gap-6 rounded-md p-6">
      <div className="flex flex-wrap gap-2">
        {filesInfo.map((fileInfo, index) => (
          <File key={`file-${index}`} fileInfo={fileInfo} index={index} />
        ))}
      </div>

      {/* File Operations Section */}
      <div className="flex flex-col border border-rosePine-highlight-low rounded-md overflow-hidden">
        {/* Header with proper desktop-like styling */}
        <div className="px-4 py-3 bg-rosePine-surface border-b border-rosePine-highlight-low">
          <h4 className="font-medium text-sm flex items-center gap-2 text-rosePine-foam">
            <FileVideo size={16} />
            <span>File Operations</span>
          </h4>
        </div>

        {/* Content with consistent padding and spacing */}
        <div className="bg-rosePine-base p-4 space-y-4">
          {/* Operations grid with better alignment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Track Operations */}
            <div className="flex flex-col gap-2 p-3 bg-rosePine-surface rounded-md border border-rosePine-highlight-low">
              <h5 className="font-medium text-xs text-rosePine-iris mb-2">Track Operations</h5>
              <Button
                variant="secondary"
                onClick={handleBulkRename}
                disabled={loading}
                className="w-full h-8 text-sm flex items-center justify-center"
              >
                {loading ? 'Renaming Tracks...' : 'Rename Tracks in Bulk'}
              </Button>
            </div>

            {/* File Naming Operations */}
            <div className="flex flex-col gap-2 p-3 bg-rosePine-surface rounded-md border border-rosePine-highlight-low">
              <h5 className="font-medium text-xs text-rosePine-iris mb-2">File Naming Operations</h5>
              <Button
                variant="secondary"
                onClick={generateFileNames}
                disabled={isGeneratingNames}
                className="w-full h-8 text-sm flex items-center justify-center"
              >
                <RefreshCw size={14} className="mr-2" />
                {isGeneratingNames ? 'Generating Names...' : 'Generate File Names'}
              </Button>
            </div>
          </div>

          {/* Custom Properties Section */}
          <div className="flex flex-col p-3 bg-rosePine-surface rounded-md border border-rosePine-highlight-low">
            <h5 className="font-medium text-xs text-rosePine-iris mb-3">Custom Properties</h5>

            {/* Desktop-like form with proper alignment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 mb-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-rosePine-muted">Muxed by:</label>
                <input
                  type="text"
                  value={muxedBy}
                  onChange={(e) => setMuxedBy(e.target.value)}
                  className="bg-rosePine-base border border-rosePine-highlight-med text-rosePine-text px-2 py-1 rounded-sm text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-rosePine-muted">Telegram:</label>
                <input
                  type="text"
                  value={telegramChannel}
                  onChange={(e) => setTelegramChannel(e.target.value)}
                  className="bg-rosePine-base border border-rosePine-highlight-med text-rosePine-text px-2 py-1 rounded-sm text-sm"
                />
              </div>
            </div>

            <Button
              variant="secondary"
              disabled={propsLoading}
              onClick={addCustomProperties}
              className="h-8 text-sm flex items-center justify-center self-end px-4"
            >
              {propsLoading ? 'Adding properties...' : 'Add Custom Properties'}
            </Button>
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="flex items-center gap-2 text-rosePine-love bg-rosePine-love/10 p-3 rounded-md">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Success message */}
      {renameSuccess && (
        <div className="flex items-center gap-2 text-rosePine-pine bg-rosePine-pine/10 p-3 rounded-md">
          <Check size={16} />
          <span>Files renamed successfully!</span>
        </div>
      )}

      {/* File Name Editor Section */}
      {showFileNameEditor && (
        <div className="flex flex-col gap-4 p-4 bg-rosePine-base rounded-md">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-lg text-rosePine-foam">File Name Editor</h4>
            <div className="flex gap-2">
              <Button variant="destructive" onClick={cancelRenaming} disabled={isRenamingFiles} className="h-8 px-3">
                <X size={16} className="mr-1" /> Cancel
              </Button>
              <Button
                variant="default"
                onClick={confirmFileRenames}
                disabled={isRenamingFiles}
                className="h-8 px-3 bg-rosePine-iris hover:bg-rosePine-iris/80 text-rosePine-base"
              >
                <Check size={16} className="mr-1" /> {isRenamingFiles ? 'Renaming...' : 'Confirm Rename'}
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3 max-h-96 overflow-y-auto">
            {filesInfo.map((fileInfo, index) => (
              <div key={`file-edit-${index}`} className="flex flex-col gap-2 p-3 bg-rosePine-surface rounded-md">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-rosePine-muted">Original filename:</label>
                  <div className="text-sm text-rosePine-text bg-rosePine-base p-2 rounded-md overflow-x-auto">
                    {fileInfo.fileName}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-rosePine-muted">New filename:</label>
                  <div className="flex">
                    <input
                      type="text"
                      value={editableFileNames[fileInfo.filePath] || ''}
                      onChange={(e) => handleEditFileName(fileInfo.filePath, e.target.value)}
                      className="flex-1 bg-rosePine-base border border-rosePine-highlight-high outline-none p-2 rounded-l-md text-sm text-rosePine-text"
                    />
                    <button
                      onClick={() => handleEditFileName(fileInfo.filePath, generatedFileNames[fileInfo.filePath])}
                      className="bg-rosePine-highlight-med px-3 rounded-r-md text-sm text-rosePine-text hover:bg-rosePine-highlight-high"
                      title="Reset to generated name"
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MediaInfo Display Section
      <h4 className="font-semibold text-lg flex items-center gap-2 text-[#ff624d]">
        <Info size={20} />
        <span>Media Information</span>
      </h4> */}
    </div>
  );
};

// Function to format file names according to specifications
const formatFileName = (fileInfo) => {
  const { fileName, videoTracks, audioTracks } = fileInfo;

  // Get file extension to preserve
  const extension = fileName.match(/\.(mkv|mp4)$/i)?.[0] || '.mkv';

  // Extract season and episode info
  const seriesRegex = /(S\d{1,2})(E\d{1,2})/i;
  const seriesMatch = fileName.match(seriesRegex);
  const isSeries = !!seriesMatch;

  // Get base name (more robust approach)
  let name = '';

  // For series, extract title before season/episode
  if (isSeries) {
    const beforeSeriesMatch = fileName.split(seriesMatch[0])[0];
    name = cleanTitle(beforeSeriesMatch);
  } else {
    // For movies, use a different approach
    // Try to extract name and year in parentheses if present
    const movieTitleMatch = fileName.match(/^(.*?)(?:\((\d{4})\)|\d{3,4}p|\[|\-)/i);
    if (movieTitleMatch) {
      name = cleanTitle(movieTitleMatch[1]);
    } else {
      // Fallback: Take everything before first technical term
      const parts = fileName.split(/\d{3,4}p|\[|\-|WEB-DL|BluRay|REMUX|REMASTER/i)[0];
      name = cleanTitle(parts);
    }
  }

  // Extract year using a proper regex
  const yearMatch = fileName.match(/(?:19|20)\d{2}/);
  const hasYear = !!yearMatch;
  const year = hasYear ? yearMatch[0] : '';
  const yearDisplay = hasYear ? `(${year}) ` : '';

  // Video track information
  const videoTrack = videoTracks?.[0];
  if (!videoTrack) {
    return `${name} ${yearDisplay}${extension}`;
  }

  // Source type detection
  const isUHD =
    fileName.toLowerCase().includes('uhd') ||
    fileName.toLowerCase().includes('2160p') ||
    fileName.toLowerCase().includes('4k');
  const isBluRay =
    fileName.toLowerCase().includes('bluray') ||
    fileName.toLowerCase().includes('blu-ray') ||
    fileName.toLowerCase().includes('bdremux');
  const isWebDl =
    fileName.toLowerCase().includes('web-dl') ||
    fileName.toLowerCase().includes('webdl') ||
    fileName.toLowerCase().includes('webrip');

  // OTT provider detection
  let ottSource = '';
  if (fileName.toLowerCase().includes('amzn')) ottSource = 'AMZN';
  else if (fileName.toLowerCase().includes('dsnp')) ottSource = 'DSNP';
  else if (fileName.toLowerCase().includes('nflx')) ottSource = 'NFLX';
  else if (fileName.toLowerCase().includes('hulu')) ottSource = 'HULU';
  else if (fileName.toLowerCase().includes('atvp')) ottSource = 'ATVP';
  else if (fileName.toLowerCase().includes('hbo')) ottSource = 'HBO';

  // Resolution detection with fallback to track information
  const resolutionMatch = fileName.match(/\d{3,4}p/i);
  const resolution = resolutionMatch ? resolutionMatch[0] : videoTrack.quality || (isUHD ? '2160p' : '1080p');

  // Source type formatting
  const sourceType = isUHD ? 'UHD BluRay' : isBluRay ? 'BluRay' : isWebDl ? 'WEB-DL' : 'WEB-DL';

  // Special versions
  const isRemux = fileName.toLowerCase().includes('remux');
  const isRemastered = fileName.toLowerCase().includes('remaster');
  const isUncut = fileName.toLowerCase().includes('uncut');
  const isDirectorsCut = fileName.toLowerCase().includes('director') && fileName.toLowerCase().includes('cut');
  const isTheatrical = fileName.toLowerCase().includes('theatrical');

  let specialVersion = '';
  if (isRemux) specialVersion += 'REMUX ';
  if (isRemastered) specialVersion += 'REMASTERED ';
  if (isUncut) specialVersion += 'UNCUT ';
  if (isDirectorsCut) specialVersion += "Director's Cut ";
  if (isTheatrical) specialVersion += 'Theatrical ';

  // Bit depth
  let bitDepth = '';
  if (fileName.toLowerCase().includes('10bit')) bitDepth = '10bit';
  else if (fileName.toLowerCase().includes('8bit')) bitDepth = '8bit';

  const bitDepthStr = bitDepth ? `${bitDepth} ` : '';

  // HDR/DV detection
  const isDV =
    videoTrack.isDV || fileName.toLowerCase().includes('dovi') || fileName.toLowerCase().includes('dolby vision');
  const isHDR = videoTrack.isHDR || fileName.toLowerCase().includes('hdr');

  let hdrInfo = '';
  if (isDV && isHDR) hdrInfo = 'DoVi HDR';
  else if (isDV) hdrInfo = 'DoVi';
  else if (isHDR) hdrInfo = 'HDR';
  else if (resolution.includes('2160p')) hdrInfo = 'SDR';

  const hdrStr = hdrInfo ? `${hdrInfo} ` : '';

  // Codec detection
  const videoCodec = videoTrack.codec?.toUpperCase() || '';
  let codecType = '';

  if (
    videoCodec.includes('HEVC') ||
    videoCodec.includes('265') ||
    fileName.toLowerCase().includes('x265') ||
    fileName.toLowerCase().includes('hevc')
  ) {
    codecType = 'x265';
  } else if (
    videoCodec.includes('AVC') ||
    videoCodec.includes('264') ||
    fileName.toLowerCase().includes('x264') ||
    fileName.toLowerCase().includes('h.264')
  ) {
    codecType = 'x264';
  } else {
    codecType = resolution.includes('2160p') ? 'x265' : 'x264';
  }

  // Format audio information
  const audioInfo = formatAudioInfo(audioTracks, fileName);

  // Get releaser name - try to find it after the last hyphen before extension
  const releaserRegex = /-([^-]+)(?:\s*\(\d+\))?\.(mkv|mp4)$/i;
  const releaserMatch = fileName.match(releaserRegex);
  const releaserName = releaserMatch ? releaserMatch[1] : 'FrameStor';

  // Build the final filename
  let formattedName = '';

  // Source display with OTT if available
  const sourceDisplay = ottSource ? `${ottSource} ${sourceType}` : sourceType;

  // Series format
  if (isSeries) {
    const season = seriesMatch[1];
    const episode = seriesMatch[2] || 'E01';

    if (isRemux) {
      formattedName = `${name} ${yearDisplay}${season}${episode} ${resolution} ${sourceDisplay} ${specialVersion}${
        codecType === 'x265' ? 'HEVC' : 'AVC'
      } [${audioInfo}] (${releaserName}-Ionicboy)${extension}`;
    } else {
      formattedName = `${name} ${yearDisplay}${season}${episode} ${resolution} ${specialVersion}${sourceDisplay} ${bitDepthStr}${hdrStr}[${audioInfo}] ${codecType} (${releaserName}-Ionicboy)${extension}`;
    }
  }
  // Movie format
  else {
    if (isRemux) {
      formattedName = `${name} ${yearDisplay}${resolution} ${sourceDisplay} ${specialVersion}${hdrStr}${
        codecType === 'x265' ? 'HEVC' : 'AVC'
      } [${audioInfo}] (${releaserName}-Ionicboy)${extension}`;
    } else {
      formattedName = `${name} ${yearDisplay}${resolution} ${specialVersion}${sourceDisplay} ${bitDepthStr}${hdrStr}[${audioInfo}] ${codecType} (${releaserName}-Ionicboy)${extension}`;
    }
  }

  // Final cleanup: remove multiple spaces, fix order of items
  return formattedName.replace(/\s+/g, ' ').replace(/\s\./g, '.').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').trim();
};

// Helper function to clean up title names
const cleanTitle = (rawTitle) => {
  if (!rawTitle) return 'Unknown';

  return rawTitle
    .replace(/\./g, ' ') // Replace dots with spaces
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/\d{3,4}p/gi, '') // Remove resolution
    .replace(/\[.*?\]/g, '') // Remove anything in brackets
    .replace(/\(\d+\)/g, '') // Remove numbers in parentheses
    .replace(/\s+/g, ' ') // Normalize spaces
    .replace(/^\s+|\s+$/g, '') // Trim start and end
    .replace(/\s*\-\s*$/, '') // Remove trailing dash
    .replace(/\s*1\s*00\s*P\s*M/i, ''); // Remove time strings like "1.00.P.M"
};

// Helper function to format audio track info
const formatAudioInfo = (audioTracks, fileName) => {
  if (!audioTracks || audioTracks.length === 0) {
    // Extract audio info from filename if no track data
    const audioRegex = /\[(.*?)\]/i;
    const fileAudioMatch = fileName.match(audioRegex);
    if (fileAudioMatch && fileAudioMatch[1]) {
      // Use audio info from filename if it contains language and format info
      if (
        fileAudioMatch[1].toLowerCase().includes('hindi') ||
        fileAudioMatch[1].toLowerCase().includes('english') ||
        fileAudioMatch[1].toLowerCase().includes('aac') ||
        fileAudioMatch[1].toLowerCase().includes('ddp')
      ) {
        return fileAudioMatch[1];
      }
    }
    return 'English AAC 2.0';
  }

  // Process audio tracks from the track info
  const processedAudio = audioTracks.map((track) => {
    // Determine language
    let language = 'English';
    if (track.language) {
      language = track.language.charAt(0).toUpperCase() + track.language.slice(1);
      if (language.toLowerCase() === 'hin') language = 'Hindi';
      if (language.toLowerCase() === 'eng') language = 'English';
    } else if (track.title && track.title.toLowerCase().includes('hindi')) {
      language = 'Hindi';
    } else if (track.title && track.title.toLowerCase().includes('english')) {
      language = 'English';
    }

    // Determine audio format - check both track data and filename
    let format = '';
    if (track.audioType) {
      format = track.audioType;
    } else if (track.title) {
      if (track.title.includes('DDP') || track.title.includes('DD+')) format = 'DDP';
      else if (track.title.includes('DD')) format = 'DD';
      else if (track.title.includes('AAC')) format = 'AAC';
      else if (track.title.includes('TrueHD')) format = 'TrueHD';
      else if (track.title.includes('DTS-HD MA')) format = 'DTS-HD MA';
      else if (track.title.includes('DTS')) format = 'DTS';
      else if (track.title.includes('HE-AAC')) format = 'HE-AAC';
      else format = 'AAC';
    } else {
      if (fileName.toLowerCase().includes('ddp') || fileName.toLowerCase().includes('dd+')) format = 'DDP';
      else if (fileName.toLowerCase().includes('dd')) format = 'DD';
      else if (fileName.toLowerCase().includes('he-aac')) format = 'HE-AAC';
      else if (fileName.toLowerCase().includes('aac')) format = 'AAC';
      else if (fileName.toLowerCase().includes('truehd')) format = 'TrueHD';
      else if (fileName.toLowerCase().includes('dts-hd ma')) format = 'DTS-HD MA';
      else if (fileName.toLowerCase().includes('dts')) format = 'DTS';
      else format = 'AAC';
    }

    // Determine channel layout
    let channels = '';
    if (track.channelConfig) {
      channels = track.channelConfig;
    } else if (track.title && track.title.match(/\d\.\d/)) {
      channels = track.title.match(/(\d\.\d)/)[1];
    } else {
      if (fileName.toLowerCase().includes('5.1')) channels = '5.1';
      else if (fileName.toLowerCase().includes('7.1')) channels = '7.1';
      else if (fileName.toLowerCase().includes('2.0')) channels = '2.0';
      else channels = '2.0';
    }

    return `${language} ${format} ${channels}`;
  });

  // Handle special case for files with "[Hindi... + English...]" pattern in filename
  if (
    fileName.includes('[') &&
    fileName.toLowerCase().includes('hindi') &&
    fileName.toLowerCase().includes('english')
  ) {
    const audioRegex = /\[(.*?)\]/i;
    const fileAudioMatch = fileName.match(audioRegex);

    if (
      fileAudioMatch &&
      fileAudioMatch[1] &&
      fileAudioMatch[1].toLowerCase().includes('hindi') &&
      fileAudioMatch[1].toLowerCase().includes('english')
    ) {
      return fileAudioMatch[1];
    }
  }

  return processedAudio.join(' + ');
};

// Extract year from filename if not in standard format
const extractYearFromFileName = (fileName) => {
  const yearRegex = /(?:19|20)\d{2}/;
  const yearMatch = fileName.match(yearRegex);
  return yearMatch ? yearMatch[0] : 'Unknown';
};

// File component to display media info in a desktop-like format
const File = ({ fileInfo, index }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="flex flex-col rounded-md w-full overflow-hidden border border-rosePine-highlight-low">
      {/* File header - more desktop-like with hover effects */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between px-4 py-3 bg-rosePine-surface hover:bg-rosePine-overlay cursor-pointer transition-colors border-b border-rosePine-highlight-low"
      >
        <div className="flex items-center gap-2 min-w-0">
          <FileVideo size={18} className="text-rosePine-foam flex-shrink-0" />
          <span className="truncate text-sm font-medium text-rosePine-text" title={fileInfo.fileName}>
            {fileInfo.fileName}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-rosePine-highlight-low text-rosePine-subtle px-2 py-0.5 rounded-sm">
            {fileInfo.videoTracks.length + fileInfo.audioTracks.length + fileInfo.subtitleTracks.length} tracks
          </span>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Track details - desktop style with more structure */}
      {expanded && (
        <div className="bg-rosePine-base">
          <div className="grid grid-cols-1 divide-y divide-rosePine-highlight-low">
            {/* Video Tracks */}
            {fileInfo.videoTracks.length > 0 && (
              <div className="px-4 py-3">
                <div className="flex items-center mb-2">
                  <span className="font-medium text-sm text-rosePine-foam">Video Tracks</span>
                  <span className="ml-2 text-xs bg-rosePine-highlight-low text-rosePine-muted px-1.5 py-0.5 rounded-sm">
                    {fileInfo.videoTracks.length}
                  </span>
                </div>
                <div className="space-y-1 ml-1">
                  {fileInfo.videoTracks.map((track, i) => (
                    <div
                      key={`video-${i}`}
                      className="flex items-start gap-2 px-2 py-1.5 rounded-sm hover:bg-rosePine-highlight-low"
                    >
                      <div className="w-5 h-5 flex items-center justify-center rounded-sm bg-rosePine-highlight-low text-xs text-rosePine-muted flex-shrink-0 mt-0.5">
                        {i}
                      </div>
                      <div>
                        <div className="text-sm text-rosePine-text">{track.title || `Track ${i}`}</div>
                        <div className="text-xs text-rosePine-muted mt-0.5">
                          {[
                            track.codec,
                            track.quality,
                            track.isHDR ? track.hdrType || 'HDR' : '',
                            track.isDV ? 'Dolby Vision' : ''
                          ]
                            .filter(Boolean)
                            .join(' • ')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Audio Tracks */}
            {fileInfo.audioTracks.length > 0 && (
              <div className="px-4 py-3">
                <div className="flex items-center mb-2">
                  <span className="font-medium text-sm text-rosePine-iris">Audio Tracks</span>
                  <span className="ml-2 text-xs bg-rosePine-highlight-low text-rosePine-muted px-1.5 py-0.5 rounded-sm">
                    {fileInfo.audioTracks.length}
                  </span>
                </div>
                <div className="space-y-1 ml-1">
                  {fileInfo.audioTracks.map((track, i) => (
                    <div
                      key={`audio-${i}`}
                      className="flex items-start gap-2 px-2 py-1.5 rounded-sm hover:bg-rosePine-highlight-low"
                    >
                      <div className="w-5 h-5 flex items-center justify-center rounded-sm bg-rosePine-highlight-low text-xs text-rosePine-muted flex-shrink-0 mt-0.5">
                        {i}
                      </div>
                      <div>
                        <div className="text-sm text-rosePine-text">{track.title || `Track ${i}`}</div>
                        <div className="text-xs text-rosePine-muted mt-0.5">
                          {[track.language, track.audioType, track.channelConfig].filter(Boolean).join(' • ')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subtitle Tracks */}
            {fileInfo.subtitleTracks.length > 0 && (
              <div className="px-4 py-3">
                <div className="flex items-center mb-2">
                  <span className="font-medium text-sm text-rosePine-love">Subtitle Tracks</span>
                  <span className="ml-2 text-xs bg-rosePine-highlight-low text-rosePine-muted px-1.5 py-0.5 rounded-sm">
                    {fileInfo.subtitleTracks.length}
                  </span>
                </div>
                <div className="space-y-1 ml-1">
                  {fileInfo.subtitleTracks.map((track, i) => (
                    <div
                      key={`subtitle-${i}`}
                      className="flex items-start gap-2 px-2 py-1.5 rounded-sm hover:bg-rosePine-highlight-low"
                    >
                      <div className="w-5 h-5 flex items-center justify-center rounded-sm bg-rosePine-highlight-low text-xs text-rosePine-muted flex-shrink-0 mt-0.5">
                        {i}
                      </div>
                      <div>
                        <div className="text-sm text-rosePine-text">{track.title || `Track ${i}`}</div>
                        <div className="text-xs text-rosePine-muted mt-0.5">
                          {[track.language, track.isSDH === 'Yes' ? 'SDH' : ''].filter(Boolean).join(' • ')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
