import React, { ChangeEvent, useState, useRef, useEffect } from 'react';
import { Edit, Flag, Save, Info, SaveIcon, FileVideo } from 'lucide-react';

export const MediaInfo = ({ filesInfo }) => {
  if (!filesInfo) return null;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const renameMultipleTracks = async (fileInfo) => {
    try {
      const audioTracks = fileInfo.audioTracks.map((track) => {
        const language = track.language
          ? `${track.language.charAt(0).toUpperCase() + track.language.slice(1)} (US)`
          : 'English (US)';
        const format = track.audioType || 'AAC';
        const channels = track.channelConfig || '2.0';
        const bitrate = track.bitrate ? `${track.bitrate} kbps` : '';
        const muxedBy = 'Ionicboy';
        const newTitle = `${language} | ${format} ${channels}${bitrate ? ' | ' + bitrate : ''} | ${muxedBy}`;

        return {
          trackId: track.trackId,
          newTitle: track.newTitle || newTitle
        };
      });

      console.log(fileInfo.videoTracks);
      const videoTracks = fileInfo.videoTracks.map((track) => {
        const quality = track.quality;
        const source = fileInfo.ottSource;
        const downloadType = fileInfo.downloadType;
        console.log(downloadType);
        const codec = track.codec;

        console.log(track.isDV);
        console.log(track.HDR);

        const hdrInfo = [];
        if (track.isDV) hdrInfo.push('DV');
        if (track.isHDR) hdrInfo.push('HDR');
        if (track.isSDR) hdrInfo.push('SDR');
        const hdrString = hdrInfo.length > 0 ? `${hdrInfo.join('+')}` : null;

        const muxedBy = 'Ionicboy';

        // Build newTitle by checking for null or undefined values
        const titleParts = [];

        if (quality) titleParts.push(quality);
        if (source) titleParts.push(source);

        if (downloadType) titleParts.push(downloadType);
        if (codec) titleParts.push(codec.toUpperCase());
        if (hdrString) titleParts.push(hdrString);
        if (muxedBy) titleParts.push(muxedBy);

        console.log(titleParts);
        const newTitle = titleParts.join(' | ');

        return {
          trackId: track.trackId,
          newTitle: track.newTitle || newTitle
        };
      });

      const languageMap = {
        en: 'English (US)',
        eng: 'English (US)',
        enUS: 'English (US)',
        'en-US': 'English (US)',
        'en-GB': 'English (UK)',
        enGB: 'English (UK)',
        ko: 'Korean (KR)',
        kor: 'Korean (KR)',
        es: 'Spanish (ES)',
        spa: 'Spanish (ES)',
        'es-419': 'Spanish (Latin America)',
        'es-LA': 'Spanish (Latin America)',
        esLA: 'Spanish (Latin America)',
        fr: 'French (FR)',
        fra: 'French (FR)',
        fre: 'French (FR)',
        'fr-CA': 'French (CA)',
        frCA: 'French (CA)',
        de: 'German (DE)',
        deu: 'German (DE)',
        ger: 'German (DE)',
        it: 'Italian (IT)',
        ita: 'Italian (IT)',
        ja: 'Japanese (JP)',
        jpn: 'Japanese (JP)',
        zh: 'Chinese (Simplified)',
        zho: 'Chinese (Simplified)',
        chi: 'Chinese (Simplified)',
        'zh-TW': 'Chinese (Traditional)',
        zhTW: 'Chinese (Traditional)',
        pt: 'Portuguese (PT)',
        por: 'Portuguese (PT)',
        'pt-BR': 'Portuguese (BR)',
        ptBR: 'Portuguese (BR)',
        ru: 'Russian (RU)',
        rus: 'Russian (RU)',
        ar: 'Arabic (001)',
        ara: 'Arabic (001)',
        hi: 'Hindi (IN)',
        hin: 'Hindi (IN)',
        tr: 'Turkish (TR)',
        tur: 'Turkish (TR)',
        nl: 'Dutch (NL)',
        nld: 'Dutch (NL)',
        dut: 'Dutch (NL)',
        sv: 'Swedish (SE)',
        swe: 'Swedish (SE)',
        no: 'Norwegian Bokmal (NO)',
        nor: 'Norwegian Bokmal (NO)',
        fi: 'Finnish (FI)',
        fin: 'Finnish (FI)',
        da: 'Danish (DK)',
        dan: 'Danish (DK)',
        pl: 'Polish (PL)',
        pol: 'Polish (PL)',
        hu: 'Hungarian (HU)',
        hun: 'Hungarian (HU)',
        cs: 'Czech (CZ)',
        ces: 'Czech (CZ)',
        cze: 'Czech (CZ)',
        el: 'Greek (GR)',
        ell: 'Greek (GR)',
        gre: 'Greek (GR)',
        he: 'Hebrew (IL)',
        heb: 'Hebrew (IL)',
        ro: 'Romanian (RO)',
        ron: 'Romanian (RO)',
        rum: 'Romanian (RO)',
        th: 'Thai (TH)',
        tha: 'Thai (TH)',
        id: 'Indonesian (ID)',
        ind: 'Indonesian (ID)',
        ms: 'Malay (MY)',
        msa: 'Malay (MY)',
        may: 'Malay (MY)',
        vi: 'Vietnamese (VN)',
        vie: 'Vietnamese (VN)',
        tl: 'Filipino (PH)',
        fil: 'Filipino (PH)',
        uk: 'Ukrainian (UA)',
        ukr: 'Ukrainian (UA)',
        hr: 'Croatian (HR)',
        hrv: 'Croatian (HR)',
        sk: 'Slovak (SK)',
        slk: 'Slovak (SK)',
        slo: 'Slovak (SK)'
      };

      const subtitleTracks = fileInfo.subtitleTracks.map((track) => {
        const languageData = track.language in languageMap ? languageMap[track.language] : 'Unknown';
        const sdh = track.isSDH === 'Yes' ? ' SDH' : '';
        const muxedBy = 'Ionicboy';

        const newTitle = `${languageData}${sdh} | ${muxedBy}`;

        return {
          trackId: track.trackId,
          newTitle: track.newTitle || newTitle
        };
      });

      const tracksToRename = [...videoTracks, ...audioTracks, ...subtitleTracks];

      console.log('Tracks to rename:', tracksToRename);

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
      setError(`Failed to rename tracks for file ${fileInfo.fileName}: ${err.message}`);
      return `Error renaming tracks for file ${fileInfo.fileName}`;
    }
  };

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
    return filesInfo.map((fileInfo) => generateFilename(fileInfo));
  };

  const addCustomProperties = async (muxedBy, telegramChannel) => {
    try {
      const addProps = filesInfo.map(async (fileInfo) => {
        console.log(fileInfo);
        console.log(fileInfo.filePath);
        const filePath = fileInfo.filePath;
        await window.Main.addProps({ filePath, muxedBy, telegramChannel });
      });

      const results = await Promise.all(addProps);
      console.log('All tracks updated:', results); // "Command executed successfully" or the output of the mkvpropedit command
    } catch (error) {
      console.error('Error:', error); // Log any errors that occur
    }
  };

  if (!filesInfo || filesInfo.length <= 0) return null;

  return (
    <div className="flex flex-col gap-6 border bg-white/5 border-neutral-800 rounded-md p-6 mt-6">
      <div className="flex flex-col gap-1">
        <h4 className="font-semibold text-xl flex items-center gap-2">
          <Info size={20}></Info>
          <span>Media Files</span>
        </h4>
        <span className=" text-neutral-400">Showing mediainfo for {filesInfo.length} files</span>
      </div>
      {/* <button
        className="border text-sm border-neutral-800 bg-neutral-900 text-center p-2 rounded-md w-max px-8 mt-4 mb-4"
        onClick={() => generateFileNames()}
      >
        Generate File Names
      </button> */}

      {/* Bulk Rename Button */}
      <button
        className="border text-sm border-neutral-800 bg-neutral-900 text-center p-2 rounded-md w-max px-8 mt-4 mb-4"
        onClick={handleBulkRename}
        disabled={loading}
      >
        {loading ? 'Renaming Tracks...' : 'Rename Tracks in Bulk'}
      </button>

      {/* Error Message */}
      {error && <div className="text-red-500">{error}</div>}

      <div className="flex flex-col gap-2 ">
        <span>Advanced</span>
        <div className="flex items-center gap-2">
          <span>Muxed by</span>
          <input
            type="text"
            value={'Ionicboy'}
            // value={generatedName}
            // onChange={(e) => setGeneratedName(e.target.value)}
            className=" bg-neutral-800 border border-neutral-700 outline-none p-1 w-96 rounded-md text-sm text-neutral-300"
          />
        </div>
        <div className="flex items-center gap-2">
          <span>Telegram Channel</span>
          <input
            type="text"
            value={'t.me/HDCLovers'}
            // value={generatedName}
            // onChange={(e) => setGeneratedName(e.target.value)}
            className=" bg-neutral-800 border border-neutral-700 outline-none p-1 w-96 rounded-md text-sm text-neutral-300"
          />
        </div>

        <button
          className="self-start border bg-white text-black font-semibold text-sm p-1 rounded-md"
          onClick={() => addCustomProperties('Ionicboy', 't.me/HDCLovers')}
        >
          Add props
        </button>
      </div>
      {/* Display MediaInfo for each selected file */}
      {filesInfo.length > 0 && (
        <div className="flex flex-col gap-4">
          {filesInfo.map((fileInfo, index) => (
            <File fileInfo={fileInfo} index={index} />
          ))}
        </div>
      )}
    </div>
  );
};

