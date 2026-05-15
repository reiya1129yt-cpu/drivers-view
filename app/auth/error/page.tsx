import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm text-center">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-red-100 mb-6">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-4">
          認証エラー
        </h1>

        <p className="text-muted-foreground mb-6">
          認証処理中にエラーが発生しました。
          もう一度お試しください。
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/auth/login"
            className="rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            ログインページへ
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            トップページへ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
