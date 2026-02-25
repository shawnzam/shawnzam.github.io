import fs from "node:fs";
import path from "node:path";

const SITE_URL = "https://shawnzam.github.io";
const BLOG_DIR = path.join(process.cwd(), "blog");
const BLOG_DESCRIPTION = "Writing on AI, research, and learning.";
const AUTHOR_NAME = "Shawn Zamechek";

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function writeText(filePath, contents) {
  fs.writeFileSync(filePath, contents, "utf8");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function parseFrontMatter(source) {
  const normalized = source.replace(/^\uFEFF/, "");
  const lines = normalized.split(/\r?\n/);

  if (!lines.length || lines[0].trim() !== "---") {
    return { metadata: {}, content: normalized };
  }

  const metadata = {};
  let endIndex = -1;

  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.trim() === "---") {
      endIndex = i;
      break;
    }

    const match = line.match(/^([^:]+):\s*(.*)$/);
    if (!match) continue;

    const key = match[1].trim();
    const value = match[2].trim().replace(/^['"]|['"]$/g, "");
    if (key) metadata[key] = value;
  }

  if (endIndex === -1) {
    return { metadata: {}, content: normalized };
  }

  return {
    metadata,
    content: lines.slice(endIndex + 1).join("\n").trim(),
  };
}

function normalizeDate(value) {
  if (!value) return "";
  const match = String(value).trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "";
  return `${match[1]}-${match[2]}-${match[3]}`;
}

function formatHumanDate(isoDate) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return isoDate;

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatRssDate(isoDate) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return new Date().toUTCString();
  return date.toUTCString();
}

