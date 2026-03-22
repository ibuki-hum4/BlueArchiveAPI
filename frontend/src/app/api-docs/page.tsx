'use client';

import Navigation from '@/components/Navigation';
import Link from 'next/link';

export default function ApiDocumentationPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-slate-900">Blue Archive API ドキュメント</h1>
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm font-medium">
              v1.0
            </div>
          </div>

          {/* クイックスタート */}
          <section className="mb-12">
            <h2 className="text-3xl font-semibold text-slate-800 mb-6 border-b border-slate-200 pb-2">🚀 クイックスタート</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">📡 ベースURL</h3>
                <code className="bg-white border border-blue-300 px-3 py-2 rounded-md text-blue-800 font-mono text-sm block">
                  https://bluearchive-api.skyia.jp
                </code>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-3">⚡ 簡単な例</h3>
                <code className="bg-white border border-green-300 px-3 py-2 rounded-md text-green-800 font-mono text-sm block">
                  GET /api/students
                </code>
              </div>
            </div>
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-900 mb-3">📋 概要</h3>
              <p className="text-gray-700 leading-relaxed">
                Blue Archive API は、ブルーアーカイブの生徒データにアクセスするための RESTful API です。
                生徒の基本情報、戦闘データ、地形適応度、武器情報などを簡単に取得・操作できます。
              </p>
            </div>
          </section>

          {/* エンドポイント */}
          <section className="mb-12">
            <h2 className="text-3xl font-semibold text-slate-800 mb-6 border-b border-slate-200 pb-2">🌐 エンドポイント</h2>
            
            {/* GET /api/students */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-8">
              <div className="bg-green-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-md text-sm font-mono mr-3">GET</span>
                  <code className="text-green-700">/api/students</code>
                </h3>
                <p className="text-gray-600 mt-2">全生徒データを取得します（パフォーマンス向上のためキャッシュ済み）</p>
              </div>
              
              <div className="p-6 space-y-6">
                {/* パラメータ */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="text-blue-600 mr-2">📝</span>クエリパラメータ（オプション）
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 px-3 py-2 text-left">パラメータ</th>
                          <th className="border border-gray-200 px-3 py-2 text-left">型</th>
                          <th className="border border-gray-200 px-3 py-2 text-left">説明</th>
                          <th className="border border-gray-200 px-3 py-2 text-left">例</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-200 px-3 py-2 font-mono">limit</td>
                          <td className="border border-gray-200 px-3 py-2">number</td>
                          <td className="border border-gray-200 px-3 py-2">取得する生徒数の制限</td>
                          <td className="border border-gray-200 px-3 py-2 font-mono">?limit=10</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-200 px-3 py-2 font-mono">school</td>
                          <td className="border border-gray-200 px-3 py-2">string</td>
                          <td className="border border-gray-200 px-3 py-2">学校で絞り込み</td>
                          <td className="border border-gray-200 px-3 py-2 font-mono">?school=ゲヘナ学園</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-200 px-3 py-2 font-mono">rarity</td>
                          <td className="border border-gray-200 px-3 py-2">number</td>
                          <td className="border border-gray-200 px-3 py-2">レア度で絞り込み</td>
                          <td className="border border-gray-200 px-3 py-2 font-mono">?rarity=3</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* レスポンス */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="text-green-600 mr-2">✅</span>成功レスポンス (200 OK)
                  </h4>
                  <div className="bg-gray-900 rounded-md p-4 overflow-x-auto">
                    <pre className="text-green-400 text-sm">
{`{
  "message": "success",
  "total": 150,
  "count": 10,
  "data": [
    {
      "id": "B5F50C9O",
      "name": "アカネ（バニーガール）",
      "rarity": 3,
      "weapon": {
        "type": "HG",
        "cover": false
      },
      "role": {
        "type": "SPECIAL",
        "class": "アタッカー",
        "position": "BACK"
      },
      "school": "ミレニアムサイエンススクール",
      "combat": {
        "attackType": "神秘",
        "defenseType": "重装甲"
      },
      "terrainAdaptation": {
        "city": "B",
        "outdoor": "D",
        "indoor": "S"
      }
    }
    // ... 他の生徒データ
  ]
}`}
                    </pre>
                  </div>
                </div>

                {/* エラーレスポンス */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="text-red-600 mr-2">❌</span>エラーレスポンス
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <div className="text-red-800 font-medium mb-1">429 Too Many Requests</div>
                      <div className="bg-gray-900 rounded-md p-2">
                        <pre className="text-red-400 text-xs">{"{ \"error\": \"Rate limit exceeded\", \"retryAfter\": 60 }"}</pre>
                      </div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <div className="text-red-800 font-medium mb-1">500 Internal Server Error</div>
                      <div className="bg-gray-900 rounded-md p-2">
                        <pre className="text-red-400 text-xs">{"{ \"error\": \"Internal server error\" }"}</pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* POST /api/students */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-8">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                  <span className="bg-yellow-500 text-white px-3 py-1 rounded-md text-sm font-mono mr-3">POST</span>
                  <code className="text-yellow-700">/api/students</code>
                </h3>
                <p className="text-gray-600 mt-2">新しい生徒データを追加します（管理者権限が必要）</p>
              </div>
              
              <div className="p-6 space-y-6">
                {/* 認証 */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-800 mb-2 flex items-center">
                    <span className="text-amber-600 mr-2">🔐</span>認証が必要
                  </h4>
                  <p className="text-amber-700 text-sm">このエンドポイントは管理者権限が必要です。適切なAPIキーをヘッダーに含めてください。</p>
                </div>

                {/* リクエストヘッダー */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="text-blue-600 mr-2">📋</span>リクエストヘッダー
                  </h4>
                  <div className="bg-gray-900 rounded-lg p-3">
                    <pre className="text-blue-400 text-sm">
{`Content-Type: application/json
Authorization: Bearer YOUR_API_KEY`}
                    </pre>
                  </div>
                </div>

                {/* リクエストボディ */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="text-purple-600 mr-2">📤</span>リクエストボディ
                  </h4>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-purple-400 text-sm">
{`{
  "name": "新しい生徒",        // 必須: 生徒名
  "rarity": 3,                 // 必須: レア度 (1-3)
  "weapon": {
    "type": "AR",              // 必須: 武器タイプ
    "cover": true              // 必須: カバー可否
  },
  "role": {
    "type": "STRIKER",         // 必須: STRIKER or SPECIAL
    "class": "アタッカー",      // 必須: 役割クラス
    "position": "FRONT"        // 必須: FRONT, MIDDLE, BACK
  },
  "school": "ゲヘナ学園",       // 必須: 所属学校
  "combat": {
    "attackType": "爆発",       // 必須: 攻撃タイプ
    "defenseType": "軽装備"     // 必須: 防御タイプ
  },
  "terrainAdaptation": {
    "city": "A",               // 必須: 市街地適応 (S/A/B/C/D)
    "outdoor": "B",            // 必須: 屋外適応
    "indoor": "S"              // 必須: 屋内適応
  }
}`}
                    </pre>
                  </div>
                </div>

                {/* 成功レスポンス */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="text-green-600 mr-2">✅</span>成功レスポンス (201 Created)
                  </h4>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <pre className="text-green-400 text-sm">
{`{
  "status": "success",
  "message": "生徒データを保存しました",
  "id": "ABC123XY",
  "data": {
    // 作成された生徒データ全体
  }
}`}
                    </pre>
                  </div>
                </div>

                {/* バリデーションエラー */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="text-red-600 mr-2">❌</span>バリデーションエラー (400 Bad Request)
                  </h4>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="bg-gray-900 rounded p-2">
                      <pre className="text-red-400 text-xs">
{`{
  "error": "Validation failed",
  "details": [
    "name is required",
    "rarity must be between 1 and 3"
  ]
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* GET /api/students/[id] */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-8">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm font-mono mr-3">GET</span>
                  <code className="text-blue-700">/api/students/{"{id}"}</code>
                </h3>
                <p className="text-gray-600 mt-2">指定IDの生徒データを取得します</p>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">パスパラメータ</h4>
                  <div className="bg-gray-50 border rounded-lg p-3">
                    <code className="text-blue-600 font-mono">id</code> - 生徒の一意識別子（例: B5F50C9O）
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="text-green-600 mr-2">✅</span>成功レスポンス (200 OK)
                  </h4>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <pre className="text-green-400 text-sm">
{`{
  "message": "success",
  "data": {
    "id": "B5F50C9O",
    "name": "アカネ（バニーガール）",
    // ... 完全な生徒データ
  }
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="text-red-600 mr-2">❌</span>エラーレスポンス (404 Not Found)
                  </h4>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="bg-gray-900 rounded p-2">
                      <pre className="text-red-400 text-xs">{"{ \"error\": \"Student not found\" }"}</pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* データ形式 */}
          <section className="mb-12">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6 border-b-2 border-blue-200 pb-2">📊 データ形式・スキーマ</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* 生徒オブジェクト構造 */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="text-blue-600 mr-2">🏗️</span>Student オブジェクト
                </h3>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-blue-400 text-xs">
{`{
  "id": string,              // 生徒ID
  "name": string,            // 生徒名
  "rarity": number,          // レア度 (1-3)
  "weapon": {
    "type": string,          // 武器タイプ
    "cover": boolean         // カバー可否
  },
  "role": {
    "type": string,          // STRIKER/SPECIAL
    "class": string,         // 役割クラス
    "position": string       // FRONT/MIDDLE/BACK
  },
  "school": string,          // 所属学校
  "combat": {
    "attackType": string,    // 攻撃タイプ
    "defenseType": string    // 防御タイプ
  },
  "terrainAdaptation": {
    "city": string,          // 市街地適応度
    "outdoor": string,       // 屋外適応度
    "indoor": string         // 屋内適応度
  }
}`}
                  </pre>
                </div>
              </div>

              {/* レスポンス構造 */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="text-green-600 mr-2">📤</span>API レスポンス構造
                </h3>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-green-400 text-xs">
{`// GET /api/students
{
  "message": string,         // ステータスメッセージ
  "total": number,           // 総データ数
  "count": number,           // 返却データ数
  "data": Student[]          // 生徒データ配列
}

// GET /api/students/[id]  
{
  "message": string,         // ステータスメッセージ
  "data": Student            // 単一生徒データ
}

// POST /api/students
{
  "status": string,          // 処理結果
  "message": string,         // メッセージ
  "id": string,              // 作成された生徒ID
  "data": Student            // 作成されたデータ
}`}
                  </pre>
                </div>
              </div>
            </div>

            {/* 詳細仕様 */}
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="text-yellow-600 mr-2">⭐</span>レア度 (rarity)
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                    <div className="text-yellow-800 font-bold text-lg">★3</div>
                    <div className="text-yellow-600 text-sm">値: 3</div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                    <div className="text-purple-800 font-bold text-lg">★2</div>
                    <div className="text-purple-600 text-sm">値: 2</div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <div className="text-blue-800 font-bold text-lg">★1</div>
                    <div className="text-blue-600 text-sm">値: 1</div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="text-orange-600 mr-2">🔫</span>武器タイプ (weapon.type)
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-11 gap-2">
                  {['HG', 'AR', 'SMG', 'SR', 'SG', 'GL', 'RL', 'RG', 'MG', 'MT', 'FT'].map(weapon => (
                    <div key={weapon} className="bg-gray-100 rounded px-2 py-1 text-center text-sm font-mono">
                      {weapon}
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  HG: ハンドガン, AR: アサルトライフル, SMG: サブマシンガン, SR: スナイパーライフル, SG: ショットガン, GL: グレネードランチャー, RL: ロケットランチャー, RG: レイルガン, MG: マシンガン, MT: 迫撃砲, FT: 火炎放射器
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="text-red-600 mr-2">⚔️</span>攻撃・防御タイプ
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">攻撃タイプ</h4>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">神秘</span>
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">爆発</span>
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">貫通</span>
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">振動</span>
                        <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded text-sm">分解</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">防御タイプ</h4>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">重装甲</span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">軽装備</span>
                        <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm">特殊装甲</span>
                        <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded text-sm">弾力装甲</span>
                        <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded text-sm">複合装甲</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="text-green-600 mr-2">🌍</span>地形適応度
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="bg-green-500 text-white px-2 py-1 rounded text-sm font-bold">S</span>
                      <span className="text-gray-600 text-sm">最高 - 120%効率</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="bg-blue-500 text-white px-2 py-1 rounded text-sm font-bold">A</span>
                      <span className="text-gray-600 text-sm">優秀 - 100%効率</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="bg-yellow-500 text-white px-2 py-1 rounded text-sm font-bold">B</span>
                      <span className="text-gray-600 text-sm">普通 - 80%効率</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="bg-orange-500 text-white px-2 py-1 rounded text-sm font-bold">C</span>
                      <span className="text-gray-600 text-sm">低い - 60%効率</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">D</span>
                      <span className="text-gray-600 text-sm">最低 - 40%効率</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 使用例・実装ガイド */}
          <section className="mb-12">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6 border-b-2 border-blue-200 pb-2">💻 使用例・実装ガイド</h2>
            
            <div className="space-y-8">
              {/* JavaScript / TypeScript */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="text-yellow-600 mr-2">⚡</span>JavaScript / TypeScript
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">基本的な使用例</h4>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-green-400 text-sm">
{`// 全生徒データを取得
const fetchStudents = async () => {
  try {
    const response = await fetch('/api/students');
    const result = await response.json();
    
    if (result.message === 'success') {
      console.log(\`\${result.total}名の生徒データを取得\`);
      return result.data;
    }
  } catch (error) {
    console.error('データ取得エラー:', error);
  }
};

// 特定の生徒を検索
const findStudent = async (id) => {
  const response = await fetch(\`/api/students/\${id}\`);
  const result = await response.json();
  return result.data;
};

// 学校で絞り込み
const getStudentsBySchool = async (school) => {
  const response = await fetch(\`/api/students?school=\${encodeURIComponent(school)}\`);
  return (await response.json()).data;
};`}
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">React Hook の実装例</h4>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-blue-400 text-sm">
{`import { useState, useEffect } from 'react';

const useStudents = (filters = {}) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams(filters);
        const response = await fetch(\`/api/students?\${params}\`);
        const result = await response.json();
        setStudents(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [JSON.stringify(filters)]);

  return { students, loading, error };
};`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              {/* Python */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="text-blue-600 mr-2">🐍</span>Python
                </h3>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-green-400 text-sm">
{`import requests
import json

class BlueArchiveAPI:
    BASE_URL = "https://bluearchive-api.skyia.jp/api"
    
    def __init__(self):
        self.session = requests.Session()
    
    def get_students(self, **filters):
        """全生徒データまたはフィルタリング結果を取得"""
        response = self.session.get(f"{self.BASE_URL}/students", params=filters)
        response.raise_for_status()
        return response.json()
    
    def get_student(self, student_id):
        """特定の生徒データを取得"""
        response = self.session.get(f"{self.BASE_URL}/students/{student_id}")
        response.raise_for_status()
        return response.json()
    
    def search_by_rarity(self, rarity):
        """レア度で検索"""
        return self.get_students(rarity=rarity)
    
    def search_by_school(self, school):
        """学校で検索"""
        return self.get_students(school=school)

# 使用例
api = BlueArchiveAPI()

# 全生徒取得
all_students = api.get_students()
print(f"総生徒数: {all_students['total']}")

# ★3生徒のみ取得
ssr_students = api.search_by_rarity(3)
print(f"★3生徒数: {len(ssr_students['data'])}")

# 特定学校の生徒取得
gehenna_students = api.search_by_school("ゲヘナ学園")
print(f"ゲヘナ学園生徒数: {len(gehenna_students['data'])}")`}
                  </pre>
                </div>
              </div>

              {/* cURL コマンド例 */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="text-gray-600 mr-2">📡</span>cURL コマンド例
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">基本的なGETリクエスト</h4>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-yellow-400 text-sm">
{`# 全生徒データを取得
curl -X GET "https://bluearchive-api.skyia.jp/api/students" \\
     -H "Accept: application/json"

# 特定生徒を取得
curl -X GET "https://bluearchive-api.skyia.jp/api/students/B5F50C9O" \\
     -H "Accept: application/json"

# フィルタリングして取得
curl -X GET "https://bluearchive-api.skyia.jp/api/students?rarity=3&limit=10" \\
     -H "Accept: application/json"`}
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">データ投稿（管理者用）</h4>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-green-400 text-sm">
{`// 全生徒データを取得（ページネーション対応）
const fetchStudents = async (page = 1, limit = 20) => {
  try {
    // 例: /api/students?page=1&limit=20
    const response = await fetch('/api/students?page=' + page + '&limit=' + limit);
    const result = await response.json();

    if (result.message === 'success') {
      console.log(result.total + '名の生徒データを取得 (count=' + result.count + ')');
      return result.data;
    }
  } catch (error) {
    console.error('データ取得エラー:', error);
  }
};

// 特定の生徒を検索
const findStudent = async (id) => {
  const response = await fetch('/api/students/' + id);
  const result = await response.json();
  return result.data;
};

// 学校で絞り込み
const getStudentsBySchool = async (school, page = 1, limit = 20) => {
  const response = await fetch('/api/students?school=' + encodeURIComponent(school) + '&page=' + page + '&limit=' + limit);
  return (await response.json()).data;
};`}
                      </pre>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="font-semibold text-yellow-800 mb-2">制限内容</div>
                    <ul className="text-yellow-700 text-sm space-y-1">
                      <li>• <strong>GET リクエスト:</strong> 1分間に100リクエスト</li>
                      <li>• <strong>POST リクエスト:</strong> 1分間に10リクエスト</li>
                      <li>• <strong>同一IP:</strong> 1時間に1000リクエスト</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="font-medium text-red-800 mb-1">制限超過時</div>
                    <div className="text-red-700 text-sm">
                      429 Too Many Requests レスポンスが返され、
                      <code className="bg-red-100 px-1 rounded">Retry-After</code> ヘッダーで待機時間が通知されます。
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="text-blue-600 mr-2">🔐</span>認証・権限
                </h3>
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="font-semibold text-green-800 mb-2">パブリックアクセス</div>
                    <ul className="text-green-700 text-sm space-y-1">
                      <li>• GET /api/students - 認証不要</li>
                      <li>• GET /api/students/[id] - 認証不要</li>
                    </ul>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="font-semibold text-amber-800 mb-2">管理者権限が必要</div>
                    <ul className="text-amber-700 text-sm space-y-1">
                      <li>• POST /api/students - APIキー必須</li>
                      <li>• PUT /api/students/[id] - APIキー必須</li>
                      <li>• DELETE /api/students/[id] - APIキー必須</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ・トラブルシューティング */}
          <section className="mb-12">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6 border-b-2 border-blue-200 pb-2">❓ FAQ・トラブルシューティング</h2>
            
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl">
                <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="font-semibold text-blue-900">Q: データが取得できません</h3>
                </div>
                <div className="p-6 text-gray-700">
                  <p className="mb-2"><strong>A:</strong> 以下を確認してください：</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>URLが正しいか（<code className="bg-gray-100 px-1 rounded">/api/students</code>）</li>
                    <li>ネットワーク接続状況</li>
                    <li>レート制限に達していないか</li>
                    <li>ブラウザの開発者ツールでエラーメッセージを確認</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl">
                <div className="bg-green-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="font-semibold text-green-900">Q: 特定の生徒が見つからない</h3>
                </div>
                <div className="p-6 text-gray-700">
                  <p className="mb-2"><strong>A:</strong> 生徒IDが正しいか確認してください。IDは英数字の組み合わせです（例: B5F50C9O）。全生徒リストから正確なIDを確認できます。</p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl">
                <div className="bg-purple-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="font-semibold text-purple-900">Q: フィルタリングが機能しない</h3>
                </div>
                <div className="p-6 text-gray-700">
                  <p className="mb-2"><strong>A:</strong> クエリパラメータの形式を確認してください：</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>学校名: 完全一致で指定（例: <code className="bg-gray-100 px-1 rounded">?school=ゲヘナ学園</code>）</li>
                    <li>レア度: 1-3の数値（例: <code className="bg-gray-100 px-1 rounded">?rarity=3</code>）</li>
                    <li>日本語文字のURLエンコードが必要な場合があります</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* 関連リンク */}
          <section className="mb-8">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6 border-b-2 border-blue-200 pb-2">🔗 関連リンク</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/terms" className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="text-blue-600 text-2xl mb-3">📋</div>
                <h3 className="font-semibold text-gray-800 mb-2">利用規約</h3>
                <p className="text-gray-600 text-sm">APIの利用条件と制限事項</p>
              </Link>
              <a 
                href="https://github.com/ibuki-hum4/BlueArchiveAPI" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="text-gray-800 text-2xl mb-3">🐙</div>
                <h3 className="font-semibold text-gray-800 mb-2">GitHub リポジトリ</h3>
                <p className="text-gray-600 text-sm">ソースコード・課題報告・貢献</p>
              </a>
              <Link href="/" className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="text-purple-600 text-2xl mb-3">🏠</div>
                <h3 className="font-semibold text-gray-800 mb-2">生徒データベース</h3>
                <p className="text-gray-600 text-sm">ホームページで生徒を検索</p>
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}