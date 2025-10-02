'use client';

import Navigation from '@/components/Navigation';
import Link from 'next/link';

export default function TermsPage() {
  const sections = [
    {
      title: "第0条（定義）",
      paragraphs: [
        "本規約において使用する用語の定義は以下の通りとします。",
      ],
      list: [
        "「本サービス」：BlueArchiveAPI 及び関連するウェブサイト、API、データベース等の提供物を指します。",
        "「利用者」：本規約に同意の上で本サービスを利用する個人または法人を指します。",
        "「提供者」：本サービスを提供する BlueArchiveAPI 運営者を指します。",
      ],
    },
    {
      title: "第1条（規約への同意）",
      paragraphs: [
        "利用者が本サービスを利用した時点で、本規約に同意したものとみなします。",
      ],
    },
    {
      title: "第2条（目的）",
      paragraphs: [
        "本規約は、本サービスの利用条件及び提供者と利用者との権利義務関係を定めるものです。",
      ],
    },
    {
      title: "第3条（利用条件）",
      paragraphs: [
        "利用者は、本サービスを適法かつ適切な目的の範囲で利用するものとします。",
        "利用者は、自己の責任において本サービスを利用し、関連するすべての法令、ガイドライン、第三者の権利を遵守するものとします。",
      ],
    },
    {
      title: "第4条（禁止事項）",
      paragraphs: ["利用者は、以下の行為を行ってはなりません。"],
      list: [
        "不正アクセス、改ざん、リバースエンジニアリング等の不正行為",
        "過度なリクエストや不正利用によるサーバーへの過負荷行為",
        "本サービスまたは提供者の信用・評判を損なう行為",
        "他者への誹謗中傷や違法コンテンツの生成・配布を目的とする利用",
      ],
    },
    {
      title: "第5条（知的財産権）",
      paragraphs: [
        "本サービスに関する権利は、提供者または正当な権利者に帰属します。",
        "本サービスの利用は、知的財産権の移転を意味するものではありません。",
      ],
    },
    {
      title: "第6条（商用利用）",
      paragraphs: [
        "本サービスの商用利用は、ブルーアーカイブ公式ガイドラインに従うものとします。",
        "ガイドラインに違反する利用は禁止します。",
        "商用利用に際して提供者の承諾が必要な場合、事前に許可を得るものとします。",
      ],
    },
    {
      title: "第7条（免責事項）",
      paragraphs: [
        "本サービスは現状有姿（as-is）で提供され、正確性・完全性・有用性等について一切の保証を行いません。",
        "提供者は、本サービスの利用により生じた損害（直接的・間接的を問わない）について、一切責任を負いません。",
      ],
    },
    {
      title: "第8条（利用停止・変更・終了）",
      paragraphs: [
        "提供者は、利用者が本規約に違反した場合、事前通知なくサービスの利用停止、制限、提供内容の変更または終了を行うことができます。",
        "利用停止・制限により生じた不利益について、提供者は一切責任を負いません。",
        "規約違反により提供者または第三者に損害が生じた場合、利用者はその損害を補償する責任を負います。",
      ],
    },
    {
      title: "第9条（規約の変更）",
      paragraphs: [
        "提供者は、必要に応じて本規約を変更できるものとします。",
        "変更後の規約は公開時点から効力を生じ、利用者は変更後も本サービスを利用することで同意したものとみなされます。",
      ],
    },
    {
      title: "第10条（分離可能性）",
      paragraphs: [
        "本規約のいずれかの条項が法令に違反し無効または執行不能と判断された場合でも、その他の条項は引き続き有効に存続します。",
      ],
    },
    {
      title: "第11条（違反時の対応）",
      paragraphs: [
        "利用者が本規約に違反した場合、提供者は本サービスの利用停止または制限を行うことができます。",
        "提供者は、違反によって生じた損害について、合理的な範囲で損害賠償を請求できます。",
        "悪質または重大な違反が確認された場合、提供者は必要に応じて法的措置を講じることがあります。",
      ],
    },
    {
      title: "第12条（準拠法・裁判管轄）",
      paragraphs: [
        "本規約は日本法に準拠します。",
        "本サービスに関して提供者と利用者の間で生じた紛争は、東京地方裁判所を第一審の専属的合意管轄裁判所とします。",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">利用規約</h1>
          
          <div className="prose prose-gray max-w-none">
            {sections.map(({ title, paragraphs, list }) => (
              <section key={title} className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">{title}</h2>
                {paragraphs?.map((text) => (
                  <p key={text} className="text-gray-600 mb-4">
                    {text}
                  </p>
                ))}
                {list && (
                  <ul className="text-gray-600 space-y-2 ml-6 list-disc">
                    {list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            <div className="border-t pt-6 mt-8">
              <p className="text-sm text-gray-500 mb-4">最終更新日: 2025年10月2日</p>

              <div className="space-y-2">
                <Link href="/api-docs" className="block text-blue-600 hover:text-blue-800 underline">
                  API使用方法
                </Link>
                <Link href="/" className="block text-blue-600 hover:text-blue-800 underline">
                  ホームに戻る
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}