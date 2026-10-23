import { useMemo, useState } from "react";
import "./DeliveryOptionsPage.css";
import Header from "./Elements/Header.jsx";
import SelectedDestinationPreview from "./Elements/SelectedDestinationPreview.jsx";
import DeliveryOptions from "./Elements/DeliveryOptions";

const products = [
    { id: 1, name: "Black and Gray Athletic Cotton Socks", detail: "6 pairs · Cotton blend", price: 299, qty: 1, tag: "SOCKS", tone: "sage", standard: "Monday, 26 October", express: "Saturday, 24 October" },
    { id: 2, name: "Intermediate Size Basketball", detail: "Size 6 · Indoor / outdoor", price: 899, qty: 1, tag: "BALL", tone: "clay", standard: "Wednesday, 28 October", express: "Monday, 26 October" },
    { id: 3, name: "Adults Plain Cotton T-Shirt", detail: "Teal · 2 pack · Size M", price: 649, qty: 1, tag: "TEE", tone: "blue", standard: "Tuesday, 27 October", express: "Sunday, 25 October" },
    { id: 4, name: "2 Slot Toaster — Black", detail: "Black · 800 W", price: 1499, qty: 1, tag: "HOME", tone: "stone", standard: "Friday, 30 October", express: "Tuesday, 27 October" },
];

const options = [
    { id: "standard", title: "Standard delivery", copy: "A little patience, no delivery fee.", fee: 0, earliest: "Mon, 26 Oct" },
    { id: "express", title: "Express delivery", copy: "Get your order sooner.", fee: 99, earliest: "Sat, 24 Oct" },
];

function Icon({ name }) {
    const paths = {
        pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
        check: <path d="m5 12 4 4L19 6"/>,
        arrow: <path d="M5 12h14m-6-6 6 6-6 6"/>,
        truck: <><path d="M3 6h11v11H3z"/><path d="M14 10h4l3 3v4h-7z"/><circle cx="7.5" cy="19" r="1.5"/><circle cx="17.5" cy="19" r="1.5"/></>,
        lock: <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    };
    return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

function ProductPlaceholder({ tag, tone }) {
    return <div className={`product-placeholder product-placeholder--${tone}`} aria-label={`${tag} image placeholder`}><span>{tag}</span><i /></div>;
}

export default function DeliveryOptionsPage() {
    const [speed, setSpeed] = useState("standard");
    const [notice, setNotice] = useState("");
    const subtotal = useMemo(() => products.reduce((sum, p) => sum + p.price * p.qty, 0), []);
    const selected = options.find((option) => option.id === speed);
    const total = subtotal + selected.fee;

    function continueToPayment() {
        setNotice(`Ready for payment: ${selected.title.toLowerCase()} selected · Total ₹${total.toLocaleString("en-IN")}.`);
    }

    return (
        <main className="delivery-options-page">

            <Header Icon={Icon}/>


            <div className="delivery-options-layout">
                <div className="delivery-main">

                    <SelectedDestinationPreview Icon={Icon} setNotice={setNotice} />

                    <DeliveryOptions Icon={Icon} options={options} speed={speed} setSpeed={setSpeed} setNotice={setNotice} />

                </div>

            </div>

        </main>
    );
}