function stripMarkdown(markdownText) {
  return markdownText
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`>#-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractFirstHeading(markdownText) {
  const headingMatch = markdownText.match(/^#\s+(.+)$/m);
  return headingMatch ? headingMatch[1].trim() : "";
}

function extractExcerpt(markdownText, maxLength = 190) {
  const blocks = markdownText.replace(/\r\n/g, "\n").split(/\n{2,}/);

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed || trimmed === "---" || trimmed.startsWith("#")) continue;
    if (trimmed.split("\n").every((line) => line.trim().startsWith("- "))) continue;

    const plain = stripMarkdown(trimmed);
    if (!plain) continue;

    if (plain.length <= maxLength) return plain;

    const clipped = plain.slice(0, maxLength);
    const lastSpace = clipped.lastIndexOf(" ");
    const safeEnd = lastSpace > 100 ? lastSpace : maxLength;
    return `${clipped.slice(0, safeEnd).trim()}...`;
  }

  return "";
}

function renderInline(markdownInline) {
  let output = escapeHtml(markdownInline);

  output = output.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    (_match, label, url) =>
      `<a href="${url}" target="_blank" rel="noopener" class="text-blue-700 hover:underline">${label}</a>`,
  );

  output = output.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  output = output.replace(
    /(^|[\s(])(https?:\/\/[^\s<)]+)(?=$|[\s).,;:!?])/g,
    (_match, prefix, url) =>
      `${prefix}<a href="${url}" target="_blank" rel="noopener" class="text-blue-700 hover:underline">${url}</a>`,
  );

  return output;
}

function markdownToHtml(markdownText) {
  const normalized = markdownText.replace(/\r\n/g, "\n").trim();
  if (!normalized) return "";

  const blocks = normalized.split(/\n{2,}/);
  const htmlBlocks = [];

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    if (trimmed === "---") {
      htmlBlocks.push("<hr />");
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const headingText = renderInline(headingMatch[2].trim());
      htmlBlocks.push(`<h${level}>${headingText}</h${level}>`);
      continue;
    }

    const lines = trimmed
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length && lines.every((line) => line.startsWith("- "))) {
      const listItems = lines
        .map((line) => `<li>${renderInline(line.slice(2).trim())}</li>`)
        .join("\n");
      htmlBlocks.push(`<ul class="list-disc pl-6 space-y-2">\n${listItems}\n</ul>`);
      continue;
    }

    const paragraph = lines.join(" ").replace(/\s+/g, " ").trim();
    htmlBlocks.push(`<p>${renderInline(paragraph)}</p>`);
  }

  return htmlBlocks.join("\n");
}

function titleCase(value) {
  const text = String(value || "").trim();
  if (!text) return "Post";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function loadPosts() {
  const entries = fs.readdirSync(BLOG_DIR, { withFileTypes: true });
  const posts = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const slug = entry.name;
    const postDir = path.join(BLOG_DIR, slug);
    const postFiles = fs.readdirSync(postDir);
    const markdownFiles = postFiles.filter((file) => file.endsWith(".md"));
    if (!markdownFiles.length) continue;

    const preferredMarkdown = `${slug}.md`;
    const markdownFile = markdownFiles.includes(preferredMarkdown)
      ? preferredMarkdown
      : markdownFiles[0];

    const markdownPath = path.join(postDir, markdownFile);
    const source = readText(markdownPath);
    const parsed = parseFrontMatter(source);
    const metadata = parsed.metadata;
    const markdownBody = parsed.content;

    const stat = fs.statSync(markdownPath);
    const fallbackIsoDate = new Date(stat.mtime).toISOString().slice(0, 10);
    const published = normalizeDate(metadata.published) || fallbackIsoDate;
    const title = metadata.title || extractFirstHeading(markdownBody) || slug;
    const type = metadata.type || "post";
    const excerpt = metadata.description || extractExcerpt(markdownBody);

    const imageFile = metadata.image || `${slug}.png`;
    const imagePath = path.join(BLOG_DIR, imageFile);
    const image = fs.existsSync(imagePath) ? imageFile : "";

    posts.push({
      slug,
      title,
      type,
      published,
      publishedDisplay: formatHumanDate(published),
      excerpt,
      html: markdownToHtml(markdownBody),
      relativeUrl: `/blog/${slug}/`,
      absoluteUrl: `${SITE_URL}/blog/${slug}/`,
      image,
      imageAbsoluteUrl: image ? `${SITE_URL}/blog/${image}` : `${SITE_URL}/me.jpg`,
    });
  }

  return posts.sort((a, b) => b.published.localeCompare(a.published));
}

function renderBlogIndex(posts) {
  const currentYear = new Date().getFullYear();
  const socialImage = posts[0]?.imageAbsoluteUrl || `${SITE_URL}/me.jpg`;
  const blogLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Shawn Zamechek Blog",
    url: `${SITE_URL}/blog/`,
    description: BLOG_DESCRIPTION,
    publisher: {
      "@type": "Person",
      name: AUTHOR_NAME,
    },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      datePublished: post.published,
      url: post.absoluteUrl,
      author: {
        "@type": "Person",
        name: AUTHOR_NAME,
      },
    })),
  };

  const postCards = posts
    .map((post) => {
      const imageHtml = post.image
        ? `                <a href="./${post.slug}/" class="block mb-4">
                    <img src="./${post.image}" alt="Title image for ${escapeHtml(post.title)}"
                        class="w-full h-56 sm:h-64 object-cover rounded-lg border border-gray-200" loading="lazy" />
                </a>
`
        : "";

      return `            <article class="bg-white p-6 rounded shadow border border-gray-200">
${imageHtml}                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                    <h3 class="text-xl font-semibold text-gray-900">${escapeHtml(post.title)}</h3>
                    <span class="text-xs font-semibold tracking-wide text-gray-500 uppercase">${escapeHtml(
                      titleCase(post.type),
                    )}</span>
                </div>
                <p class="text-sm text-gray-500 mb-3">Published: ${escapeHtml(post.publishedDisplay)}</p>
                <p class="text-gray-700 mb-4">${escapeHtml(post.excerpt)}</p>
                <a href="./${post.slug}/" class="text-blue-700 hover:underline font-semibold">Read post</a>
            </article>`;
    })
    .join("\n\n");

  return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Shawn Zamechek | Blog</title>
    <meta name="description" content="${escapeHtml(BLOG_DESCRIPTION)}" />
    <meta name="robots" content="index,follow,max-image-preview:large" />
    <link rel="canonical" href="${SITE_URL}/blog/" />
    <link rel="alternate" type="application/rss+xml" title="Shawn Zamechek Blog RSS" href="${SITE_URL}/blog/rss.xml" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="Shawn Zamechek | Blog" />
    <meta property="og:description" content="${escapeHtml(BLOG_DESCRIPTION)}" />
    <meta property="og:url" content="${SITE_URL}/blog/" />
    <meta property="og:image" content="${socialImage}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Shawn Zamechek | Blog" />
    <meta name="twitter:description" content="${escapeHtml(BLOG_DESCRIPTION)}" />
    <meta name="twitter:image" content="${socialImage}" />
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-K2VQENWRZJ"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'G-K2VQENWRZJ');
    </script>
    <script type="application/ld+json">
${JSON.stringify(blogLd, null, 2)}
    </script>
    <link rel="stylesheet" href="../assets/styles.css" />
    <style>
        .site-header {
            position: relative;
            background: rgba(254, 252, 232, 0.94);
            box-shadow: 0 1px 0 rgba(15, 23, 42, 0.04), 0 8px 20px -20px rgba(15, 23, 42, 0.55);
        }

        .site-header::after {
            content: '';
            position: absolute;
            left: 1rem;
            right: 1rem;
            bottom: 0;
            height: 1px;
            background: linear-gradient(90deg,
                    rgba(148, 163, 184, 0),
                    rgba(148, 163, 184, 0.55),
                    rgba(148, 163, 184, 0));
        }
    </style>
</head>

<body class="bg-gradient-to-br from-green-100 via-gray-50 to-green-50 min-h-screen flex flex-col">
    <!-- Scroll to Top Button -->
    <button id="scrollTopBtn" aria-label="Scroll to top"
        class="fixed bottom-6 right-6 z-50 bg-green-700 hover:bg-green-800 text-white rounded-full shadow-lg p-3 transition-opacity opacity-0 pointer-events-none"
        style="transition: opacity 0.3s;">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
        </svg>
    </button>

    <header class="site-header">
        <div class="container mx-auto px-4 py-6 flex justify-between items-center">
            <div>
                <h1 class="text-3xl font-extrabold text-gray-800">Blog</h1>
                <p class="text-sm text-gray-600 mt-1">${escapeHtml(BLOG_DESCRIPTION)}</p>
            </div>
            <div class="flex items-center gap-4">
                <a href="./rss.xml" class="text-orange-700 hover:underline font-semibold">RSS</a>
                <a href="../" class="text-blue-700 hover:underline font-semibold">Back Home</a>
            </div>
        </div>
    </header>

    <main class="flex-1 container mx-auto px-4 py-12">
        <div class="max-w-3xl mx-auto">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">Posts</h2>

${postCards}
        </div>
    </main>

    <footer class="bg-white border-t py-4 mt-auto">
        <div class="container mx-auto px-4 text-center text-gray-500">
            &copy; ${currentYear} ${AUTHOR_NAME}.
        </div>
    </footer>
    <script>
        const scrollTopBtn = document.getElementById('scrollTopBtn');
        function checkScroll() {
            const header = document.querySelector('header');
            const headerBottom = header ? header.offsetHeight : 0;
            if (window.scrollY > headerBottom + 10) {
                scrollTopBtn.style.opacity = '1';
                scrollTopBtn.style.pointerEvents = 'auto';
            } else {
                scrollTopBtn.style.opacity = '0';
                scrollTopBtn.style.pointerEvents = 'none';
            }
        }
        window.addEventListener('scroll', checkScroll);
        if (scrollTopBtn) {
            scrollTopBtn.addEventListener('click', function () {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            checkScroll();
        }
    </script>
</body>

</html>
`;
}

