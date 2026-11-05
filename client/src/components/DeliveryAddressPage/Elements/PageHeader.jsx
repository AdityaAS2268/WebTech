
export default function PageHeader() {

    return (
        <>
            <header className="PageHeader">
                <div>
                    <p className="PageIndication">CHECKOUT <span>/</span> DELIVERY</p>
                    <h1>Where should we send it?</h1>
                    <p className="HeadingTitle">
                        Choose a saved address or add a new one for this order.
                    </p>
                </div>

                <div className="checkout-progress" aria-label="Checkout progress: delivery, step 1 of 3">
                    <div className="progress-step progress-step--active">
                        <span className="progress-number">1</span>
                        <span>Delivery</span>
                    </div>
                    <span className="progress-line" />
                    <div className="progress-step">
                        <span className="progress-number">2</span>
                        <span>Payment</span>
                    </div>
                    <span className="progress-line" />
                    <div className="progress-step">
                        <span className="progress-number">3</span>
                        <span>Review</span>
                    </div>
                </div>

            </header>
        </>
    )

}

