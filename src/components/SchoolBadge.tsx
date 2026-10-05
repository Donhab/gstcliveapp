import React, { useState, useEffect, useRef } from 'react';
import defaultBadgeImage from '../assets/images/gstc_garki_badge_1790464142597.jpg';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Upload, CheckCircle2, RotateCcw, Image as ImageIcon, X, Trash2, ShieldCheck } from 'lucide-react';

const LOCAL_STORAGE_BADGE_KEY = 'gstc_official_school_badge_v1';

let currentBadgeUrl: string =
  (typeof window !== 'undefined' && window.localStorage.getItem(LOCAL_STORAGE_BADGE_KEY)) ||
  defaultBadgeImage;

const listeners = new Set<(url: string) => void>();

let preloadedImg: HTMLImageElement | null = null;

function syncFaviconAndPreload(url: string) {
  if (typeof window === 'undefined') return;

  // Preload image for HTML5 Canvas PDF & PNG Report Card Printer
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    preloadedImg = img;
  };
  img.src = url;

  // Sync browser tab favicon
  try {
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = url;
  } catch {
    // Ignore DOM head errors
  }
}

// Initialize on module load
syncFaviconAndPreload(currentBadgeUrl);

export function getActiveSchoolBadgeUrl(): string {
  return currentBadgeUrl || defaultBadgeImage;
}

export function getDefaultSchoolBadgeUrl(): string {
  return defaultBadgeImage;
}

export function getPreloadedBadgeImage(): HTMLImageElement | null {
  return preloadedImg;
}

export async function setGlobalSchoolBadgeUrl(
  newUrl: string | null,
  persistToFirestore: boolean = true
): Promise<void> {
  const resolved = newUrl && newUrl.trim() ? newUrl.trim() : defaultBadgeImage;
  if (resolved === currentBadgeUrl && !persistToFirestore) return;

  currentBadgeUrl = resolved;

  if (typeof window !== 'undefined') {
    try {
      if (newUrl && newUrl !== defaultBadgeImage) {
        window.localStorage.setItem(LOCAL_STORAGE_BADGE_KEY, resolved);
      } else if (newUrl === null) {
        window.localStorage.removeItem(LOCAL_STORAGE_BADGE_KEY);
      }
    } catch {
      // Ignore storage quota errors
    }
  }

  syncFaviconAndPreload(resolved);
  listeners.forEach((listener) => listener(resolved));

  if (persistToFirestore) {
    try {
      await Promise.all([
        setDoc(
          doc(db, 'website_customization', 'main'),
          {
            schoolBadgeUrl: resolved,
            updatedAt: Date.now()
          },
          { merge: true }
        ),
        setDoc(
          doc(db, 'settings', 'global_config'),
          {
            schoolBadgeUrl: resolved
          },
          { merge: true }
        )
      ]);
    } catch (err) {
      console.error('Failed to sync school badge to Firestore:', err);
    }
  }
}

export function useSchoolBadgeUrl(): string {
  const [url, setUrl] = useState<string>(getActiveSchoolBadgeUrl());

  useEffect(() => {
    setUrl(getActiveSchoolBadgeUrl());
    const handler = (updated: string) => setUrl(updated);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  return url;
}

/**
 * Reads and optimizes an uploaded badge/logo image file into a clean high-resolution Data URL
 * suitable for instant real-time Firestore synchronization and report card printing.
 */
export function compressBadgeImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => {
      const rawDataUrl = reader.result as string;
      const img = new Image();
      img.onerror = () => resolve(rawDataUrl);
      img.onload = () => {
        try {
          const maxDim = 600;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width >= height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(rawDataUrl);
            return;
          }
          // Fill white background for JPEGs or transparent crests
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.92);
          resolve(compressed);
        } catch {
          resolve(rawDataUrl);
        }
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  });
}

interface SchoolBadgeProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showBorder?: boolean;
  onClick?: () => void;
}