function renderPostPage(post) {
  const currentYear = new Date().getFullYear();
  const pageDescription = post.excerpt || BLOG_DESCRIPTION;
  const pageTitle = post.title;
  const postLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.published,
    dateModified: post.published,
    author: {
      "@type": "Person",
      name: AUTHOR_NAME,
    },
    publisher: {
      "@type": "Person",
      name: AUTHOR_NAME,
    },
    image: post.imageAbsoluteUrl,
    mainEntityOfPage: post.absoluteUrl,
    description: pageDescription,
  };

  const imageHtml = post.image
    ? `            <img src="../${post.image}" alt="Title image for ${escapeHtml(post.title)}"
                class="w-full h-64 sm:h-80 object-cover rounded-lg border border-gray-200 mb-6" />
`
    : "";

  return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(pageTitle)}</title>
    <meta name="description" content="${escapeHtml(pageDescription)}" />
    <meta name="robots" content="index,follow,max-image-preview:large" />
    <link rel="canonical" href="${post.absoluteUrl}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escapeHtml(pageTitle)}" />
    <meta property="og:description" content="${escapeHtml(pageDescription)}" />
    <meta property="og:url" content="${post.absoluteUrl}" />
    <meta property="og:image" content="${post.imageAbsoluteUrl}" />
    <meta property="article:published_time" content="${post.published}T00:00:00Z" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(pageTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(pageDescription)}" />
    <meta name="twitter:image" content="${post.imageAbsoluteUrl}" />
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-K2VQENWRZJ"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'G-K2VQENWRZJ');
    </script>
    <script type="application/ld+json">
