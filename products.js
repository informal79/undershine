const productContainers = document.querySelectorAll('[data-products]');
const featuredProductContainer = document.querySelector('[data-featured-product]');

const formatPrice = (price) => `${Number(price).toLocaleString('ko-KR')}원`;

function getPurchaseUrl(product) {
  const isMobile = window.matchMedia('(max-width: 760px)').matches
    || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  return isMobile && product.mobilePurchaseUrl
    ? product.mobilePurchaseUrl
    : product.purchaseUrl;
}

function createProductCard(product) {
  const card = document.createElement('article');
  card.className = 'shop-card reveal visible';

  const imageLink = document.createElement('a');
  imageLink.className = 'shop-card-image';
  imageLink.href = getPurchaseUrl(product);
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
  const tagline = document.createElement('p');
  tagline.className = 'product-tagline';
  tagline.textContent = product.tagline || '';
  const priceBlock = document.createElement('div');
  priceBlock.className = 'price-block';

  if (product.discountRate > 0) {
    const regularPrice = document.createElement('p');
    regularPrice.className = 'regular-price';
    regularPrice.textContent = `정가 ${formatPrice(product.regularPrice)}`;
    priceBlock.append(regularPrice);
  }

  const salePrice = document.createElement('p');
  salePrice.className = 'sale-price';
  if (product.discountRate > 0) {
    const discount = document.createElement('strong');
    discount.textContent = `${product.discountRate}%`;
    salePrice.append(discount);
  }
  const currentPrice = document.createElement('span');
  currentPrice.textContent = formatPrice(product.price);
  salePrice.append(currentPrice);
  priceBlock.append(salePrice);
  text.append(name, tagline, priceBlock);

  const buyButton = document.createElement('a');
  buyButton.className = 'buy-button';
  buyButton.href = getPurchaseUrl(product);
  buyButton.target = '_blank';
  buyButton.rel = 'noopener noreferrer';
  buyButton.textContent = '구매하기';
  buyButton.setAttribute('aria-label', `${product.name} 구매하기`);

  info.append(text, buyButton);
  card.append(imageLink, info);
  return card;
}

function createFeaturedProduct(product) {
  const article = document.createElement('article');
  article.className = 'featured-product-card reveal visible';

  const imageLink = document.createElement('a');
  imageLink.className = 'featured-product-image';
  imageLink.href = getPurchaseUrl(product);
  imageLink.target = '_blank';
  imageLink.rel = 'noopener noreferrer';
  imageLink.setAttribute('aria-label', `${product.name} 구매 페이지 열기`);

  const image = document.createElement('img');
  image.src = product.image.replace('/230x230ex/', '/600x600ex/');
  image.alt = product.name;
  imageLink.append(image);

  const copy = document.createElement('div');
  copy.className = 'featured-product-copy';
  const eyebrow = document.createElement('p');
  eyebrow.className = 'eyebrow';
  eyebrow.textContent = 'CURATED PICK';
  const name = document.createElement('h2');
  name.textContent = product.name;
  const tagline = document.createElement('p');
  tagline.className = 'featured-tagline';
  tagline.textContent = product.tagline || '';

  const priceBlock = document.createElement('div');
  priceBlock.className = 'price-block';
  if (product.discountRate > 0) {
    const regularPrice = document.createElement('p');
    regularPrice.className = 'regular-price';
    regularPrice.textContent = `정가 ${formatPrice(product.regularPrice)}`;
    priceBlock.append(regularPrice);
  }
  const salePrice = document.createElement('p');
  salePrice.className = 'sale-price';
  if (product.discountRate > 0) {
    const discount = document.createElement('strong');
    discount.textContent = `${product.discountRate}%`;
    salePrice.append(discount);
  }
  const currentPrice = document.createElement('span');
  currentPrice.textContent = formatPrice(product.price);
  salePrice.append(currentPrice);
  priceBlock.append(salePrice);

  const buyButton = document.createElement('a');
  buyButton.className = 'featured-buy-button';
  buyButton.href = getPurchaseUrl(product);
  buyButton.target = '_blank';
  buyButton.rel = 'noopener noreferrer';
  buyButton.textContent = '구매하기';

  copy.append(eyebrow, name, tagline, priceBlock, buyButton);
  article.append(imageLink, copy);
  return article;
}

async function loadProducts() {
  if (!productContainers.length && !featuredProductContainer) return;

  try {
    const response = await fetch('products.json');
    if (!response.ok) throw new Error('제품 데이터를 불러오지 못했습니다.');
    const products = await response.json();

    if (featuredProductContainer && products.length) {
      featuredProductContainer.replaceChildren(createFeaturedProduct(products[0]));
    }

    productContainers.forEach((container) => {
      const limit = Number(container.dataset.limit) || products.length;
      const start = Number(container.dataset.start) || 0;
      container.replaceChildren(...products.slice(start, start + limit).map(createProductCard));
    });
  } catch (error) {
    if (featuredProductContainer) {
      const message = document.createElement('p');
      message.className = 'products-status products-error';
      message.textContent = '추천 제품을 불러오지 못했습니다.';
      featuredProductContainer.replaceChildren(message);
    }
    productContainers.forEach((container) => {
      const message = document.createElement('p');
      message.className = 'products-status products-error';
      message.textContent = '제품을 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.';
      container.replaceChildren(message);
    });
  }
}

loadProducts();
