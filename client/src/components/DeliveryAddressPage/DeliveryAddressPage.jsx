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

    async function RetrieveUserAddresses(userID) {
        try {
            const response = await fetch("/api/userAddressesForUserID", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userID: userID })
            })

            const data = await response.json();
            console.log(data.result);

            var retrievedAddresss = [];

            data.result.map((address) => {
                const currentAddress = {
                    id: address.id,
                    label: address.AddressLabel,
                    name: address.Name,
                    phone: address.PhoneNo,
                    line1: address.AddressLine1,
                    line2: address.AddressLine2,
                    city: address.City,
                    state: address.State,
                    pincode: address.PinCode,
                    isDefault: address.IsDefault === "Y",
                    userID: address.userID
                }

                if (address.IsDefault === "Y") {
                    setSelectedId(address.id)
                }

                retrievedAddresss.push(currentAddress);
            })

            setAddresses(retrievedAddresss);

        } catch (error) {
            console.log(error);
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
                setAddresses(current =>
                    current.map(address =>
                        address.id === editingId
                            ? { ...address, ...cleaned }
                            : address
                    )
                );

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

                // Use the actual ID generated by MySQL
                const newAddress = {
                    ...cleaned,
                    id: data.insertedId,
                    userID: "USR1001"
                };

                setAddresses(current => [...current, newAddress]);
                setSelectedId(newAddress.id);

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

        // We can temporarily select it directly via `setSelectedId` or handle it in state.
        // Since selectedAddress looks up by id in `addresses`, let's temporarily append it
        // or set a dedicated `tempSelectedAddress` state. Or simpler: add it to addresses
        // as a non-saved item, OR store it directly as the selected delivery target!
        // To keep it clean without permanently polluting saved cards:
        setAddresses((current) => [...current, tempAddress]);
        setSelectedId(tempAddress.id);
        setNotice("Using this address temporarily for this order (not saved to profile).");
        setShowForm(false);
    }

    async function removeAddress(id) {
        const remaining = addresses.filter((address) => address.id !== id);
        setAddresses(remaining);
        if (selectedId === id) setSelectedId(remaining[0]?.id ?? null);
        setNotice("Address removed.");

        // Removing the address from Database
        const response = await fetch("/api/RemoveAddress", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({addressID: id, userID: addresses[0].userID})
        });

    }

    async function setDefaultAddress(id) {
        setAddresses((current) =>
            current.map((address) => ({ ...address, isDefault: address.id === id }))
        );
        setNotice("Default address updated.");

        // Updating to database
        const response = await fetch("/api/UpdateDefaultAddress", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                defaultAddressID: id,
                userID: addresses[0].userID
            })
        });

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