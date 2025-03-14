import React, { useState, useEffect, useRef } from 'react';
import { MediaInfo } from '../mediainfo';
import {
  HardDrive,
  FolderOpen,
  FileVideo,
  CheckCircle,
  Circle,
  RefreshCcw,
  X,
  ChevronDown,
  ChevronUp,
  Info,
  Loader2
} from 'lucide-react';
import { useBrowseStore } from '../../stores/browseStore';
import { motion, AnimatePresence } from 'framer-motion';

const FilePicker: React.FC = () => {
  // Store and state
  const filePaths = useBrowseStore((state) => state.filePaths);
  const updateFilePaths = useBrowseStore((state) => state.updateFilePaths);
  const clearFilePaths = useBrowseStore((state) => state.clearFilePaths);

  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [filesInfo, setFilesInfo] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFileList, setShowFileList] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'type'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

  const fileListRef = useRef<HTMLUListElement>(null);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'a' && document.activeElement === fileListRef.current) {
        e.preventDefault();
        handleSelectAll();
      }

      if (e.ctrlKey && e.key === 'o') {
        e.preventDefault();
        openFileDialog();
      }

      // Handle space key for toggling selection of focused item
      if (e.key === ' ' && document.activeElement?.classList.contains('file-item')) {
        e.preventDefault();
        const filePath = document.activeElement.getAttribute('data-filepath');
        if (filePath) {
          handleFileSelect(filePath, e.ctrlKey);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filePaths, selectedFiles]);

  // File operations
  const openFileDialog = async () => {
    const browsedFiles = await window.Main.openFileDialog();
    updateFilePaths(browsedFiles);
  };

  // Enhanced file selection with multi-select support
  const handleFileSelect = (filePath: string, modifierKey = false, shiftKey = false) => {
    // Find the index of the clicked file
    const clickedIndex = filteredAndSortedFiles.findIndex((path) => path === filePath);

    // Handle shift+click for range selection
    if (shiftKey && lastSelectedIndex !== null) {
      const start = Math.min(clickedIndex, lastSelectedIndex);
      const end = Math.max(clickedIndex, lastSelectedIndex);

      const rangeToSelect = filteredAndSortedFiles.slice(start, end + 1);

      if (modifierKey) {
        // With Ctrl+Shift: Add the range to existing selection
        setSelectedFiles((prevSelected) => {
          const newSelection = [...prevSelected];
          rangeToSelect.forEach((path) => {
            if (!newSelection.includes(path)) {
              newSelection.push(path);
            }
          });
          return newSelection;
        });
      } else {
        // With just Shift: Replace selection with the range
        setSelectedFiles(rangeToSelect);
      }
    }
    // Handle Ctrl+click for individual toggles
    else if (modifierKey) {
      setSelectedFiles((prevSelected) => {
        const isSelected = prevSelected.includes(filePath);
        if (isSelected) {
          return prevSelected.filter((path) => path !== filePath);
        } else {
          return [...prevSelected, filePath];
        }
      });
    }
    // Regular click (select only this item)
    else {
      const isAlreadyOnlyItemSelected = selectedFiles.length === 1 && selectedFiles[0] === filePath;

      setSelectedFiles(isAlreadyOnlyItemSelected ? [] : [filePath]);
    }

    // Update the last selected index for shift+click functionality
    setLastSelectedIndex(clickedIndex);
  };

  const handleClearFiles = () => {
    setSelectedFiles([]);
    setFilesInfo([]);
    clearFilePaths();
    setLastSelectedIndex(null);
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === filteredAndSortedFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles([...filteredAndSortedFiles]);
    }
  };

  const extractMediaInfoForSelectedFiles = async () => {
    if (selectedFiles.length === 0) return;

    try {
      setIsLoading(true);
      const mediaInfoPromises = selectedFiles.map(async (filePath) => {
        const metadata = await window.Main.extractMediaInfo(filePath);
        return metadata;
      });

      const mediaInfoResults = await Promise.all(mediaInfoPromises);
      setFilesInfo(mediaInfoResults);
    } catch (error) {
      console.error('Error extracting MediaInfo for selected files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const getFileTypeClass = (filePath: string) => {
    const ext = getFileExtension(filePath);
    const videoExts = ['mkv', 'mp4', 'avi', 'mov', 'webm'];

    return videoExts.includes(ext) ? 'text-rosePine-foam' : 'text-rosePine-gold';
  };

  const getFileTypeIcon = (filePath: string) => {
    const ext = getFileExtension(filePath);
    const videoExts = ['mkv', 'mp4', 'avi', 'mov', 'webm'];

    return videoExts.includes(ext) ? <FileVideo size={16} className={`mr-2 ${getFileTypeClass(filePath)}`} /> : null;
  };

  // Filter and sort files
  const filteredAndSortedFiles = filePaths
    .filter((filePath) => {
      if (!searchTerm) return true;
      const fileName = filePath.split('\\').pop()?.toLowerCase() || '';
      return fileName.includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      const aName = a.split('\\').pop() || '';
      const bName = b.split('\\').pop() || '';
      const aExt = getFileExtension(a);
      const bExt = getFileExtension(b);

      if (sortBy === 'name') {
        return sortOrder === 'asc' ? aName.localeCompare(bName) : bName.localeCompare(aName);
      } else {
        return sortOrder === 'asc'
          ? aExt.localeCompare(bExt) || aName.localeCompare(bName)
          : bExt.localeCompare(aExt) || bName.localeCompare(aName);
      }
    });

  return (
    <div className="flex flex-col bg-rosePine-base overflow-hidden h-full border border-rosePine-highlight-low rounded-md">
      {/* Header Area - more desktop app-like */}
      <div className="flex items-center justify-between px-4 py-3 bg-rosePine-surface border-b border-rosePine-highlight-low">
        <div className="flex items-center gap-2">
          <HardDrive size={18} className="text-rosePine-foam" />
          <h4 className="text-base font-medium text-rosePine-text">Media Files</h4>
          {selectedFiles.length > 0 && (
            <span className="bg-rosePine-iris text-rosePine-base text-xs font-medium px-2 py-0.5 rounded-sm ml-2">
              {selectedFiles.length} selected
            </span>
          )}
        </div>

        {/* Header actions - aligned and consistent */}
        <div className="flex items-center gap-2">
          {filePaths.length > 0 && (
            <button
              onClick={handleClearFiles}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-sm
                       text-rosePine-muted hover:bg-rosePine-highlight-low hover:text-rosePine-text
                       transition-colors border border-transparent hover:border-rosePine-highlight-med"
              title="Clear all files (Ctrl+X)"
            >
              <X size={14} />
              <span>Clear</span>
            </button>
          )}

          <button
            onClick={openFileDialog}
            className="flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-sm
                     bg-rosePine-iris hover:bg-opacity-90 text-rosePine-base
                     transition-colors focus:outline-none"
            title="Browse for files (Ctrl+O)"
          >
            <FolderOpen size={14} />
            <span>Browse</span>
          </button>
        </div>
      </div>

      {/* File List Section */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex flex-col flex-1">
          <AnimatePresence>
            {filePaths.length > 0 && (
              <motion.div
                initial={false}
                animate={{ height: showFileList ? 'auto' : '36px' }}
                className="flex flex-col overflow-hidden border-b border-rosePine-highlight-low"
              >
                {/* File list header - Desktop style */}
                <div
                  onClick={() => setShowFileList(!showFileList)}
                  className="flex items-center justify-between px-4 py-2 bg-rosePine-overlay border-b border-rosePine-highlight-med cursor-pointer hover:bg-opacity-90"
                >
                  <div className="flex items-center gap-2">
                    {showFileList ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    <span className="text-sm font-medium text-rosePine-text">Files</span>
                    <span className="text-xs text-rosePine-muted">
                      ({selectedFiles.length}/{filteredAndSortedFiles.length})
                    </span>
                  </div>

                  {showFileList && (
                    <div className="flex items-center gap-2">
                      {/* Search input */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search files..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="py-1 px-2 text-xs rounded-sm bg-rosePine-surface border border-rosePine-highlight-med
                                   text-rosePine-text focus:outline-none focus:border-rosePine-iris w-40"
                        />
                        {searchTerm && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSearchTerm('');
                            }}
                            className="absolute right-1.5 top-1/2 transform -translate-y-1/2 text-rosePine-muted hover:text-rosePine-text"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>

                      {/* Controls group */}
                      <div className="flex border border-rosePine-highlight-med rounded-sm overflow-hidden">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSortBy(sortBy === 'name' ? 'type' : 'name');
                          }}
                          className="text-xs px-2 py-1 bg-rosePine-base text-rosePine-subtle
                                 hover:bg-rosePine-highlight-low hover:text-rosePine-text border-r border-rosePine-highlight-med"
                        >
                          {sortBy === 'name' ? 'Name' : 'Type'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                          }}
                          className="text-rosePine-subtle hover:text-rosePine-text px-2 bg-rosePine-base hover:bg-rosePine-highlight-low"
                        >
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </button>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectAll();
                        }}
                        className="text-xs px-2 py-1 rounded-sm border border-rosePine-highlight-med bg-rosePine-base text-rosePine-subtle
                                 hover:bg-rosePine-highlight-low hover:text-rosePine-text transition-colors"
                      >
                        {selectedFiles.length === filteredAndSortedFiles.length ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Improved File List */}
                {showFileList && (
                  <div className="flex-1 overflow-hidden">
                    {filteredAndSortedFiles.length > 0 ? (
                      <ul
                        ref={fileListRef}
                        tabIndex={0}
                        className="divide-y divide-rosePine-highlight-low max-h-[260px] overflow-y-auto 
                                 bg-rosePine-base focus:outline-none focus:ring-1 focus:ring-inset focus:ring-rosePine-highlight-low"
                      >
                        {filteredAndSortedFiles.map((filePath, index) => {
                          const isSelected = selectedFiles.includes(filePath);
                          const fileName = filePath.split('\\').pop() || '';

                          return (
                            <li
                              key={index}
                              onClick={(e) => handleFileSelect(filePath, e.ctrlKey, e.shiftKey)}
                              onDoubleClick={() => {
                                setSelectedFiles([filePath]);
                                extractMediaInfoForSelectedFiles();
                              }}
                              className={`flex items-center px-3 py-1.5 cursor-pointer group transition-colors duration-150 file-item
                                       ${isSelected ? 'bg-rosePine-overlay' : 'hover:bg-rosePine-highlight-low'}`}
                              data-filepath={filePath}
                              data-index={index}
                              tabIndex={0}
                              role="option"
                              aria-selected={isSelected}
                            >
                              <div className="flex-shrink-0 mr-2">
                                {isSelected ? (
                                  <CheckCircle size={14} className="text-rosePine-iris" />
                                ) : (
                                  <Circle
                                    size={14}
                                    className="text-rosePine-highlight-med group-hover:text-rosePine-subtle"
                                  />
                                )}
                              </div>

                              <div className="flex flex-col min-w-0 flex-1">
                                <div className="flex items-center">
                                  {getFileTypeIcon(filePath)}
                                  <span
                                    className={`truncate text-sm ${
                                      isSelected ? 'text-rosePine-text font-medium' : 'text-rosePine-subtle'
                                    }`}
                                    title={fileName}
                                  >
                                    {fileName}
                                  </span>
                                  <span className="ml-2 text-xs text-rosePine-muted">
                                    {getFileExtension(filePath).toUpperCase()}
                                  </span>
                                </div>
                                <span className="text-xs text-rosePine-muted truncate" title={filePath}>
                                  {filePath}
                                </span>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    ) : searchTerm ? (
                      <div className="flex items-center justify-center p-6 text-rosePine-muted">
                        <Info size={16} className="mr-2" />
                        <p className="text-sm">No files match your search</p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center p-6 text-rosePine-muted">
                        <Info size={16} className="mr-2" />
                        <p className="text-sm">No files available</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Action bar */}
                <div className="flex items-center justify-between px-4 py-2 bg-rosePine-surface border-t border-rosePine-highlight-low">
                  <div className="text-xs text-rosePine-muted flex items-center">
                    <span>
                      {filteredAndSortedFiles.length} file{filteredAndSortedFiles.length !== 1 ? 's' : ''}
                      {searchTerm &&
                        filteredAndSortedFiles.length !== filePaths.length &&
                        ` (filtered from ${filePaths.length})`}
                    </span>

                    {selectedFiles.length > 0 && (
                      <span className="ml-3 text-rosePine-subtle">
                        <span className="font-mono bg-rosePine-highlight-low px-1 py-0.5 rounded-sm text-xs">
                          Ctrl+Click
                        </span>{' '}
                        or{' '}
                        <span className="font-mono bg-rosePine-highlight-low px-1 py-0.5 rounded-sm text-xs">
                          Shift+Click
                        </span>{' '}
                        for selection
                      </span>
                    )}
                  </div>

                  <button
                    onClick={extractMediaInfoForSelectedFiles}
                    disabled={selectedFiles.length <= 0 || isLoading}
                    className="flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-sm
                             bg-rosePine-pine hover:bg-opacity-90 text-rosePine-text
                             transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Extracting...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCcw size={14} />
                        <span>Extract Info</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state - more desktop app-like */}
          {filePaths.length === 0 && (
            <div className="flex items-center justify-center flex-col p-10 gap-4 flex-1">
              <div className="rounded-full p-4 bg-rosePine-highlight-low text-rosePine-subtle">
                <FolderOpen size={32} />
              </div>
              <div className="flex items-center flex-col gap-1 text-center max-w-md">
                <span className="font-medium text-rosePine-text">No media files selected</span>
                <span className="text-xs text-rosePine-muted max-w-xs">
                  Click the Browse button to select media files for analysis.
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <button
                  onClick={openFileDialog}
                  className="flex items-center gap-2 px-4 py-2 rounded-sm bg-rosePine-iris 
                           hover:bg-opacity-90 text-rosePine-base transition-colors"
                >
                  <FolderOpen size={16} />
                  <span>Browse Files</span>
                </button>
              </div>
              <div className="mt-3 text-xs text-rosePine-muted">
                Keyboard shortcut:{' '}
                <span className="font-mono bg-rosePine-highlight-low px-1.5 py-0.5 rounded-sm">Ctrl+O</span>
              </div>
            </div>
          )}
        </div>

        {/* Media info section - now with proper separation */}
        <AnimatePresence>
          {filesInfo.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-auto mt-3 px-3"
            >
              <MediaInfo filesInfo={filesInfo} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FilePicker;
