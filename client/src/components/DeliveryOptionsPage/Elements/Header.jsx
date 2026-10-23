export default function Header({ Icon }) {
    return (
        <>
            <header className="checkout-heading">
                <div>
                    <p className="eyebrow">CHECKOUT <span>/</span> DELIVERY</p>
                    <h1>Make it yours.</h1>
                    <p className="heading-copy">Choose how your order gets to you. We’ll take care of the rest.</p>
                </div>
                <div className="checkout-progress" aria-label="Checkout progress">
                    <div className="progress-step progress-step--complete"><span className="progress-number"><Icon name="check"/></span><span>Address</span></div>
                    <span className="progress-line progress-line--complete"/>
                    <div className="progress-step progress-step--active"><span className="progress-number">2</span><span>Delivery</span></div>
                    <span className="progress-line"/>
                    <div className="progress-step"><span className="progress-number">3</span><span>Payment</span></div>
                </div>
            </header>
        </>
    )
}