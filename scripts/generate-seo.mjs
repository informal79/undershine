import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const storyDir = path.join(root, 'story');
const domain = 'https://undershine.vercel.app';
const posts = JSON.parse(fs.readFileSync(path.join(storyDir, 'posts.json'), 'utf8'));
const products = JSON.parse(fs.readFileSync(path.join(root, 'products.json'), 'utf8'));

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#39;');

function renderBody(source) {
  return String(source).split(/\n\s*\n/).map((block) => {
    const text = block.trim();
    if (!text) return '';
    if (text.startsWith('## ')) return `<h2>${escapeHtml(text.slice(3))}</h2>`;
    const lines = text.split('\n');
    if (lines.every((line) => line.startsWith('- '))) {
      return `<ul>${lines.map((line) => `<li>${escapeHtml(line.slice(2))}</li>`).join('')}</ul>`;
    }
    return `<p>${escapeHtml(text)}</p>`;
  }).join('\n');
}

function jsonLd(value) {
  return JSON.stringify(value).replaceAll('<', '\\u003c');
}

function renderPost(post, index) {
  const canonical = `${domain}/story/${post.url}`;
  const previous = posts[index - 1];
  const next = posts[index + 1];
  const blogPosting = {
    '@context': 'https://schema.org', '@type': 'BlogPosting',
    headline: post.title, description: post.description,
    datePublished: post.date, dateModified: post.updated || post.date,
    author: {'@type': 'Person', name: post.author},
    mainEntityOfPage: canonical, keywords: post.tags.join(', ')
  };
  const faqPage = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: post.faq.map(({q, a}) => ({
      '@type': 'Question', name: q,
      acceptedAnswer: {'@type': 'Answer', text: a}
    }))
  };
  const breadcrumb = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      {'@type': 'ListItem', position: 1, name: '홈', item: `${domain}/`},
      {'@type': 'ListItem', position: 2, name: '이야기', item: `${domain}/story/`},
      {'@type': 'ListItem', position: 3, name: post.title, item: canonical}
    ]
  };
  const tags = post.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('');
  const faq = post.faq.map(({q, a}) => `<details><summary>${escapeHtml(q)}</summary><p>${escapeHtml(a)}</p></details>`).join('\n');
  const sources = post.sources.map(({title, url}) => `<li><a href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(title)}</a></li>`).join('\n');
  const related = post.relatedLinks.map(({label, url}) => `<li><a href="${escapeHtml(url)}">${escapeHtml(label)}</a></li>`).join('\n');
  const prevLink = previous ? `<a href="${escapeHtml(previous.url)}"><p class="dir">이전 글</p><p class="pn-title">${escapeHtml(previous.title)}</p></a>` : '<span></span>';
  const nextLink = next ? `<a class="next" href="${escapeHtml(next.url)}"><p class="dir">다음 글</p><p class="pn-title">${escapeHtml(next.title)}</p></a>` : '<span></span>';
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(post.title)}</title>
  <meta name="description" content="${escapeHtml(post.description)}">
  <meta name="author" content="${escapeHtml(post.author)}">
  <meta name="theme-color" content="#FBF8F0">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(post.title)}">
  <meta property="og:description" content="${escapeHtml(post.description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${domain}/assets/undershine-hero.png">
  <script type="application/ld+json">${jsonLd(blogPosting)}</script>
  <script type="application/ld+json">${jsonLd(faqPage)}</script>
  <script type="application/ld+json">${jsonLd(breadcrumb)}</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Noto+Sans+KR:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="icon" href="../assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="../styles.css">
  <link rel="stylesheet" href="story.css">
</head>
<body class="story-page">
<header class="site-header" id="top">
  <a class="logo" href="../index.html" aria-label="UnderShine 홈">UNDER<span>SHINE</span></a>
  <nav class="desktop-nav" aria-label="주요 메뉴"><a href="../about.html">내 소개</a><a href="../products.html">제품</a><a class="active" href="./">이야기</a><a href="../index.html#contact">연락하기</a></nav>
  <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-nav" aria-label="메뉴 열기"><span></span><span></span></button>
  <nav class="mobile-nav" id="mobile-nav" aria-label="모바일 메뉴"><a href="../about.html">내 소개</a><a href="../products.html">제품</a><a class="active" href="./">이야기</a><a href="../index.html#contact">연락하기</a></nav>
