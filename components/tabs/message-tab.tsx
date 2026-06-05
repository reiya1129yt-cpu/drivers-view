"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Search,
  Plus,
  Users,
  Lock,
  Send,
  Image as ImageIcon,
  MoreVertical,
  Check,
  CheckCheck,
  X,
  Flag,
  Ban,
  Trash2,
  MapPin,
  Calendar,
  Globe,
  Settings,
} from "lucide-react";
import type { Profile } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

interface MessageTabProps {
  user: { email: string; id: string } | null;
  profile: Profile | null;
}

type MessageTabType = "dm" | "group";
type MessagePage = "list" | "chat" | "new-group" | "group-detail" | "user-profile" | "settings";

// Mock data types
interface Conversation {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  is_read: boolean;
}

interface Group {
  id: string;
  name: string;
  description: string;
  member_count: number;
  region: string;
  is_public: boolean;
  last_activity: string;
  image_url: string | null;
}

interface ChatMessage {
  id: string;
  sender_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  is_read: boolean;
}

// Mock data
const mockConversations: Conversation[] = [
  {
    id: "1",
    user_id: "user1",
    user_name: "山田太郎",
    user_avatar: null,
    last_message: "来週のツーリング楽しみにしています！",
    last_message_time: "2024-01-15T10:30:00Z",
    unread_count: 2,
    is_read: false,
  },
  {
    id: "2",
    user_id: "user2",
    user_name: "佐藤花子",
    user_avatar: null,
    last_message: "あのPA、めっちゃ良かったです",
    last_message_time: "2024-01-14T15:20:00Z",
    unread_count: 0,
    is_read: true,
  },
];

const mockGroups: Group[] = [
  {
    id: "1",
    name: "関西ドライブ部",
    description: "関西エリアでドライブを楽しむグループです",
    member_count: 156,
    region: "関西",
    is_public: true,
    last_activity: "2024-01-15T12:00:00Z",
    image_url: null,
  },
  {
    id: "2",
    name: "86オーナーズ",
    description: "トヨタ86/GR86オーナーの交流グループ",
    member_count: 89,
    region: "全国",
    is_public: true,
    last_activity: "2024-01-15T08:30:00Z",
    image_url: null,
  },
  {
    id: "3",
    name: "大阪夜景部",
    description: "大阪周辺の夜景スポットを巡るグループ",
    member_count: 45,
    region: "大阪",
    is_public: true,
    last_activity: "2024-01-14T22:00:00Z",
    image_url: null,
  },
];

const mockMessages: ChatMessage[] = [
  {
    id: "1",
    sender_id: "user1",
    content: "こんにちは！先日の投稿見ました",
    image_url: null,
    created_at: "2024-01-15T09:00:00Z",
    is_read: true,
  },
  {
    id: "2",
    sender_id: "me",
    content: "ありがとうございます！あの場所すごく良かったですよ",
    image_url: null,
    created_at: "2024-01-15T09:15:00Z",
    is_read: true,
  },
  {
    id: "3",
    sender_id: "user1",
    content: "来週のツーリング楽しみにしています！",
    image_url: null,
    created_at: "2024-01-15T10:30:00Z",
    is_read: false,
  },
];

