export default function EditAddressModalSideTips() {
    return (
        <>
            <div className="modal-side-panel">
                <div className="side-panel-badge">📍</div>
                <div className="side-panel-content">
                    <h3>Quick Delivery Tips</h3>
                    <p>Accurate address details ensure your order reaches you without delays.</p>

                    <div className="side-panel-list">
                        <div className="side-panel-item">
                            <span>✓</span>
                            <div>Double-check your 6-digit PIN code for precise courier routing.</div>
                        </div>
                        <div className="side-panel-item">
                            <span>✓</span>
                            <div>Include landmarks in Line 2 for easy location identification.</div>
                        </div>
                        <div className="side-panel-item">
                            <span>✓</span>
                            <div>Active phone numbers help delivery executives coordinate smoothly.</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}