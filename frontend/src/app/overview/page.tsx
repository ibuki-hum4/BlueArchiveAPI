import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';

export const metadata: Metadata = {
  title: '概要',
  description:
    'Blue Archive Databaseの理念と特徴、APIおよびデータ検索機能の活用方法を紹介する概要ページです。',
};

export default function OverviewPage() {
  return (
    <>
      <PageHeader
        width="lg"
        title="Blue Archive Databaseについて"
        description="ブルーアーカイブに登場する生徒たちのプロフィールや戦闘ステータス、武器情報を継続的に整理・公開する非公認のデータベースです。"
      >
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/api-docs"
            className="inline-flex items-center rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            APIドキュメント
          </Link>
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            生徒一覧
          </Link>
        </div>
      </PageHeader>

      <main id="main-content" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <section className="grid gap-6 lg:grid-cols-3">
          {[{
            title: 'データブラウジング',
            description: 'フィルターやソートを駆使して、目的の生徒に瞬時に辿り着けるUIを備えています。名前や学校だけでなく、攻撃タイプや武器種など細かい条件にも対応。',
          }, {
            title: 'APIでの活用',
            description: 'RESTfulなAPIエンドポイントを通じて、アプリケーションやツールで生徒データを直接取得。JSON形式で提供されるため、バックエンド・フロントエンド問わず利用できます。',
          }, {
            title: 'コミュニティ共同体制',
            description: 'GitHubで変更履歴を管理し、Pull Requestでの改善提案を歓迎しています。データの追加や誤記修正など、誰でもプロジェクトに貢献できます。',
          }].map((feature) => (
            <article
              key={feature.title}
              className="ba-panel p-6"
            >
              <h2 className="text-base font-semibold text-gray-900">{feature.title}</h2>
              <p className="mt-3 text-sm text-gray-600">{feature.description}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <div className="ba-panel p-6 sm:p-8">
            <h2 className="text-xl font-semibold tracking-tight">データソースと更新ポリシー</h2>
            <p className="mt-4 text-sm text-gray-600">
              ゲーム内の最新情報をもとに、students.jsonへ定期的な更新を行っています。データの正確性を保つため、ゲーム内表記との整合性確認とバージョン管理を徹底。リリースノートやコミュニティからの情報も反映し、最新の生徒ステータスを提供します。
            </p>
            <ul className="mt-6 space-y-3 text-sm text-gray-600">
              <li>・全生徒のプロフィール、ステータス、武器、ロール情報を網羅</li>
              <li>・更新履歴はGitHubのPull Requestとコミットで追跡可能</li>
              <li>・API経由での取得時も同じデータソースを利用</li>
            </ul>
          </div>

          <div className="flex flex-col gap-6">
            <article className="ba-panel p-6 sm:p-8">
              <h3 className="text-base font-semibold text-gray-900">API連携の始め方</h3>
              <ol className="mt-4 space-y-3 text-sm">
                <li><span className="font-semibold">1.</span> <Link href="/api-docs" className="underline underline-offset-4 hover:text-gray-900">APIドキュメント</Link>でエンドポイントとレスポンス形式を確認。</li>
                <li><span className="font-semibold">2.</span> サンプルリクエストを参考に自身のプロジェクトからデータ取得。</li>
                <li><span className="font-semibold">3.</span> 必要に応じてキャッシュ戦略やレート制限の制御を実装。</li>
              </ol>
              <p className="mt-4 text-sm text-gray-600">
                APIレスポンスはJSON形式で提供され、CORSにも対応しています。個人開発からコミュニティツールまで幅広く活用可能です。
              </p>
            </article>

            <article className="ba-panel p-6 sm:p-8">
              <h3 className="text-base font-semibold text-gray-900">プロジェクトへ貢献する</h3>
              <p className="mt-4 text-sm text-gray-600">
                データの抜けや誤りを見つけた場合は、<Link href="https://github.com/ibuki-hum4/BlueArchiveAPI" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-gray-900">GitHubリポジトリ</Link>でIssueやPull Requestを作成してください。改善提案やUI向上のアイデアも大歓迎です。
              </p>
              <p className="mt-4 text-sm text-gray-600">
                共同編集者によるレビュー体制を整えており、API/データ両面での品質維持を行っています。
              </p>
            </article>
          </div>
        </section>

        <section className="rounded-2xl bg-gray-900 p-8 text-white sm:p-10">
          <div className="max-w-3xl">
            <h2 className="text-xl font-semibold tracking-tight">さあ、データを活用してみましょう。</h2>
            <p className="mt-4 text-base text-gray-300">
              生徒データの分析やツール開発、コミュニティサイトの強化など、Blue Archive Databaseはさまざまな活用シナリオをサポートします。次のアイデアを実現する準備はできていますか？
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-100"
              >
                生徒一覧をブラウズ
              </Link>
              <Link
                href="/api"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
              >
                APIレスポンスを試す
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