export default function MessageTab({ user, profile }: MessageTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<MessageTabType>("dm");
  const [currentPage, setCurrentPage] = useState<MessagePage>("list");
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dmReceiveSetting, setDmReceiveSetting] = useState<"all" | "follow" | "none">("all");

  // Group creation form
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [newGroupRegion, setNewGroupRegion] = useState("全国");
  const [newGroupIsPublic, setNewGroupIsPublic] = useState(true);

  // Login required screen
  if (!user) {
    return (
      <div className="flex flex-col h-full bg-background">
        {/* Header */}
        <div className="flex items-center justify-center px-4 pt-4 pb-2">
          <h1 className="text-2xl font-bold text-foreground">メッセージ</h1>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <Lock className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-foreground mb-2">ログインが必要です</p>
          <p className="text-sm text-muted-foreground text-center mb-6">
            この機能はログインが必要です
          </p>
          <a
            href="/auth/login"
            className="rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground"
          >
            ログイン
          </a>
        </div>
      </div>
    );
  }

  // Chat view
  if (currentPage === "chat" && selectedConversation) {
    return (
      <div className="flex flex-col h-full bg-background">
        {/* Chat Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <button
            onClick={() => {
              setCurrentPage("list");
              setSelectedConversation(null);
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex items-center gap-3 flex-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
              {selectedConversation.user_name.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-foreground">{selectedConversation.user_name}</p>
              <p className="text-xs text-muted-foreground">オンライン</p>
            </div>
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary">
            <MoreVertical className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {mockMessages.map((msg) => {
            const isMe = msg.sender_id === "me";
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    isMe
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-card border border-border text-foreground rounded-bl-md"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : ""}`}>
                    <span className={`text-[10px] ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: ja })}
                    </span>
                    {isMe && (
                      msg.is_read ? (
                        <CheckCheck className="h-3 w-3 text-primary-foreground/70" />
                      ) : (
                        <Check className="h-3 w-3 text-primary-foreground/70" />
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border hover:bg-secondary">
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
            </button>
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="メッセージを入力..."
              className="flex-1 h-10 px-4 rounded-full bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              disabled={!messageInput.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Group detail view
  if (currentPage === "group-detail" && selectedGroup) {
    return (
      <div className="flex flex-col h-full bg-background">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <button
            onClick={() => {
              setCurrentPage("list");
              setSelectedGroup(null);
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground flex-1">{selectedGroup.name}</h1>
          <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary">
            <Settings className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Group Info */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary text-2xl font-bold">
              {selectedGroup.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-muted-foreground">{selectedGroup.member_count}人のメンバー</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${selectedGroup.is_public ? "bg-green-500/20 text-green-500" : "bg-orange-500/20 text-orange-500"}`}>
                  {selectedGroup.is_public ? "公開" : "非公開"}
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{selectedGroup.region}</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{selectedGroup.description}</p>
          <button className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium">
            グループに参加
          </button>
        </div>

        {/* Group Chat Messages would go here */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-center text-muted-foreground">グループに参加してメッセージを見る</p>
        </div>
      </div>
    );
  }

  // New group creation
  if (currentPage === "new-group") {
    return (
      <div className="flex flex-col h-full bg-background">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <button
            onClick={() => setCurrentPage("list")}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">グループ作成</h1>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">グループ名</label>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="例: 関西ドライブ部"
              className="w-full h-12 px-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">説明</label>
            <textarea
              value={newGroupDescription}
              onChange={(e) => setNewGroupDescription(e.target.value)}
              placeholder="グループの説明を入力..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">地域</label>
            <select
              value={newGroupRegion}
              onChange={(e) => setNewGroupRegion(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="全国">全国</option>
              <option value="北海道">北海道</option>
              <option value="東北">東北</option>
              <option value="関東">関東</option>
              <option value="中部">中部</option>
              <option value="関西">関西</option>
              <option value="中国">中国</option>
              <option value="四国">四国</option>
              <option value="九州">九州</option>
              <option value="沖縄">沖縄</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">公開設定</label>
            <div className="flex gap-3">
              <button
                onClick={() => setNewGroupIsPublic(true)}
                className={`flex-1 py-3 rounded-xl font-medium ${
                  newGroupIsPublic
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-foreground"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>公開</span>
                </div>
              </button>
              <button
                onClick={() => setNewGroupIsPublic(false)}
                className={`flex-1 py-3 rounded-xl font-medium ${
                  !newGroupIsPublic
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-foreground"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Lock className="h-4 w-4" />
                  <span>非公開</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="p-4 border-t border-border">
          <button
            disabled={!newGroupName.trim()}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-50"
          >
            グループを作成
          </button>
        </div>
      </div>
    );
  }

  // DM Settings
  if (currentPage === "settings") {
    return (
      <div className="flex flex-col h-full bg-background">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <button
            onClick={() => setCurrentPage("list")}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">メッセージ設定</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="rounded-xl bg-card border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <p className="font-medium text-foreground">メッセージ受信設定</p>
              <p className="text-xs text-muted-foreground">誰からのメッセージを受け取るか設定します</p>
            </div>
            
            {[
              { value: "all" as const, label: "全員許可", desc: "すべてのユーザーからメッセージを受け取ります" },
              { value: "follow" as const, label: "フォローのみ", desc: "フォローしているユーザーのみ（今後対応）" },
              { value: "none" as const, label: "受信しない", desc: "メッセージを受け取りません" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setDmReceiveSetting(option.value)}
                className="w-full flex items-center justify-between px-4 py-4 hover:bg-secondary transition-colors border-b border-border last:border-b-0"
              >
                <div className="text-left">
                  <p className="font-medium text-foreground">{option.label}</p>
                  <p className="text-xs text-muted-foreground">{option.desc}</p>
                </div>
                {dmReceiveSetting === option.value && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Main list view
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h1 className="text-2xl font-bold text-foreground">メッセージ</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage("settings")}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-card border border-border"
          >
            <Settings className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-4 mb-4">
        <button
          onClick={() => setActiveSubTab("dm")}
          className={`flex-1 py-2 rounded-xl font-medium text-sm ${
            activeSubTab === "dm"
              ? "bg-primary text-primary-foreground"
              : "bg-card border border-border text-muted-foreground"
          }`}
        >
          個人メッセージ
        </button>
        <button
          onClick={() => setActiveSubTab("group")}
          className={`flex-1 py-2 rounded-xl font-medium text-sm ${
            activeSubTab === "group"
              ? "bg-primary text-primary-foreground"
              : "bg-card border border-border text-muted-foreground"
          }`}
        >
          グループ
        </button>
      </div>

      {/* Search */}
      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeSubTab === "dm" ? "ユーザーを検索..." : "グループを検索..."}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-20">
        {activeSubTab === "dm" ? (
          // DM List
          <div className="space-y-2">
            {mockConversations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">メッセージはまだありません</p>
              </div>
            ) : (
              mockConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    setSelectedConversation(conv);
                    setCurrentPage("chat");
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:bg-secondary transition-colors"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                    {conv.user_name.charAt(0)}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-foreground">{conv.user_name}</p>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(conv.last_message_time), { addSuffix: true, locale: ja })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${conv.unread_count > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                        {conv.last_message}
                      </p>
                      {conv.unread_count > 0 && (
                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground px-1">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        ) : (
          // Group List
          <div className="space-y-2">
            {/* Create Group Button */}
            <button
              onClick={() => setCurrentPage("new-group")}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-colors"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Plus className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="font-medium text-primary">新しいグループを作成</p>
                <p className="text-xs text-muted-foreground">車好き仲間を集めよう</p>
              </div>
            </button>

            {/* Group List */}
            {mockGroups.map((group) => (
              <button
                key={group.id}
                onClick={() => {
                  setSelectedGroup(group);
                  setCurrentPage("group-detail");
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:bg-secondary transition-colors"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
                  {group.name.charAt(0)}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{group.name}</p>
                    {group.is_public ? (
                      <Globe className="h-3 w-3 text-muted-foreground" />
                    ) : (
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{group.member_count}人</span>
                    <span>・</span>
                    <span>{group.region}</span>
                  </div>
                </div>
                <Users className="h-5 w-5 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
