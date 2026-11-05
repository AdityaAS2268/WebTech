import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { products as localProducts } from "./data/products";
import Profile from "./components/Profile";
import "./App.css";

// Format prices in Indian Rupees
const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);

function App() {
  const navigate = useNavigate();

  // Products fetched from MySQL through Express, with local fallback
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Shopping states
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [cart, setCart] = useState({});
  const [wishlist, setWishlist] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Fetch products from MySQL with fallback to local catalog
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("http://localhost:3000/api/products");

        if (response.ok) {
          const data = await response.json();

          if (data.success && Array.isArray(data.products) && data.products.length > 0) {
            // Ensure all product properties match the React UI
            const formattedProducts = data.products.map((product) => ({
              ...product,
              id: product.id,
              name: product.name || "Unnamed Product",
              image: product.image
                ? product.image.startsWith("/")
                  ? product.image
                  : `/${product.image}`
                : "",
              priceCents: Number(product.priceCents ?? product.price_cents ?? 0),
              stock: Number(product.stock ?? 10),
              category: product.category || product.type || "General",
              rating: {
                stars: Number(product.rating?.stars ?? product.rating_stars ?? 0),
                count: Number(product.rating?.count ?? product.rating_count ?? 0),
              },
            }));

            setProducts(formattedProducts);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Could not fetch products from MySQL backend, using local catalog:", err.message);
      }

      // Safe fallback to bundled product catalog
      const fallbackList = (localProducts || []).map((product) => ({
        ...product,
        stock: Number(product.stock ?? 15),
        category: product.category || (product.keywords && product.keywords[0]) || "General",
        rating: product.rating || { stars: 4.5, count: 50 },
      }));

      setProducts(fallbackList);
      setLoading(false);
    }

    fetchProducts();
  }, []);

  // Compute categories dynamically
  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(
        products
          .map((product) => product.category)
          .filter(Boolean)
      ),
    ];
  }, [products]);

  // Filter and sort products
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
      result.sort((a, b) => a.priceCents - b.priceCents);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.priceCents - a.priceCents);
    } else if (sortBy === "rating") {
      result.sort((a, b) => (b.rating?.stars || 0) - (a.rating?.stars || 0));
    }

    return result;
  }, [products, search, category, sortBy, showWishlist, wishlist]);

  // Cart calculations
  const cartCount = Object.values(cart).reduce(
    (total, quantity) => total + quantity,
    0
  );

  const cartItems = products.filter((product) => cart[product.id] > 0);

  const cartTotal = cartItems.reduce(
    (total, product) => total + (product.priceCents / 100) * cart[product.id],
    0
  );

  // Cart operations
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
        : [...current, productId]
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

  // Loading screen (only until initial products are ready)
  if (loading && products.length === 0) {
    return (
      <div style={{ padding: "4rem", textAlign: "center", fontFamily: "sans-serif" }}>
        <h2>Loading ShopSphere...</h2>
      </div>
    );
  }

  // Main application
  return (
    <div className="shop">
      {/* Navigation Bar */}
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
            Profile
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

      {/* Main Content */}
      <main className="main-content">
        {showProfile ? (
          <Profile onBackToShop={() => setShowProfile(false)} />
        ) : (
          <>
            {/* Welcome Section */}
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

            {/* Product Catalogue */}
            <section className="catalogue">
              <div className="catalogue-heading">
                <div>
                  <p className="eyebrow">
                    {showWishlist ? "YOUR SAVED ITEMS" : "THE COLLECTION"}
                  </p>
                  <h2>{showWishlist ? "Your wishlist" : "Explore products"}</h2>
                </div>

                <label className="sort-control">
                  <span>Sort by</span>
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                </label>
              </div>

              {/* Category Filters */}
              <div className="category-list" aria-label="Product categories">
                {categories.map((item) => (
                  <button
                    key={item}
                    className={
                      category === item
                        ? "category-chip selected"
                        : "category-chip"
                    }
                    onClick={() => setCategory(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <p className="result-count">
                {filteredProducts.length} product
                {filteredProducts.length !== 1 ? "s" : ""} found
              </p>

              {/* Product Cards */}
              {filteredProducts.length > 0 ? (
                <div className="product-grid">
                  {filteredProducts.map((product) => {
                    const isWishlisted = wishlist.includes(product.id);
                    const quantity = cart[product.id] || 0;

                    return (
                      <article className="product-card" key={product.id}>
                        <div className="product-image">
                          <img
                            src={product.image}
                            alt={product.name}
                            loading="lazy"
                          />
                          <button
                            className={
                              isWishlisted
                                ? "wishlist-button wishlisted"
                                : "wishlist-button"
                            }
                            onClick={() => toggleWishlist(product.id)}
                            aria-label={
                              isWishlisted
                                ? `Remove ${product.name} from wishlist`
                                : `Add ${product.name} to wishlist`
                            }
                            aria-pressed={isWishlisted}
                          >
                            {isWishlisted ? "♥" : "♡"}
                          </button>

                          {product.stock === 0 && (
                            <span className="stock-badge">Sold out</span>
                          )}
                        </div>

                        <div className="product-info">
                          <p className="product-category">{product.category}</p>
                          <h3>{product.name}</h3>

                          <div className="product-rating">
                            <img
                              className="rating-stars"
                              src={`/images/ratings/rating-${Math.round(
                                product.rating.stars * 10
                              )}.png`}
                              alt={`${product.rating.stars} out of 5 stars`}
                            />
                            <span className="rating-count">
                              {product.rating.count}
                            </span>
                          </div>

                          <div className="product-footer">
                            <div>
                              <p className="product-price">
                                {formatPrice(product.priceCents / 100)}
                              </p>
                              <p
                                className={
                                  product.stock > 0
                                    ? "stock-text"
                                    : "stock-text unavailable"
                                }
                              >
                                {product.stock > 0
                                  ? `${product.stock} in stock`
                                  : "Currently unavailable"}
                              </p>
                            </div>

                            <button
                              className="add-button"
                              onClick={() => addToCart(product)}
                              disabled={
                                product.stock === 0 || quantity >= product.stock
                              }
                            >
                              {quantity > 0
                                ? `Add more (${quantity})`
                                : "Add to cart"}
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <span>⌕</span>
                  <h3>No products found</h3>
                  <p>Try another search or change your filters.</p>
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

      {/* Shopping Cart */}
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
                        <p>{formatPrice(product.priceCents / 100)}</p>
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
                  onClick={() => {
                    const checkoutItems = cartItems.map((product) => ({
                      id: product.id,
                      name: product.name,
                      image: product.image,
                      price: product.priceCents / 100,
                      qty: cart[product.id],
                      category: product.category,
                    }));

                    sessionStorage.setItem(
                      "checkoutItems",
                      JSON.stringify(checkoutItems)
                    );

                    console.log("CHECKOUT ITEMS:", checkoutItems);
                    navigate("/checkout/address");
                  }}
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