</header>
<div class="wrap">
  <div class="top"><a class="back" href="index.html">&larr; 목록으로</a></div>
  <main id="main">
    <article>
      <header class="post-head">
        <time datetime="${escapeHtml(post.date)}">${escapeHtml(post.date.replaceAll('-', '. '))}.</time>
        <h1>${escapeHtml(post.title)}</h1>
        <p class="meta"><span>${escapeHtml(post.author)}</span><span>수정 ${escapeHtml(post.updated || post.date)}</span></p>
        <div class="tags">${tags}</div>
      </header>
      <hr class="rule">
      <div class="body">${renderBody(post.body)}</div>
      <a class="product-cta" href="${escapeHtml(post.productLink.url)}">${escapeHtml(post.productLink.label)} <span aria-hidden="true">↗</span></a>
      <section class="related" aria-labelledby="related-title"><h2 id="related-title">함께 읽기</h2><ul>${related}</ul></section>
      <section class="faq" aria-labelledby="faq-title"><h2 id="faq-title">자주 묻는 질문</h2>${faq}</section>
      <section class="sources" aria-labelledby="sources-title"><h2 id="sources-title">참고·출처</h2><ol>${sources}</ol></section>
      <nav class="pn" aria-label="이전 및 다음 글">${prevLink}${nextLink}</nav>
    </article>
  </main>
</div>
<footer><a class="logo" href="../index.html">UNDER<span>SHINE</span></a><p>© 2026 UNDERSHINE. ALL RIGHTS RESERVED.</p><a href="#top">BACK TO TOP ↑</a></footer>
<script src="../script.js"></script>
</body>
</html>\n`;
}

posts.forEach((post, index) => {
  fs.writeFileSync(path.join(storyDir, post.url), renderPost(post, index));
});

const productsPath = path.join(root, 'products.html');
const productsHtml = fs.readFileSync(productsPath, 'utf8');
const productGraph = {
  '@context': 'https://schema.org',
  '@graph': products.map((product) => ({
    '@type': 'Product', name: product.name, image: product.image,
    url: product.purchaseUrl,
    offers: {'@type': 'Offer', price: String(product.price), priceCurrency: 'KRW'}
  }))
};
const productSchema = `<!-- PRODUCT_SCHEMA_START -->\n  <script type="application/ld+json">${jsonLd(productGraph)}</script>\n  <!-- PRODUCT_SCHEMA_END -->`;
fs.writeFileSync(productsPath, productsHtml.replace(/<!-- PRODUCT_SCHEMA_START -->[\s\S]*?<!-- PRODUCT_SCHEMA_END -->/, productSchema));

const publicPages = [
  ['/', '2026-08-29'], ['/about.html', '2026-08-29'], ['/products.html', '2026-08-29'], ['/story/', '2026-08-29'],
  ...posts.map((post) => [`/story/${post.url}`, post.updated || post.date])
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${publicPages.map(([url, date]) => `  <url><loc>${domain}${url}</loc><lastmod>${date}</lastmod></url>`).join('\n')}
</urlset>\n`;
fs.writeFileSync(path.join(root, 'sitemap.xml'), sitemap);

const sorted = posts.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20);
const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>UnderShine 이야기</title>
  <link>${domain}/story/</link>
  <description>매일 입는 좋은 기본을 만드는 UnderShine의 이야기</description>
  <language>ko</language>
${sorted.map((post) => `  <item><title>${escapeHtml(post.title)}</title><link>${domain}/story/${post.url}</link><description>${escapeHtml(post.summary)}</description><pubDate>${new Date(`${post.date}T00:00:00+09:00`).toUTCString()}</pubDate><guid>${domain}/story/${post.url}</guid></item>`).join('\n')}
</channel></rss>\n`;
fs.writeFileSync(path.join(root, 'feed.xml'), feed);

const llms = `# UnderShine

편안함 속에서 자연스럽게 빛나는 일상을 위한 데일리웨어 브랜드입니다.

## 파는 것

여성의류, 여성속옷, 남성의류를 판매합니다.

## 페이지 안내

- [홈](${domain}/): 브랜드 소개와 대표 제품
- [내 소개](${domain}/about.html): UnderShine을 시작한 이야기
- [제품](${domain}/products.html): 판매 중인 제품과 구매 링크
- [이야기](${domain}/story/): 제품 관리와 브랜드 제작 이야기

## 이야기(블로그)

${sorted.slice(0, 30).map((post) => `- [${post.title}](${domain}/story/${post.url}): ${post.summary}`).join('\n')}
`;
fs.writeFileSync(path.join(root, 'llms.txt'), llms);

fs.writeFileSync(path.join(root, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /story/admin.html\n\nSitemap: ${domain}/sitemap.xml\n`);
