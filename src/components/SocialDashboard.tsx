"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Send,
  Plus,
  RefreshCw,
  Sparkles,
  Share2,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Layers,
  Image as ImageIcon,
  Building,
  Radio,
  FileText,
  Check,
  Globe,
  Sliders,
  ChevronRight,
  ArrowUpRight,
  User,
  Key,
  CreditCard,
  Moon,
  Sun,
  Video,
  Eye,
  EyeOff,
  Download,
  Flame,
  ShieldCheck,
  CheckCheck,
} from "lucide-react";

const PLATFORMS_CONFIG: Record<
  string,
  { label: string; tag: string; icon: string }
> = {
  INSTAGRAM: { label: "Instagram", tag: "IG", icon: "📸" },
  FACEBOOK: { label: "Facebook", tag: "FB", icon: "📘" },
  LINKEDIN: { label: "LinkedIn", tag: "IN", icon: "💼" },
  YOUTUBE: { label: "YouTube", tag: "YT", icon: "▶️" },
  PINTEREST: { label: "Pinterest", tag: "PIN", icon: "📌" },
  GOOGLE_BUSINESS: { label: "Google Business", tag: "GBP", icon: "📍" },
};

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function SocialDashboard() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<
    "composer" | "queue" | "channels" | "history" | "ai_studio" | "profile"
  >("composer");

  // Global Theme: dark vs light
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const isDark = theme === "dark";

  // Client workspace state
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [loadingClients, setLoadingClients] = useState(true);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");

  // Composer state
  const [postContent, setPostContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [scheduleType, setScheduleType] = useState<"QUEUE" | "SCHEDULE" | "NOW">("QUEUE");
  const [customDateTime, setCustomDateTime] = useState("");
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [postFeedback, setPostFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // AI Assistant state (Copywriting)
  const [aiTopic, setAiTopic] = useState("");
  const [aiKeywords, setAiKeywords] = useState("");
  const [aiTone, setAiTone] = useState("engaging");
  const [aiPlatform, setAiPlatform] = useState("INSTAGRAM");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any | null>(null);

  // AI Visual & Video Generator state
  const [aiStudioMode, setAiStudioMode] = useState<"COPY" | "MEDIA">("MEDIA");
  const [mediaPrompt, setMediaPrompt] = useState("");
  const [genMediaType, setGenMediaType] = useState<"IMAGE" | "VIDEO">("IMAGE");
  const [genAspectRatio, setGenAspectRatio] = useState("1:1");
  const [genStyle, setGenStyle] = useState("Fashion Editorial");
  const [isMediaGenerating, setIsMediaGenerating] = useState(false);
  const [generatedMediaResult, setGeneratedMediaResult] = useState<any | null>(null);

  // Queue & Posts state
  const [posts, setPosts] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [newSlotDay, setNewSlotDay] = useState(1);
  const [newSlotTime, setNewSlotTime] = useState("10:00");
  const [isCronRunning, setIsCronRunning] = useState(false);
  const [cronFeedback, setCronFeedback] = useState<string | null>(null);

  // Connect Channel Modal
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [connectPlatform, setConnectPlatform] = useState("INSTAGRAM");
  const [connectAccountName, setConnectAccountName] = useState("");
  const [connectAccountId, setConnectAccountId] = useState("");
  const [connectAccessToken, setConnectAccessToken] = useState("");

  // User Profile & Settings State
  const [profileName, setProfileName] = useState("Gaurav Sharma");
  const [profileEmail, setProfileEmail] = useState("gaurav@iifd.edu");
  const [profileOrg, setProfileOrg] = useState("Gaurav IIFD Studio");
  const [profileAvatar, setProfileAvatar] = useState(
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
  );
  const [profilePlan, setProfilePlan] = useState("Agency Enterprise");
  const [apiKeys, setApiKeys] = useState<{ [key: string]: string }>({
    geminiKey: "",
    openAiKey: "",
    metaToken: "",
    linkedInToken: "",
    pinterestToken: "",
    youtubeKey: "",
  });
  const [showKey, setShowKey] = useState<{ [key: string]: boolean }>({});
  const [profileFeedback, setProfileFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchClients();
    fetchUserSettings();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      loadClientData(selectedClient.id);
    }
  }, [selectedClient?.id]);

  const fetchUserSettings = async () => {
    try {
      const res = await fetch(`${BASE_PATH}/api/user/settings`);
      const data = await res.json();
      if (data.settings) {
        const s = data.settings;
        setProfileName(s.name || "Gaurav Sharma");
        setProfileEmail(s.email || "gaurav@iifd.edu");
        setProfileOrg(s.organization || "Gaurav IIFD Studio");
        if (s.avatarUrl) setProfileAvatar(s.avatarUrl);
        if (s.theme) setTheme(s.theme);
        if (s.apiKeys) setApiKeys(s.apiKeys);
      }
    } catch (err) {
      console.error("Failed to load user settings:", err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_PATH}/api/user/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileName,
          email: profileEmail,
          organization: profileOrg,
          avatarUrl: profileAvatar,
          theme,
          apiKeys,
        }),
      });
      const data = await res.json();
      if (data.settings) {
        setProfileFeedback("Settings & API keys saved successfully.");
        setTimeout(() => setProfileFeedback(null), 3000);
      }
    } catch (err: any) {
      console.error("Save profile error:", err);
    }
  };

  const toggleTheme = (newTheme: "dark" | "light") => {
    setTheme(newTheme);
    fetch(`${BASE_PATH}/api/user/settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: newTheme }),
    }).catch(console.error);
  };

  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      const res = await fetch(`${BASE_PATH}/api/clients`);
      const data = await res.json();
      if (data.clients && data.clients.length > 0) {
        setClients(data.clients);
        if (!selectedClient) {
          setSelectedClient(data.clients[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load clients:", err);
    } finally {
      setLoadingClients(false);
    }
  };

  const loadClientData = async (clientId: string) => {
    try {
      const postsRes = await fetch(`${BASE_PATH}/api/posts?clientId=${clientId}`);
      const postsData = await postsRes.json();
      if (postsData.posts) setPosts(postsData.posts);

      const schedRes = await fetch(`${BASE_PATH}/api/schedules?clientId=${clientId}`);
      const schedData = await schedRes.json();
      if (schedData.schedules) setSchedules(schedData.schedules);

      const currentClientObj = clients.find((c) => c.id === clientId) || selectedClient;
      if (currentClientObj?.accounts) {
        setSelectedAccountIds(currentClientObj.accounts.map((a: any) => a.id));
      }
    } catch (err) {
      console.error("Error loading client data:", err);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;
    try {
      const res = await fetch(`${BASE_PATH}/api/clients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newClientName.trim() }),
      });
      const data = await res.json();
      if (data.client) {
        setClients([...clients, data.client]);
        setSelectedClient(data.client);
        setNewClientName("");
        setIsAddClientModalOpen(false);
      }
    } catch (err) {
      console.error("Create client error:", err);
    }
  };

  const toggleAccountSelection = (accountId: string) => {
    setSelectedAccountIds((prev) =>
      prev.includes(accountId) ? prev.filter((id) => id !== accountId) : [...prev, accountId]
    );
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    if (!postContent.trim()) {
      setPostFeedback({ type: "error", message: "Please enter your post caption." });
      return;
    }
    if (selectedAccountIds.length === 0) {
      setPostFeedback({ type: "error", message: "Select at least one connected channel." });
      return;
    }

    try {
      setIsSubmittingPost(true);
      setPostFeedback(null);

      const mediaUrls = mediaUrl.trim() ? [mediaUrl.trim()] : [];
      const mediaType = mediaUrls.length > 0 ? (mediaUrl.includes(".mp4") ? "VIDEO" : "IMAGE") : "TEXT_ONLY";

      const res = await fetch(`${BASE_PATH}/api/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClient.id,
          content: postContent,
          mediaUrls,
          mediaType,
          targetAccountIds: selectedAccountIds,
          scheduleType,
          scheduledAt: scheduleType === "SCHEDULE" ? customDateTime : null,
        }),
      });

      const data = await res.json();
      if (res.ok && data.post) {
        setPostFeedback({
          type: "success",
          message:
            scheduleType === "NOW"
              ? "🚀 Post published successfully across target channels."
              : "📅 Post scheduled into automated publishing queue.",
        });
        setPostContent("");
        setMediaUrl("");
        loadClientData(selectedClient.id);
      } else {
        setPostFeedback({ type: "error", message: data.error || "Failed to submit post." });
      }
    } catch (err: any) {
      setPostFeedback({ type: "error", message: err.message || "An error occurred." });
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!aiTopic.trim()) return;
    try {
      setIsAiLoading(true);
      const res = await fetch(`${BASE_PATH}/api/ai/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: aiTopic,
          keywords: aiKeywords,
          tone: aiTone,
          platform: aiPlatform,
        }),
      });
      const data = await res.json();
      if (data.content) {
        setAiResult(data);
      }
    } catch (err) {
      console.error("AI Generation error:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleGenerateMedia = async () => {
    if (!mediaPrompt.trim()) return;
    try {
      setIsMediaGenerating(true);
      const res = await fetch(`${BASE_PATH}/api/ai/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: mediaPrompt,
          mediaType: genMediaType,
          aspectRatio: genAspectRatio,
          style: genStyle,
        }),
      });
      const data = await res.json();
      if (data.mediaUrl) {
        setGeneratedMediaResult(data);
      }
    } catch (err) {
      console.error("Media gen error:", err);
    } finally {
      setIsMediaGenerating(false);
    }
  };

  const handleAttachMediaToComposer = () => {
    if (generatedMediaResult?.mediaUrl) {
      setMediaUrl(generatedMediaResult.mediaUrl);
      if (!postContent.trim() && mediaPrompt) {
        setPostContent(`✨ Created with Gaurav IIFD AI Studio: "${mediaPrompt}"\n\n#IIFDFashion #AIStudio #CreativeMedia #NextGenDesign`);
      }
      setActiveTab("composer");
    }
  };

  const handleApplyAiToComposer = () => {
    if (aiResult?.content) {
      setPostContent(aiResult.content);
      setActiveTab("composer");
    }
  };

  const handleAddScheduleSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    try {
      const res = await fetch(`${BASE_PATH}/api/schedules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClient.id,
          dayOfWeek: Number(newSlotDay),
          timeSlot: newSlotTime,
        }),
      });
      const data = await res.json();
      if (data.schedule) {
        setSchedules([...schedules, data.schedule]);
      }
    } catch (err) {
      console.error("Add schedule error:", err);
    }
  };

  const handleDeleteScheduleSlot = async (id: string) => {
    try {
      await fetch(`${BASE_PATH}/api/schedules?id=${id}`, { method: "DELETE" });
      setSchedules(schedules.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Delete schedule error:", err);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    try {
      await fetch(`${BASE_PATH}/api/posts/${id}`, { method: "DELETE" });
      setPosts(posts.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Delete post error:", err);
    }
  };

  const handleTriggerAutomation = async () => {
    try {
      setIsCronRunning(true);
      setCronFeedback(null);
      const res = await fetch(`${BASE_PATH}/api/cron/publish`, { method: "POST" });
      const data = await res.json();
      setCronFeedback(data.message || "Queue checked.");
      if (selectedClient) loadClientData(selectedClient.id);
      setTimeout(() => setCronFeedback(null), 4000);
    } catch (err: any) {
      setCronFeedback("Automation error: " + err.message);
    } finally {
      setIsCronRunning(false);
    }
  };

  const handleConnectAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !connectAccountName.trim()) return;
    try {
      const res = await fetch(`${BASE_PATH}/api/accounts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClient.id,
          platform: connectPlatform,
          accountName: connectAccountName.trim(),
          accountId: connectAccountId.trim() || undefined,
          accessToken: connectAccessToken.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.account) {
        await fetchClients();
        setIsConnectModalOpen(false);
        setConnectAccountName("");
        setConnectAccountId("");
        setConnectAccessToken("");
      }
    } catch (err) {
      console.error("Connect account error:", err);
    }
  };

  const activeClientAccounts = selectedClient?.accounts || [];
  const scheduledPosts = posts.filter((p) => p.status === "SCHEDULED");
  const publishedPosts = posts.filter((p) => p.status === "PUBLISHED");

  // Readable Theme Classes
  const bgMain = isDark ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900";
  const bgCard = isDark ? "bg-zinc-900/60 border-zinc-800" : "bg-white border-zinc-200 shadow-sm";
  const bgInput = isDark ? "bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-500" : "bg-zinc-50 border-zinc-300 text-zinc-900 placeholder:text-zinc-400";
  const borderSubtle = isDark ? "border-zinc-800" : "border-zinc-200";
  const textMuted = isDark ? "text-zinc-400" : "text-zinc-600";
  const textSubtle = isDark ? "text-zinc-500" : "text-zinc-400";
  const navHover = isDark ? "hover:bg-zinc-900 hover:text-zinc-100" : "hover:bg-zinc-100 hover:text-zinc-950";
  const btnPrimary = isDark
    ? "bg-zinc-100 hover:bg-white text-zinc-950 font-bold shadow-md"
    : "bg-zinc-950 hover:bg-zinc-800 text-white font-bold shadow-md";
  const btnSecondary = isDark
    ? "bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-700"
    : "bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-300";

  return (
    <div className={`flex h-screen ${bgMain} overflow-hidden font-sans text-sm antialiased transition-colors duration-200`}>
      {/* SIDEBAR NAVIGATION - READABLE & GENEROUS */}
      <aside className={`w-72 border-r ${borderSubtle} flex flex-col justify-between shrink-0 ${isDark ? "bg-zinc-950" : "bg-white"}`}>
        <div>
          {/* BRAND */}
          <div className={`h-20 border-b ${borderSubtle} px-6 flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-950 font-black text-sm tracking-wider shadow">
                GI
              </div>
              <div>
                <span className="font-bold text-base tracking-tight block">Gaurav IIFD</span>
                <span className={`text-xs ${textMuted} block font-medium`}>Social Automation Hub</span>
              </div>
            </div>
            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${isDark ? "bg-zinc-900 border-zinc-700 text-zinc-300" : "bg-zinc-100 border-zinc-200 text-zinc-700"}`}>
              v2.0
            </span>
          </div>

          {/* CLIENT WORKSPACE SWITCHER */}
          <div className={`p-5 border-b ${borderSubtle} ${isDark ? "bg-zinc-900/30" : "bg-zinc-50"}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold uppercase tracking-wider ${textMuted}`}>
                Client Workspace
              </span>
              <button
                onClick={() => setIsAddClientModalOpen(true)}
                title="Create Workspace"
                className={`text-xs font-bold flex items-center gap-1 ${isDark ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-800"}`}
              >
                <Plus className="w-3.5 h-3.5" />
                Add Client
              </button>
            </div>

            <select
              value={selectedClient?.id || ""}
              onChange={(e) => {
                const found = clients.find((c) => c.id === e.target.value);
                if (found) setSelectedClient(found);
              }}
              className={`w-full text-sm font-semibold border rounded-lg px-3 py-2.5 focus:outline-none ${bgInput}`}
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <div className={`mt-3 flex items-center justify-between text-xs ${textMuted} font-medium`}>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                {activeClientAccounts.length} channel(s) active
              </span>
              <span className="font-semibold">{scheduledPosts.length} in queue</span>
            </div>
          </div>

          {/* NAV TABS */}
          <nav className="p-4 space-y-2">
            <button
              onClick={() => setActiveTab("composer")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-semibold transition ${
                activeTab === "composer"
                  ? isDark
                    ? "bg-zinc-900 text-white border border-zinc-700 shadow"
                    : "bg-zinc-900 text-white shadow"
                  : `${textMuted} ${navHover}`
              }`}
            >
              <Send className="w-4 h-4 shrink-0" />
              Post Composer
            </button>

            <button
              onClick={() => setActiveTab("queue")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition ${
                activeTab === "queue"
                  ? isDark
                    ? "bg-zinc-900 text-white border border-zinc-700 shadow"
                    : "bg-zinc-900 text-white shadow"
                  : `${textMuted} ${navHover}`
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Clock className="w-4 h-4 shrink-0" />
                Queue & Schedule
              </div>
              {scheduledPosts.length > 0 && (
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {scheduledPosts.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("channels")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition ${
                activeTab === "channels"
                  ? isDark
                    ? "bg-zinc-900 text-white border border-zinc-700 shadow"
                    : "bg-zinc-900 text-white shadow"
                  : `${textMuted} ${navHover}`
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Share2 className="w-4 h-4 shrink-0" />
                Channels & APIs
              </div>
              <span className="text-xs font-mono bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{activeClientAccounts.length}</span>
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition ${
                activeTab === "history"
                  ? isDark
                    ? "bg-zinc-900 text-white border border-zinc-700 shadow"
                    : "bg-zinc-900 text-white shadow"
                  : `${textMuted} ${navHover}`
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Layers className="w-4 h-4 shrink-0" />
                Post History
              </div>
              <span className="text-xs font-mono bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{posts.length}</span>
            </button>

            <button
              onClick={() => setActiveTab("ai_studio")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition ${
                activeTab === "ai_studio"
                  ? isDark
                    ? "bg-gradient-to-r from-rose-950 to-indigo-950 text-white border border-rose-500/40 shadow-lg"
                    : "bg-rose-500 text-white shadow-lg"
                  : `${textMuted} ${navHover}`
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Sparkles className="w-4 h-4 shrink-0 text-rose-400" />
                AI Creative & Video
              </div>
              <span className="text-xs bg-rose-500/20 text-rose-300 font-bold px-2 py-0.5 rounded border border-rose-500/30">
                PRO
              </span>
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-semibold transition ${
                activeTab === "profile"
                  ? isDark
                    ? "bg-zinc-900 text-white border border-zinc-700 shadow"
                    : "bg-zinc-900 text-white shadow"
                  : `${textMuted} ${navHover}`
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              Profile & Settings
            </button>
          </nav>
        </div>

        {/* WORKER FOOTER */}
        <div className={`p-5 border-t ${borderSubtle} ${isDark ? "bg-zinc-900/30" : "bg-zinc-50"}`}>
          <div className={`flex items-center justify-between text-xs mb-3 font-semibold ${textMuted}`}>
            <span className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              Auto-Queue Worker
            </span>
            <span className="text-xs text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              ACTIVE
            </span>
          </div>

          <button
            onClick={handleTriggerAutomation}
            disabled={isCronRunning}
            className={`w-full text-xs font-bold py-2.5 px-3.5 rounded-lg flex items-center justify-center gap-2 border transition disabled:opacity-50 ${btnSecondary}`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCronRunning ? "animate-spin text-indigo-400" : ""}`} />
            {isCronRunning ? "Publishing due..." : "Run Due Queue Now"}
          </button>

          {cronFeedback && (
            <p className={`mt-2 text-xs p-2 rounded border text-center font-medium ${isDark ? "bg-zinc-900 border-zinc-800 text-zinc-200" : "bg-zinc-100 border-zinc-200 text-zinc-800"}`}>
              {cronFeedback}
            </p>
          )}
        </div>
      </aside>

      {/* MAIN VIEW AREA */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* HEADER BAR */}
        <header className={`h-20 border-b ${borderSubtle} px-8 flex items-center justify-between backdrop-blur sticky top-0 z-10 ${isDark ? "bg-zinc-950/80" : "bg-white/80"}`}>
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              {activeTab === "composer" && "Post Composer & Multi-Channel Publish"}
              {activeTab === "queue" && "Queue Automation & Daily Posting Slots"}
              {activeTab === "channels" && "Connected Social Media Accounts & APIs"}
              {activeTab === "history" && "Post Activity & History Logs"}
              {activeTab === "ai_studio" && "Gaurav IIFD Generative Studio (Images, Videos & Copy)"}
              {activeTab === "profile" && "User Profile, API Keys & Settings"}
            </h2>
            <p className={`text-xs sm:text-sm ${textMuted} mt-0.5`}>
              Client Brand: <span className="font-bold text-indigo-400">{selectedClient?.name || "Loading..."}</span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme switcher */}
            <button
              onClick={() => toggleTheme(isDark ? "light" : "dark")}
              title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
              className={`px-3.5 py-2 rounded-lg border text-xs font-bold flex items-center gap-2 transition ${btnSecondary}`}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
              <span className="capitalize">{theme} Mode</span>
            </button>

            <button
              onClick={() => setActiveTab("ai_studio")}
              className="text-xs sm:text-sm font-bold bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition"
            >
              <Sparkles className="w-4 h-4" />
              Generate Image/Video
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-500/50 shadow shrink-0"
              title="Profile Settings"
            >
              <img src={profileAvatar} alt="Profile" className="w-full h-full object-cover" />
            </button>
          </div>
        </header>

        {/* TAB 1: COMPOSER */}
        {activeTab === "composer" && (
          <div className="p-8 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {postFeedback && (
                <div
                  className={`p-4 rounded-lg flex items-center gap-3 border text-sm font-semibold ${
                    postFeedback.type === "success"
                      ? isDark
                        ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                        : "bg-emerald-50 border-emerald-300 text-emerald-800"
                      : "bg-red-950/40 border-red-500/40 text-red-300"
                  }`}
                >
                  {postFeedback.type === "success" ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                  )}
                  <span>{postFeedback.message}</span>
                </div>
              )}

              {/* 1. CHANNELS SELECTOR */}
              <div className={`border rounded-xl p-6 ${bgCard}`}>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-sm font-bold uppercase tracking-wider ${textMuted}`}>
                    1. Select Channels to Post
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedAccountIds.length === activeClientAccounts.length) {
                        setSelectedAccountIds([]);
                      } else {
                        setSelectedAccountIds(activeClientAccounts.map((a: any) => a.id));
                      }
                    }}
                    className="text-xs font-bold text-indigo-400 hover:underline"
                  >
                    {selectedAccountIds.length === activeClientAccounts.length ? "Deselect All" : "Select All"}
                  </button>
                </div>

                {activeClientAccounts.length === 0 ? (
                  <div className={`p-6 rounded-lg border text-center ${borderSubtle}`}>
                    <p className={`text-sm ${textMuted} mb-3`}>No social channels linked for this client.</p>
                    <button
                      onClick={() => setActiveTab("channels")}
                      className={`text-sm px-4 py-2 rounded-lg font-bold ${btnPrimary}`}
                    >
                      Connect Channels
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {activeClientAccounts.map((acc: any) => {
                      const cfg = PLATFORMS_CONFIG[acc.platform] || {
                        label: acc.platform,
                        tag: acc.platform.substring(0, 2),
                        icon: "🌐",
                      };
                      const isSelected = selectedAccountIds.includes(acc.id);

                      return (
                        <div
                          key={acc.id}
                          onClick={() => toggleAccountSelection(acc.id)}
                          className={`p-3.5 rounded-lg border cursor-pointer transition flex items-center justify-between select-none ${
                            isSelected
                              ? isDark
                                ? "bg-zinc-800 border-zinc-600 text-white ring-1 ring-zinc-500 shadow-md"
                                : "bg-zinc-100 border-zinc-950 text-zinc-950 font-bold shadow-md"
                              : `${borderSubtle} opacity-70 hover:opacity-100`
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <span className="text-base mr-2">{cfg.icon}</span>
                            <span className="text-sm font-semibold truncate">{acc.accountName}</span>
                          </div>
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? isDark
                                  ? "bg-white text-zinc-950"
                                  : "bg-zinc-950 text-white"
                                : "border-zinc-500"
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 font-bold" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 2. POST CONTENT & MEDIA */}
              <div className={`border rounded-xl p-6 space-y-4 ${bgCard}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-bold uppercase tracking-wider ${textMuted}`}>
                    2. Write Post Caption & Hashtags
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("ai_studio")}
                    className="text-xs sm:text-sm font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4" />
                    AI Copy Generator
                  </button>
                </div>

                <div className="relative">
                  <textarea
                    rows={6}
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Compose updates, announcements, captions, or campaign details..."
                    className={`w-full rounded-lg p-4 text-sm focus:outline-none transition resize-none leading-relaxed border ${bgInput}`}
                  />
                  <div className={`flex justify-between items-center text-xs ${textMuted} mt-2`}>
                    <span className="font-medium">{postContent.length} characters</span>
                    <span>Supports multi-platform formatting & emojis</span>
                  </div>
                </div>

                {/* MEDIA URL */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={`text-sm block flex items-center gap-2 font-semibold ${textMuted}`}>
                      <ImageIcon className="w-4 h-4 text-indigo-400" />
                      Image / Video Creative URL
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setAiStudioMode("MEDIA");
                        setActiveTab("ai_studio");
                      }}
                      className="text-xs font-bold text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Generate Visual with AI
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      placeholder="https://... creative image or video URL"
                      className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-mono border focus:outline-none ${bgInput}`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setMediaUrl("https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&auto=format&fit=crop&q=80")
                      }
                      className={`text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-lg border whitespace-nowrap ${btnSecondary}`}
                    >
                      Sample Image
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. SCHEDULING STRATEGY */}
              <div className={`border rounded-xl p-6 space-y-4 ${bgCard}`}>
                <span className={`text-sm font-bold uppercase tracking-wider block ${textMuted}`}>
                  3. Scheduling & Publish Strategy
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div
                    onClick={() => setScheduleType("QUEUE")}
                    className={`p-4 rounded-xl border cursor-pointer transition ${
                      scheduleType === "QUEUE"
                        ? isDark
                          ? "bg-zinc-800 border-zinc-500 text-white ring-1 ring-zinc-500 shadow-md"
                          : "bg-zinc-100 border-zinc-950 text-zinc-950 font-bold shadow-md"
                        : `${borderSubtle} opacity-70 hover:opacity-100`
                    }`}
                  >
                    <div className="font-bold text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      Buffer-Style Queue
                    </div>
                    <p className={`text-xs mt-1.5 ${textMuted} leading-normal`}>
                      Auto-assigns to next available daily time slot
                    </p>
                  </div>

                  <div
                    onClick={() => setScheduleType("SCHEDULE")}
                    className={`p-4 rounded-xl border cursor-pointer transition ${
                      scheduleType === "SCHEDULE"
                        ? isDark
                          ? "bg-zinc-800 border-zinc-500 text-white ring-1 ring-zinc-500 shadow-md"
                          : "bg-zinc-100 border-zinc-950 text-zinc-950 font-bold shadow-md"
                        : `${borderSubtle} opacity-70 hover:opacity-100`
                    }`}
                  >
                    <div className="font-bold text-sm flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      Specific Date/Time
                    </div>
                    <p className={`text-xs mt-1.5 ${textMuted} leading-normal`}>Pick an exact custom date and time</p>
                  </div>

                  <div
                    onClick={() => setScheduleType("NOW")}
                    className={`p-4 rounded-xl border cursor-pointer transition ${
                      scheduleType === "NOW"
                        ? isDark
                          ? "bg-zinc-800 border-zinc-500 text-white ring-1 ring-zinc-500 shadow-md"
                          : "bg-zinc-100 border-zinc-950 text-zinc-950 font-bold shadow-md"
                        : `${borderSubtle} opacity-70 hover:opacity-100`
                    }`}
                  >
                    <div className="font-bold text-sm flex items-center gap-2">
                      <Send className="w-4 h-4 text-emerald-400" />
                      Publish Now
                    </div>
                    <p className={`text-xs mt-1.5 ${textMuted} leading-normal`}>Dispatches immediately to platforms</p>
                  </div>
                </div>

                {scheduleType === "SCHEDULE" && (
                  <div className="pt-2">
                    <label className={`text-sm block mb-1.5 font-semibold ${textMuted}`}>Select Custom Date & Time:</label>
                    <input
                      type="datetime-local"
                      value={customDateTime}
                      onChange={(e) => setCustomDateTime(e.target.value)}
                      className={`border rounded-lg px-4 py-2.5 text-sm focus:outline-none ${bgInput}`}
                    />
                  </div>
                )}

                <div className="pt-3 flex justify-end">
                  <button
                    onClick={handleCreatePost}
                    disabled={isSubmittingPost}
                    className={`w-full sm:w-auto px-8 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition disabled:opacity-50 ${btnPrimary}`}
                  >
                    {isSubmittingPost ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : scheduleType === "NOW" ? (
                      <>
                        <Send className="w-4 h-4" />
                        Publish Immediately
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4" />
                        Schedule Update
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT 1 COL: PREVIEW */}
            <div className="space-y-6">
              <div className={`border rounded-xl p-6 ${bgCard}`}>
                <div className={`flex items-center justify-between mb-4 pb-3 border-b ${borderSubtle}`}>
                  <span className={`text-sm font-bold uppercase tracking-wider ${textMuted}`}>
                    Live Feed Preview
                  </span>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${isDark ? "bg-zinc-800 border-zinc-700 text-zinc-300" : "bg-zinc-100 border-zinc-300 text-zinc-800"}`}>
                    FEED CARD
                  </span>
                </div>

                {/* Minimal Post Card */}
                <div className={`border rounded-xl overflow-hidden shadow-sm ${isDark ? "bg-zinc-950 border-zinc-800" : "bg-white border-zinc-200"}`}>
                  <div className={`p-4 flex items-center gap-3 border-b ${borderSubtle}`}>
                    <div className="w-9 h-9 rounded-full bg-zinc-800 text-white flex items-center justify-center text-xs font-bold shadow">
                      {selectedClient?.name?.substring(0, 2).toUpperCase() || "GI"}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{selectedClient?.name || "Brand Name"}</p>
                      <p className={`text-xs ${textMuted}`}>Scheduled Feed Update • 🌍 Public</p>
                    </div>
                  </div>

                  <div className="p-4 text-sm whitespace-pre-wrap leading-relaxed min-h-[90px]">
                    {postContent || (
                      <span className={`${textMuted} italic`}>Post caption, hashtags, and links preview here in real-time...</span>
                    )}
                  </div>

                  {mediaUrl && (
                    <div className={`border-t ${borderSubtle} max-h-64 overflow-hidden`}>
                      {mediaUrl.includes(".mp4") ? (
                        <video src={mediaUrl} controls className="w-full max-h-64 object-cover" />
                      ) : (
                        <img
                          src={mediaUrl}
                          alt="Creative"
                          className="w-full object-cover max-h-64"
                          onError={(e) => {
                            (e.target as any).src = "https://placehold.co/600x400/18181b/white?text=Creative+Preview";
                          }}
                        />
                      )}
                    </div>
                  )}

                  <div className={`p-3.5 border-t ${borderSubtle} flex justify-between text-xs font-semibold ${textMuted}`}>
                    <span className="hover:text-zinc-200 cursor-pointer">❤️ Like</span>
                    <span className="hover:text-zinc-200 cursor-pointer">💬 Comment</span>
                    <span className="hover:text-zinc-200 cursor-pointer">↗️ Share</span>
                  </div>
                </div>

                <div className={`mt-5 pt-4 border-t ${borderSubtle}`}>
                  <p className={`text-xs uppercase font-bold mb-2.5 ${textMuted}`}>Target Platforms:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedAccountIds.map((accId) => {
                      const acc = activeClientAccounts.find((a: any) => a.id === accId);
                      if (!acc) return null;
                      const cfg = PLATFORMS_CONFIG[acc.platform];
                      return (
                        <span
                          key={accId}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${isDark ? "bg-zinc-900 border-zinc-700 text-zinc-200" : "bg-zinc-100 border-zinc-300 text-zinc-800"}`}
                        >
                          {cfg?.icon} {acc.platform}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: QUEUE & SCHEDULE */}
        {activeTab === "queue" && (
          <div className="p-8 max-w-6xl mx-auto w-full space-y-6">
            <div className={`border rounded-xl p-6 ${bgCard}`}>
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b ${borderSubtle}`}>
                <div>
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-400" />
                    Automated Daily Posting Schedule Slots (Buffer-Style)
                  </h3>
                  <p className={`text-xs sm:text-sm mt-1 ${textMuted}`}>
                    Recurring daily time slots for {selectedClient?.name}. When you click "Add to Queue", posts automatically fill these times.
                  </p>
                </div>

                <form onSubmit={handleAddScheduleSlot} className="flex items-center gap-2">
                  <select
                    value={newSlotDay}
                    onChange={(e) => setNewSlotDay(Number(e.target.value))}
                    className={`border rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none ${bgInput}`}
                  >
                    {DAYS_OF_WEEK.map((d, idx) => (
                      <option key={d} value={idx}>
                        {d}
                      </option>
                    ))}
                  </select>

                  <input
                    type="time"
                    value={newSlotTime}
                    onChange={(e) => setNewSlotTime(e.target.value)}
                    className={`border rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none ${bgInput}`}
                  />

                  <button
                    type="submit"
                    className={`text-xs sm:text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 ${btnPrimary}`}
                  >
                    <Plus className="w-4 h-4" />
                    Add Slot
                  </button>
                </form>
              </div>

              {/* DAY SLOTS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {DAYS_OF_WEEK.map((dayName, dayIndex) => {
                  const daySlots = schedules.filter((s) => s.dayOfWeek === dayIndex);
                  return (
                    <div key={dayName} className={`border rounded-xl p-4 ${isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"}`}>
                      <div className={`flex items-center justify-between mb-3 pb-2 border-b ${borderSubtle}`}>
                        <span className="text-sm font-bold">{dayName}</span>
                        <span className={`text-xs font-semibold ${textMuted}`}>{daySlots.length} slot(s)</span>
                      </div>

                      {daySlots.length === 0 ? (
                        <p className={`text-xs italic ${textMuted}`}>No slots</p>
                      ) : (
                        <div className="space-y-2">
                          {daySlots.map((slot) => (
                            <div
                              key={slot.id}
                              className={`flex items-center justify-between px-3 py-1.5 rounded-lg border text-sm ${isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-300"}`}
                            >
                              <span className="font-mono font-bold text-indigo-400">{slot.timeSlot}</span>
                              <button
                                onClick={() => handleDeleteScheduleSlot(slot.id)}
                                className="text-zinc-500 hover:text-red-500 transition"
                                title="Remove slot"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* QUEUED POSTS */}
            <div className={`border rounded-xl p-6 ${bgCard}`}>
              <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                Upcoming Queued & Scheduled Posts
              </h3>

              {scheduledPosts.length === 0 ? (
                <div className={`p-10 text-center rounded-xl border ${borderSubtle}`}>
                  <p className={`text-sm ${textMuted}`}>Queue is currently empty.</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {scheduledPosts.map((post) => {
                    const media = JSON.parse(post.mediaUrls || "[]");
                    return (
                      <div
                        key={post.id}
                        className={`border rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start justify-between ${isDark ? "bg-zinc-950 border-zinc-800" : "bg-white border-zinc-200"}`}
                      >
                        <div className="flex gap-4">
                          {media.length > 0 && (
                            <img
                              src={media[0]}
                              alt="Creative"
                              className="w-16 h-16 rounded-lg object-cover shrink-0 border border-zinc-700"
                            />
                          )}
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${isDark ? "bg-zinc-900 border-zinc-700 text-indigo-300" : "bg-zinc-100 border-zinc-300 text-zinc-800"}`}>
                                {post.scheduledAt ? new Date(post.scheduledAt).toLocaleString() : "Queued"}
                              </span>
                              <span className={`text-xs ${textMuted}`}>
                                {post.targets?.length || 0} platform(s)
                              </span>
                            </div>
                            <p className="text-sm font-normal line-clamp-2 max-w-xl">{post.content}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="text-zinc-500 hover:text-red-500 p-2 self-end sm:self-center transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: CHANNELS */}
        {activeTab === "channels" && (
          <div className="p-8 max-w-6xl mx-auto w-full space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Connected Social Media Accounts</h3>
                <p className={`text-xs sm:text-sm ${textMuted}`}>
                  Manage account connections and API keys for <span className="font-bold text-indigo-400">{selectedClient?.name}</span>
                </p>
              </div>

              <button
                onClick={() => setIsConnectModalOpen(true)}
                className={`text-xs sm:text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-2 ${btnPrimary}`}
              >
                <Plus className="w-4 h-4" />
                Connect Channel
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Object.keys(PLATFORMS_CONFIG).map((platformKey) => {
                const cfg = PLATFORMS_CONFIG[platformKey];
                const connectedAccounts = activeClientAccounts.filter((a: any) => a.platform === platformKey);
                const isConnected = connectedAccounts.length > 0;

                return (
                  <div
                    key={platformKey}
                    className={`rounded-xl border p-5 flex flex-col justify-between transition ${
                      isConnected
                        ? isDark
                          ? "bg-zinc-900/60 border-zinc-700 shadow-md"
                          : "bg-white border-zinc-300 shadow-md"
                        : "opacity-60 border-dashed"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{cfg.icon}</span>
                          <span className="font-bold text-sm">{cfg.label}</span>
                        </div>

                        <span
                          className={`text-xs font-mono px-2 py-0.5 rounded border font-bold ${
                            isConnected
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                              : `${borderSubtle} ${textMuted}`
                          }`}
                        >
                          {isConnected ? "CONNECTED" : "INACTIVE"}
                        </span>
                      </div>

                      {isConnected ? (
                        <div className="space-y-2 mt-2">
                          {connectedAccounts.map((acc: any) => (
                            <div
                              key={acc.id}
                              className={`p-3 rounded-lg border flex items-center justify-between text-sm ${isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"}`}
                            >
                              <div className="min-w-0 pr-2">
                                <p className="font-bold truncate text-sm">{acc.accountName}</p>
                                <p className={`text-xs font-mono truncate ${textMuted}`}>ID: {acc.accountId}</p>
                              </div>
                              <button
                                onClick={async () => {
                                  if (confirm(`Disconnect ${acc.accountName}?`)) {
                                    await fetch(`${BASE_PATH}/api/accounts/${acc.id}`, { method: "DELETE" });
                                    await fetchClients();
                                  }
                                }}
                                className="text-zinc-500 hover:text-red-500 p-1.5 transition"
                                title="Disconnect"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className={`text-xs mt-2 ${textMuted}`}>
                          Connect {cfg.label} for automated posting and schedule sync.
                        </p>
                      )}
                    </div>

                    <div className={`mt-5 pt-3 border-t ${borderSubtle}`}>
                      <button
                        onClick={() => {
                          setConnectPlatform(platformKey);
                          setIsConnectModalOpen(true);
                        }}
                        className={`w-full text-xs font-bold py-2 rounded-lg border transition ${btnSecondary}`}
                      >
                        {isConnected ? "+ Add Another Page" : "Connect Account"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: HISTORY */}
        {activeTab === "history" && (
          <div className="p-8 max-w-6xl mx-auto w-full space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Post Activity & Dispatch History</h3>
                <p className={`text-xs sm:text-sm ${textMuted}`}>Review all published, scheduled, and draft posts</p>
              </div>
              <button
                onClick={() => selectedClient && loadClientData(selectedClient.id)}
                className={`text-xs sm:text-sm font-bold px-4 py-2 rounded-lg border flex items-center gap-2 ${btnSecondary}`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
            </div>

            {posts.length === 0 ? (
              <div className={`p-10 text-center border rounded-xl ${borderSubtle}`}>
                <p className={`text-sm ${textMuted}`}>No post activity recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => {
                  const media = JSON.parse(post.mediaUrls || "[]");
                  const isPublished = post.status === "PUBLISHED";
                  const isScheduled = post.status === "SCHEDULED";

                  return (
                    <div
                      key={post.id}
                      className={`border rounded-xl p-5 flex flex-col md:flex-row gap-5 items-start justify-between ${bgCard}`}
                    >
                      <div className="flex gap-4 min-w-0 flex-1">
                        {media.length > 0 && (
                          <img
                            src={media[0]}
                            alt="Creative"
                            className="w-20 h-20 rounded-lg object-cover shrink-0 border border-zinc-700"
                          />
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2.5 mb-2">
                            <span
                              className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${
                                isPublished
                                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                                  : isScheduled
                                  ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                                  : "bg-red-500/10 border-red-500/30 text-red-400"
                              }`}
                            >
                              {post.status}
                            </span>

                            <span className={`text-xs font-medium ${textMuted}`}>
                              {isPublished && post.publishedAt
                                ? `Published: ${new Date(post.publishedAt).toLocaleString()}`
                                : isScheduled && post.scheduledAt
                                ? `Scheduled: ${new Date(post.scheduledAt).toLocaleString()}`
                                : `Created: ${new Date(post.createdAt).toLocaleDateString()}`}
                            </span>
                          </div>

                          <p className="text-sm whitespace-pre-wrap leading-relaxed line-clamp-3">
                            {post.content}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {post.targets?.map((tgt: any) => (
                              <span
                                key={tgt.id}
                                className={`text-xs font-mono font-semibold px-2 py-0.5 rounded border ${isDark ? "bg-zinc-950 border-zinc-800 text-zinc-300" : "bg-zinc-100 border-zinc-200 text-zinc-800"}`}
                              >
                                {tgt.platform} ({tgt.status})
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="text-zinc-500 hover:text-red-500 p-2 self-end md:self-center transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: AI CREATIVE STUDIO (IMAGES, VIDEOS & COPY) */}
        {activeTab === "ai_studio" && (
          <div className="p-8 max-w-5xl mx-auto w-full space-y-6">
            <div className={`border rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${bgCard}`}>
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-rose-500" />
                  Gaurav IIFD Generative Studio (Images, Videos & Copy)
                </h3>
                <p className={`text-xs sm:text-sm mt-1 ${textMuted}`}>
                  Powered by Google Imagen 3, Veo Video Generator, Gemini 1.5, and OpenAI.
                </p>
              </div>

              {/* MODE SWITCHER */}
              <div className="flex bg-zinc-900/50 p-1.5 rounded-lg border border-zinc-800 text-sm font-bold">
                <button
                  onClick={() => setAiStudioMode("MEDIA")}
                  className={`px-4 py-1.5 rounded-md transition ${
                    aiStudioMode === "MEDIA"
                      ? isDark
                        ? "bg-zinc-800 text-white shadow"
                        : "bg-white text-zinc-950 shadow"
                      : textMuted
                  }`}
                >
                  🎨 AI Images & Videos
                </button>
                <button
                  onClick={() => setAiStudioMode("COPY")}
                  className={`px-4 py-1.5 rounded-md transition ${
                    aiStudioMode === "COPY"
                      ? isDark
                        ? "bg-zinc-800 text-white shadow"
                        : "bg-white text-zinc-950 shadow"
                      : textMuted
                  }`}
                >
                  ✍️ Captions & Hashtags
                </button>
              </div>
            </div>

            {/* AI MEDIA GENERATOR (IMAGE & VIDEO) */}
            {aiStudioMode === "MEDIA" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={`border rounded-xl p-6 space-y-4 ${bgCard}`}>
                  <span className={`text-sm font-bold uppercase tracking-wider block ${textMuted}`}>
                    AI Visual & Video Prompt Engine
                  </span>

                  <div>
                    <label className="text-sm font-semibold block mb-1.5">Creative Description / Visual Prompt:</label>
                    <textarea
                      rows={4}
                      value={mediaPrompt}
                      onChange={(e) => setMediaPrompt(e.target.value)}
                      placeholder="e.g. Cinematic 4k fashion editorial of a haute couture dress floating in water with golden hour light and delicate silk folds..."
                      className={`w-full rounded-lg p-3.5 text-sm focus:outline-none transition resize-none border ${bgInput}`}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className={`text-xs font-semibold block mb-1 ${textMuted}`}>Media Type:</label>
                      <select
                        value={genMediaType}
                        onChange={(e) => setGenMediaType(e.target.value as any)}
                        className={`w-full border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none ${bgInput}`}
                      >
                        <option value="IMAGE">Static Image</option>
                        <option value="VIDEO">Short Video / Reel</option>
                      </select>
                    </div>

                    <div>
                      <label className={`text-xs font-semibold block mb-1 ${textMuted}`}>Aspect Ratio:</label>
                      <select
                        value={genAspectRatio}
                        onChange={(e) => setGenAspectRatio(e.target.value)}
                        className={`w-full border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none ${bgInput}`}
                      >
                        <option value="1:1">1:1 Square (IG/FB)</option>
                        <option value="9:16">9:16 Reel / TikTok</option>
                        <option value="16:9">16:9 Landscape</option>
                        <option value="4:5">4:5 Portrait</option>
                      </select>
                    </div>

                    <div>
                      <label className={`text-xs font-semibold block mb-1 ${textMuted}`}>Style Preset:</label>
                      <select
                        value={genStyle}
                        onChange={(e) => setGenStyle(e.target.value)}
                        className={`w-full border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none ${bgInput}`}
                      >
                        <option value="Fashion Editorial">Fashion Editorial</option>
                        <option value="Cinematic">Cinematic (Veo/Sora)</option>
                        <option value="Minimalist Studio">Minimalist Studio</option>
                        <option value="3D Modern Render">3D Modern Render</option>
                        <option value="Luxury Commercial">Luxury Commercial</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateMedia}
                    disabled={isMediaGenerating || !mediaPrompt.trim()}
                    className={`w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition disabled:opacity-50 ${btnPrimary}`}
                  >
                    {isMediaGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Generating {genMediaType}...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate AI {genMediaType}
                      </>
                    )}
                  </button>
                </div>

                {/* MEDIA PREVIEW CARD */}
                <div className={`border rounded-xl p-6 flex flex-col justify-between ${bgCard}`}>
                  <div>
                    <div className={`flex items-center justify-between mb-4 pb-3 border-b ${borderSubtle}`}>
                      <span className={`text-sm font-bold uppercase tracking-wider ${textMuted}`}>
                        Generated Visual Output
                      </span>
                      {generatedMediaResult && (
                        <span className="text-xs font-mono bg-rose-500/10 text-rose-400 px-2.5 py-1 rounded border border-rose-500/20 font-bold">
                          {generatedMediaResult.engine}
                        </span>
                      )}
                    </div>

                    {generatedMediaResult ? (
                      <div className="space-y-4">
                        <div className={`border rounded-xl overflow-hidden max-h-72 flex items-center justify-center bg-black ${borderSubtle}`}>
                          {generatedMediaResult.mediaType === "VIDEO" ? (
                            <video
                              src={generatedMediaResult.mediaUrl}
                              controls
                              autoPlay
                              loop
                              className="max-h-72 w-full object-cover"
                            />
                          ) : (
                            <img
                              src={generatedMediaResult.mediaUrl}
                              alt="Generated Visual"
                              className="max-h-72 w-full object-cover"
                            />
                          )}
                        </div>

                        <p className={`text-xs ${textMuted} italic line-clamp-2`}>
                          Prompt: "{generatedMediaResult.prompt}" ({generatedMediaResult.style}, {generatedMediaResult.aspectRatio})
                        </p>
                      </div>
                    ) : (
                      <div className={`p-14 text-center text-sm italic ${textMuted}`}>
                        Enter a creative description on the left and click "Generate AI Image / Video" to render your visual ad asset.
                      </div>
                    )}
                  </div>

                  {generatedMediaResult && (
                    <div className={`pt-4 border-t mt-4 ${borderSubtle}`}>
                      <button
                        onClick={handleAttachMediaToComposer}
                        className={`w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 ${btnPrimary}`}
                      >
                        <Send className="w-4 h-4" />
                        1-Click Attach to Post Composer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AI COPY & HASHTAGS GENERATOR */}
            {aiStudioMode === "COPY" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={`border rounded-xl p-6 space-y-4 ${bgCard}`}>
                  <span className={`text-sm font-bold uppercase tracking-wider block ${textMuted}`}>
                    Copywriting Brief
                  </span>

                  <div>
                    <label className="text-sm font-semibold block mb-1.5">Topic or Product Overview:</label>
                    <textarea
                      rows={3}
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      placeholder="e.g. Announcing new weekend admissions for fashion communication and styling degree..."
                      className={`w-full rounded-lg p-3.5 text-sm focus:outline-none transition resize-none border ${bgInput}`}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold block mb-1.5">Target Keywords (comma-separated):</label>
                    <input
                      type="text"
                      value={aiKeywords}
                      onChange={(e) => setAiKeywords(e.target.value)}
                      placeholder="FashionSchool, Admissions2026, CreativeCareer, Style"
                      className={`w-full rounded-lg px-4 py-2.5 text-sm border focus:outline-none ${bgInput}`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`text-xs font-semibold block mb-1 ${textMuted}`}>Tone:</label>
                      <select
                        value={aiTone}
                        onChange={(e) => setAiTone(e.target.value)}
                        className={`w-full border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none ${bgInput}`}
                      >
                        <option value="engaging">Engaging & Conversational</option>
                        <option value="professional">Professional & Academic</option>
                        <option value="urgency">Urgent & Promotional</option>
                        <option value="luxury">Luxury & Editorial</option>
                      </select>
                    </div>

                    <div>
                      <label className={`text-xs font-semibold block mb-1 ${textMuted}`}>Target Format:</label>
                      <select
                        value={aiPlatform}
                        onChange={(e) => setAiPlatform(e.target.value)}
                        className={`w-full border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none ${bgInput}`}
                      >
                        <option value="INSTAGRAM">Instagram</option>
                        <option value="LINKEDIN">LinkedIn</option>
                        <option value="FACEBOOK">Facebook</option>
                        <option value="PINTEREST">Pinterest</option>
                        <option value="YOUTUBE">YouTube</option>
                        <option value="GOOGLE_BUSINESS">Google Business</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateAI}
                    disabled={isAiLoading || !aiTopic.trim()}
                    className={`w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition disabled:opacity-50 ${btnPrimary}`}
                  >
                    {isAiLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Generating Copy...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Caption & Hashtags
                      </>
                    )}
                  </button>
                </div>

                <div className={`border rounded-xl p-6 flex flex-col justify-between ${bgCard}`}>
                  <div>
                    <div className={`flex items-center justify-between mb-4 pb-3 border-b ${borderSubtle}`}>
                      <span className={`text-sm font-bold uppercase tracking-wider ${textMuted}`}>
                        Generated Copy & Hashtags
                      </span>
                      {aiResult && (
                        <span className={`text-xs font-mono px-2 py-0.5 rounded border ${borderSubtle} ${textMuted}`}>
                          {aiResult.source}
                        </span>
                      )}
                    </div>

                    {aiResult ? (
                      <div className="space-y-4">
                        <div className={`border rounded-xl p-4 text-sm whitespace-pre-wrap leading-relaxed ${isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"}`}>
                          {aiResult.content}
                        </div>

                        {aiResult.visualCreativeIdea && (
                          <div className={`border rounded-lg p-3.5 text-xs italic ${borderSubtle} ${textMuted}`}>
                            💡 Visual Suggestion: {aiResult.visualCreativeIdea}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className={`p-14 text-center text-sm italic ${textMuted}`}>
                        Enter your topic brief on the left to generate viral copy and hashtags.
                      </div>
                    )}
                  </div>

                  {aiResult && (
                    <div className={`pt-4 border-t mt-4 ${borderSubtle}`}>
                      <button
                        onClick={handleApplyAiToComposer}
                        className={`w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 ${btnPrimary}`}
                      >
                        <Send className="w-4 h-4" />
                        Apply to Post Composer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: USER PROFILE, API KEYS & SETTINGS */}
        {activeTab === "profile" && (
          <div className="p-8 max-w-5xl mx-auto w-full space-y-6">
            {profileFeedback && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-sm font-bold text-emerald-500 flex items-center gap-2">
                <CheckCheck className="w-5 h-5" />
                {profileFeedback}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* SECTION 1: PROFILE DETAILS */}
              <div className={`border rounded-xl p-6 ${bgCard} space-y-5`}>
                <div className={`flex items-center justify-between pb-3 border-b ${borderSubtle}`}>
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-400" />
                    Personal & Organization Profile
                  </h3>
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                    {profilePlan}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Avatar Preview */}
                  <div className="relative group shrink-0">
                    <img
                      src={profileAvatar}
                      alt="Avatar"
                      className="w-24 h-24 rounded-full object-cover border-2 border-indigo-500/50 shadow-lg"
                      onError={(e) => {
                        (e.target as any).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80";
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 w-full">
                    <div>
                      <label className={`text-xs font-bold block mb-1.5 ${textMuted}`}>Full Name:</label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className={`w-full border rounded-lg px-3.5 py-2.5 text-sm font-medium focus:outline-none ${bgInput}`}
                      />
                    </div>

                    <div>
                      <label className={`text-xs font-bold block mb-1.5 ${textMuted}`}>Email Address:</label>
                      <input
                        type="email"
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        className={`w-full border rounded-lg px-3.5 py-2.5 text-sm font-medium focus:outline-none ${bgInput}`}
                      />
                    </div>

                    <div>
                      <label className={`text-xs font-bold block mb-1.5 ${textMuted}`}>Organization / Agency:</label>
                      <input
                        type="text"
                        value={profileOrg}
                        onChange={(e) => setProfileOrg(e.target.value)}
                        className={`w-full border rounded-lg px-3.5 py-2.5 text-sm font-medium focus:outline-none ${bgInput}`}
                      />
                    </div>

                    <div>
                      <label className={`text-xs font-bold block mb-1.5 ${textMuted}`}>Avatar Image URL:</label>
                      <input
                        type="url"
                        value={profileAvatar}
                        onChange={(e) => setProfileAvatar(e.target.value)}
                        placeholder="https://..."
                        className={`w-full border rounded-lg px-3.5 py-2.5 text-sm font-mono focus:outline-none ${bgInput}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: APPEARANCE & THEME */}
              <div className={`border rounded-xl p-6 ${bgCard} space-y-4`}>
                <div className={`pb-3 border-b ${borderSubtle}`}>
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <Sun className="w-5 h-5 text-amber-400" />
                    Appearance & Display Theme
                  </h3>
                  <p className={`text-xs sm:text-sm mt-1 ${textMuted}`}>Customize UI palette according to your preference.</p>
                </div>

                <div className="grid grid-cols-2 gap-4 max-w-md">
                  <div
                    onClick={() => toggleTheme("dark")}
                    className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      isDark
                        ? "bg-zinc-900 border-zinc-500 text-white ring-1 ring-zinc-500 shadow-md"
                        : "bg-zinc-100 border-zinc-300 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Moon className="w-5 h-5 text-indigo-400" />
                      <div>
                        <p className="text-sm font-bold">Dark Obsidian</p>
                        <p className={`text-xs ${textMuted}`}>Refined matte dark mode</p>
                      </div>
                    </div>
                    {isDark && <Check className="w-5 h-5 text-emerald-400 font-bold" />}
                  </div>

                  <div
                    onClick={() => toggleTheme("light")}
                    className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      !isDark
                        ? "bg-white border-zinc-950 text-zinc-950 font-bold ring-1 ring-zinc-950 shadow-md"
                        : "bg-zinc-900 border-zinc-800 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Sun className="w-5 h-5 text-amber-500" />
                      <div>
                        <p className="text-sm font-bold">Clean Light</p>
                        <p className={`text-xs ${textMuted}`}>Crisp minimal porcelain</p>
                      </div>
                    </div>
                    {!isDark && <Check className="w-5 h-5 text-emerald-500 font-bold" />}
                  </div>
                </div>
              </div>

              {/* SECTION 3: API KEYS MANAGEMENT */}
              <div className={`border rounded-xl p-6 ${bgCard} space-y-4`}>
                <div className={`pb-3 border-b ${borderSubtle}`}>
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <Key className="w-5 h-5 text-rose-400" />
                    API Keys & Platform Access Tokens
                  </h3>
                  <p className={`text-xs sm:text-sm mt-1 ${textMuted}`}>
                    Store your production credentials. Leave blank to continue using automatic Sandbox Simulator mode.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: "geminiKey", label: "Google Gemini API Key", ph: "AIzaSy..." },
                    { key: "openAiKey", label: "OpenAI API Key", ph: "sk-..." },
                    { key: "metaToken", label: "Meta Graph Access Token (FB & IG)", ph: "EAA..." },
                    { key: "linkedInToken", label: "LinkedIn UGC OAuth Token", ph: "AQV..." },
                    { key: "pinterestToken", label: "Pinterest API v5 Access Token", ph: "pina_..." },
                    { key: "youtubeKey", label: "Google Cloud / YouTube API Key", ph: "AIza..." },
                  ].map((field) => (
                    <div key={field.key} className="space-y-1.5">
                      <label className={`text-xs font-bold block ${textMuted}`}>{field.label}:</label>
                      <div className="relative">
                        <input
                          type={showKey[field.key] ? "text" : "password"}
                          value={apiKeys[field.key] || ""}
                          onChange={(e) =>
                            setApiKeys({ ...apiKeys, [field.key]: e.target.value })
                          }
                          placeholder={field.ph}
                          className={`w-full border rounded-lg px-3.5 py-2.5 text-sm font-mono pr-10 focus:outline-none ${bgInput}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowKey({ ...showKey, [field.key]: !showKey[field.key] })}
                          className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300"
                        >
                          {showKey[field.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 4: BILLING & AGENCY USAGE STATS */}
              <div className={`border rounded-xl p-6 ${bgCard} space-y-4`}>
                <div className={`pb-3 border-b ${borderSubtle} flex items-center justify-between`}>
                  <div>
                    <h3 className="text-base font-bold flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-emerald-400" />
                      Subscription & Workspace Quotas
                    </h3>
                    <p className={`text-xs sm:text-sm mt-1 ${textMuted}`}>Active Agency Enterprise Plan tier.</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    ACTIVE
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className={`p-5 rounded-xl border ${isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"}`}>
                    <p className={`text-xs font-bold uppercase tracking-wider ${textMuted}`}>Scheduled Posts</p>
                    <p className="text-2xl font-black mt-1.5">48 / 1,000</p>
                    <div className="w-full bg-zinc-800 h-2 rounded-full mt-3 overflow-hidden">
                      <div className="bg-indigo-500 h-full w-[4.8%]"></div>
                    </div>
                  </div>

                  <div className={`p-5 rounded-xl border ${isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"}`}>
                    <p className={`text-xs font-bold uppercase tracking-wider ${textMuted}`}>AI Image & Video Credits</p>
                    <p className="text-2xl font-black mt-1.5">25 / 500</p>
                    <div className="w-full bg-zinc-800 h-2 rounded-full mt-3 overflow-hidden">
                      <div className="bg-rose-500 h-full w-[5%]"></div>
                    </div>
                  </div>

                  <div className={`p-5 rounded-xl border ${isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"}`}>
                    <p className={`text-xs font-bold uppercase tracking-wider ${textMuted}`}>Client Workspaces</p>
                    <p className="text-2xl font-black mt-1.5">{clients.length} / Unlimited</p>
                    <div className="w-full bg-zinc-800 h-2 rounded-full mt-3 overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[100%]"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SAVE BUTTON */}
              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className={`px-8 py-3 rounded-lg text-sm font-bold shadow-md ${btnPrimary}`}
                >
                  Save Settings & API Keys
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* MODAL: ADD CLIENT */}
      {isAddClientModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`border rounded-xl p-6 max-w-sm w-full shadow-2xl ${isDark ? "bg-zinc-950 border-zinc-800" : "bg-white border-zinc-300"}`}>
            <h3 className="text-base font-bold mb-1 flex items-center gap-2">
              <Building className="w-5 h-5 text-indigo-400" />
              Add Client Workspace
            </h3>
            <p className={`text-xs mb-4 ${textMuted}`}>
              Create an isolated brand workspace with dedicated social channels and daily schedules.
            </p>

            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label className={`text-xs font-bold block mb-1.5 ${textMuted}`}>Brand / Client Name:</label>
                <input
                  type="text"
                  required
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="e.g. Apex Studio"
                  className={`w-full border rounded-lg px-3.5 py-2.5 text-sm font-semibold focus:outline-none ${bgInput}`}
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddClientModalOpen(false)}
                  className={`text-xs font-semibold px-4 py-2 rounded-lg ${btnSecondary}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`text-xs font-bold px-4 py-2 rounded-lg ${btnPrimary}`}
                >
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONNECT ACCOUNT */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`border rounded-xl p-6 max-w-md w-full shadow-2xl ${isDark ? "bg-zinc-950 border-zinc-800" : "bg-white border-zinc-300"}`}>
            <h3 className="text-base font-bold mb-1 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-indigo-400" />
              Link Channel ({PLATFORMS_CONFIG[connectPlatform]?.label})
            </h3>
            <p className={`text-xs mb-4 ${textMuted}`}>
              Adding to client: <span className="font-bold text-indigo-400">{selectedClient?.name}</span>
            </p>

            <form onSubmit={handleConnectAccount} className="space-y-3.5">
              <div>
                <label className={`text-xs font-bold block mb-1.5 ${textMuted}`}>Platform:</label>
                <select
                  value={connectPlatform}
                  onChange={(e) => setConnectPlatform(e.target.value)}
                  className={`w-full border rounded-lg px-3.5 py-2 text-sm font-semibold focus:outline-none ${bgInput}`}
                >
                  {Object.keys(PLATFORMS_CONFIG).map((p) => (
                    <option key={p} value={p}>
                      {PLATFORMS_CONFIG[p].label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`text-xs font-bold block mb-1.5 ${textMuted}`}>Account / Page Name:</label>
                <input
                  type="text"
                  required
                  value={connectAccountName}
                  onChange={(e) => setConnectAccountName(e.target.value)}
                  placeholder="e.g. My Brand Official Page"
                  className={`w-full border rounded-lg px-3.5 py-2 text-sm font-semibold focus:outline-none ${bgInput}`}
                />
              </div>

              <div>
                <label className={`text-xs font-bold block mb-1.5 ${textMuted}`}>Page ID / Channel ID (Optional):</label>
                <input
                  type="text"
                  value={connectAccountId}
                  onChange={(e) => setConnectAccountId(e.target.value)}
                  placeholder="Leave empty for auto-generated ID"
                  className={`w-full border rounded-lg px-3.5 py-2 text-sm font-mono focus:outline-none ${bgInput}`}
                />
              </div>

              <div>
                <label className={`text-xs font-bold block mb-1.5 ${textMuted}`}>OAuth Token / API Key (Optional):</label>
                <input
                  type="password"
                  value={connectAccessToken}
                  onChange={(e) => setConnectAccessToken(e.target.value)}
                  placeholder="Leave empty for Sandbox Simulator mode"
                  className={`w-full border rounded-lg px-3.5 py-2 text-sm font-mono focus:outline-none ${bgInput}`}
                />
                <p className={`text-xs mt-1 ${textMuted}`}>
                  Tip: If left blank, posts will simulate with live success receipts.
                </p>
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsConnectModalOpen(false)}
                  className={`text-xs font-semibold px-4 py-2 rounded-lg ${btnSecondary}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`text-xs font-bold px-4 py-2 rounded-lg ${btnPrimary}`}
                >
                  Link Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
