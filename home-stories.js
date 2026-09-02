const homeStoryList = document.querySelector('[data-home-stories]');

function formatStoryDate(value) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value || '';
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

function createHomeStory(post) {
  const card = document.createElement('a');
  card.className = 'story';
  card.href = post.url ? `story/${post.url}` : `story/post.html?id=${encodeURIComponent(post.id || '')}`;

  const date = document.createElement('span');
  date.textContent = formatStoryDate(post.date);
  const content = document.createElement('div');
  const label = document.createElement('p');
  label.textContent = Array.isArray(post.tags) && post.tags.length ? post.tags[0] : 'STORY';
  const title = document.createElement('h3');
  title.textContent = post.title || '(제목 없음)';
  const summary = document.createElement('p');
  summary.textContent = post.summary || '';
  content.append(label, title, summary);
  const arrow = document.createElement('span');
  arrow.className = 'story-arrow';
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '↗';
  card.append(date, content, arrow);
  return card;
}

if (homeStoryList) {
  const renderLatestStories = (posts) => {
    const latest = Array.isArray(posts)
      ? posts.slice().sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))).slice(0, 3)
      : [];
    homeStoryList.replaceChildren(...latest.map(createHomeStory));
  };

  fetch('story/posts.json', { cache: 'no-store' })
    .then((response) => {
      if (!response.ok) throw new Error(String(response.status));
      return response.json();
    })
    .then(renderLatestStories)
    .catch(() => {
      if (Array.isArray(window.__undershineFallbackStories)) {
        renderLatestStories(window.__undershineFallbackStories);
        return;
      }
      const message = document.createElement('p');
      message.className = 'products-status';
      message.textContent = '이야기를 불러오지 못했습니다.';
      homeStoryList.replaceChildren(message);
    });
}