${JSON.stringify(postLd, null, 2)}
    </script>
    <link rel="stylesheet" href="../../assets/styles.css" />
    <style>
        .site-header {
            position: relative;
            background: rgba(254, 252, 232, 0.94);
            box-shadow: 0 1px 0 rgba(15, 23, 42, 0.04), 0 8px 20px -20px rgba(15, 23, 42, 0.55);
        }

        .site-header::after {
            content: '';
            position: absolute;
            left: 1rem;
            right: 1rem;
            bottom: 0;
            height: 1px;
            background: linear-gradient(90deg,
                    rgba(148, 163, 184, 0),
                    rgba(148, 163, 184, 0.55),
                    rgba(148, 163, 184, 0));
        }

        .post-content h1,
        .post-content h2,
        .post-content h3 {
            color: #1f2937;
            font-weight: 700;
            line-height: 1.3;
            margin-top: 1.75rem;
            margin-bottom: 0.75rem;
        }

        .post-content h1 {
            font-size: 1.9rem;
            margin-top: 0;
        }

        .post-content h2 {
            font-size: 1.4rem;
        }

        .post-content h3 {
            font-size: 1.15rem;
        }

        .post-content p,
        .post-content ul {
            color: #374151;
            line-height: 1.85;
            margin-bottom: 1rem;
        }

        .post-content em {
            color: #4b5563;
        }

        .post-content hr {
            border: 0;
            border-top: 1px solid #d1d5db;
            margin: 1.5rem 0;
        }
    </style>
</head>

