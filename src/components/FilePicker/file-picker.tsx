import React, { useEffect, useState } from 'react';
import { MediaInfo } from '../mediainfo';
import { HardDrive, FolderOpen, Info } from 'lucide-react';

const FilePicker: React.FC = () => {
  const [filePaths, setFilePaths] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [filesInfo, setFilesInfo] = useState<any[]>([]);

  const openFileDialog = async () => {
    const selectedFiles = await window.Main.openFileDialog();
    console.log(selectedFiles);

    setFilePaths((prev) => [...new Set([...prev, ...selectedFiles])]);
  };

  const handleFileSelect = (filePath: string) => {
    const isSelected = selectedFiles.includes(filePath);

    if (isSelected) {
      setSelectedFiles(selectedFiles.filter((file) => file !== filePath));
    } else {
      setSelectedFiles([...selectedFiles, filePath]);
    }
  };

  const extractMediaInfoForSelectedFiles = async () => {
    try {
      const mediaInfoPromises = selectedFiles.map(async (filePath) => {
        const metadata = await window.Main.extractMediaInfo(filePath);
        return metadata;
      });

      const mediaInfoResults = await Promise.all(mediaInfoPromises);

      setFilesInfo(mediaInfoResults);
      console.log(mediaInfoResults);
    } catch (error) {
      console.error('Error extracting MediaInfo for selected files:', error);
    }
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === filePaths.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filePaths);
    }
  };

  // useEffect(() => {
  //   extractMediaInfoForSelectedFiles();
  // }, [selectedFiles]);

  return (
    <div className="w-full flex flex-col gap-2 overflow-y-auto h-max">
      <div className="flex flex-col gap-6 border border-neutral-800 rounded-md p-6">
        <div className="flex flex-col gap-1">
          <h4 className="font-semibold text-xl flex items-center gap-2">
            <HardDrive size={20}></HardDrive>
            <span>Media Files</span>
          </h4>
          <span className=" text-neutral-400">Select media files to extract information</span>
        </div>
        <div>
          <div className="flex items-center justify-between  mb-4">
            <button
              onClick={() => handleSelectAll()}
              className="border text-sm border-neutral-800 bg-black/50 text-center p-2 rounded-md w-max px-4"
            >
              {selectedFiles.length === filePaths.length ? 'Deselect All' : 'Select All'}
            </button>
            <span className="text-neutral-400">
              {selectedFiles.length} of {filePaths.length} selected
            </span>
          </div>

          <ul className="bg-black/50 border-neutral-800 border p-2 rounded-xl flex flex-col gap-2 min-h-64">
            {filePaths && filePaths.length > 0 ? (
              filePaths.map((filePath, index) => (
                <li
                  // title={filePath}
                  className={`p-2 rounded-md truncate cursor-pointer text-sm ${
                    selectedFiles.includes(filePath) ? 'bg-white/20' : 'hover:bg-white/10'
                  }`}
                  onClick={() => handleFileSelect(filePath)}
                  key={index}
                >
                  {filePath.split('\\').pop()}
                </li>
              ))
            ) : (
              <div className=" flex items-center justify-center flex-col p-4 gap-4">
                <div className=" rounded-full p-3 w-max bg-white/20 text-neutral-400 ">
                  <FolderOpen></FolderOpen>
                </div>
                <div className="flex items-center flex-col gap-1">
                  <span className="font-semibold">No files selected</span>
                  <span className="text-neutral-400 text-sm">Click the button below to browse for media files.</span>
                </div>
                <button
                  onClick={openFileDialog}
                  className="border flex font-semibold items-center gap-2 text-sm bg-white text-neutral-800  text-center p-2 rounded-md w-max"
                >
                  <FolderOpen size={20}></FolderOpen>
                  <span>Browse Files</span>
                </button>
              </div>
            )}
          </ul>
        </div>

        <div className="flex items-center justify-between">
          {filePaths.length >= 1 ? (
            <button
              onClick={openFileDialog}
              className="border flex font-semibold items-center gap-2 text-sm bg-black/25 border-neutral-800  text-center p-2 rounded-md w-max"
            >
              <FolderOpen size={20}></FolderOpen>
              <span>Browse More Files</span>
            </button>
          ) : (
            <div></div>
          )}

          <button
            onClick={extractMediaInfoForSelectedFiles}
            disabled={selectedFiles.length <= 0}
            className={`border flex items-center  gap-2 text-sm text-neutral-800 font-semibold bg-white text-center p-2 rounded-md w-max disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Info size={20}></Info>
            <span>Extract Media Info</span>
          </button>
        </div>
      </div>

      <MediaInfo filesInfo={filesInfo}></MediaInfo>
    </div>
  );
};

export default FilePicker;
