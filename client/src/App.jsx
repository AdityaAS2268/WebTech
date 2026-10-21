import { useMemo, useState } from "react";
import { products } from "./data/products";
import Profile from "./components/Profile";
import "./App.css";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

function App() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [cart, setCart] = useState({});
  const [wishlist, setWishlist] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const categories = [
    "All",
    ...new Set(products.map((product) => product.category)),
  ];

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        category === "All" || product.category === category;

      const matchesWishlist = !showWishlist || wishlist.includes(product.id);

      return matchesSearch && matchesCategory && matchesWishlist;
    });

    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [search, category, sortBy, showWishlist, wishlist]);

  const cartCount = Object.values(cart).reduce(
    (total, quantity) => total + quantity,
    0,
  );

  const cartItems = products.filter((product) => cart[product.id] > 0);

  const cartTotal = cartItems.reduce(
    (total, product) => total + product.price * cart[product.id],
    0,
  );

  function addToCart(product) {
    if (product.stock === 0) return;

    setCart((current) => {
      const quantity = current[product.id] || 0;

      if (quantity >= product.stock) {
        return current;
      }

      return {
        ...current,
        [product.id]: quantity + 1,
      };
    });
  }

  function updateQuantity(product, change) {
    setCart((current) => {
      const nextQuantity = (current[product.id] || 0) + change;

      if (nextQuantity <= 0) {
        const updated = { ...current };
        delete updated[product.id];
        return updated;
      }

      if (nextQuantity > product.stock) {
        return current;
      }

      return {
        ...current,
        [product.id]: nextQuantity,
      };
    });
  }

  function toggleWishlist(productId) {
    setWishlist((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  }

  function openWishlist() {
    setShowWishlist((current) => !current);
    setShowCart(false);
    setShowProfile(false);
  }

  function openCart() {
    setShowCart((current) => !current);
    setShowWishlist(false);
    setShowProfile(false);
  }

  return (
    <div className="shop">
      <header className="navbar">
        <a
          className="brand"
          href="#"
          aria-label="Shop home"
          onClick={(e) => {
            e.preventDefault();
            setShowProfile(false);
          }}
        >
          Shop<span>Sphere</span>
        </a>

        <label className="search-box">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setShowProfile(false);
            }}
          />
        </label>

        <nav className="nav-actions" aria-label="Shopping actions">
          <button
            className={showProfile ? "nav-button active" : "nav-button"}
            onClick={() => {
              setShowProfile((current) => !current);
              setShowCart(false);
              setShowWishlist(false);
            }}
            aria-pressed={showProfile}
          >
            👤 Profile
          </button>

          <button
            className={showWishlist ? "nav-button active" : "nav-button"}
            onClick={openWishlist}
            aria-pressed={showWishlist}
          >
            ♡ Wishlist ({wishlist.length})
          </button>

          <button className="cart-button" onClick={openCart}>
            🛒 Cart ({cartCount})
          </button>
        </nav>
      </header>

      <main className="main-content">
        {showProfile ? (
          <div style={{ padding: "1rem" }}>
            <Profile />
          </div>
        ) : (
          <>
            <section className="welcome">
              <div>
                <p className="eyebrow">YOUR EVERYDAY MARKETPLACE</p>
                <h1>
                  Find your next <span>favourite.</span>
                </h1>
                <p className="welcome-description">
                  Discover products picked for your everyday needs.
                </p>
              </div>

              <div className="welcome-badge">
                <span>✦</span>
                <p>
                  Good finds.
                  <br />
                  Better choices.
                </p>
              </div>
            </section>

            <section className="catalogue">
              <div className="catalogue-heading">
                <div>
                  <p className="eyebrow">
                    {showWishlist ? "YOUR SAVED ITEMS" : "THE COLLECTION"}
                  </p>
                  <h2>{showWishlist ? "Your wishlist" : "Explore products"}</h2>
                </div>

                <div className="filters">
                  <label>
                    Category
                    <select
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                    >
                      {categories.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Sort by
                    <select
                      value={sortBy}
                      onChange={(event) => setSortBy(event.target.value)}
                    >
                      <option value="featured">Featured</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Rating</option>
                    </select>
                  </label>
                </div>
              </div>

              {filteredProducts.length > 0 ? (
                <div className="product-grid">
                  {filteredProducts.map((product) => {
                    const quantityInCart = cart[product.id] || 0;
                    const isWishlisted = wishlist.includes(product.id);

                    return (
                      <article className="product-card" key={product.id}>
                        <div className="product-image-container">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="product-image"
                          />
                          <button
                            className={
                              isWishlisted
                                ? "wishlist-button active"
                                : "wishlist-button"
                            }
                            onClick={() => toggleWishlist(product.id)}
                            aria-label={
                              isWishlisted
                                ? `Remove ${product.name} from wishlist`
                                : `Save ${product.name} to wishlist`
                            }
                          >
                            {isWishlisted ? "♥" : "♡"}
                          </button>
                        </div>

                        <div className="product-body">
                          <p className="product-category">{product.category}</p>
                          <h3 className="product-title">{product.name}</h3>

                          <div className="rating">
                            <img
                              src={`/images/ratings/rating-${Math.round(
                                product.rating * 10,
                              )}.png`}
                              alt={`${product.rating} stars`}
                              className="rating-stars"
                            />
                            <span className="rating-count">
                              ({product.ratingCount})
                            </span>
                          </div>

                          <div className="product-footer">
                            <span className="price">
                              {formatPrice(product.price)}
                            </span>
                            <span
                              className={
                                product.stock > 0
                                  ? "stock in-stock"
                                  : "stock out-of-stock"
                              }
                            >
                              {product.stock > 0
                                ? `${product.stock} left`
                                : "Out of stock"}
                            </span>
                          </div>

                          <button
                            className="add-to-cart-button"
                            onClick={() => addToCart(product)}
                            disabled={
                              product.stock === 0 ||
                              quantityInCart >= product.stock
                            }
                          >
                            {product.stock === 0
                              ? "Sold out"
                              : quantityInCart > 0
                                ? `In cart (${quantityInCart})`
                                : "Add to cart"}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <h3>No products found</h3>
                  <p>
                    {showWishlist
                      ? "You haven't saved any items yet. Browse products and tap the heart icon to save them here."
                      : "Try clearing your filters or searching for something else."}
                  </p>
                  <button
                    className="reset-button"
                    onClick={() => {
                      setSearch("");
                      setCategory("All");
                      setShowWishlist(false);
                    }}
                  >
                    Show all products
                  </button>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {showCart && (
        <div className="overlay" onClick={() => setShowCart(false)}>
          <aside
            className="cart-panel"
            onClick={(event) => event.stopPropagation()}
            aria-label="Shopping cart"
          >
            <div className="panel-heading">
              <div>
                <p className="eyebrow">YOUR SELECTION</p>
                <h2>Shopping cart</h2>
              </div>
              <button
                className="close-button"
                onClick={() => setShowCart(false)}
                aria-label="Close cart"
              >
                ×
              </button>
            </div>

            {cartItems.length === 0 ? (
              <div className="empty-state">
                <h3>Your cart is empty</h3>
                <p>Add a product to get started.</p>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cartItems.map((product) => (
                    <div className="cart-item" key={product.id}>
                      <img src={product.image} alt="" />
                      <div className="cart-item-info">
                        <h3>{product.name}</h3>
                        <p>{formatPrice(product.price)}</p>
                        <div className="quantity-controls">
                          <button
                            onClick={() => updateQuantity(product, -1)}
                            aria-label={`Decrease ${product.name} quantity`}
                          >
                            −
                          </button>
                          <span>{cart[product.id]}</span>
                          <button
                            onClick={() => updateQuantity(product, 1)}
                            disabled={cart[product.id] >= product.stock}
                            aria-label={`Increase ${product.name} quantity`}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        className="remove-button"
                        onClick={() =>
                          setCart((current) => {
                            const updated = { ...current };
                            delete updated[product.id];
                            return updated;
                          })
                        }
                        aria-label={`Remove ${product.name}`}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="cart-total">
                  <span>Subtotal</span>
                  <strong>{formatPrice(cartTotal)}</strong>
                </div>
                <p className="cart-note">
                  Shipping and final charges are calculated at checkout.
                </p>
                <button
                  className="checkout-button"
                  onClick={() =>
                    alert(
                      "Checkout integration will be added with the Payment module.",
                    )
                  }
                >
                  Proceed to checkout
                </button>
              </>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

export default App;
