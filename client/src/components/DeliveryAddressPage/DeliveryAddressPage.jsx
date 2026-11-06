import {useEffect, useMemo, useState} from "react";
import { useNavigate } from "react-router-dom";

import "./DeliveryAddressPage.css";
import { initialAddresses, emptyAddress } from "./DeliveryAddressPage.js"

import PageHeader from "./Elements/PageHeader.jsx";
import AddressSection from "./AddressSection/AddressSection.jsx";
import SelectedDeliveryContinue from "./AddressSection/Elements/SelectedDeliveryContinue.jsx";
import AddressModal from "./AddressSection/Elements/EditAddressModal.jsx";

export default function DeliveryAddressPage() {

    const navigate = useNavigate();

    const [addresses, setAddresses] = useState(() => {
        try {
            const saved = localStorage.getItem("shopsphere_user_addresses");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
        } catch (e) {
            console.warn("Could not read addresses from localStorage", e);
        }
        return initialAddresses;
    });

    const [selectedId, setSelectedId] = useState(() => {
        try {
            const saved = localStorage.getItem("shopsphere_user_addresses");
            if (saved) {
                const parsed = JSON.parse(saved);
                const defaultAddr = parsed.find((a) => a.isDefault);
                if (defaultAddr) return defaultAddr.id;
                if (parsed.length > 0) return parsed[0].id;
            }
        } catch (e) {}
        return 1;
    });

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyAddress);
    const [errors, setErrors] = useState({});
    const [notice, setNotice] = useState("");

    const selectedAddress = useMemo(
        () => addresses.find((address) => address.id === selectedId) || addresses[0],
        [addresses, selectedId]
    );

    async function RetrieveUserAddresses(userID) {
        try {
            let fetched = null;
            // First attempt: fetch from unified profile addresses
            try {
                const res = await fetch("http://localhost:3000/api/profile/addresses");
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && Array.isArray(data.addresses) && data.addresses.length > 0) {
                        fetched = data.addresses;
                    }
                }
            } catch (e) {
                console.warn("Could not fetch from /api/profile/addresses:", e);
            }

            // Second attempt: fetch from /api/userAddressesForUserID
            if (!fetched) {
                const response = await fetch("/api/userAddressesForUserID", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userID: userID || "USR1001" })
                });
                const data = await response.json();
                if (data.result && Array.isArray(data.result) && data.result.length > 0) {
                    fetched = data.result.map((address) => ({
                        id: address.id,
                        label: address.AddressLabel || address.label || "Home",
                        name: address.Name || address.name || "Jane Doe",
                        phone: address.PhoneNo || address.phone || "+91 98765 43210",
                        line1: address.AddressLine1 || address.line1 || "",
                        line2: address.AddressLine2 || address.line2 || "",
                        city: address.City || address.city || "",
                        state: address.State || address.state || "",
                        pincode: address.PinCode || address.pincode || "",
                        isDefault: address.IsDefault === "Y" || address.isDefault === true,
                        userID: address.userID || "USR1001"
                    }));
                }
            }

            if (fetched && fetched.length > 0) {
                const normalized = fetched.map((address) => ({
                    id: address.id || address.address_id,
                    label: address.label || address.AddressLabel || "Home",
                    name: address.name || address.Name || "Jane Doe",
                    phone: address.phone || address.PhoneNo || "+91 98765 43210",
                    line1: address.line1 || address.AddressLine1 || address.address_line || "",
                    line2: address.line2 || address.AddressLine2 || "",
                    city: address.city || address.City || "",
                    state: address.state || address.State || "",
                    pincode: String(address.pincode || address.PinCode || ""),
                    isDefault: address.isDefault === true || address.IsDefault === "Y",
                    userID: address.userID || "USR1001"
                }));

                setAddresses(normalized);
                const defaultAddr = normalized.find((a) => a.isDefault) || normalized[0];
                if (defaultAddr) setSelectedId(defaultAddr.id);
                try {
                    localStorage.setItem("shopsphere_user_addresses", JSON.stringify(normalized));
                } catch (e) {}
            }
        } catch (error) {
            console.error("RetrieveUserAddresses failed:", error);
        }
    }

    useEffect(() => {
        RetrieveUserAddresses("USR1001");
    }, [])

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


    async function UpdateAddressToDatabase(address) {
        const response = await fetch("/api/UpdateAddress", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(address)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Address update failed");
        }

        return data;
    }


    async function saveAddress(event) {
        event.preventDefault();

        if (!validate()) return;

        const existingAddress = addresses.find(
            address => address.id === editingId
        );

        const cleaned = {
            ...form,
            name: form.name.trim(),
            phone: form.phone.trim(),
            line1: form.line1.trim(),
            line2: form.line2.trim(),
            city: form.city.trim(),
            state: form.state.trim(),
            pincode: form.pincode.trim(),
            isDefault: editingId
                ? existingAddress?.isDefault ?? false
                : addresses.length === 0,
            userID: addresses[0].userID
        };

        try {
            if (editingId) {

                // Include the database ID and user ID!
                const addressToUpdate = {
                    ...cleaned,
                    id: editingId,
                    userID: "USR1001"
                };

                // Wait until MySQL confirms the update
                await UpdateAddressToDatabase(addressToUpdate);

                // Update React state only after success
                const nextAddresses = addresses.map(address =>
                    address.id === editingId
                        ? { ...address, ...cleaned }
                        : address
                );
                setAddresses(nextAddresses);
                try {
                    localStorage.setItem("shopsphere_user_addresses", JSON.stringify(nextAddresses));
                } catch (e) {}

                setNotice("Address updated successfully!");

            } else {

                const addressToAdd = {
                    ...cleaned,
                    userID: "USR1001"
                };

                const response = await fetch("/api/AddAddress", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(addressToAdd)
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Address insertion failed");
                }

                // Use the actual ID generated by MySQL or store
                const newAddress = {
                    ...cleaned,
                    id: data.insertedId || Date.now(),
                    userID: "USR1001"
                };

                const nextAddresses = [...addresses, newAddress];
                setAddresses(nextAddresses);
                setSelectedId(newAddress.id);
                try {
                    localStorage.setItem("shopsphere_user_addresses", JSON.stringify(nextAddresses));
                } catch (e) {}

                setNotice("Address added successfully!");
            }

            setShowForm(false);

        } catch (error) {
            console.error("Address update failed:", error);
            setNotice("Could not update address. Please try again.");
        }
    }


    function useTemporarilyAddress(event) {
        event.preventDefault();
        // Run validation first
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
        if (Object.keys(next).length > 0) return;

        // Create a temporary address object without saving it permanently to the saved list
        const tempAddress = {
            id: 'temp-' + Date.now(),
            ...form,
            name: form.name.trim(),
            phone: form.phone.trim(),
            line1: form.line1.trim(),
            line2: form.line2.trim(),
            city: form.city.trim(),
            state: form.state.trim(),
            pincode: form.pincode.trim(),
            isDefault: false,
        };

        setAddresses((current) => [...current, tempAddress]);
        setSelectedId(tempAddress.id);
        setNotice("Using this address temporarily for this order (not saved to profile).");
        setShowForm(false);
    }

    async function removeAddress(id) {
        const remaining = addresses.filter((address) => address.id !== id);
        setAddresses(remaining);
        if (selectedId === id) setSelectedId(remaining[0]?.id ?? null);
        try {
            localStorage.setItem("shopsphere_user_addresses", JSON.stringify(remaining));
        } catch (e) {}
        setNotice("Address removed.");

        // Removing the address from Database
        try {
            await fetch("/api/RemoveAddress", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ addressID: id, userID: addresses[0]?.userID || "USR1001" })
            });
        } catch (e) {
            console.warn("Could not sync remove to backend:", e);
        }
    }

    async function setDefaultAddress(id) {
        const updated = addresses.map((address) => ({ ...address, isDefault: address.id === id }));
        setAddresses(updated);
        setSelectedId(id);
        try {
            localStorage.setItem("shopsphere_user_addresses", JSON.stringify(updated));
        } catch (e) {}
        setNotice("Default address updated.");

        // Updating to database
        try {
            await fetch("/api/UpdateDefaultAddress", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    defaultAddressID: id,
                    userID: addresses[0]?.userID || "USR1001"
                })
            });
        } catch (e) {
            console.warn("Could not sync default to backend:", e);
        }
    }

    function continueToDelivery() {
        if (!selectedAddress) {
            setNotice("Add or select an address to continue.");
            return;
        }

        sessionStorage.setItem("selectedAddress", JSON.stringify(selectedAddress));

        setNotice(`Delivery address selected: ${selectedAddress.label}. Backend and next checkout step will be connected later.`);

        navigate("/checkout/options");

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

                <AddressModal
                    showForm={showForm}
                    editingId={editingId}
                    form={form}
                    errors={errors}
                    updateField={updateField}
                    saveAddress={saveAddress}
                    setShowForm={setShowForm}
                    useTemporarilyAddress={useTemporarilyAddress}
                />

            </main>
        </>
    )
}