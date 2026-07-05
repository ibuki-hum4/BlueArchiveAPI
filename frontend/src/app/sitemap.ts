import type { MetadataRoute } from 'next';
import { readStudentsData } from '@/lib/students/storage';

// 生徒データはPVCで実行時にマウントされるため、ビルド時の静的生成を無効化する
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

const siteUrl = 'https://bluearchive-api.skyia.jp';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const students = await readStudentsData();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/overview`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/api-docs`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  const studentRoutes: MetadataRoute.Sitemap = students.map((student) => ({
    url: `${siteUrl}/${student.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...studentRoutes];
}
