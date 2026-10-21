import {useMemo, useState} from "react";

import "./DeliveryAddressPage.css";
import { initialAddresses, emptyAddress } from "./DeliveryAddressPage.js"

import PageHeader from "./Elements/PageHeader.jsx";
import AddressSection from "./AddressSection/AddressSection.jsx";
import SelectedDeliveryContinue from "./AddressSection/Elements/SelectedDeliveryContinue.jsx";


export default function DeliveryAddressPage() {

    const [addresses, setAddresses] = useState(initialAddresses);
    const [selectedId, setSelectedId] = useState(1);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyAddress);
    const [errors, setErrors] = useState({});
    const [notice, setNotice] = useState("");

    const selectedAddress = useMemo(
        () => addresses.find((address) => address.id === selectedId),
        [addresses, selectedId]
    );

    function startAddAddress() {
        setEditingId(null);
        setForm(emptyAddress);
        setErrors({});
        setNotice("");
        setShowForm(true);
    }

    function startEditAddress(address) {
        setEditingId(address.id);
        setForm({
            label: address.label,
            name: address.name,
            phone: address.phone,
            line1: address.line1,
            line2: address.line2,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
        });
        setErrors({});
        setNotice("");
        setShowForm(true);
    }

    function updateField(event) {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
        setErrors((current) => ({ ...current, [name]: "" }));
    }

    function validate() {
        const next = {};
        ["name", "phone", "line1", "city", "state", "pincode"].forEach((key) => {
            if (!form[key].trim()) next[key] = "This field is required.";
        });
        if (form.phone && !/^[+]?[\d\s()-]{10,16}$/.test(form.phone.trim())) {
            next.phone = "Enter a valid phone number.";
        }
        if (form.pincode && !/^\d{6}$/.test(form.pincode.trim())) {
            next.pincode = "Enter a 6-digit PIN code.";
        }
        setErrors(next);
        return Object.keys(next).length === 0;
    }

    function saveAddress(event) {
        event.preventDefault();
        if (!validate()) return;

        const cleaned = {
            ...form,
            name: form.name.trim(),
            phone: form.phone.trim(),
            line1: form.line1.trim(),
            line2: form.line2.trim(),
            city: form.city.trim(),
            state: form.state.trim(),
            pincode: form.pincode.trim(),
            isDefault: !editingId && addresses.length === 0,
        };

        if (editingId) {
            setAddresses((current) =>
                current.map((address) =>
                    address.id === editingId ? { ...address, ...cleaned } : address
                )
            );
            setNotice("Address updated.");
        } else {
            const newAddress = { ...cleaned, id: Date.now() };
            setAddresses((current) => [...current, newAddress]);
            setSelectedId(newAddress.id);
            setNotice("Address added and selected.");
        }
        setShowForm(false);
    }

    function removeAddress(id) {
        const remaining = addresses.filter((address) => address.id !== id);
        setAddresses(remaining);
        if (selectedId === id) setSelectedId(remaining[0]?.id ?? null);
        setNotice("Address removed.");
    }

    function setDefaultAddress(id) {
        setAddresses((current) =>
            current.map((address) => ({ ...address, isDefault: address.id === id }))
        );
        setNotice("Default address updated.");
    }

    function continueToDelivery() {
        if (!selectedAddress) {
            setNotice("Add or select an address to continue.");
            return;
        }
        setNotice(`Delivery address selected: ${selectedAddress.label}. Backend and next checkout step will be connected later.`);
    }


    return (
        <>
            <main className="ContentView">

                <PageHeader />

                <div className="delivery-layout">

                    <AddressSection
                        addresses={addresses}
                        selectedId={selectedId}
                        setSelectedId={setSelectedId}
                        startAddAddress={startAddAddress}
                        startEditAddress={startEditAddress}
                        setDefaultAddress={setDefaultAddress}
                        removeAddress={removeAddress}
                        notice={notice}
                        errors={errors}
                    />

                    <SelectedDeliveryContinue
                        selectedAddress={selectedAddress}
                        continueToDelivery={continueToDelivery}
                    />

                </div>

                <div className="Filler"></div>

            </main>
        </>
    )
}