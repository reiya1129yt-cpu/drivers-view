import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm text-center">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-green-100 mb-6">
          <Mail className="h-8 w-8 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-4">
          確認メールを送信しました
        </h1>

        <p className="text-muted-foreground mb-6">
          登録したメールアドレスに確認メールを送信しました。
          メール内のリンクをクリックしてアカウントを有効化してください。
        </p>

        <div className="rounded-lg bg-secondary p-4 text-left">
          <h3 className="font-medium text-secondary-foreground mb-2">
            メールが届かない場合
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>・迷惑メールフォルダを確認してください</li>
            <li>・入力したメールアドレスが正しいか確認してください</li>
            <li>・数分待ってから再度確認してください</li>
          </ul>
        </div>

        <Link
          href="/auth/login"
          className="flex items-center justify-center gap-2 mt-6 text-primary hover:text-primary/80"
        >
          <ArrowLeft className="h-4 w-4" />
          ログインページへ戻る
        </Link>
      </div>
    </div>
  );
}
