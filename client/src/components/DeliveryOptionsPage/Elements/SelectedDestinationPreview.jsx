import {useNavigate} from "react-router-dom";

export default function SelectedDestinationPreview({ Icon, setNotice }) {

    const navigate = useNavigate();

    return (
        <>
            <section className="destination-strip">
                <span className="destination-icon"><Icon name="pin"/></span>
                <div className="destination-copy">
                    <p className="mini-label">DELIVERING TO</p>
                    <strong>Home · ABCD</strong>
                    <span>24, Lake View Road, Velachery, Chennai – 600042</span>
                </div>
                <button className="quiet-link" type="button" onClick={() => {
                    setNotice("Address selection will connect to your saved-address page.")
                    navigate("/checkout/address");
                }}>Change</button>
            </section>
        </>
    )
}