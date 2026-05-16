"use client";

import { X, Fuel, Car, Users } from "lucide-react";
import type { CommunityPostType } from "@/lib/types";

interface PostTypeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: CommunityPostType) => void;
}

const postTypes = [
  {
    id: "price" as CommunityPostType,
    icon: Fuel,
    label: "価格を投稿",
    description: "ガソリン価格を共有して他のドライバーを助けよう",
    color: "bg-red-500",
  },
  {
    id: "car" as CommunityPostType,
    icon: Car,
    label: "クルマを投稿",
    description: "愛車の写真や動画を共有しよう",
    color: "bg-blue-500",
  },
  {
    id: "gathering" as CommunityPostType,
    icon: Users,
    label: "集まりを募集",
    description: "ツーリングやオフ会の参加者を募集しよう",
    color: "bg-green-500",
  },
];

export default function PostTypeSelector({
  isOpen,
  onClose,
  onSelectType,
}: PostTypeSelectorProps) {
  if (!isOpen) return null;

  const handleSelect = (type: CommunityPostType) => {
    onSelectType(type);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60">
      <div className="w-full max-w-lg rounded-t-2xl bg-card max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">投稿タイプを選択</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {postTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => handleSelect(type.id)}
                className="w-full flex items-center gap-4 rounded-xl border border-border p-4 text-left hover:bg-secondary transition-colors"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${type.color} text-white`}
                >
                  <type.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-foreground">{type.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {type.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
