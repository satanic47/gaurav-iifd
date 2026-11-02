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
} from "lucide-react";

// Minimalist platform labels & subtle icons
const PLATFORMS_CONFIG: Record<
  string,
  { label: string; tag: string; border: string; bg: string; text: string }
> = {
  INSTAGRAM: {
    label: "Instagram",
    tag: "IG",
    border: "border-zinc-800",
    bg: "bg-zinc-900/40",
    text: "text-zinc-200",
  },
  FACEBOOK: {
    label: "Facebook",
    tag: "FB",
    border: "border-zinc-800",
    bg: "bg-zinc-900/40",
    text: "text-zinc-200",
  },
  LINKEDIN: {
    label: "LinkedIn",
    tag: "IN",
    border: "border-zinc-800",
    bg: "bg-zinc-900/40",
    text: "text-zinc-200",
  },
  YOUTUBE: {
    label: "YouTube",
    tag: "YT",
    border: "border-zinc-800",
    bg: "bg-zinc-900/40",
    text: "text-zinc-200",
  },
  PINTEREST: {
    label: "Pinterest",
    tag: "PIN",
    border: "border-zinc-800",
    bg: "bg-zinc-900/40",
    text: "text-zinc-200",
  },
  GOOGLE_BUSINESS: {
    label: "Google Business",
    tag: "GBP",
    border: "border-zinc-800",
    bg: "bg-zinc-900/40",
    text: "text-zinc-200",
  },
};

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function SocialDashboard() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"composer" | "queue" | "channels" | "history" | "ai_studio">("composer");

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

  // AI Assistant state
  const [aiTopic, setAiTopic] = useState("");
  const [aiKeywords, setAiKeywords] = useState("");
  const [aiTone, setAiTone] = useState("engaging");
  const [aiPlatform, setAiPlatform] = useState("INSTAGRAM");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any | null>(null);

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

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      loadClientData(selectedClient.id);
    }
  }, [selectedClient?.id]);

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
      const mediaType = mediaUrls.length > 0 ? "IMAGE" : "TEXT_ONLY";

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
              : "Post queued into automated publishing schedule.",
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

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans antialiased selection:bg-zinc-800 selection:text-white">
      {/* SIDEBAR NAVIGATION - MINIMALIST OBSIDIAN / ZINC */}
      <aside className="w-64 border-r border-zinc-900 bg-zinc-950 flex flex-col justify-between">
        <div>
          {/* LOGO & BRAND */}
          <div className="h-16 border-b border-zinc-900 px-6 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-zinc-100 flex items-center justify-center text-zinc-950 font-black text-xs tracking-wider">
                II
              </div>
              <div>
                <span className="font-semibold text-sm tracking-tight text-zinc-100">IIFD Social</span>
                <span className="text-[10px] text-zinc-500 block leading-tight">Automation Engine</span>
              </div>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
              v1.0
            </span>
          </div>

          {/* CLIENT SELECTOR */}
          <div className="p-4 border-b border-zinc-900 bg-zinc-900/20">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                Workspace / Brand
              </span>
              <button
                onClick={() => setIsAddClientModalOpen(true)}
                title="Create Workspace"
                className="text-[11px] text-zinc-400 hover:text-white transition flex items-center gap-1 font-medium"
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
              className="w-full bg-zinc-900 text-xs font-medium border border-zinc-800 rounded-md px-3 py-2 text-zinc-200 focus:outline-none focus:border-zinc-700"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-500 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                {activeClientAccounts.length} channel(s) active
              </span>
              <span>{scheduledPosts.length} queued</span>
            </div>
          </div>

          {/* NAV ITEMS */}
          <nav className="p-3 space-y-1">
            <button
              onClick={() => setActiveTab("composer")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition ${
                activeTab === "composer"
                  ? "bg-zinc-900 text-white border border-zinc-800"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              Post Composer
            </button>

            <button
              onClick={() => setActiveTab("queue")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition ${
                activeTab === "queue"
                  ? "bg-zinc-900 text-white border border-zinc-800"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Clock className="w-3.5 h-3.5" />
                Queue & Schedule
              </div>
              {scheduledPosts.length > 0 && (
                <span className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.2 rounded font-mono">
                  {scheduledPosts.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("channels")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition ${
                activeTab === "channels"
                  ? "bg-zinc-900 text-white border border-zinc-800"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Share2 className="w-3.5 h-3.5" />
                Channels & APIs
              </div>
              <span className="text-[10px] text-zinc-500">{activeClientAccounts.length}</span>
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition ${
                activeTab === "history"
                  ? "bg-zinc-900 text-white border border-zinc-800"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Layers className="w-3.5 h-3.5" />
                Post History
              </div>
              <span className="text-[10px] text-zinc-500">{posts.length}</span>
            </button>

            <button
              onClick={() => setActiveTab("ai_studio")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition ${
                activeTab === "ai_studio"
                  ? "bg-zinc-900 text-white border border-zinc-800"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
              AI Creative Studio
            </button>
          </nav>
        </div>

        {/* WORKER FOOTER */}
        <div className="p-4 border-t border-zinc-900 bg-zinc-900/20">
          <div className="flex items-center justify-between text-[11px] mb-2 text-zinc-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              Scheduler Daemon
            </span>
            <span className="text-[10px] text-zinc-400">Running</span>
          </div>

          <button
            onClick={handleTriggerAutomation}
            disabled={isCronRunning}
            className="w-full text-xs py-1.5 px-3 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 flex items-center justify-center gap-1.5 border border-zinc-800 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isCronRunning ? "animate-spin text-zinc-100" : ""}`} />
            {isCronRunning ? "Checking due..." : "Run Due Queue Now"}
          </button>

          {cronFeedback && (
            <p className="mt-1.5 text-[10px] text-zinc-300 bg-zinc-900 p-1.5 rounded border border-zinc-800 text-center">
              {cronFeedback}
            </p>
          )}
        </div>
      </aside>

      {/* MAIN VIEW */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-zinc-950">
        {/* HEADER BAR */}
        <header className="h-16 border-b border-zinc-900 px-8 flex items-center justify-between bg-zinc-950/80 backdrop-blur sticky top-0 z-10">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              {activeTab === "composer" && "Post Composer"}
              {activeTab === "queue" && "Queue & Daily Time Slots"}
              {activeTab === "channels" && "Connected Social Media Channels"}
              {activeTab === "history" && "Post Activity & History"}
              {activeTab === "ai_studio" && "AI Creative & Copy Studio"}
            </h2>
            <p className="text-xs text-zinc-500">
              Client: <span className="text-zinc-300 font-medium">{selectedClient?.name || "Loading..."}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab("ai_studio")}
              className="text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 px-3 py-1.5 rounded-md flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
              AI Copywriter
            </button>
            <button
              onClick={() => setIsConnectModalOpen(true)}
              className="text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-950 px-3 py-1.5 rounded-md flex items-center gap-1.5 transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Link Channel
            </button>
          </div>
        </header>

        {/* TAB 1: COMPOSER */}
        {activeTab === "composer" && (
          <div className="p-8 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT 2 COLS: FORM */}
            <div className="lg:col-span-2 space-y-6">
              {/* FEEDBACK */}
              {postFeedback && (
                <div
                  className={`p-3.5 rounded-md flex items-center gap-2.5 border text-xs font-medium ${
                    postFeedback.type === "success"
                      ? "bg-zinc-900 border-zinc-700 text-zinc-200"
                      : "bg-red-950/30 border-red-900 text-red-300"
                  }`}
                >
                  {postFeedback.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span>{postFeedback.message}</span>
                </div>
              )}

              {/* CHANNELS SELECTOR */}
              <div className="bg-zinc-900/30 border border-zinc-900 rounded-lg p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Target Social Channels
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
                    className="text-[11px] text-zinc-500 hover:text-zinc-300 font-medium"
                  >
                    {selectedAccountIds.length === activeClientAccounts.length ? "Deselect All" : "Select All"}
                  </button>
                </div>

                {activeClientAccounts.length === 0 ? (
                  <div className="p-4 bg-zinc-900/50 rounded-md border border-zinc-800/80 text-center">
                    <p className="text-xs text-zinc-400 mb-2">No channels linked for this client.</p>
                    <button
                      onClick={() => setActiveTab("channels")}
                      className="text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-medium px-3 py-1 rounded"
                    >
                      Connect Accounts
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {activeClientAccounts.map((acc: any) => {
                      const cfg = PLATFORMS_CONFIG[acc.platform] || {
                        label: acc.platform,
                        tag: acc.platform.substring(0, 2),
                      };
                      const isSelected = selectedAccountIds.includes(acc.id);

                      return (
                        <div
                          key={acc.id}
                          onClick={() => toggleAccountSelection(acc.id)}
                          className={`p-2.5 rounded-md border cursor-pointer transition flex items-center justify-between select-none ${
                            isSelected
                              ? "bg-zinc-800/70 border-zinc-700 text-white"
                              : "bg-zinc-950 border-zinc-900 text-zinc-500 hover:border-zinc-800"
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <span className="text-[10px] font-mono uppercase bg-zinc-900 border border-zinc-800 px-1 rounded text-zinc-400 mr-1.5">
                              {cfg.tag}
                            </span>
                            <span className="text-xs font-medium truncate">{acc.accountName}</span>
                          </div>
                          <div
                            className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                              isSelected ? "bg-zinc-100 border-white text-zinc-950" : "border-zinc-700"
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

              {/* CAPTION & MEDIA */}
              <div className="bg-zinc-900/30 border border-zinc-900 rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Post Caption & Copy
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("ai_studio")}
                    className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 font-medium bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded"
                  >
                    <Sparkles className="w-3 h-3" />
                    AI Assistant
                  </button>
                </div>

                <div className="relative">
                  <textarea
                    rows={6}
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Compose your post caption, key highlights, hashtags, or links..."
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-md p-3.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 transition resize-none leading-relaxed"
                  />
                  <div className="flex justify-between items-center text-[11px] text-zinc-500 mt-1">
                    <span>{postContent.length} characters</span>
                    <span>Supports multi-platform formatting</span>
                  </div>
                </div>

                {/* MEDIA URL */}
                <div>
                  <label className="text-xs text-zinc-400 block mb-1.5 flex items-center gap-1.5 font-medium">
                    <ImageIcon className="w-3.5 h-3.5 text-zinc-500" />
                    Media / Ad Creative URL (Image or Video)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      placeholder="https://... image or video asset URL"
                      className="flex-1 bg-zinc-950 border border-zinc-900 rounded-md px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setMediaUrl("https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&auto=format&fit=crop&q=80")
                      }
                      className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-3 py-2 rounded-md border border-zinc-800 whitespace-nowrap"
                    >
                      Sample Image
                    </button>
                  </div>
                </div>
              </div>

              {/* DELIVERY OPTIONS */}
              <div className="bg-zinc-900/30 border border-zinc-900 rounded-lg p-5 space-y-4">
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-400 block">
                  Publishing Strategy
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => setScheduleType("QUEUE")}
                    className={`p-3 rounded-md border cursor-pointer transition ${
                      scheduleType === "QUEUE"
                        ? "bg-zinc-800/80 border-zinc-700 text-white"
                        : "bg-zinc-950 border-zinc-900 text-zinc-400 hover:border-zinc-800"
                    }`}
                  >
                    <div className="font-medium text-xs flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-300" />
                      Add to Daily Queue
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      Fills next available daily time slot
                    </p>
                  </div>

                  <div
                    onClick={() => setScheduleType("SCHEDULE")}
                    className={`p-3 rounded-md border cursor-pointer transition ${
                      scheduleType === "SCHEDULE"
                        ? "bg-zinc-800/80 border-zinc-700 text-white"
                        : "bg-zinc-950 border-zinc-900 text-zinc-400 hover:border-zinc-800"
                    }`}
                  >
                    <div className="font-medium text-xs flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-zinc-300" />
                      Specific Date/Time
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1">Pick an exact custom schedule</p>
                  </div>

                  <div
                    onClick={() => setScheduleType("NOW")}
                    className={`p-3 rounded-md border cursor-pointer transition ${
                      scheduleType === "NOW"
                        ? "bg-zinc-800/80 border-zinc-700 text-white"
                        : "bg-zinc-950 border-zinc-900 text-zinc-400 hover:border-zinc-800"
                    }`}
                  >
                    <div className="font-medium text-xs flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5 text-zinc-300" />
                      Publish Now
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1">Dispatches immediately</p>
                  </div>
                </div>

                {scheduleType === "SCHEDULE" && (
                  <div className="pt-2">
                    <label className="text-xs text-zinc-400 block mb-1">Select Date & Time:</label>
                    <input
                      type="datetime-local"
                      value={customDateTime}
                      onChange={(e) => setCustomDateTime(e.target.value)}
                      className="bg-zinc-950 border border-zinc-900 rounded-md px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700"
                    />
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleCreatePost}
                    disabled={isSubmittingPost}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
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
                        Schedule Post
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT 1 COL: MINIMAL PREVIEW */}
            <div className="space-y-6">
              <div className="bg-zinc-900/30 border border-zinc-900 rounded-lg p-5">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-900">
                  <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Live Feed Preview
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">FEED CARD</span>
                </div>

                {/* Minimal Post Card */}
                <div className="bg-zinc-950 border border-zinc-900 rounded-md overflow-hidden">
                  <div className="p-3 flex items-center gap-2.5 border-b border-zinc-900">
                    <div className="w-7 h-7 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-semibold text-zinc-200">
                      {selectedClient?.name?.substring(0, 2).toUpperCase() || "WS"}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">{selectedClient?.name || "Client Name"}</p>
                      <p className="text-[10px] text-zinc-500">Scheduled Feed Post • Public</p>
                    </div>
                  </div>

                  <div className="p-3 text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed min-h-[70px]">
                    {postContent || (
                      <span className="text-zinc-600 italic">Caption and hashtags preview here...</span>
                    )}
                  </div>

                  {mediaUrl && (
                    <div className="border-t border-zinc-900 bg-zinc-900/40 max-h-56 overflow-hidden">
                      <img
                        src={mediaUrl}
                        alt="Creative"
                        className="w-full object-cover max-h-56"
                        onError={(e) => {
                          (e.target as any).src = "https://placehold.co/600x400/18181b/white?text=Preview";
                        }}
                      />
                    </div>
                  )}

                  <div className="p-2.5 border-t border-zinc-900 flex justify-between text-[11px] text-zinc-500">
                    <span>Like</span>
                    <span>Comment</span>
                    <span>Share</span>
                  </div>
                </div>

                {/* Selected Platforms List */}
                <div className="mt-4 pt-3 border-t border-zinc-900">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Publishing to:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAccountIds.map((accId) => {
                      const acc = activeClientAccounts.find((a: any) => a.id === accId);
                      if (!acc) return null;
                      return (
                        <span
                          key={accId}
                          className="text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-0.5 rounded"
                        >
                          {acc.platform}
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
            {/* BUFFER STYLE SLOTS */}
            <div className="bg-zinc-900/30 border border-zinc-900 rounded-lg p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-900">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-zinc-400" />
                    Automated Daily Posting Schedule Slots
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Posts added to queue will automatically fill these recurring time slots.
                  </p>
                </div>

                <form onSubmit={handleAddScheduleSlot} className="flex items-center gap-2">
                  <select
                    value={newSlotDay}
                    onChange={(e) => setNewSlotDay(Number(e.target.value))}
                    className="bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-200 focus:outline-none"
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
                    className="bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-200 focus:outline-none"
                  />

                  <button
                    type="submit"
                    className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-medium px-3 py-1 rounded flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add Slot
                  </button>
                </form>
              </div>

              {/* DAY SLOTS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {DAYS_OF_WEEK.map((dayName, dayIndex) => {
                  const daySlots = schedules.filter((s) => s.dayOfWeek === dayIndex);
                  return (
                    <div key={dayName} className="bg-zinc-950 border border-zinc-900 rounded-md p-3">
                      <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-zinc-900">
                        <span className="text-xs font-semibold text-zinc-300">{dayName}</span>
                        <span className="text-[10px] text-zinc-500">{daySlots.length} slot(s)</span>
                      </div>

                      {daySlots.length === 0 ? (
                        <p className="text-[11px] text-zinc-600 italic">No slots configured</p>
                      ) : (
                        <div className="space-y-1.5">
                          {daySlots.map((slot) => (
                            <div
                              key={slot.id}
                              className="flex items-center justify-between bg-zinc-900/60 px-2.5 py-1 rounded border border-zinc-900"
                            >
                              <span className="text-xs font-mono text-zinc-300">{slot.timeSlot}</span>
                              <button
                                onClick={() => handleDeleteScheduleSlot(slot.id)}
                                className="text-zinc-500 hover:text-red-400 text-xs"
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

            {/* QUEUED POSTS LIST */}
            <div className="bg-zinc-900/30 border border-zinc-900 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-zinc-400" />
                Upcoming Queued Posts
              </h3>

              {scheduledPosts.length === 0 ? (
                <div className="p-8 text-center bg-zinc-950 rounded-md border border-zinc-900">
                  <p className="text-xs text-zinc-500">Queue is currently empty.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {scheduledPosts.map((post) => {
                    const media = JSON.parse(post.mediaUrls || "[]");
                    return (
                      <div
                        key={post.id}
                        className="bg-zinc-950 border border-zinc-900 rounded-md p-3.5 flex flex-col sm:flex-row gap-3 items-start justify-between"
                      >
                        <div className="flex gap-3">
                          {media.length > 0 && (
                            <img
                              src={media[0]}
                              alt="Creative"
                              className="w-14 h-14 rounded object-cover shrink-0 border border-zinc-800"
                            />
                          )}
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-mono text-zinc-300 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                                {post.scheduledAt ? new Date(post.scheduledAt).toLocaleString() : "Queued"}
                              </span>
                              <span className="text-[10px] text-zinc-500">
                                {post.targets?.length || 0} platform(s)
                              </span>
                            </div>
                            <p className="text-xs text-zinc-300 line-clamp-2 max-w-xl">{post.content}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="text-zinc-500 hover:text-red-400 p-1.5 self-end sm:self-center"
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
                <h3 className="text-sm font-semibold text-zinc-100">Connected Social Channels & APIs</h3>
                <p className="text-xs text-zinc-500">
                  Manage accounts and access tokens for <span className="text-zinc-300">{selectedClient?.name}</span>
                </p>
              </div>

              <button
                onClick={() => setIsConnectModalOpen(true)}
                className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-semibold px-3 py-1.5 rounded-md flex items-center gap-1.5"
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
                        ? "bg-zinc-900/30 border-zinc-800"
                        : "bg-zinc-950 border-zinc-900 opacity-70"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">
                            {cfg.tag}
                          </span>
                          <span className="font-semibold text-xs text-zinc-200">{cfg.label}</span>
                        </div>

                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                            isConnected
                              ? "bg-emerald-950/30 border-emerald-800 text-emerald-400"
                              : "bg-zinc-900 border-zinc-800 text-zinc-500"
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
                              className="bg-zinc-950 p-2 rounded border border-zinc-900 flex items-center justify-between text-xs"
                            >
                              <div className="min-w-0 pr-2">
                                <p className="font-medium text-zinc-200 truncate">{acc.accountName}</p>
                                <p className="text-[10px] text-zinc-500 font-mono truncate">ID: {acc.accountId}</p>
                              </div>
                              <button
                                onClick={async () => {
                                  if (confirm(`Disconnect ${acc.accountName}?`)) {
                                    await fetch(`${BASE_PATH}/api/accounts/${acc.id}`, { method: "DELETE" });
                                    await fetchClients();
                                  }
                                }}
                                className="text-zinc-500 hover:text-red-400 text-xs p-1"
                                title="Disconnect"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-500 mt-2">
                          Connect official Page, Profile, or Channel.
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-zinc-900">
                      <button
                        onClick={() => {
                          setConnectPlatform(platformKey);
                          setIsConnectModalOpen(true);
                        }}
                        className="w-full text-xs font-medium py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition"
                      >
                        {isConnected ? "+ Add Page" : "Connect"}
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
                <h3 className="text-sm font-semibold text-zinc-100">Post Activity & Dispatch Logs</h3>
                <p className="text-xs text-zinc-500">History of all published and scheduled updates</p>
              </div>
              <button
                onClick={() => selectedClient && loadClientData(selectedClient.id)}
                className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded border border-zinc-800 flex items-center gap-1.5"
              >
                <RefreshCw className="w-3 h-3" />
                Refresh
              </button>
            </div>

            {posts.length === 0 ? (
              <div className="p-8 text-center bg-zinc-950 border border-zinc-900 rounded-lg">
                <p className="text-xs text-zinc-500">No post history found.</p>
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
                      className="bg-zinc-900/30 border border-zinc-900 rounded-lg p-4 flex flex-col md:flex-row gap-4 items-start justify-between"
                    >
                      <div className="flex gap-3 min-w-0 flex-1">
                        {media.length > 0 && (
                          <img
                            src={media[0]}
                            alt="Creative"
                            className="w-16 h-16 rounded object-cover shrink-0 border border-zinc-800"
                          />
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span
                              className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                                isPublished
                                  ? "bg-emerald-950/40 border-emerald-800 text-emerald-400"
                                  : isScheduled
                                  ? "bg-zinc-900 border-zinc-700 text-zinc-300"
                                  : "bg-red-950/40 border-red-800 text-red-400"
                              }`}
                            >
                              {post.status}
                            </span>

                            <span className="text-[11px] text-zinc-500">
                              {isPublished && post.publishedAt
                                ? `Published: ${new Date(post.publishedAt).toLocaleString()}`
                                : isScheduled && post.scheduledAt
                                ? `Scheduled: ${new Date(post.scheduledAt).toLocaleString()}`
                                : `Created: ${new Date(post.createdAt).toLocaleDateString()}`}
                            </span>
                          </div>

                          <p className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed line-clamp-3">
                            {post.content}
                          </p>

                          <div className="mt-2.5 flex flex-wrap gap-1.5">
                            {post.targets?.map((tgt: any) => (
                              <span
                                key={tgt.id}
                                className="text-[10px] font-mono bg-zinc-950 px-2 py-0.5 rounded border border-zinc-900 text-zinc-400"
                              >
                                {tgt.platform} ({tgt.status})
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="text-zinc-500 hover:text-red-400 p-1.5 self-end md:self-center"
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

        {/* TAB 5: AI CREATIVE STUDIO */}
        {activeTab === "ai_studio" && (
          <div className="p-8 max-w-5xl mx-auto w-full space-y-6">
            <div className="bg-zinc-900/30 border border-zinc-900 rounded-lg p-5">
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-zinc-300" />
                AI Social Copy & Creative Studio (Google Gemini & OpenAI)
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Generate high-converting headlines, copy, target hashtags, and visual art prompts.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* INPUT */}
              <div className="bg-zinc-900/30 border border-zinc-900 rounded-lg p-5 space-y-4">
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-400 block">
                  Campaign Brief
                </span>

                <div>
                  <label className="text-xs text-zinc-300 block mb-1">Topic or Product Overview:</label>
                  <textarea
                    rows={3}
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    placeholder="e.g. Launching an exclusive weekend masterclass on digital fashion and generative AI..."
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-md p-3 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-300 block mb-1">Target Keywords (comma-separated):</label>
                  <input
                    type="text"
                    value={aiKeywords}
                    onChange={(e) => setAiKeywords(e.target.value)}
                    placeholder="FashionDesign, Masterclass, ArtificialIntelligence, Style"
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-md px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-300 block mb-1">Tone:</label>
                    <select
                      value={aiTone}
                      onChange={(e) => setAiTone(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-md px-3 py-1.5 text-xs text-zinc-200 focus:outline-none"
                    >
                      <option value="engaging">Engaging & Conversational</option>
                      <option value="professional">Professional & B2B</option>
                      <option value="urgency">Urgent & Promotional</option>
                      <option value="luxury">Luxury & Minimal</option>
                      <option value="storytelling">Storytelling & Hook</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-zinc-300 block mb-1">Format:</label>
                    <select
                      value={aiPlatform}
                      onChange={(e) => setAiPlatform(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-md px-3 py-1.5 text-xs text-zinc-200 focus:outline-none"
                    >
                      <option value="INSTAGRAM">Instagram</option>
                      <option value="LINKEDIN">LinkedIn</option>
                      <option value="FACEBOOK">Facebook</option>
                      <option value="PINTEREST">Pinterest</option>
                      <option value="YOUTUBE">YouTube</option>
                      <option value="GOOGLE_BUSINESS">Google Business Profile</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateAI}
                  disabled={isAiLoading || !aiTopic.trim()}
                  className="w-full py-2.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                >
                  {isAiLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Generating Copy...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Generate Copy & Hashtags
                    </>
                  )}
                </button>
              </div>

              {/* OUTPUT */}
              <div className="bg-zinc-900/30 border border-zinc-900 rounded-lg p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                      Generated Result
                    </span>
                    {aiResult && (
                      <span className="text-[10px] text-zinc-400 font-mono bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-900">
                        {aiResult.source}
                      </span>
                    )}
                  </div>

                  {aiResult ? (
                    <div className="space-y-3">
                      <div className="bg-zinc-950 border border-zinc-900 rounded-md p-3.5">
                        <p className="text-[10px] font-mono text-zinc-500 uppercase mb-1">Copy:</p>
                        <p className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">
                          {aiResult.content}
                        </p>
                      </div>

                      {aiResult.visualCreativeIdea && (
                        <div className="bg-zinc-950 border border-zinc-900 rounded-md p-3">
                          <p className="text-[10px] font-mono text-zinc-500 uppercase mb-0.5">
                            Ad Creative / Visual Prompt:
                          </p>
                          <p className="text-xs text-zinc-400 italic">{aiResult.visualCreativeIdea}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-zinc-600 text-xs italic">
                      Configure your prompt on the left and click Generate.
                    </div>
                  )}
                </div>

                {aiResult && (
                  <div className="pt-3 border-t border-zinc-900">
                    <button
                      onClick={handleApplyAiToComposer}
                      className="w-full py-2 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 font-medium text-xs flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Apply to Composer
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: ADD CLIENT */}
      {isAddClientModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-sm font-semibold text-zinc-100 mb-1 flex items-center gap-2">
              <Building className="w-4 h-4 text-zinc-400" />
              Add Client Workspace
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              Create an isolated brand workspace with dedicated social accounts and daily schedules.
            </p>

            <form onSubmit={handleCreateClient} className="space-y-3.5">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Brand / Client Name:</label>
                <input
                  type="text"
                  required
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="e.g. Apex Studio"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddClientModalOpen(false)}
                  className="text-xs px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-xs px-3 py-1.5 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold"
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
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-sm font-semibold text-zinc-100 mb-1 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-zinc-400" />
              Link Channel ({PLATFORMS_CONFIG[connectPlatform]?.label})
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              Adding to workspace: <span className="text-zinc-300 font-medium">{selectedClient?.name}</span>
            </p>

            <form onSubmit={handleConnectAccount} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Platform:</label>
                <select
                  value={connectPlatform}
                  onChange={(e) => setConnectPlatform(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1.5 text-xs text-zinc-200 focus:outline-none"
                >
                  {Object.keys(PLATFORMS_CONFIG).map((p) => (
                    <option key={p} value={p}>
                      {PLATFORMS_CONFIG[p].label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Account / Page Name:</label>
                <input
                  type="text"
                  required
                  value={connectAccountName}
                  onChange={(e) => setConnectAccountName(e.target.value)}
                  placeholder="e.g. My Brand Official Page"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Page ID / Channel ID (Optional):</label>
                <input
                  type="text"
                  value={connectAccountId}
                  onChange={(e) => setConnectAccountId(e.target.value)}
                  placeholder="Leave empty for auto-generated ID"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">OAuth Token / API Key (Optional):</label>
                <input
                  type="password"
                  value={connectAccessToken}
                  onChange={(e) => setConnectAccessToken(e.target.value)}
                  placeholder="Leave empty for instant Sandbox Simulator"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 font-mono"
                />
                <p className="text-[10px] text-zinc-500 mt-1">
                  Tip: If left blank, posts will publish in Sandbox Simulator mode with live success receipts.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsConnectModalOpen(false)}
                  className="text-xs px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-xs px-3 py-1.5 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold"
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