function generateFilename(fileInfo) {
  const fileName = fileInfo.fileName;

  const seriesRegex = /(S\d{1,2})(E\d{1,2})?/i;
  const yearRegex = /(\d{4})/;
  const formatRegex = /(UHD\s*BluRay|BluRay|WEB-DL|HDR|HEVC|x264|x265)/i;
  const releaserRegex = /\-\s*(.+)$/i;

  const isSeries = seriesRegex.test(fileName);
  const fileNameRegex = /^(.+?)(?:\s*\(\d{4}\))?(?:\s*S\d{1,2}E\d{1,2})?(?:\s*\d{3,4}p.*|$)/i;

  const nameMatch = fileName.match(fileNameRegex);
  const yearMatch = fileName.match(yearRegex);
  const formatMatch = fileName.match(formatRegex);
  const releaserMatch = fileName.replace(/\.\w+$/, '').match(releaserRegex);

  const name = nameMatch ? nameMatch[1].replace(/\.+/g, ' ').trim() : 'Unknown';
  const year = yearMatch ? yearMatch[1] : 'Unknown';
  const format = formatMatch ? formatMatch[1] : 'Unknown';
  const releaser = releaserMatch ? releaserMatch[1].trim() : 'Unknown';

  let formattedName = '';

  const { audioTracks, videoTracks } = fileInfo;
  const audioLanguages = audioTracks
    .map((track) => {
      const language = track.language ? track.language.toUpperCase() : 'Unknown';
      const codec = track.codec ? track.codec.toUpperCase() : 'Unknown';
      const channelConfig = track.channelConfig ? track.channelConfig.toUpperCase() : 'Unknown';
      return `${language} ${codec} ${channelConfig}`;
    })
    .join(' + ');

  if (isSeries) {
    const seasonEpisodeMatch = fileName.match(seriesRegex);
    const season = seasonEpisodeMatch ? seasonEpisodeMatch[1] : 'S??';
    const episode = seasonEpisodeMatch && seasonEpisodeMatch[2] ? seasonEpisodeMatch[2] : 'E??';

    formattedName = `${name} (${year}) ${season}${episode} ${videoTracks[0].quality} ${
      videoTracks[0].isDV ? 'DV' : ''
    } ${videoTracks[0].isHDR ? 'HDR' : ''} [${audioLanguages}] ${videoTracks[0].codec} [${releaser}]`;
  } else {
    formattedName = `${name} (${year}) ${videoTracks[0].quality} ${videoTracks[0].isDV ? 'DV' : ''} ${
      videoTracks[0].isHDR ? 'HDR' : ''
    } [${audioLanguages}] ${videoTracks[0].codec} [${releaser}]`;
  }

  return formattedName;
}

