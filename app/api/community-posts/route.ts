import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MOCK_POSTS = [
  {
    id: "mock-1",
    post_type: "gas_price",
    author_name: "田中たろう",
    author_avatar: null,
    content: "コスモ石油 渋谷店でレギュラーが¥162でした！セルフで安い",
    fuel_type: "regular",
    price: 162,
    station_name: "コスモ石油 渋谷店",
    car_category: null,
    likes: 14,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "mock-2",
    post_type: "gas_price",
    author_name: "佐藤はな",
    author_avatar: null,
    content: "出光 新宿西口店 ハイオク¥178。会員カードで2円引きあり",
    fuel_type: "high_octane",
    price: 178,
    station_name: "出光 新宿西口店",
    car_category: null,
    likes: 8,
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: "mock-3",
    post_type: "car",
    author_name: "鈴木けんじ",
    author_avatar: null,
    content: "86のオイル交換してきた。Mobil1の5W-30、7500km走ったけどまだ全然綺麗だった👍",
    fuel_type: null,
    price: null,
    station_name: null,
    car_category: "maintenance",
    likes: 23,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: "mock-4",
    post_type: "car",
    author_name: "やまだあいこ",
    author_avatar: null,
    content: "今日の朝練、箱根のターンパイクが最高だった。GTRの排気音が気持ちよすぎる",
    fuel_type: null,
    price: null,
    station_name: null,
    car_category: "driving",
    likes: 41,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: "mock-5",
    post_type: "gas_price",
    author_name: "こばやしゆうと",
    author_avatar: null,
    content: "エネオス 品川港南台SS 軽油¥139。昨日より3円上がってた",
    fuel_type: "diesel",
    price: 139,
    station_name: "エネオス 品川港南台SS",
    car_category: null,
    likes: 5,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
];

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const isLoggedIn = !!user;

    const { data, error } = await supabase
      .from("community_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    let posts = (error || !data || data.length === 0) ? MOCK_POSTS : data;

    // Filter car posts for non-authenticated users
    if (!isLoggedIn) {
      posts = posts.filter((p: any) => p.post_type === "gas_price");
    }

    return NextResponse.json({ posts, isLoggedIn });
  } catch {
    return NextResponse.json({ posts: MOCK_POSTS.filter(p => p.post_type === "gas_price"), isLoggedIn: false });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { post_type, content, fuel_type, price, station_name, car_category, author_name } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: "投稿内容を入力してください" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("community_posts")
      .insert([{
        post_type: post_type || "gas_price",
        author_name: author_name || "ゲスト",
        content: content.trim(),
        fuel_type: fuel_type || null,
        price: price ? Number(price) : null,
        station_name: station_name || null,
        car_category: car_category || null,
      }])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
