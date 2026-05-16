'use client';
import { useState, FormEvent } from 'react';

interface VideoFormat {
  resolution: string;
  ext: string;
}

interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: number;
  formats: VideoFormat[];
}

// Platform တစ်ခုချင်းစီအတွက် Theme Color နှင့် စာသားများ သတ်မှတ်ခြင်း
const PLATFORMS = {
  all: {
    name: 'All-in-One',
    color: 'from-blue-600 to-indigo-600',
    borderColor: 'border-blue-500/30',
    focusRing: 'focus:ring-blue-500',
    placeholder: 'ဘယ် Platform က Link ပဲဖြစ်ဖြစ် ဒီမှာ ထည့်ပါ...',
    bg: 'bg-blue-600/10'
  },
  youtube: {
    name: 'YouTube',
    color: 'from-red-600 to-rose-700',
    borderColor: 'border-red-500/30',
    focusRing: 'focus:ring-red-500',
    placeholder: 'YouTube ဗီဒီယို သို့မဟုတ် Shorts Link ကို ဒီမှာ ထည့်ပါ...',
    bg: 'bg-red-600/10'
  },
  facebook: {
    name: 'Facebook',
    color: 'from-blue-700 to-sky-800',
    borderColor: 'border-blue-600/30',
    focusRing: 'focus:ring-blue-600',
    placeholder: 'Facebook ဗီဒီယို သို့မဟုတ် Reels Link ကို ဒီမှာ ထည့်ပါ...',
    bg: 'bg-blue-700/10'
  },
  tiktok: {
    name: 'TikTok',
    color: 'from-slate-800 via-pink-600 to-cyan-500',
    borderColor: 'border-pink-500/30',
    focusRing: 'focus:ring-pink-500',
    placeholder: 'TikTok ဗီဒီယို Link ကို ဒီမှာ ထည့်ပါ...',
    bg: 'bg-slate-800/20'
  },
  instagram: {
    name: 'Instagram',
    color: 'from-purple-600 via-pink-500 to-orange-400',
    borderColor: 'border-pink-500/30',
    focusRing: 'focus:ring-pink-400',
    placeholder: 'Instagram Video သို့မဟုတ် Reels Link ကို ဒီမှာ ထည့်ပါ...',
    bg: 'bg-purple-600/10'
  }
};

type PlatformKey = keyof typeof PLATFORMS;

