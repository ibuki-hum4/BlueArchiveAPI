import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import RarityStars from '@/components/RarityStars';
import TypeChip from '@/components/TypeChip';
import { attackDotClass, defenseDotClass, terrainGradeClass } from '@/lib/student-style';
import { cn } from '@/lib/utils';
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
    // openGraph はルートレイアウトの設定と統合されず丸ごと置き換わるため、共通項目もここで指定する
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalPath,
      siteName,
      locale: 'ja_JP',
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

const TERRAINS = [
  { key: 'city', label: '市街地' },
  { key: 'outdoor', label: '屋外' },
  { key: 'indoor', label: '屋内' },
] as const;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="ba-panel p-5 sm:p-6">
      <h2 className="mb-3 text-sm font-semibold text-gray-900">{title}</h2>
      {children}
    </section>
  );
}

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 py-2.5 text-sm last:border-b-0">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-right font-medium text-gray-900">{children}</dd>
    </div>
  );
}

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
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <script
        type="application/ld+json"
        // JSON内の "<" をエスケープして </script> によるタグ脱出を防ぐ
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }}
      />

      {/* パンくず（JSON-LDと同じ階層） */}
      <nav aria-label="パンくずリスト" className="text-sm">
        <ol className="flex items-center gap-1 text-gray-400">
          <li>
            <Link href="/" className="text-gray-500 hover:text-gray-900">
              生徒一覧
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
          <li aria-current="page" className="truncate text-gray-900">{student.name}</li>
        </ol>
      </nav>

      <header className="mt-6">
        <div className="flex items-center gap-3">
          <RarityStars rarity={student.rarity} />
          <span className="ba-skew px-3 py-0.5 text-xs font-semibold italic tracking-wide text-white">
            {student.weapon.type}
          </span>
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">{student.name}</h1>
        <p className="mt-1 text-gray-500">{student.school}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          <TypeChip label={`攻撃 ${student.combat.attackType}`} dotClass={attackDotClass(student.combat.attackType)} />
          <TypeChip label={`防御 ${student.combat.defenseType}`} dotClass={defenseDotClass(student.combat.defenseType)} />
          <span className="text-xs text-gray-500">{student.role.type} · {student.role.class}</span>
        </div>
      </header>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Section title="基本情報">
          <dl>
            <InfoRow label="学校">{student.school}</InfoRow>
            <InfoRow label="レア度"><RarityStars rarity={student.rarity} size="sm" /></InfoRow>
            <InfoRow label="タイプ">{student.role.type}</InfoRow>
            <InfoRow label="クラス">{student.role.class}</InfoRow>
            <InfoRow label="ポジション">{student.role.position}</InfoRow>
          </dl>
        </Section>

        <Section title="戦闘情報">
          <dl>
            <InfoRow label="武器タイプ">{student.weapon.type}</InfoRow>
            <InfoRow label="遮蔽物">{student.weapon.cover ? '使用する' : '使用しない'}</InfoRow>
            <InfoRow label="攻撃タイプ">
              <TypeChip label={student.combat.attackType} dotClass={attackDotClass(student.combat.attackType)} />
            </InfoRow>
            <InfoRow label="防御タイプ">
              <TypeChip label={student.combat.defenseType} dotClass={defenseDotClass(student.combat.defenseType)} />
            </InfoRow>
          </dl>
        </Section>
      </div>

      <div className="mt-4">
        <Section title="地形適応度">
          <dl className="grid grid-cols-3 divide-x divide-gray-100">
            {TERRAINS.map(({ key, label }) => (
              <div key={key} className="py-2 text-center">
                <dt className="text-xs text-gray-500">{label}</dt>
                <dd className={cn('mt-1 text-3xl font-semibold tracking-tight', terrainGradeClass(student.terrainAdaptation[key]))}>
                  {student.terrainAdaptation[key]}
                </dd>
              </div>
            ))}
          </dl>
        </Section>
      </div>

      {/* API利用者向け */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400">
        <span>ID: <code className="font-mono">{student.id}</code></span>
        <a href={`/api/students/${student.id}`} className="font-mono hover:text-gray-900">
          GET /api/students/{student.id}
        </a>
      </div>
    </main>
  );
}
