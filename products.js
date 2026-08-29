const productContainers = document.querySelectorAll('[data-products]');

const formatPrice = (price) => `${Number(price).toLocaleString('ko-KR')}원`;

function createProductCard(product) {
  const card = document.createElement('article');
  card.className = 'shop-card reveal visible';

  const imageLink = document.createElement('a');
  imageLink.className = 'shop-card-image';
  imageLink.href = product.purchaseUrl;
  imageLink.target = '_blank';
  imageLink.rel = 'noopener noreferrer';
  imageLink.setAttribute('aria-label', `${product.name} 구매 페이지 열기`);

  const image = document.createElement('img');
  image.src = product.image.replace('/230x230ex/', '/600x600ex/');
  image.alt = product.name;
  image.loading = 'lazy';
  imageLink.append(image);

  const info = document.createElement('div');
  info.className = 'shop-card-info';

  const text = document.createElement('div');
  const name = document.createElement('h3');
  name.textContent = product.name;
  const price = document.createElement('p');
  price.textContent = formatPrice(product.price);
  text.append(name, price);

  const buyButton = document.createElement('a');
  buyButton.className = 'buy-button';
  buyButton.href = product.purchaseUrl;
  buyButton.target = '_blank';
  buyButton.rel = 'noopener noreferrer';
  buyButton.textContent = '구매하기';
  buyButton.setAttribute('aria-label', `${product.name} 구매하기`);

  info.append(text, buyButton);
  card.append(imageLink, info);
  return card;
}

async function loadProducts() {
  if (!productContainers.length) return;

  try {
    const response = await fetch('products.json');
    if (!response.ok) throw new Error('제품 데이터를 불러오지 못했습니다.');
    const products = await response.json();

    productContainers.forEach((container) => {
      const limit = Number(container.dataset.limit) || products.length;
      container.replaceChildren(...products.slice(0, limit).map(createProductCard));
    });
  } catch (error) {
    productContainers.forEach((container) => {
      const message = document.createElement('p');
      message.className = 'products-status products-error';
      message.textContent = '제품을 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.';
      container.replaceChildren(message);
    });
  }
}

loadProducts();
