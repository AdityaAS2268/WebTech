export default function OrderTotal({ Icon, notice, products, subtotal, selected, total, continueToPayment }) {
    return  (
        <>
            <div className="summary-card">
                <div className="summary-heading">
                    <div>
                        <p className="mini-label">A QUICK LOOK</p>
                        <h2>Order summary</h2>
                    </div>
                    <span className="summary-count">{products.length}</span>
                </div>

                <div className="summary-lines">
                    <div>
                        <span>Items subtotal</span>
                        <strong>₹{subtotal.toLocaleString("en-IN")}</strong>
                    </div>

                    <div>
                        <span>Delivery</span>
                        <strong className={selected.fee === 0 ? "free-delivery" : ""}>
                            {selected.fee === 0 ? "FREE" : `₹${selected.fee}`}
                        </strong>
                    </div>
                </div>

                {selected.fee === 0 && <div className="free-delivery-note"><span className="free-note-mark">✓</span>You’ve got free delivery.</div>}

                <div className="summary-total">
                    <span>Total</span>
                    <strong>₹{total.toLocaleString("en-IN")}</strong>
                </div>

                <p className="tax-note">Inclusive of applicable taxes</p>

                <button type="button" className="payment-button" onClick={continueToPayment}>Continue to payment
                    <Icon name="arrow"/>
                </button>

                {notice && <p className="summary-notice" role="status">{notice}</p>}

                <p className="privacy-note"><Icon name="lock"/> Secure checkout, just the way it should be.</p>
            </div>

            <div className="summary-help">
                <strong>Need to make a change?</strong>
                <p>You can go back to your cart to update quantities or remove an item.</p>
            </div>
        </>
    )
}