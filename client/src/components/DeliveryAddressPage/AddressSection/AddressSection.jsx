import { PlusIcon, PinIcon, CheckIcon } from "../Elements/Icons.jsx";
import AddressCards from "./Elements/AddressCards.jsx";


export default function AddressSection({
                                                         addresses,
                                                         selectedId,
                                                         setSelectedId,
                                                         startAddAddress,
                                                         startEditAddress,
                                                         setDefaultAddress,
                                                         removeAddress,
                                                         notice
                                                     }) {
    return (
        <>

            <section className="address-section" aria-labelledby="address-title">
                <div className="section-heading">
                    <div>
                        <span className="section-index">01</span>
                        <h2 id="address-title">Your addresses</h2>
                    </div>
                    <span className="subtle-count">{addresses.length} saved</span>
                </div>

                <AddressCards
                    addresses={addresses}
                    selectedId={selectedId}
                    setSelectedId={setSelectedId}
                    startEditAddress={startEditAddress}
                    setDefaultAddress={setDefaultAddress}
                    removeAddress={removeAddress}
                />

                <button type="button" className="add-address-card" onClick={startAddAddress}>
                    <span className="add-icon"><PlusIcon /></span>
                    <span className="add-address-copy">
              <strong>Add a new address</strong>
              <small>Use another home, office or delivery location</small>
            </span>
                    <span className="add-arrow" aria-hidden="true">↗</span>
                </button>

                {notice && <p className="inline-notice" role="status">{notice}</p>}
            </section>

        </>
    )
}