import { VideoConfig } from '../types';

export function generateStandaloneHtml(config: VideoConfig): string {
  const siteName = config.siteName || 'اسم موقعك';
  const videoTitle = config.videoTitle || 'عنوان الفيديو هنا';
  const videoUrl = config.videoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  const redirectUrl = config.redirectUrl || 'https://www.google.com';
  const thumbnailUrl = config.thumbnailUrl || 'https://placehold.co/900x506/0d0f0d/2ecc71?text=%D8%B5%D9%88%D8%B1%D8%A9+%D9%85%D8%B5%D8%BA%D8%B1%D8%A9';
  const mediaType = config.mediaType || 'image';
  const buttonText = config.buttonText || '▶ مشاهدة الفيديو';
  const description = config.description || 'اكتب هنا وصف الفيديو أو الصورة.';
  const delayMs = config.delayRedirectMs ?? 150;

  const isVideoMedia = mediaType === 'video' || thumbnailUrl.startsWith('data:video/') || thumbnailUrl.endsWith('.mp4') || thumbnailUrl.endsWith('.webm');

  const mediaElementHtml = isVideoMedia
    ? `<video src="${escapeHtml(thumbnailUrl)}" controls autoplay loop muted playsinline style="width:100%;height:100%;object-fit:cover;"></video>`
    : `<img src="${escapeHtml(thumbnailUrl)}" alt="${escapeHtml(videoTitle)}">`;

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(videoTitle)}</title>
<style>
  :root{
    --bg:#0d0f0d;
    --bg-alt:#161916;
    --green:#2ecc71;
    --green-dark:#1e9e57;
    --text:#eaeaea;
    --text-dim:#a0a8a0;
    --border:#2a2e2a;
  }

  *{margin:0;padding:0;box-sizing:border-box;}

  body{
    background:var(--bg);
    color:var(--text);
    font-family:'Tahoma','Segoe UI',Arial,sans-serif;
    line-height:1.8;
  }

  header{
    display:flex;
    align-items:center;
    justify-content:space-between;
    padding:20px 40px;
    background:var(--bg-alt);
    border-bottom:2px solid var(--green);
  }

  .site-name{
    font-size:24px;
    font-weight:700;
    color:var(--green);
    letter-spacing:0.5px;
  }

  main{
    max-width:900px;
    margin:0 auto;
    padding:40px 20px;
  }

  .video-title{
    text-align:center;
    font-size:28px;
    font-weight:600;
    margin-bottom:30px;
    color:var(--text);
  }

  .media-wrapper{
    width:100%;
    aspect-ratio:16/9;
    background:#000;
    border:1px solid var(--border);
    border-radius:8px;
    overflow:hidden;
    display:flex;
    align-items:center;
    justify-content:center;
  }

  .media-wrapper img,
  .media-wrapper video{
    width:100%;
    height:100%;
    object-fit:cover;
  }

  .watch-btn-container{
    display:flex;
    justify-content:center;
    margin:30px 0;
  }

  .watch-btn{
    background:var(--green);
    color:#0d0f0d;
    border:none;
    padding:14px 40px;
    font-size:18px;
    font-weight:700;
    border-radius:6px;
    cursor:pointer;
    transition:background .2s ease, transform .15s ease;
    text-decoration:none;
    display:inline-block;
  }

  .watch-btn:hover{
    background:var(--green-dark);
    transform:translateY(-2px);
  }

  .description-section{
    margin-top:30px;
    padding:24px;
    background:var(--bg-alt);
    border:1px solid var(--border);
    border-radius:8px;
  }

  .description-section h2{
    color:var(--green);
    font-size:18px;
    margin-bottom:12px;
  }

  .description-section p{
    color:var(--text-dim);
    font-size:15px;
    white-space: pre-line;
  }

  footer{
    text-align:center;
    padding:20px;
    color:var(--text-dim);
    font-size:13px;
    border-top:1px solid var(--border);
    margin-top:40px;
  }
</style>
</head>
<body>

<header>
  <div class="site-name">${escapeHtml(siteName)}</div>
</header>

<main>
  <h1 class="video-title">${escapeHtml(videoTitle)}</h1>

  <div class="media-wrapper">
    ${mediaElementHtml}
  </div>

  <div class="watch-btn-container">
    <!-- عند النقر: يفتح رابط الفيديو في تبويب جديد ويتم توجيه الصفحة الحالية إلى الرابط الآخر -->
    <a
      href="${escapeHtml(videoUrl)}"
      target="_blank"
      rel="noopener noreferrer"
      class="watch-btn"
      id="watchButton"
      onclick="handleWatchClick(event)"
    >
      ${escapeHtml(buttonText)}
    </a>
  </div>

  <div class="description-section">
    <h2>الوصف</h2>
    <p>${escapeHtml(description)}</p>
  </div>
</main>

<footer>
  &copy; ${new Date().getFullYear()} ${escapeHtml(siteName)}. جميع الحقوق محفوظة.
</footer>

<script>
  function handleWatchClick(event) {
    var videoUrl = "${escapeJs(videoUrl)}";
    var redirectUrl = "${escapeJs(redirectUrl)}";

    // 1. فتح رابط الفيديو للمستخدم في تبويب جديد
    if (videoUrl) {
      window.open(videoUrl, '_blank', 'noopener,noreferrer');
    }

    // 2. توجيه الصفحة الحالية إلى الرابط الآخر
    if (redirectUrl) {
      event.preventDefault();
      setTimeout(function() {
        window.location.href = redirectUrl;
      }, ${delayMs});
    }
  }
</script>

</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeJs(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/'/g, "\\'");
}
