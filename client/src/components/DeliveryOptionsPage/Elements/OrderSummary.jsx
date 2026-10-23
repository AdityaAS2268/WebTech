export default function OrderSummary({ Icon, products, ProductPlaceholder, speed }) {
    return (
        <>
            <section className="items-section">
                <div className="section-heading section-heading--items">
                    <div>
                        <span className="section-index">02</span>
                        <div>
                            <h2>Your items</h2>
                            <p>{products.length} items in this order</p>
                        </div>
                    </div>
                    <span className="items-count">
                        {products.reduce((n, p) => n + p.qty, 0)} pieces
                    </span>
                </div>

                <ProductList products={products} ProductPlaceholder={ProductPlaceholder} speed={speed} />

                <p className="delivery-footnote"><Icon name="truck"/>
                    <span>Items can arrive separately, even when they’re part of the same order.</span>
                </p>
            </section>
        </>
    )
}

function ProductList({ products, ProductPlaceholder, speed }) {
    return (
        <>
            <div className="product-list">
                {products.map((product, index) => <article className="checkout-product" key={product.id}>
                    <ProductPlaceholder tag={product.tag} tone={product.tone}/>
                    <div className="checkout-product__details">
                        <p className="product-category">ITEM {String(index + 1).padStart(2, "0")}</p>
                        <h3>{product.name}</h3><p className="product-variant">{product.detail}</p>
                        <div className="product-delivery-date"><span className="date-dot"/><span>Arrives <strong>{speed === "standard" ? product.standard : product.express}</strong></span></div>
                    </div>
                    <div className="checkout-product__price"><strong>₹{product.price.toLocaleString("en-IN")}</strong><span>Qty {product.qty}</span></div>
                </article>)}
            </div>
        </>
    )
}