<body class="bg-gradient-to-br from-green-100 via-gray-50 to-green-50 min-h-screen flex flex-col">
    <!-- Scroll to Top Button -->
    <button id="scrollTopBtn" aria-label="Scroll to top"
        class="fixed bottom-6 right-6 z-50 bg-green-700 hover:bg-green-800 text-white rounded-full shadow-lg p-3 transition-opacity opacity-0 pointer-events-none"
        style="transition: opacity 0.3s;">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
        </svg>
    </button>

    <header class="site-header">
        <div class="container mx-auto px-4 py-6 flex justify-between items-center">
            <div>
                <h1 class="text-2xl font-extrabold text-gray-800">Blog Post</h1>
                <p class="text-sm text-gray-600 mt-1">${escapeHtml(BLOG_DESCRIPTION)}</p>
            </div>
            <div class="space-x-4">
                <a href="../" class="text-blue-700 hover:underline font-semibold">All Posts</a>
                <a href="../../" class="text-blue-700 hover:underline font-semibold">Home</a>
            </div>
        </div>
    </header>

    <main class="flex-1 container mx-auto px-4 py-12">
        <article class="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded shadow border border-gray-200">
${imageHtml}            <p class="text-sm text-gray-500 mb-5">Published: ${escapeHtml(post.publishedDisplay)}</p>
            <div class="post-content">
${post.html}
            </div>
        </article>
    </main>

    <footer class="bg-white border-t py-4 mt-auto">
        <div class="container mx-auto px-4 text-center text-gray-500">
            &copy; ${currentYear} ${AUTHOR_NAME}.
        </div>
    </footer>
    <script>
        const scrollTopBtn = document.getElementById('scrollTopBtn');
        function checkScroll() {
            const header = document.querySelector('header');
            const headerBottom = header ? header.offsetHeight : 0;
            if (window.scrollY > headerBottom + 10) {
                scrollTopBtn.style.opacity = '1';
                scrollTopBtn.style.pointerEvents = 'auto';
            } else {
                scrollTopBtn.style.opacity = '0';
                scrollTopBtn.style.pointerEvents = 'none';
            }
        }
        window.addEventListener('scroll', checkScroll);
        if (scrollTopBtn) {
            scrollTopBtn.addEventListener('click', function () {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            checkScroll();
        }
    </script>
</body>

</html>
`;
}

function renderRss(posts) {
  const lastBuildDate = posts.length
    ? formatRssDate(posts[0].published)
    : new Date().toUTCString();

  const items = posts
    .map((post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(post.absoluteUrl)}</link>
      <guid isPermaLink="true">${escapeXml(post.absoluteUrl)}</guid>
      <pubDate>${escapeXml(formatRssDate(post.published))}</pubDate>
      <description>${escapeXml(post.excerpt)}</description>
      <category>${escapeXml(post.type)}</category>
    </item>`)
    .join("\n\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Shawn Zamechek Blog</title>
    <link>${SITE_URL}/blog/</link>
    <description>${escapeXml(BLOG_DESCRIPTION)}</description>
    <language>en-us</language>
    <atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${escapeXml(lastBuildDate)}</lastBuildDate>

${items}
  </channel>
</rss>
`;
}

function renderSitemap(posts) {
  const today = new Date().toISOString().slice(0, 10);
  const blogLastMod = posts[0]?.published || today;

  const postUrls = posts
    .map(
      (post) => `  <url>
    <loc>${escapeXml(post.absoluteUrl)}</loc>
    <lastmod>${post.published}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/blog/</loc>
    <lastmod>${blogLastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
${postUrls}
</urlset>
`;
}

function main() {
  if (!fs.existsSync(BLOG_DIR)) {
    throw new Error("Missing blog directory.");
  }

  const posts = loadPosts();
  if (!posts.length) {
    throw new Error("No markdown posts found under blog/<slug>/");
  }

  writeText(path.join(BLOG_DIR, "index.html"), renderBlogIndex(posts));

  for (const post of posts) {
    const postIndexPath = path.join(BLOG_DIR, post.slug, "index.html");
    writeText(postIndexPath, renderPostPage(post));
  }

  writeText(path.join(BLOG_DIR, "rss.xml"), renderRss(posts));
  writeText(path.join(process.cwd(), "sitemap.xml"), renderSitemap(posts));

  console.log(`Built ${posts.length} post(s): ${posts.map((post) => post.slug).join(", ")}`);
}

main();
