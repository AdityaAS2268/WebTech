import { PinIcon } from "../../Elements/Icons.jsx";

export default function SelectedDeliveryContinue({ selectedAddress, continueToDelivery }) {
    return (
        <>
            <aside className="delivery-aside">
                <div className="aside-card">
                    <div className="aside-title-row">
                        <span className="aside-icon"><PinIcon /></span>
                        <div>
                            <p className="aside-kicker">DELIVERING TO</p>
                            <h2>{selectedAddress ? selectedAddress.label : "No address selected"}</h2>
                        </div>
                    </div>
                    {selectedAddress ? (
                        <div className="selected-address">
                            <strong>{selectedAddress.name}</strong>
                            <p>{selectedAddress.line1}{selectedAddress.line2 ? `, ${selectedAddress.line2}` : ""}</p>
                            <p>{selectedAddress.city}, {selectedAddress.state} {selectedAddress.pincode}</p>
                            <p>{selectedAddress.phone}</p>
                        </div>
                    ) : (
                        <p className="aside-empty-copy">Select a saved address or add a new one to continue.</p>
                    )}
                    <div className="aside-divider" />
                    <div className="delivery-note">
                        <span className="note-dot" />
                        <p>Delivery options and dates will be shown in the next step.</p>
                    </div>
                    <button type="button" className="continue-button" onClick={continueToDelivery}>
                        Continue <span aria-hidden="true">→</span>
                    </button>
                    <p className="secure-note"><span aria-hidden="true">⌑</span> Your address details stay private.</p>
                </div>
                <div className="help-note">
                    <strong>Need to send it somewhere else?</strong>
                    <p>You can add another address now and choose it for this order.</p>
                </div>
            </aside>
        </>
    )
}