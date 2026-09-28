import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import Navigation from '@/components/Navigation';
import RarityStars from '@/components/RarityStars';
import { getStudentById } from '@/lib/students/server';
import { buildOgImageUrl, siteName, siteUrl } from '@/lib/site';

// 生徒データはPVCで実行時にマウントされるため、リクエストごとにレンダリングする
export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const student = await getStudentById(id);

  if (!student) {
    return {
      title: '生徒が見つかりません',
      robots: { index: false },
    };
  }

  const fullTitle = `${student.name} | ${siteName}`;
  const description = `${student.school}所属の${student.name}の詳細情報。レア度★${student.rarity}、攻撃タイプ${student.combat.attackType}などを掲載。`;
  const image = buildOgImageUrl({
    id: student.id,
    title: student.name,
    subtitle: `${student.school} / レア度★${student.rarity}`,
  });
  const canonicalPath = `/${student.id}`;

  return {
    // ルートレイアウトの title.template で「| Blue Archive API」が付与される
    title: student.name,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalPath,
      type: 'profile',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${student.name}のOGP画像`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
    },
  };
}

// 攻撃タイプの色設定
const getAttackTypeColor = (attackType: string): string => {
  switch (attackType) {
    case '神秘': return 'text-ba-blue-700 bg-ba-blue-50';
    case '爆発': return 'text-red-600 bg-red-50';
    case '貫通': return 'text-yellow-600 bg-yellow-50';
    default: return 'text-gray-600 bg-gray-50';
  }
};

// 地形適応度の背景色
const getTerrainColor = (grade: string): string => {
  switch (grade) {
    case 'S': return 'bg-green-50 text-green-700';
    case 'A': return 'bg-ba-blue-50 text-ba-blue-700';
    case 'B': return 'bg-yellow-50 text-yellow-700';
    case 'C': return 'bg-orange-50 text-orange-700';
    case 'D': return 'bg-red-50 text-red-700';
    default: return 'bg-gray-100 text-gray-600';
  }
};

export default async function StudentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const student = await getStudentById(id);

  if (!student) {
    notFound();
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '生徒一覧', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: student.name, item: `${siteUrl}/${student.id}` },
    ],
  };

  return (
    <div className="min-h-screen bg-ba-blue-50/40 text-ba-navy-900">
      <script
        type="application/ld+json"
        // JSON内の "<" をエスケープして </script> によるタグ脱出を防ぐ
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }}
      />
      <Navigation />

      <main id="main-content" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 戻るリンク */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-ba-blue-600 hover:text-ba-blue-800"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          生徒一覧に戻る
        </Link>

        <div className="overflow-hidden rounded-xl border border-border bg-white">
          {/* ヘッダー部分 */}
          <div className="ba-soft-panel p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <h1 className="font-rounded text-3xl font-extrabold text-ba-navy-900">{student.name}</h1>
                  <RarityStars rarity={student.rarity} size="lg" />
                </div>
                <p className="text-sm text-ba-navy-400">{student.school}</p>
              </div>
            </div>
          </div>

          {/* 詳細情報 */}
          <div className="p-6 space-y-6">
            {/* 基本情報 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-ba-navy-900 border-b border-ba-blue-100 pb-2">
                  基本情報
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-ba-navy-500">レア度:</span>
                    <RarityStars rarity={student.rarity} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ba-navy-500">学校:</span>
                    <span className="font-semibold text-ba-navy-900">{student.school}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-bold text-ba-navy-900 border-b border-ba-blue-100 pb-2">
                  戦闘情報
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-ba-navy-500">武器タイプ:</span>
                    <span className="font-semibold text-ba-navy-900">{student.weapon.type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ba-navy-500">カバー:</span>
                    <span className="font-semibold text-ba-navy-900">{student.weapon.cover ? 'あり' : 'なし'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ba-navy-500">攻撃タイプ:</span>
                    <span className={`rounded-md px-2.5 py-1 text-sm font-semibold ${getAttackTypeColor(student.combat.attackType)}`}>
                      {student.combat.attackType}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ba-navy-500">防御タイプ:</span>
                    <span className="font-semibold text-ba-navy-900">{student.combat.defenseType}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 役割情報 */}
            <div>
              <h2 className="mb-4 text-xl font-bold text-ba-navy-900 border-b border-ba-blue-100 pb-2">
                役割・ポジション
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg bg-ba-navy-50 p-4">
                  <div className="mb-1 text-sm text-ba-navy-400">タイプ</div>
                  <div className="font-bold text-ba-navy-900">{student.role.type}</div>
                </div>
                <div className="rounded-lg bg-ba-navy-50 p-4">
                  <div className="mb-1 text-sm text-ba-navy-400">クラス</div>
                  <div className="font-bold text-ba-navy-900">{student.role.class}</div>
                </div>
                <div className="rounded-lg bg-ba-navy-50 p-4">
                  <div className="mb-1 text-sm text-ba-navy-400">ポジション</div>
                  <div className="font-bold text-ba-navy-900">{student.role.position}</div>
                </div>
              </div>
            </div>

            {/* 地形適応 */}
            <div>
              <h2 className="mb-4 text-xl font-bold text-ba-navy-900 border-b border-ba-blue-100 pb-2">
                地形適応度
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border border-ba-blue-100 p-4 text-center">
                  <div className="mb-2 text-sm text-ba-navy-400">市街地</div>
                  <div className={`inline-block rounded-md px-4 py-2 text-lg font-bold ${getTerrainColor(student.terrainAdaptation.city)}`}>
                    {student.terrainAdaptation.city}
                  </div>
                </div>
                <div className="rounded-lg border border-ba-blue-100 p-4 text-center">
                  <div className="mb-2 text-sm text-ba-navy-400">屋外</div>
                  <div className={`inline-block rounded-md px-4 py-2 text-lg font-bold ${getTerrainColor(student.terrainAdaptation.outdoor)}`}>
                    {student.terrainAdaptation.outdoor}
                  </div>
                </div>
                <div className="rounded-lg border border-ba-blue-100 p-4 text-center">
                  <div className="mb-2 text-sm text-ba-navy-400">屋内</div>
                  <div className={`inline-block rounded-md px-4 py-2 text-lg font-bold ${getTerrainColor(student.terrainAdaptation.indoor)}`}>
                    {student.terrainAdaptation.indoor}
                  </div>
                </div>
              </div>
            </div>

            {/* ID情報（デバッグ用） */}
            <div className="border-t border-ba-blue-100 pt-4">
              <div className="text-sm text-ba-navy-400">
                ID: {student.id}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
