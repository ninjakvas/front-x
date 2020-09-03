export const slickPrev = (name) => {
  const icon = name ? `<svg><use xlink:href="img/sprite.svg#${name}"></use></svg>` : '';
  return `<button type="button" class="slick-prev">${icon}</button>`;
};

export const slickNext = (name) => {
  const icon = name ? `<svg><use xlink:href="img/sprite.svg#${name}"></use></svg>` : '';
  return `<button type="button" class="slick-next">${icon}</button>`;
};