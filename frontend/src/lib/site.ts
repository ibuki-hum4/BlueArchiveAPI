// サイト全体で共有するメタ情報

export const siteName = "Blue Archive API";
export const siteDescription = "ブルーアーカイブの生徒データを検索・閲覧できる非公式データベース";
export const siteUrl = "https://bluearchive-api.skyia.jp";

// OGP画像のキャッシュを破棄したいときに更新する
export const ogVersion = "20260322a";

export const buildOgImageUrl = (params?: { id?: string; title?: string; subtitle?: string }) => {
  const search = new URLSearchParams();
  if (params?.title) {
    search.set("title", params.title);
  }
  if (params?.id) {
    search.set("id", params.id);
  }
  if (params?.subtitle) {
    search.set("subtitle", params.subtitle);
  }
  search.set("v", ogVersion);
  return `/api/og?${search.toString()}`;
};
