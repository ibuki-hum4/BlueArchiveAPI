import type { Metadata } from "next";
import { readStudentsData } from "@/lib/students/storage";

const siteName = "Blue Archive API";

type LayoutProps = {
  children: React.ReactNode;
};

type MetadataProps = {
  params: {
    id: string;
  };
};

const buildOgImageUrl = (title: string, subtitle?: string) => {
  const params = new URLSearchParams({ title });
  if (subtitle) {
    params.set("subtitle", subtitle);
  }
  return `/og?${params.toString()}`;
};

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const students = await readStudentsData();
  const student = students.find((item) => item.id === params.id);
  const canonicalPath = `/${params.id}`;

  if (!student) {
    const title = `生徒が見つかりません | ${siteName}`;
    const description = "指定された生徒が存在しないか、データが読み込めませんでした。";
    const image = buildOgImageUrl("生徒が見つかりません", `ID: ${params.id}`);

    return {
      title,
      description,
      alternates: {
        canonical: canonicalPath,
      },
      openGraph: {
        title,
        description,
        url: canonicalPath,
        type: "website",
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: "生徒が見つかりません",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [image],
      },
    };
  }

  const title = `${student.name} | ${siteName}`;
  const description = `${student.school}所属の${student.name}の詳細情報。レア度★${student.rarity}、攻撃タイプ${student.combat.attackType}などを掲載。`;
  const subtitle = `${student.school} / レア度★${student.rarity}`;
  const image = buildOgImageUrl(student.name, subtitle);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title,
      description,
      url: canonicalPath,
      type: "profile",
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
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default function StudentLayout({ children }: LayoutProps) {
  return <>{children}</>;
}
