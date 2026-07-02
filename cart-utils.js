(function () {
  const STORAGE_KEY = 'moduforgeCart';

  function getCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    updateBadges(cart);
  }

  function makeId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function getCount(cart = getCart()) {
    return cart.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
  }

  function updateBadges(cart = getCart()) {
    document.querySelectorAll('.cart-badge').forEach(badge => {
      badge.textContent = getCount(cart);
    });
  }

  function addProduct(product) {
    const cart = getCart();
    const productId = String(product.productId || product.id);
    const colour = (product.colour || '').trim();
    if (!colour) {
      return cart;
    }
    const qty = Number(product.qty) || 1;
    const existing = cart.find(item =>
      item.type === 'product' &&
      String(item.productId) === productId &&
      (item.colour || 'Standard') === colour
    );

    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({
        id: makeId('product'),
        type: 'product',
        productId,
        name: product.name,
        image: product.image,
        colour,
        price: Number(product.price) || 0,
        qty
      });
    }

    saveCart(cart);
    return cart;
  }

  function addBundle(bundle) {
    const cart = getCart();
    const components = (bundle.components || []).map(component => ({
      id: String(component.id || component.name),
      name: component.name,
      price: Number(component.price) || 0
    }));
    const colour = bundle.colour || 'Custom selection';
    const signature = `${colour}|${components.map(component => component.id).sort().join('|')}`;
    const bundleId = bundle.bundleId || bundle.id || bundle.name || 'bundle';
    const existing = cart.find(item =>
      item.type === 'bundle' &&
      item.bundleId === bundleId &&
      item.signature === signature
    );

    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        id: makeId('bundle'),
        type: 'bundle',
        bundleId,
        signature,
        name: bundle.name,
        image: bundle.image,
        colour,
        price: Number(bundle.price) || components.reduce((sum, component) => sum + component.price, 0),
        qty: 1,
        components
      });
    }

    saveCart(cart);
    return cart;
  }

  function removeLine(id) {
    const cart = getCart().filter(item => item.id !== id);
    saveCart(cart);
    return cart;
  }

  function updateQty(id, qty) {
    let cart = getCart();
    cart = cart.map(item => item.id === id ? { ...item, qty: Number(qty) } : item)
      .filter(item => item.qty > 0);
    saveCart(cart);
    return cart;
  }

  window.ModuForgeCart = {
    getCart,
    saveCart,
    getCount,
    updateBadges,
    addProduct,
    addBundle,
    removeLine,
    updateQty
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => updateBadges());
  } else {
    updateBadges();
  }
})();
