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
              ? "Post published successfully across target channels."
              : "Post scheduled into automated publishing queue.",
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

  // Dynamic Theme Classes
  const bgMain = isDark ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900";
  const bgCard = isDark ? "bg-zinc-900/40 border-zinc-900" : "bg-white border-zinc-200 shadow-sm";
  const bgInput = isDark ? "bg-zinc-950 border-zinc-800 text-zinc-200" : "bg-zinc-50 border-zinc-300 text-zinc-900";
  const borderSubtle = isDark ? "border-zinc-900" : "border-zinc-200";
  const textMuted = isDark ? "text-zinc-500" : "text-zinc-600";
  const navHover = isDark ? "hover:bg-zinc-900/60 hover:text-zinc-200" : "hover:bg-zinc-100 hover:text-zinc-900";
  const btnPrimary = isDark
    ? "bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold"
    : "bg-zinc-950 hover:bg-zinc-800 text-white font-semibold";
  const btnSecondary = isDark
    ? "bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-800"
    : "bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-200";

  return (
    <div className={`flex h-screen ${bgMain} overflow-hidden font-sans antialiased transition-colors duration-200`}>
      {/* SIDEBAR NAVIGATION */}
      <aside className={`w-64 border-r ${borderSubtle} flex flex-col justify-between shrink-0 ${isDark ? "bg-zinc-950" : "bg-white"}`}>
        <div>
          {/* BRAND */}
          <div className={`h-16 border-b ${borderSubtle} px-5 flex items-center justify-between`}>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-950 font-black text-xs tracking-wider">
                GI
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight block">Gaurav IIFD</span>
                <span className={`text-[10px] ${textMuted} block leading-tight font-medium`}>Social Automation & AI</span>
              </div>
            </div>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${isDark ? "bg-zinc-900 border-zinc-800 text-zinc-400" : "bg-zinc-100 border-zinc-200 text-zinc-600"}`}>
              v2.0
            </span>
          </div>

          {/* CLIENT WORKSPACE SWITCHER */}
          <div className={`p-4 border-b ${borderSubtle} ${isDark ? "bg-zinc-900/20" : "bg-zinc-50"}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${textMuted}`}>
                Client Workspace
              </span>
              <button
                onClick={() => setIsAddClientModalOpen(true)}
                title="Create Workspace"
                className={`text-[11px] font-semibold flex items-center gap-0.5 ${isDark ? "text-zinc-300 hover:text-white" : "text-zinc-700 hover:text-zinc-950"}`}
              >
                <Plus className="w-3 h-3" />
                New
              </button>
            </div>

            <select
              value={selectedClient?.id || ""}
              onChange={(e) => {
                const found = clients.find((c) => c.id === e.target.value);
                if (found) setSelectedClient(found);
              }}
              className={`w-full text-xs font-medium border rounded-md px-2.5 py-1.5 focus:outline-none ${bgInput}`}
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <div className={`mt-2 flex items-center justify-between text-[11px] ${textMuted} font-medium`}>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                {activeClientAccounts.length} channel(s)
              </span>
              <span>{scheduledPosts.length} in queue</span>
            </div>
          </div>

          {/* NAV TABS */}
          <nav className="p-3 space-y-1">
            <button
              onClick={() => setActiveTab("composer")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition ${
                activeTab === "composer"
                  ? isDark
                    ? "bg-zinc-900 text-white border border-zinc-800"
                    : "bg-zinc-200 text-zinc-950 font-semibold"
                  : `${textMuted} ${navHover}`
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              Post Composer
            </button>

            <button
              onClick={() => setActiveTab("queue")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition ${
                activeTab === "queue"
                  ? isDark
                    ? "bg-zinc-900 text-white border border-zinc-800"
                    : "bg-zinc-200 text-zinc-950 font-semibold"
                  : `${textMuted} ${navHover}`
              }`}
            >
              <div className="flex items-center gap-3">
                <Clock className="w-3.5 h-3.5" />
                Queue & Schedule
              </div>
              {scheduledPosts.length > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
                  {scheduledPosts.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("channels")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition ${
                activeTab === "channels"
                  ? isDark
                    ? "bg-zinc-900 text-white border border-zinc-800"
                    : "bg-zinc-200 text-zinc-950 font-semibold"
                  : `${textMuted} ${navHover}`
              }`}
            >
              <div className="flex items-center gap-3">
                <Share2 className="w-3.5 h-3.5" />
                Channels & APIs
              </div>
              <span className="text-[10px]">{activeClientAccounts.length}</span>
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition ${
                activeTab === "history"
                  ? isDark
                    ? "bg-zinc-900 text-white border border-zinc-800"
                    : "bg-zinc-200 text-zinc-950 font-semibold"
                  : `${textMuted} ${navHover}`
              }`}
            >
              <div className="flex items-center gap-3">
                <Layers className="w-3.5 h-3.5" />
                Post History
              </div>
              <span className="text-[10px]">{posts.length}</span>
            </button>

            <button
              onClick={() => setActiveTab("ai_studio")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition ${
                activeTab === "ai_studio"
                  ? isDark
                    ? "bg-zinc-900 text-white border border-zinc-800"
                    : "bg-zinc-200 text-zinc-950 font-semibold"
                  : `${textMuted} ${navHover}`
              }`}
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-3.5 h-3.5" />
                AI Creative & Video
              </div>
              <span className="text-[9px] bg-rose-500/10 text-rose-500 font-bold px-1.5 py-0.2 rounded border border-rose-500/20">
                PRO
              </span>
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition ${
                activeTab === "profile"
                  ? isDark
                    ? "bg-zinc-900 text-white border border-zinc-800"
                    : "bg-zinc-200 text-zinc-950 font-semibold"
                  : `${textMuted} ${navHover}`
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Profile & Settings
            </button>
          </nav>
        </div>

        {/* WORKER FOOTER */}
        <div className={`p-4 border-t ${borderSubtle} ${isDark ? "bg-zinc-900/20" : "bg-zinc-50"}`}>
          <div className={`flex items-center justify-between text-[11px] mb-2 font-medium ${textMuted}`}>
            <span className="flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
              Scheduler Engine
            </span>
            <span className="text-[10px] text-emerald-500 font-bold">LIVE</span>
          </div>

          <button
            onClick={handleTriggerAutomation}
            disabled={isCronRunning}
            className={`w-full text-xs py-1.5 px-3 rounded-md flex items-center justify-center gap-1.5 border transition disabled:opacity-50 ${btnSecondary}`}
          >
            <RefreshCw className={`w-3 h-3 ${isCronRunning ? "animate-spin" : ""}`} />
            {isCronRunning ? "Publishing due..." : "Run Due Posts Now"}
          </button>

          {cronFeedback && (
            <p className={`mt-1.5 text-[10px] p-1.5 rounded border text-center ${isDark ? "bg-zinc-900 border-zinc-800 text-zinc-300" : "bg-zinc-100 border-zinc-200 text-zinc-800"}`}>
              {cronFeedback}
            </p>
          )}
        </div>
      </aside>

      {/* MAIN VIEW AREA */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* HEADER BAR */}
        <header className={`h-16 border-b ${borderSubtle} px-8 flex items-center justify-between backdrop-blur sticky top-0 z-10 ${isDark ? "bg-zinc-950/80" : "bg-white/80"}`}>
          <div>
            <h2 className="text-sm font-bold tracking-tight">
              {activeTab === "composer" && "Post Composer & Multi-Channel Publish"}
              {activeTab === "queue" && "Queue Automation & Daily Time Slots"}
              {activeTab === "channels" && "Connected Social Media Accounts"}
              {activeTab === "history" && "Post Dispatch History & Logs"}
              {activeTab === "ai_studio" && "Gaurav IIFD AI Visuals, Video & Copy Studio"}
              {activeTab === "profile" && "User Profile, API Keys & Workspace Settings"}
            </h2>
            <p className={`text-xs ${textMuted}`}>
              Active Brand: <span className="font-semibold text-zinc-300 dark:text-zinc-200">{selectedClient?.name || "Loading..."}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme switcher button */}
            <button
              onClick={() => toggleTheme(isDark ? "light" : "dark")}
              title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
              className={`p-2 rounded-md border text-xs flex items-center gap-1.5 transition ${btnSecondary}`}
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
              <span className="hidden sm:inline capitalize">{theme} Mode</span>
            </button>

            <button
              onClick={() => setActiveTab("ai_studio")}
              className="text-xs font-medium bg-gradient-to-r from-rose-500 to-indigo-600 text-white px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-sm hover:opacity-90"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generate Image/Video
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className="w-8 h-8 rounded-full overflow-hidden border border-zinc-700 shrink-0"
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
                  className={`p-3.5 rounded-md flex items-center gap-2.5 border text-xs font-medium ${
                    postFeedback.type === "success"
                      ? isDark
                        ? "bg-zinc-900 border-zinc-700 text-zinc-200"
                        : "bg-emerald-50 border-emerald-300 text-emerald-800"
                      : "bg-red-950/30 border-red-900 text-red-300"
                  }`}
                >
                  {postFeedback.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  )}
                  <span>{postFeedback.message}</span>
                </div>
              )}

              {/* CHANNELS SELECTOR */}
              <div className={`border rounded-lg p-5 ${bgCard}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
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
                    className="text-[11px] font-semibold text-indigo-400 hover:underline"
                  >
                    {selectedAccountIds.length === activeClientAccounts.length ? "Deselect All" : "Select All"}
                  </button>
                </div>

                {activeClientAccounts.length === 0 ? (
                  <div className={`p-4 rounded-md border text-center ${borderSubtle}`}>
                    <p className={`text-xs ${textMuted} mb-2`}>No channels connected for this client yet.</p>
                    <button
                      onClick={() => setActiveTab("channels")}
                      className={`text-xs px-3 py-1 rounded ${btnPrimary}`}
                    >
                      Connect Channels
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                          className={`p-2.5 rounded-md border cursor-pointer transition flex items-center justify-between select-none ${
                            isSelected
                              ? isDark
                                ? "bg-zinc-800/80 border-zinc-600 text-white"
                                : "bg-zinc-100 border-zinc-900 text-zinc-950 font-medium"
                              : `${borderSubtle} opacity-60 hover:opacity-100`
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <span className="mr-1.5">{cfg.icon}</span>
                            <span className="text-xs font-medium truncate">{acc.accountName}</span>
                          </div>
                          <div
                            className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? isDark
                                  ? "bg-white text-zinc-950"
                                  : "bg-zinc-950 text-white"
                                : "border-zinc-500"
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* POST CONTENT & MEDIA */}
              <div className={`border rounded-lg p-5 space-y-4 ${bgCard}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
                    2. Write Post Caption & Hashtags
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("ai_studio")}
                    className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    AI Copy Generator
                  </button>
                </div>

                <div className="relative">
                  <textarea
                    rows={6}
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Compose updates, announcements, captions, or campaign details..."
                    className={`w-full rounded-md p-3.5 text-xs focus:outline-none transition resize-none leading-relaxed border ${bgInput}`}
                  />
                  <div className={`flex justify-between items-center text-[11px] ${textMuted} mt-1`}>
                    <span>{postContent.length} characters</span>
                    <span>Supports multi-platform formatting & emojis</span>
                  </div>
                </div>

                {/* MEDIA URL & AI GENERATOR SHORTCUT */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={`text-xs block flex items-center gap-1.5 font-medium ${textMuted}`}>
                      <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                      Image / Video Creative URL
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setAiStudioMode("MEDIA");
                        setActiveTab("ai_studio");
                      }}
                      className="text-[11px] font-semibold text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <Video className="w-3 h-3" />
                      Generate with AI
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      placeholder="https://... creative image or video URL"
                      className={`flex-1 rounded-md px-3 py-2 text-xs font-mono border focus:outline-none ${bgInput}`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setMediaUrl("https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&auto=format&fit=crop&q=80")
                      }
                      className={`text-xs px-3 py-2 rounded-md border whitespace-nowrap ${btnSecondary}`}
                    >
                      Sample Image
                    </button>
                  </div>
                </div>
              </div>

              {/* DELIVERY STRATEGY */}
              <div className={`border rounded-lg p-5 space-y-4 ${bgCard}`}>
                <span className={`text-xs font-semibold uppercase tracking-wider block ${textMuted}`}>
                  3. Scheduling & Publish Strategy
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => setScheduleType("QUEUE")}
                    className={`p-3 rounded-md border cursor-pointer transition ${
                      scheduleType === "QUEUE"
                        ? isDark
                          ? "bg-zinc-800/90 border-zinc-500 text-white"
                          : "bg-zinc-100 border-zinc-950 text-zinc-950 font-semibold"
                        : `${borderSubtle} opacity-70 hover:opacity-100`
                    }`}
                  >
                    <div className="font-semibold text-xs flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      Buffer-Style Queue
                    </div>
                    <p className={`text-[11px] mt-1 ${textMuted}`}>
                      Auto-assigns to next available daily time slot
                    </p>
                  </div>

                  <div
                    onClick={() => setScheduleType("SCHEDULE")}
                    className={`p-3 rounded-md border cursor-pointer transition ${
                      scheduleType === "SCHEDULE"
                        ? isDark
                          ? "bg-zinc-800/90 border-zinc-500 text-white"
                          : "bg-zinc-100 border-zinc-950 text-zinc-950 font-semibold"
                        : `${borderSubtle} opacity-70 hover:opacity-100`
                    }`}
                  >
                    <div className="font-semibold text-xs flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      Specific Date/Time
                    </div>
                    <p className={`text-[11px] mt-1 ${textMuted}`}>Pick an exact future date & time</p>
                  </div>

                  <div
                    onClick={() => setScheduleType("NOW")}
                    className={`p-3 rounded-md border cursor-pointer transition ${
                      scheduleType === "NOW"
                        ? isDark
                          ? "bg-zinc-800/90 border-zinc-500 text-white"
                          : "bg-zinc-100 border-zinc-950 text-zinc-950 font-semibold"
                        : `${borderSubtle} opacity-70 hover:opacity-100`
                    }`}
                  >
                    <div className="font-semibold text-xs flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5 text-emerald-400" />
                      Publish Now
                    </div>
                    <p className={`text-[11px] mt-1 ${textMuted}`}>Dispatches immediately</p>
                  </div>
                </div>

                {scheduleType === "SCHEDULE" && (
                  <div className="pt-2">
                    <label className={`text-xs block mb-1 font-medium ${textMuted}`}>Select Custom Date & Time:</label>
                    <input
                      type="datetime-local"
                      value={customDateTime}
                      onChange={(e) => setCustomDateTime(e.target.value)}
                      className={`border rounded-md px-3 py-1.5 text-xs focus:outline-none ${bgInput}`}
                    />
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleCreatePost}
                    disabled={isSubmittingPost}
                    className={`w-full sm:w-auto px-6 py-2.5 rounded-md text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 ${btnPrimary}`}
                  >
                    {isSubmittingPost ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Processing...
                      </>
                    ) : scheduleType === "NOW" ? (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Publish Immediately
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        Schedule Update
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT 1 COL: PREVIEW */}
            <div className="space-y-6">
              <div className={`border rounded-lg p-5 ${bgCard}`}>
                <div className={`flex items-center justify-between mb-3 pb-2 border-b ${borderSubtle}`}>
                  <span className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
                    Live Feed Preview
                  </span>
                  <span className={`text-[10px] font-mono ${textMuted}`}>GAURAV IIFD ENGINE</span>
                </div>

                {/* Minimal Card */}
                <div className={`border rounded-md overflow-hidden ${isDark ? "bg-zinc-950 border-zinc-900" : "bg-white border-zinc-200"}`}>
                  <div className={`p-3 flex items-center gap-2.5 border-b ${borderSubtle}`}>
                    <div className="w-7 h-7 rounded bg-zinc-800 text-white flex items-center justify-center text-xs font-bold">
                      {selectedClient?.name?.substring(0, 2).toUpperCase() || "GI"}
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{selectedClient?.name || "Brand Name"}</p>
                      <p className={`text-[10px] ${textMuted}`}>Scheduled Feed Update • Public</p>
                    </div>
                  </div>

                  <div className="p-3 text-xs whitespace-pre-wrap leading-relaxed min-h-[70px]">
                    {postContent || (
                      <span className={`${textMuted} italic`}>Post caption, hashtags, and links preview here...</span>
                    )}
                  </div>

                  {mediaUrl && (
                    <div className={`border-t ${borderSubtle} max-h-60 overflow-hidden`}>
                      {mediaUrl.includes(".mp4") ? (
                        <video src={mediaUrl} controls className="w-full max-h-60 object-cover" />
                      ) : (
                        <img
                          src={mediaUrl}
                          alt="Creative"
                          className="w-full object-cover max-h-60"
                          onError={(e) => {
                            (e.target as any).src = "https://placehold.co/600x400/18181b/white?text=Creative+Preview";
                          }}
                        />
                      )}
                    </div>
                  )}

                  <div className={`p-2.5 border-t ${borderSubtle} flex justify-between text-[11px] ${textMuted}`}>
                    <span>❤️ Like</span>
                    <span>💬 Comment</span>
                    <span>↗️ Share</span>
                  </div>
                </div>

                <div className={`mt-4 pt-3 border-t ${borderSubtle}`}>
                  <p className={`text-[10px] uppercase font-semibold mb-2 ${textMuted}`}>Target Platforms:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAccountIds.map((accId) => {
                      const acc = activeClientAccounts.find((a: any) => a.id === accId);
                      if (!acc) return null;
                      const cfg = PLATFORMS_CONFIG[acc.platform];
                      return (
                        <span
                          key={accId}
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border ${isDark ? "bg-zinc-900 border-zinc-800 text-zinc-300" : "bg-zinc-100 border-zinc-300 text-zinc-800"}`}
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
            <div className={`border rounded-lg p-6 ${bgCard}`}>
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b ${borderSubtle}`}>
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    Automated Daily Posting Schedule Slots (Buffer-Style)
                  </h3>
                  <p className={`text-xs mt-0.5 ${textMuted}`}>
                    Recurring daily time slots for {selectedClient?.name}. When you click "Add to Queue", posts automatically fill these times.
                  </p>
                </div>

                <form onSubmit={handleAddScheduleSlot} className="flex items-center gap-2">
                  <select
                    value={newSlotDay}
                    onChange={(e) => setNewSlotDay(Number(e.target.value))}
                    className={`border rounded px-2.5 py-1 text-xs focus:outline-none ${bgInput}`}
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
                    className={`border rounded px-2.5 py-1 text-xs focus:outline-none ${bgInput}`}
                  />

                  <button
                    type="submit"
                    className={`text-xs font-semibold px-3 py-1 rounded flex items-center gap-1 ${btnPrimary}`}
                  >
                    <Plus className="w-3 h-3" />
                    Add Slot
                  </button>
                </form>
              </div>

              {/* DAY SLOTS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {DAYS_OF_WEEK.map((dayName, dayIndex) => {
                  const daySlots = schedules.filter((s) => s.dayOfWeek === dayIndex);
                  return (
                    <div key={dayName} className={`border rounded-md p-3 ${isDark ? "bg-zinc-950 border-zinc-900" : "bg-zinc-50 border-zinc-200"}`}>
                      <div className={`flex items-center justify-between mb-2 pb-1.5 border-b ${borderSubtle}`}>
                        <span className="text-xs font-bold">{dayName}</span>
                        <span className={`text-[10px] ${textMuted}`}>{daySlots.length} slot(s)</span>
                      </div>

                      {daySlots.length === 0 ? (
                        <p className={`text-[11px] italic ${textMuted}`}>No slots</p>
                      ) : (
                        <div className="space-y-1.5">
                          {daySlots.map((slot) => (
                            <div
                              key={slot.id}
                              className={`flex items-center justify-between px-2.5 py-1 rounded border text-xs ${isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-300"}`}
                            >
                              <span className="font-mono font-semibold">{slot.timeSlot}</span>
                              <button
                                onClick={() => handleDeleteScheduleSlot(slot.id)}
                                className="text-zinc-500 hover:text-red-500"
                                title="Remove slot"
                              >
                                <Trash2 className="w-3 h-3" />
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
            <div className={`border rounded-lg p-6 ${bgCard}`}>
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                Upcoming Queued & Scheduled Posts
              </h3>

              {scheduledPosts.length === 0 ? (
                <div className={`p-8 text-center rounded-md border ${borderSubtle}`}>
                  <p className={`text-xs ${textMuted}`}>Queue is currently empty.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {scheduledPosts.map((post) => {
                    const media = JSON.parse(post.mediaUrls || "[]");
                    return (
                      <div
                        key={post.id}
                        className={`border rounded-md p-3.5 flex flex-col sm:flex-row gap-3 items-start justify-between ${isDark ? "bg-zinc-950 border-zinc-900" : "bg-white border-zinc-200"}`}
                      >
                        <div className="flex gap-3">
                          {media.length > 0 && (
                            <img
                              src={media[0]}
                              alt="Creative"
                              className="w-14 h-14 rounded object-cover shrink-0 border border-zinc-700"
                            />
                          )}
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded border ${isDark ? "bg-zinc-900 border-zinc-800 text-zinc-300" : "bg-zinc-100 border-zinc-300 text-zinc-800"}`}>
                                {post.scheduledAt ? new Date(post.scheduledAt).toLocaleString() : "Queued"}
                              </span>
                              <span className={`text-[10px] ${textMuted}`}>
                                {post.targets?.length || 0} platform(s)
                              </span>
                            </div>
                            <p className="text-xs line-clamp-2 max-w-xl">{post.content}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="text-zinc-500 hover:text-red-500 p-1.5 self-end sm:self-center"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
                <h3 className="text-sm font-bold">Connected Social Media Channels</h3>
                <p className={`text-xs ${textMuted}`}>
                  Manage account connections for <span className="font-semibold">{selectedClient?.name}</span>
                </p>
              </div>

              <button
                onClick={() => setIsConnectModalOpen(true)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-md flex items-center gap-1.5 ${btnPrimary}`}
              >
                <Plus className="w-3.5 h-3.5" />
                Connect Channel
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.keys(PLATFORMS_CONFIG).map((platformKey) => {
                const cfg = PLATFORMS_CONFIG[platformKey];
                const connectedAccounts = activeClientAccounts.filter((a: any) => a.platform === platformKey);
                const isConnected = connectedAccounts.length > 0;

                return (
                  <div
                    key={platformKey}
                    className={`rounded-lg border p-4 flex flex-col justify-between transition ${
                      isConnected
                        ? isDark
                          ? "bg-zinc-900/40 border-zinc-800"
                          : "bg-white border-zinc-300 shadow-sm"
                        : "opacity-60 border-dashed"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{cfg.icon}</span>
                          <span className="font-bold text-xs">{cfg.label}</span>
                        </div>

                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded border font-semibold ${
                            isConnected
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                              : `${borderSubtle} ${textMuted}`
                          }`}
                        >
                          {isConnected ? "CONNECTED" : "INACTIVE"}
                        </span>
                      </div>

                      {isConnected ? (
                        <div className="space-y-1.5 mt-2">
                          {connectedAccounts.map((acc: any) => (
                            <div
                              key={acc.id}
                              className={`p-2 rounded border flex items-center justify-between text-xs ${isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"}`}
                            >
                              <div className="min-w-0 pr-2">
                                <p className="font-semibold truncate">{acc.accountName}</p>
                                <p className={`text-[10px] font-mono truncate ${textMuted}`}>ID: {acc.accountId}</p>
                              </div>
                              <button
                                onClick={async () => {
                                  if (confirm(`Disconnect ${acc.accountName}?`)) {
                                    await fetch(`${BASE_PATH}/api/accounts/${acc.id}`, { method: "DELETE" });
                                    await fetchClients();
                                  }
                                }}
                                className="text-zinc-500 hover:text-red-500 p-1"
                                title="Disconnect"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className={`text-xs mt-2 ${textMuted}`}>
                          Connect {cfg.label} for automated posting.
                        </p>
                      )}
                    </div>

                    <div className={`mt-4 pt-2.5 border-t ${borderSubtle}`}>
                      <button
                        onClick={() => {
                          setConnectPlatform(platformKey);
                          setIsConnectModalOpen(true);
                        }}
                        className={`w-full text-xs font-semibold py-1.5 rounded border transition ${btnSecondary}`}
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
                <h3 className="text-sm font-bold">Post Dispatch History & Logs</h3>
                <p className={`text-xs ${textMuted}`}>Review all published, scheduled, and draft posts</p>
              </div>
              <button
                onClick={() => selectedClient && loadClientData(selectedClient.id)}
                className={`text-xs px-3 py-1.5 rounded border flex items-center gap-1.5 ${btnSecondary}`}
              >
                <RefreshCw className="w-3 h-3" />
                Refresh
              </button>
            </div>

            {posts.length === 0 ? (
              <div className={`p-8 text-center border rounded-lg ${borderSubtle}`}>
                <p className={`text-xs ${textMuted}`}>No post activity recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {posts.map((post) => {
                  const media = JSON.parse(post.mediaUrls || "[]");
                  const isPublished = post.status === "PUBLISHED";
                  const isScheduled = post.status === "SCHEDULED";

                  return (
                    <div
                      key={post.id}
                      className={`border rounded-lg p-4 flex flex-col md:flex-row gap-4 items-start justify-between ${bgCard}`}
                    >
                      <div className="flex gap-3 min-w-0 flex-1">
                        {media.length > 0 && (
                          <img
                            src={media[0]}
                            alt="Creative"
                            className="w-16 h-16 rounded object-cover shrink-0 border border-zinc-700"
                          />
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                                isPublished
                                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                                  : isScheduled
                                  ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                                  : "bg-red-500/10 border-red-500/30 text-red-400"
                              }`}
                            >
                              {post.status}
                            </span>

                            <span className={`text-[11px] ${textMuted}`}>
                              {isPublished && post.publishedAt
                                ? `Published: ${new Date(post.publishedAt).toLocaleString()}`
                                : isScheduled && post.scheduledAt
                                ? `Scheduled: ${new Date(post.scheduledAt).toLocaleString()}`
                                : `Created: ${new Date(post.createdAt).toLocaleDateString()}`}
                            </span>
                          </div>

                          <p className="text-xs whitespace-pre-wrap leading-relaxed line-clamp-3">
                            {post.content}
                          </p>

                          <div className="mt-2.5 flex flex-wrap gap-1.5">
                            {post.targets?.map((tgt: any) => (
                              <span
                                key={tgt.id}
                                className={`text-[10px] font-mono px-2 py-0.5 rounded border ${isDark ? "bg-zinc-950 border-zinc-800 text-zinc-400" : "bg-zinc-100 border-zinc-200 text-zinc-700"}`}
                              >
                                {tgt.platform} ({tgt.status})
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="text-zinc-500 hover:text-red-500 p-1.5 self-end md:self-center"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
            <div className={`border rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${bgCard}`}>
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-rose-500" />
                  Gaurav IIFD Generative Studio (Images, Videos & Copy)
                </h3>
                <p className={`text-xs mt-1 ${textMuted}`}>
                  Powered by Google Imagen 3, Veo Video Generator, Gemini 1.5, and OpenAI.
                </p>
              </div>

              {/* MODE SWITCHER */}
              <div className="flex bg-zinc-900/50 p-1 rounded-md border border-zinc-800 text-xs">
                <button
                  onClick={() => setAiStudioMode("MEDIA")}
                  className={`px-3 py-1 rounded font-semibold transition ${
                    aiStudioMode === "MEDIA"
                      ? isDark
                        ? "bg-zinc-800 text-white"
                        : "bg-white text-zinc-950 shadow"
                      : textMuted
                  }`}
                >
                  🎨 AI Images & Videos
                </button>
                <button
                  onClick={() => setAiStudioMode("COPY")}
                  className={`px-3 py-1 rounded font-semibold transition ${
                    aiStudioMode === "COPY"
                      ? isDark
                        ? "bg-zinc-800 text-white"
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
                <div className={`border rounded-lg p-5 space-y-4 ${bgCard}`}>
                  <span className={`text-xs font-semibold uppercase tracking-wider block ${textMuted}`}>
                    AI Image & Video Prompt
                  </span>

                  <div>
                    <label className="text-xs font-medium block mb-1">Creative Description / Visual Prompt:</label>
                    <textarea
                      rows={4}
                      value={mediaPrompt}
                      onChange={(e) => setMediaPrompt(e.target.value)}
                      placeholder="e.g. Cinematic 4k fashion editorial of a haute couture dress floating in water with golden hour light and delicate silk folds..."
                      className={`w-full rounded-md p-3 text-xs focus:outline-none transition resize-none border ${bgInput}`}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className={`text-xs block mb-1 font-medium ${textMuted}`}>Media Type:</label>
                      <select
                        value={genMediaType}
                        onChange={(e) => setGenMediaType(e.target.value as any)}
                        className={`w-full border rounded-md px-2.5 py-1.5 text-xs focus:outline-none ${bgInput}`}
                      >
                        <option value="IMAGE">Static Image</option>
                        <option value="VIDEO">Short Video / Reel</option>
                      </select>
                    </div>

                    <div>
                      <label className={`text-xs block mb-1 font-medium ${textMuted}`}>Aspect Ratio:</label>
                      <select
                        value={genAspectRatio}
                        onChange={(e) => setGenAspectRatio(e.target.value)}
                        className={`w-full border rounded-md px-2.5 py-1.5 text-xs focus:outline-none ${bgInput}`}
                      >
                        <option value="1:1">1:1 Square (IG/FB)</option>
                        <option value="9:16">9:16 Reel / TikTok</option>
                        <option value="16:9">16:9 Landscape</option>
                        <option value="4:5">4:5 Portrait</option>
                      </select>
                    </div>

                    <div>
                      <label className={`text-xs block mb-1 font-medium ${textMuted}`}>Style Preset:</label>
                      <select
                        value={genStyle}
                        onChange={(e) => setGenStyle(e.target.value)}
                        className={`w-full border rounded-md px-2.5 py-1.5 text-xs focus:outline-none ${bgInput}`}
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
                    className={`w-full py-2.5 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition disabled:opacity-50 ${btnPrimary}`}
                  >
                    {isMediaGenerating ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Generating {genMediaType}...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Generate AI {genMediaType}
                      </>
                    )}
                  </button>
                </div>

                {/* MEDIA PREVIEW CARD */}
                <div className={`border rounded-lg p-5 flex flex-col justify-between ${bgCard}`}>
                  <div>
                    <div className={`flex items-center justify-between mb-3 pb-2 border-b ${borderSubtle}`}>
                      <span className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
                        Generated Visual Output
                      </span>
                      {generatedMediaResult && (
                        <span className="text-[10px] font-mono bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded border border-rose-500/20 font-semibold">
                          {generatedMediaResult.engine}
                        </span>
                      )}
                    </div>

                    {generatedMediaResult ? (
                      <div className="space-y-3">
                        <div className={`border rounded-md overflow-hidden max-h-72 flex items-center justify-center bg-black ${borderSubtle}`}>
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
                      <div className={`p-12 text-center text-xs italic ${textMuted}`}>
                        Enter a creative description on the left and click "Generate AI Image / Video" to render your visual ad asset.
                      </div>
                    )}
                  </div>

                  {generatedMediaResult && (
                    <div className={`pt-3 border-t mt-4 ${borderSubtle}`}>
                      <button
                        onClick={handleAttachMediaToComposer}
                        className={`w-full py-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 ${btnPrimary}`}
                      >
                        <Send className="w-3.5 h-3.5" />
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
                <div className={`border rounded-lg p-5 space-y-4 ${bgCard}`}>
                  <span className={`text-xs font-semibold uppercase tracking-wider block ${textMuted}`}>
                    Copywriting Brief
                  </span>

                  <div>
                    <label className="text-xs font-medium block mb-1">Topic or Product Overview:</label>
                    <textarea
                      rows={3}
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      placeholder="e.g. Announcing new weekend admissions for fashion communication and styling degree..."
                      className={`w-full rounded-md p-3 text-xs focus:outline-none transition resize-none border ${bgInput}`}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium block mb-1">Target Keywords (comma-separated):</label>
                    <input
                      type="text"
                      value={aiKeywords}
                      onChange={(e) => setAiKeywords(e.target.value)}
                      placeholder="FashionSchool, Admissions2026, CreativeCareer, Style"
                      className={`w-full rounded-md px-3 py-2 text-xs border focus:outline-none ${bgInput}`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`text-xs block mb-1 font-medium ${textMuted}`}>Tone:</label>
                      <select
                        value={aiTone}
                        onChange={(e) => setAiTone(e.target.value)}
                        className={`w-full border rounded-md px-2.5 py-1.5 text-xs focus:outline-none ${bgInput}`}
                      >
                        <option value="engaging">Engaging & Conversational</option>
                        <option value="professional">Professional & Academic</option>
                        <option value="urgency">Urgent & Promotional</option>
                        <option value="luxury">Luxury & Editorial</option>
                      </select>
                    </div>

                    <div>
                      <label className={`text-xs block mb-1 font-medium ${textMuted}`}>Target Format:</label>
                      <select
                        value={aiPlatform}
                        onChange={(e) => setAiPlatform(e.target.value)}
                        className={`w-full border rounded-md px-2.5 py-1.5 text-xs focus:outline-none ${bgInput}`}
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
                    className={`w-full py-2.5 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition disabled:opacity-50 ${btnPrimary}`}
                  >
                    {isAiLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Generating Copy...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Generate Caption & Hashtags
                      </>
                    )}
                  </button>
                </div>

                <div className={`border rounded-lg p-5 flex flex-col justify-between ${bgCard}`}>
                  <div>
                    <div className={`flex items-center justify-between mb-3 pb-2 border-b ${borderSubtle}`}>
                      <span className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
                        Generated Copy & Hashtags
                      </span>
                      {aiResult && (
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${borderSubtle} ${textMuted}`}>
                          {aiResult.source}
                        </span>
                      )}
                    </div>

                    {aiResult ? (
                      <div className="space-y-3">
                        <div className={`border rounded-md p-3.5 text-xs whitespace-pre-wrap leading-relaxed ${isDark ? "bg-zinc-950 border-zinc-900" : "bg-zinc-50 border-zinc-200"}`}>
                          {aiResult.content}
                        </div>

                        {aiResult.visualCreativeIdea && (
                          <div className={`border rounded-md p-3 text-xs italic ${borderSubtle} ${textMuted}`}>
                            💡 Visual Suggestion: {aiResult.visualCreativeIdea}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className={`p-12 text-center text-xs italic ${textMuted}`}>
                        Enter your topic brief on the left to generate viral copy and hashtags.
                      </div>
                    )}
                  </div>

                  {aiResult && (
                    <div className={`pt-3 border-t mt-4 ${borderSubtle}`}>
                      <button
                        onClick={handleApplyAiToComposer}
                        className={`w-full py-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 ${btnPrimary}`}
                      >
                        <Send className="w-3.5 h-3.5" />
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
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-md text-xs font-semibold text-emerald-500 flex items-center gap-2">
                <CheckCheck className="w-4 h-4" />
                {profileFeedback}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* SECTION 1: PROFILE DETAILS */}
              <div className={`border rounded-lg p-6 ${bgCard} space-y-5`}>
                <div className={`flex items-center justify-between pb-3 border-b ${borderSubtle}`}>
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-400" />
                    Personal & Organization Profile
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                    {profilePlan}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Avatar Preview */}
                  <div className="relative group shrink-0">
                    <img
                      src={profileAvatar}
                      alt="Avatar"
                      className="w-20 h-20 rounded-full object-cover border-2 border-indigo-500/40 shadow-md"
                      onError={(e) => {
                        (e.target as any).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80";
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 w-full">
                    <div>
                      <label className={`text-xs block mb-1 font-medium ${textMuted}`}>Full Name:</label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className={`w-full border rounded-md px-3 py-1.5 text-xs focus:outline-none ${bgInput}`}
                      />
                    </div>

                    <div>
                      <label className={`text-xs block mb-1 font-medium ${textMuted}`}>Email Address:</label>
                      <input
                        type="email"
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        className={`w-full border rounded-md px-3 py-1.5 text-xs focus:outline-none ${bgInput}`}
                      />
                    </div>

                    <div>
                      <label className={`text-xs block mb-1 font-medium ${textMuted}`}>Organization / Agency:</label>
                      <input
                        type="text"
                        value={profileOrg}
                        onChange={(e) => setProfileOrg(e.target.value)}
                        className={`w-full border rounded-md px-3 py-1.5 text-xs focus:outline-none ${bgInput}`}
                      />
                    </div>

                    <div>
                      <label className={`text-xs block mb-1 font-medium ${textMuted}`}>Avatar Image URL:</label>
                      <input
                        type="url"
                        value={profileAvatar}
                        onChange={(e) => setProfileAvatar(e.target.value)}
                        placeholder="https://..."
                        className={`w-full border rounded-md px-3 py-1.5 text-xs font-mono focus:outline-none ${bgInput}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: APPEARANCE & THEME */}
              <div className={`border rounded-lg p-6 ${bgCard} space-y-4`}>
                <div className={`pb-3 border-b ${borderSubtle}`}>
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-400" />
                    Appearance & Display Theme
                  </h3>
                  <p className={`text-xs mt-0.5 ${textMuted}`}>Customize UI palette according to your preference.</p>
                </div>

                <div className="grid grid-cols-2 gap-4 max-w-md">
                  <div
                    onClick={() => toggleTheme("dark")}
                    className={`p-3.5 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                      isDark
                        ? "bg-zinc-900 border-zinc-500 text-white ring-1 ring-zinc-500"
                        : "bg-zinc-100 border-zinc-300 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Moon className="w-4 h-4 text-indigo-400" />
                      <div>
                        <p className="text-xs font-bold">Dark Obsidian</p>
                        <p className={`text-[10px] ${textMuted}`}>Refined matte dark mode</p>
                      </div>
                    </div>
                    {isDark && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>

                  <div
                    onClick={() => toggleTheme("light")}
                    className={`p-3.5 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                      !isDark
                        ? "bg-white border-zinc-950 text-zinc-950 font-semibold ring-1 ring-zinc-950 shadow-sm"
                        : "bg-zinc-900 border-zinc-800 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <div>
                        <p className="text-xs font-bold">Clean Light</p>
                        <p className={`text-[10px] ${textMuted}`}>Crisp minimal porcelain</p>
                      </div>
                    </div>
                    {!isDark && <Check className="w-4 h-4 text-emerald-500" />}
                  </div>
                </div>
              </div>

              {/* SECTION 3: API KEYS MANAGEMENT */}
              <div className={`border rounded-lg p-6 ${bgCard} space-y-4`}>
                <div className={`pb-3 border-b ${borderSubtle}`}>
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <Key className="w-4 h-4 text-rose-400" />
                    API Keys & Platform Access Tokens
                  </h3>
                  <p className={`text-xs mt-0.5 ${textMuted}`}>
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
                    <div key={field.key} className="space-y-1">
                      <label className={`text-xs font-medium block ${textMuted}`}>{field.label}:</label>
                      <div className="relative">
                        <input
                          type={showKey[field.key] ? "text" : "password"}
                          value={apiKeys[field.key] || ""}
                          onChange={(e) =>
                            setApiKeys({ ...apiKeys, [field.key]: e.target.value })
                          }
                          placeholder={field.ph}
                          className={`w-full border rounded-md px-3 py-1.5 text-xs font-mono pr-8 focus:outline-none ${bgInput}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowKey({ ...showKey, [field.key]: !showKey[field.key] })}
                          className="absolute right-2.5 top-2 text-zinc-500 hover:text-zinc-300"
                        >
                          {showKey[field.key] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 4: BILLING & AGENCY USAGE STATS */}
              <div className={`border rounded-lg p-6 ${bgCard} space-y-4`}>
                <div className={`pb-3 border-b ${borderSubtle} flex items-center justify-between`}>
                  <div>
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      Subscription & Workspace Quotas
                    </h3>
                    <p className={`text-xs mt-0.5 ${textMuted}`}>Active Agency Enterprise Plan tier.</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                    Active
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-lg border ${isDark ? "bg-zinc-950 border-zinc-900" : "bg-zinc-50 border-zinc-200"}`}>
                    <p className={`text-[10px] font-semibold uppercase ${textMuted}`}>Scheduled Posts</p>
                    <p className="text-xl font-bold mt-1">48 / 1,000</p>
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-indigo-500 h-full w-[4.8%]"></div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border ${isDark ? "bg-zinc-950 border-zinc-900" : "bg-zinc-50 border-zinc-200"}`}>
                    <p className={`text-[10px] font-semibold uppercase ${textMuted}`}>AI Image & Video Credits</p>
                    <p className="text-xl font-bold mt-1">25 / 500</p>
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-rose-500 h-full w-[5%]"></div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border ${isDark ? "bg-zinc-950 border-zinc-900" : "bg-zinc-50 border-zinc-200"}`}>
                    <p className={`text-[10px] font-semibold uppercase ${textMuted}`}>Client Workspaces</p>
                    <p className="text-xl font-bold mt-1">{clients.length} / Unlimited</p>
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[100%]"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SAVE BUTTON */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className={`px-6 py-2.5 rounded-md text-xs font-semibold shadow-md ${btnPrimary}`}
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
          <div className={`border rounded-lg p-6 max-w-sm w-full shadow-2xl ${isDark ? "bg-zinc-950 border-zinc-800" : "bg-white border-zinc-300"}`}>
            <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-400" />
              Add Client Workspace
            </h3>
            <p className={`text-xs mb-4 ${textMuted}`}>
              Create an isolated brand workspace with dedicated social channels and daily schedules.
            </p>

            <form onSubmit={handleCreateClient} className="space-y-3.5">
              <div>
                <label className={`text-xs block mb-1 font-medium ${textMuted}`}>Brand / Client Name:</label>
                <input
                  type="text"
                  required
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="e.g. Apex Studio"
                  className={`w-full border rounded-md px-3 py-2 text-xs focus:outline-none ${bgInput}`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddClientModalOpen(false)}
                  className={`text-xs px-3 py-1.5 rounded ${btnSecondary}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`text-xs px-3 py-1.5 rounded ${btnPrimary}`}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONNECT ACCOUNT */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`border rounded-lg p-6 max-w-md w-full shadow-2xl ${isDark ? "bg-zinc-950 border-zinc-800" : "bg-white border-zinc-300"}`}>
            <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-indigo-400" />
              Link Channel ({PLATFORMS_CONFIG[connectPlatform]?.label})
            </h3>
            <p className={`text-xs mb-4 ${textMuted}`}>
              Adding to client: <span className="font-semibold text-zinc-300 dark:text-zinc-200">{selectedClient?.name}</span>
            </p>

            <form onSubmit={handleConnectAccount} className="space-y-3">
              <div>
                <label className={`text-xs block mb-1 font-medium ${textMuted}`}>Platform:</label>
                <select
                  value={connectPlatform}
                  onChange={(e) => setConnectPlatform(e.target.value)}
                  className={`w-full border rounded-md px-3 py-1.5 text-xs focus:outline-none ${bgInput}`}
                >
                  {Object.keys(PLATFORMS_CONFIG).map((p) => (
                    <option key={p} value={p}>
                      {PLATFORMS_CONFIG[p].label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`text-xs block mb-1 font-medium ${textMuted}`}>Account / Page Name:</label>
                <input
                  type="text"
                  required
                  value={connectAccountName}
                  onChange={(e) => setConnectAccountName(e.target.value)}
                  placeholder="e.g. My Brand Official Page"
                  className={`w-full border rounded-md px-3 py-1.5 text-xs focus:outline-none ${bgInput}`}
                />
              </div>

              <div>
                <label className={`text-xs block mb-1 font-medium ${textMuted}`}>Page ID / Channel ID (Optional):</label>
                <input
                  type="text"
                  value={connectAccountId}
                  onChange={(e) => setConnectAccountId(e.target.value)}
                  placeholder="Leave empty for auto-generated ID"
                  className={`w-full border rounded-md px-3 py-1.5 text-xs font-mono focus:outline-none ${bgInput}`}
                />
              </div>

              <div>
                <label className={`text-xs block mb-1 font-medium ${textMuted}`}>OAuth Token / API Key (Optional):</label>
                <input
                  type="password"
                  value={connectAccessToken}
                  onChange={(e) => setConnectAccessToken(e.target.value)}
                  placeholder="Leave empty for Sandbox Simulator mode"
                  className={`w-full border rounded-md px-3 py-1.5 text-xs font-mono focus:outline-none ${bgInput}`}
                />
                <p className={`text-[10px] mt-1 ${textMuted}`}>
                  Tip: If left blank, posts will simulate with live success receipts.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsConnectModalOpen(false)}
                  className={`text-xs px-3 py-1.5 rounded ${btnSecondary}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`text-xs px-3 py-1.5 rounded ${btnPrimary}`}
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
