import type { Metadata } from 'next';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { readStudentsData } from '@/lib/students/storage';

// 追加: 動的化 + キャッシュ無効化 + Nodeランタイム
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: '概要',
  description:
    'Blue Archive Databaseの理念と特徴、APIおよびデータ検索機能の活用方法を紹介する概要ページです。',
};

// formatNumber removed because unused in the overview page

export default async function OverviewPage() {
  const students = await readStudentsData();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navigation />
      <main
        id="main-content"
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16"
      >
        <section className="space-y-6">
          <article className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-900 shadow-sm">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
              Project Overview
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
              Blue Archive Databaseについて
            </h1>
            <p className="mt-4 max-w-3xl text-base text-slate-600">
              Blue Archive Databaseは、ブルーアーカイブに登場する生徒たちのプロフィールや戦闘ステータス、武器情報を継続的に整理・公開する非公認のデータベースです。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/api-docs"
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500"
              >
                APIドキュメントを見る
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/#explore"
                className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-5 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                生徒一覧へ移動
              </Link>
            </div>
          </article>

          {/* 統計カード（登録生徒・学校数・武器タイプ）は非表示にしました */}
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {[{
            title: 'データブラウジング',
            description: 'フィルターやソートを駆使して、目的の生徒に瞬時に辿り着けるUIを備えています。名前や学校だけでなく、攻撃タイプや武器種など細かい条件にも対応。',
            icon: '🔍',
          }, {
            title: 'APIでの活用',
            description: 'RESTfulなAPIエンドポイントを通じて、アプリケーションやツールで生徒データを直接取得。JSON形式で提供されるため、バックエンド・フロントエンド問わず利用できます。',
            icon: '🛠️',
          }, {
            title: 'コミュニティ共同体制',
            description: 'GitHubで変更履歴を管理し、Pull Requestでの改善提案を歓迎しています。データの追加や誤記修正など、誰でもプロジェクトに貢献できます。',
            icon: '🤝',
          }].map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="text-3xl" aria-hidden="true">{feature.icon}</span>
              <h2 className="mt-4 text-xl font-semibold text-slate-900">{feature.title}</h2>
              <p className="mt-3 text-sm text-slate-600">{feature.description}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">データソースと更新ポリシー</h2>
            <p className="mt-4 text-sm text-slate-600">
              ゲーム内の最新情報をもとに、students.jsonへ定期的な更新を行っています。データの正確性を保つため、ゲーム内表記との整合性確認とバージョン管理を徹底。リリースノートやコミュニティからの情報も反映し、最新の生徒ステータスを提供します。
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-600">
              <li>・全生徒のプロフィール、ステータス、武器、ロール情報を網羅</li>
              <li>・更新履歴はGitHubのPull Requestとコミットで追跡可能</li>
              <li>・API経由での取得時も同じデータソースを利用</li>
            </ul>
          </div>

          <div className="flex flex-col gap-6">
            <article className="rounded-3xl border border-blue-100 bg-blue-50/50 p-8 text-blue-900 shadow-sm">
              <h3 className="text-xl font-semibold">API連携の始め方</h3>
              <ol className="mt-4 space-y-3 text-sm">
                <li><span className="font-semibold">1.</span> <Link href="/api-docs" className="text-blue-700 transition hover:underline">APIドキュメント</Link>でエンドポイントとレスポンス形式を確認。</li>
                <li><span className="font-semibold">2.</span> サンプルリクエストを参考に自身のプロジェクトからデータ取得。</li>
                <li><span className="font-semibold">3.</span> 必要に応じてキャッシュ戦略やレート制限の制御を実装。</li>
              </ol>
              <p className="mt-4 text-sm text-blue-800/90">
                APIレスポンスはJSON形式で提供され、CORSにも対応しています。個人開発からコミュニティツールまで幅広く活用可能です。
              </p>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900">プロジェクトへ貢献する</h3>
              <p className="mt-4 text-sm text-slate-600">
                データの抜けや誤りを見つけた場合は、<Link href="https://github.com/ibuki-hum4/BlueArchiveAPI" target="_blank" rel="noopener noreferrer" className="text-blue-600 transition hover:underline">GitHubリポジトリ</Link>でIssueやPull Requestを作成してください。改善提案やUI向上のアイデアも大歓迎です。
              </p>
              <p className="mt-4 text-sm text-slate-600">
                共同編集者によるレビュー体制を整えており、API/データ両面での品質維持を行っています。
              </p>
            </article>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-10 text-white">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-tight">さあ、データを活用してみましょう。</h2>
            <p className="mt-4 text-base text-slate-100/90">
              生徒データの分析やツール開発、コミュニティサイトの強化など、Blue Archive Databaseはさまざまな活用シナリオをサポートします。次のアイデアを実現する準備はできていますか？
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                生徒一覧をブラウズ
              </Link>
              <Link
                href="/api"
                className="inline-flex items-center gap-2 rounded-full border border-white/60 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                APIレスポンスを試す
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