export const SchoolBadge: React.FC<SchoolBadgeProps> = ({
  className = '',
  size = 'md',
  showBorder = true,
  onClick
}) => {
  const badgeUrl = useSchoolBadgeUrl();

  let sizeClass = 'w-10 h-10';
  if (size === 'xs') sizeClass = 'w-7 h-7';
  if (size === 'sm') sizeClass = 'w-9 h-9';
  if (size === 'md') sizeClass = 'w-11 h-11';
  if (size === 'lg') sizeClass = 'w-16 h-16';
  if (size === 'xl') sizeClass = 'w-24 h-24';

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full bg-white overflow-hidden shadow-xs ${
        showBorder ? 'border-2 border-amber-300 ring-1 ring-emerald-800/30' : ''
      } ${onClick ? 'cursor-pointer hover:ring-2 hover:ring-amber-400 transition' : ''} ${sizeClass} ${className}`}
      title="Govt. Science & Technical College Garki, Abuja - Official School Badge"
    >
      <img
        src={badgeUrl}
        alt="GSTC Garki School Badge"
        referrerPolicy="no-referrer"
        onError={(e) => {
          const target = e.currentTarget;
          if (target.src !== defaultBadgeImage) {
            target.src = defaultBadgeImage;
          }
        }}
        className="w-full h-full object-contain object-center p-0.5"
      />
    </div>
  );
};

interface SchoolBadgeUploaderCardProps {
  compact?: boolean;
}

export const SchoolBadgeUploaderCard: React.FC<SchoolBadgeUploaderCardProps> = ({
  compact = false
}) => {
  const { userProfile } = useAuth();
  const canManageBadge =
    userProfile?.role === 'super_admin' || userProfile?.role === 'admin';

  const badgeUrl = useSchoolBadgeUrl();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!canManageBadge) {
    return null;
  }

  const handleFileSelection = async (file: File | undefined) => {
    if (!file || !canManageBadge) return;
    setUploading(true);
    setStatusMsg(null);
    try {
      const optimizedDataUrl = await compressBadgeImageFile(file);
      await setGlobalSchoolBadgeUrl(optimizedDataUrl, true);
      setStatusMsg('Official School Badge / Logo updated across the entire portal!');
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err) {
      console.error('Error uploading badge:', err);
      setStatusMsg('Could not process image file. Please try another image.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveBadge = async () => {
    if (!canManageBadge) return;
    setUploading(true);
    try {
      await setGlobalSchoolBadgeUrl(null, true);
      setStatusMsg('Custom badge removed and default GSTC Garki crest restored.');
      setTimeout(() => setStatusMsg(null), 3500);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        if (!canManageBadge) return;
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
          handleFileSelection(file);
        }
      }}
      className={`bg-emerald-50/60 border border-emerald-200 rounded-xl ${
        compact ? 'p-3.5' : 'p-4'
      } flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}
    >
      <div className="flex items-center gap-3.5">
        <SchoolBadge size={compact ? 'md' : 'lg'} className="shadow-sm" />
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-xs sm:text-sm font-bold text-stone-900">
              Official School Badge / Logo
            </h4>
            <span className="text-[10px] font-semibold text-emerald-800 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-700" />
              <span>Super Admin &amp; Admin Only</span>
            </span>
          </div>
          <p className="text-[11px] text-stone-600 mt-0.5 max-w-xl leading-relaxed">
            Displayed on the navigation bar, landing page, login portal, scratch cards, and official printable PDF report cards. Drag &amp; drop or upload a badge image (e.g. JPEG/PNG) to update immediately.
          </p>
          {statusMsg && (
            <p className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{statusMsg}</span>
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            handleFileSelection(file);
            e.target.value = '';
          }}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="px-3.5 py-2 bg-[#0b4d2c] hover:bg-[#083a21] text-white text-xs font-bold rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <Upload className="w-3.5 h-3.5 text-amber-300" />
          <span>{uploading ? 'Updating Badge...' : 'Add / Upload Badge'}</span>
        </button>

        <button
          type="button"
          disabled={uploading}
          onClick={handleRemoveBadge}
          className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg border border-red-200 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          title="Remove custom badge and restore default crest"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-600" />
          <span>Remove / Reset Badge</span>
        </button>
      </div>
    </div>
  );
};

interface SchoolBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SchoolBadgeModal: React.FC<SchoolBadgeModalProps> = ({ isOpen, onClose }) => {
  const { userProfile } = useAuth();
  const canManageBadge =
    userProfile?.role === 'super_admin' || userProfile?.role === 'admin';

  const badgeUrl = useSchoolBadgeUrl();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !canManageBadge) return;
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            setUploading(true);
            try {
              const dataUrl = await compressBadgeImageFile(file);
              await setGlobalSchoolBadgeUrl(dataUrl, true);
              setSavedNotice('School badge/logo updated across the entire portal in real time!');
              setTimeout(() => setSavedNotice(null), 3500);
            } finally {
              setUploading(false);
            }
          }
          break;
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen, canManageBadge]);

  if (!isOpen || !canManageBadge) return null;

  const handleFile = async (file: File | undefined) => {
    if (!file || !canManageBadge) return;
    setUploading(true);
    setSavedNotice(null);
    try {
      const dataUrl = await compressBadgeImageFile(file);
      await setGlobalSchoolBadgeUrl(dataUrl, true);
      setSavedNotice('School badge/logo updated across the entire portal in real time!');
      setTimeout(() => setSavedNotice(null), 3500);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveBadge = async () => {
    if (!canManageBadge) return;
    setUploading(true);
    setSavedNotice(null);
    try {
      await setGlobalSchoolBadgeUrl(null, true);
      setSavedNotice('Custom badge removed and default GSTC Garki crest restored.');
      setTimeout(() => setSavedNotice(null), 3500);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2.5">
            <SchoolBadge size="sm" />
            <div>
              <h3 className="font-bold text-sm text-stone-900">
                Official School Badge / Logo Manager
              </h3>
              <p className="text-[11px] text-stone-500">
                Super Admin &amp; Admin Exclusive • Global Identity Crest
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file && file.type.startsWith('image/')) {
              handleFile(file);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-emerald-300 hover:border-[#0b4d2c] bg-emerald-50/50 rounded-2xl p-6 text-center cursor-pointer transition space-y-3"
        >
          <div className="flex justify-center">
            <SchoolBadge size="xl" className="shadow-md" />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-800">
              Click to add/upload school badge image, drag &amp; drop, or paste (Ctrl+V)
            </p>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Supports JPEG, PNG, WebP • Automatically updates Navbar, Homepage, Login, Scratch Cards &amp; Report Cards
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              handleFile(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            disabled={uploading}
            className="px-4 py-2 bg-[#0b4d2c] hover:bg-[#083a21] text-white text-xs font-bold rounded-lg shadow-xs inline-flex items-center gap-1.5"
          >
            <ImageIcon className="w-3.5 h-3.5 text-amber-300" />
            <span>{uploading ? 'Applying Badge...' : 'Add / Upload Badge Image'}</span>
          </button>
        </div>

        {savedNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{savedNotice}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            disabled={uploading}
            onClick={handleRemoveBadge}
            className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg border border-red-200 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600" />
            <span>{badgeUrl !== defaultBadgeImage ? 'Remove Custom Badge' : 'Reset Default Badge'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

