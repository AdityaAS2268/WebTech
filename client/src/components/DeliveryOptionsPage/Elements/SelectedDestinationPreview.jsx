import {useNavigate} from "react-router-dom";

export default function SelectedDestinationPreview({ Icon, setNotice, selectedAddress }) {

    const navigate = useNavigate();

    return (
        <>
            <section className="destination-strip">
                <span className="destination-icon"><Icon name="pin"/></span>
                <div className="destination-copy">
                    <p className="mini-label">DELIVERING TO</p>
                    <strong>{selectedAddress.label} · {selectedAddress.name}</strong>
                    <span>{selectedAddress.line1}, {selectedAddress.line2}, {selectedAddress.city} – {selectedAddress.pincode}</span>
                </div>
                <button className="quiet-link" type="button" onClick={() => {
                    setNotice("Address selection will connect to your saved-address page.")
                    navigate("/checkout/address");
                }}>Change</button>
            </section>
        </>
    )
}