export default function Home() {
  const [activePlatform, setActivePlatform] = useState<PlatformKey>('all');
  const [url, setUrl] = useState<string>('');
  const [loadingInfo, setLoadingInfo] = useState<boolean>(false);
  const [loadingDownload, setLoadingDownload] = useState<boolean>(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [selectedRes, setSelectedRes] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const currentTheme = PLATFORMS[activePlatform];

  const handlePlatformChange = (platform: PlatformKey) => {
    setActivePlatform(platform);
    // Platform ချိန်းလိုက်ရင် ယခင်ရှာထားတဲ့ အချက်အလက်တွေကို ရှင်းထုတ်ပေးခြင်း
    setUrl('');
    setVideoInfo(null);
    setMessage('');
  };

  const handleFetchInfo = async (e: FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoadingInfo(true);
    setMessage('');
    setVideoInfo(null);
    setSelectedRes('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) throw new Error('ဗီဒီယို အချက်အလက် ရှာမတွေ့ပါ။ Link မှန်ကန်မှု ရှိမရှိ ပြန်စစ်ပါ။');

      const data: VideoInfo = await response.json();
      setVideoInfo(data);
      if (data.formats.length > 0) {
        setSelectedRes(data.formats[0].resolution);
      }
    } catch (err: any) {
      setMessage(err.message || 'Error တက်သွားပါသည်။');
    } finally {
      setLoadingInfo(false);
    }
  };

  const handleDownload = async () => {
    if (!url || !selectedRes) return;

    setLoadingDownload(true);
    setMessage('ဖိုင်ကို ဒေါင်းလုဒ်လုပ်နေပါပြီ... ခဏစောင့်ပေးပါ...');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, resolution: selectedRes }),
      });

      if (!response.ok) throw new Error('Download ဆွဲရာတွင် အမှားအယွင်း ရှိနေပါသည်။');

      const isMp3 = selectedRes === "MP3 Audio";
      const fileExtension = isMp3 ? 'mp3' : 'mp4';

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${videoInfo?.title || 'download'}.${fileExtension}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      
      setMessage('ဒေါင်းလုဒ် အောင်မြင်စွာ ပြုလုပ်ပြီးပါပြီ။ 🎉');
    } catch (error: any) {
      setMessage(error.message || 'တစ်ခုခု မှားယွင်းသွားပါသည်။');
    } finally {
      setLoadingDownload(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-4 transition-all duration-500">
      <div className="w-full max-w-2xl p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl space-y-6">
        
        {/* Title နေရာ */}
        <div className="text-center">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
            INFERNO Downloader
          </h1>
          <p className="text-gray-400 text-xs mt-1">ကလစ်တစ်ချက်ရုံနဲ့ ဘယ် Platform ကမဆို အလွယ်တကူ ဒေါင်းလုဒ်ဆွဲပါ</p>
        </div>

        {/* 📱 နေရာ (၁) - Platform Selection Tab Buttons */}
        <div className="grid grid-cols-5 gap-2 p-1.5 rounded-2xl bg-black/40 border border-white/5 text-xs font-semibold">
          {(Object.keys(PLATFORMS) as PlatformKey[]).map((p) => (
            <button
              key={p}
              onClick={() => handlePlatformChange(p)}
              className={`py-2.5 rounded-xl transition-all duration-300 ${
                activePlatform === p
                  ? `bg-gradient-to-r ${PLATFORMS[p].color} text-white shadow-lg scale-105`
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {PLATFORMS[p].name}
            </button>
          ))}
        </div>

        {/* 💡 နေရာ (၂) - Dynamic Form Box */}
        <div className={`p-6 rounded-2xl border ${currentTheme.borderColor} ${currentTheme.bg} transition-all duration-500`}>
          <form onSubmit={handleFetchInfo} className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Mode: <span className="text-white">{currentTheme.name}</span>
              </span>
            </div>
            
            <input
              type="text"
              placeholder={currentTheme.placeholder}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-white/10 text-white focus:outline-none focus:ring-2 ${currentTheme.focusRing} text-sm transition-all`}
              disabled={loadingInfo || loadingDownload}
            />
            
            <button
              type="submit"
              disabled={loadingInfo || loadingDownload || !url}
              className={`w-full py-3 bg-gradient-to-r ${currentTheme.color} hover:opacity-90 font-bold rounded-xl transition-all text-sm shadow-md`}
            >
              {loadingInfo ? 'ဗီဒီယို အချက်အလက် ရှာဖွေနေဆဲ...' : `${currentTheme.name} ဗီဒီယို ရှာဖွေရန်`}
            </button>
          </form>
        </div>

        {/* 🎬 နေရာ (၃) - Video Info & Download Options Output */}
        {videoInfo && (
          <div className="p-4 rounded-2xl bg-slate-900 border border-white/5 space-y-4 animate-fade-in">
            <div className="md:flex gap-4 items-start">
              <img src={videoInfo.thumbnail} alt="thumbnail" className="w-full md:w-48 max-h-40 rounded-xl object-cover bg-black shadow-md mb-3 md:mb-0" />
              <div className="space-y-2 flex-1">
                <h2 className="font-bold text-sm md:text-base line-clamp-2">{videoInfo.title}</h2>
                {videoInfo.duration > 0 && (
                  <p className="text-xs text-slate-400">ကြာချိန်: {Math.round(videoInfo.duration / 60)} မိနစ်</p>
                )}
              </div>
            </div>
            
            <div className="border-t border-white/5 pt-3 space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-medium">Select Quality / Format:</label>
                <select
                  value={selectedRes}
                  onChange={(e) => setSelectedRes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none text-sm"
                >
                  {videoInfo.formats.map((f) => (
                    <option key={f.resolution} value={f.resolution}>
                      {f.resolution === "MP3 Audio" ? "🎵 MP3 Audio Only (သီချင်းသီးသန့်)" : f.resolution === "Default Quality Video" ? "🎬 Default Video Quality" : `🎬 ${f.resolution} (MP4 HD)`}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleDownload}
                disabled={loadingDownload || !selectedRes}
                className={`w-full py-3 bg-gradient-to-r ${currentTheme.color} hover:opacity-90 rounded-xl font-bold transition-all text-sm`}
              >
                {loadingDownload ? 'ဖိုင်ကို ရယူနေဆဲ...' : 'ဒေါင်းလုဒ်လုပ်မည်'}
              </button>
            </div>
          </div>
        )}

        {message && (
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center text-xs text-gray-300">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}