const File = ({ fileInfo, index }) => {
  const [generatedName, setGeneratedName] = useState('');

  useEffect(() => {
    setGeneratedName(generateFilename(fileInfo));
  }, [fileInfo]);

  return (
    <div key={index} className="gap-4 flex flex-col bg-black/20 border-neutral-800 border rounded-md h-max mt-8">
      <h6 className="font-semibold flex items-center gap-2 text-neutral-100 p-4 bg-neutral-900">
        <FileVideo size={20} />
        <span>{fileInfo.fileName}</span>
      </h6>

      <div className="flex gap-4 items-center flex-wrap px-4 pb-4">
        <div className="flex flex-col gap-2">
          <h6 className="font-semibold text-neutral-300 gap-2 flex flex-col text-sm">Video Tracks</h6>
          <pre className="overflow-x-auto overflow-y-auto h-24 w-96 rounded-md p-2 ">
            {fileInfo.videoTracks.map((track, i) => (
              <span key={i} className="text-neutral-300">
                Track {i}: {track.title} <br />
              </span>
            ))}
          </pre>
        </div>

        <div className="flex flex-col gap-2">
          <h6 className="font-semibold text-neutral-300 gap-2 flex flex-col text-sm">Audio Tracks</h6>
          <pre className="overflow-x-auto overflow-y-auto h-24 w-96 rounded-md p-2 ">
            {fileInfo.audioTracks.map((track, i) => (
              <span key={i} className="text-neutral-300">
                Track {i}: {track.title} <br />
              </span>
            ))}
          </pre>
        </div>

        <div className="flex flex-col gap-2">
          <h6 className="font-semibold text-neutral-300 gap-2 flex flex-col text-sm">Subtitle Tracks</h6>
          <pre className="overflow-x-auto overflow-y-auto h-24 w-96 rounded-md p-2 ">
            {fileInfo.subtitleTracks.map((track, i) => (
              <span key={i} className="text-neutral-300">
                Track {i}: {track.title} <br />
              </span>
            ))}
          </pre>
        </div>
      </div>
    </div>
  );
};

const FileName = ({ name }) => {
  const [isEditable, setIsEditable] = useState(false);
  const [fileName, setFileName] = useState(name);
  const editRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editRef.current && !editRef.current.contains(event.target as Node)) {
        setIsEditable(false); // Cancel edit if clicked outside
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  return (
    <div className="w-full max-w-5xl flex items-center" ref={editRef}>
      <input
        type="text"
        value={fileName}
        onChange={(event: ChangeEvent<HTMLInputElement>) => setFileName(event?.target.value)}
        className={`w-full bg-neutral-800 border outline-none  p-1 rounded-md cursor-auto ${
          isEditable ? 'border-light-blue-600' : 'border-neutral-700'
        }`}
        disabled={!isEditable}
      />
      <button
        onClick={() => setIsEditable((prev) => !prev)}
        className=" text-neutral-400 hover:text-neutral-100 p-2 rounded-md"
      >
        {isEditable ? <SaveIcon size={20} /> : <Edit size={20}></Edit>}
      </button>
    </div>
  );
};
