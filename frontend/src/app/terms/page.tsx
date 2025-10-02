'use client';

import Navigation from '@/components/Navigation';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">利用規約</h1>
          
          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">第1条（適用）</h2>
              <p className="text-gray-600 mb-4">
                本規約は、BlueArchive API（以下「本サービス」）の利用に関する条件を定めるものです。
                本サービスを利用される方（以下「利用者」）は、本規約に同意したものとみなします。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">第2条（サービス内容）</h2>
              <p className="text-gray-600 mb-4">
                本サービスは、ブルーアーカイブのゲーム内キャラクター（生徒）に関するデータを提供するAPIサービスです。
              </p>
              <ul className="text-gray-600 space-y-2 ml-6">
                <li>• 生徒の基本情報（名前、レア度、所属学校等）</li>
                <li>• 戦闘関連データ（武器、攻撃タイプ、防御タイプ等）</li>
                <li>• 地形適応度データ</li>
                <li>• その他ゲーム内で公開されている情報</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">第3条（利用条件）</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">3.1 利用目的</h3>
                  <p className="text-gray-600 mb-2">本サービスは以下の目的での利用を想定しています：</p>
                  <ul className="text-gray-600 space-y-1 ml-6">
                    <li>• ブルーアーカイブファンコミュニティ向けのツール開発</li>
                    <li>• 学習・研究目的でのデータ分析</li>
                    <li>• 個人的な情報整理・管理</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">3.2 レート制限</h3>
                  <p className="text-gray-600">
                    安定したサービス提供のため、1分間に100回までのリクエスト制限を設けています。
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">第4条（禁止事項）</h2>
              <p className="text-gray-600 mb-4">利用者は以下の行為を行ってはなりません：</p>
              <ul className="text-gray-600 space-y-2 ml-6">
                <li>• サーバーに過度な負荷をかける行為</li>
                <li>• 本サービスの運営を妨害する行為</li>
                <li>• 取得したデータを商業目的で無断利用する行為</li>
                <li>• 法令に違反する行為</li>
                <li>• 他の利用者や第三者に迷惑をかける行為</li>
                <li>• 本サービスを利用して不正なアクセスを試みる行為</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">第5条（知的財産権）</h2>
              <div className="space-y-4">
                <p className="text-gray-600">
                  本サービスで提供されるブルーアーカイブに関するデータの著作権は、
                  株式会社Nexon Games、Yostar Limited、NAT Games等の権利者に帰属します。
                </p>
                <p className="text-gray-600">
                  本API自体のソースコードはオープンソースとして提供されていますが、
                  ゲームデータの二次利用については各権利者の定める条件に従ってください。
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">第6条（免責事項）</h2>
              <div className="space-y-4">
                <p className="text-gray-600">
                  本サービスは「現状有姿」で提供されており、データの正確性、完全性、
                  最新性について一切保証いたしません。
                </p>
                <p className="text-gray-600">
                  本サービスの利用により生じた損害について、当方は一切の責任を負いません。
                </p>
                <p className="text-gray-600">
                  予告なくサービスの内容変更や停止を行う場合があります。
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">第7条（プライバシー）</h2>
              <p className="text-gray-600 mb-4">
                本サービスはアクセスログを記録する場合がありますが、
                個人を特定する情報の収集は行いません。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">第8条（規約の変更）</h2>
              <p className="text-gray-600 mb-4">
                本規約は予告なく変更される場合があります。
                変更後の規約は、本ページに掲載された時点で効力を発生します。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">第9条（お問い合わせ）</h2>
              <p className="text-gray-600 mb-4">
                本サービスに関するお問い合わせは、
                <a 
                  href="https://github.com/ibuki-hum4/BlueArchiveAPI/issues" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline mx-1"
                >
                  GitHubのIssues
                </a>
                までお願いします。
              </p>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-sm text-gray-500 mb-4">
                最終更新日: 2025年10月2日
              </p>
              
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