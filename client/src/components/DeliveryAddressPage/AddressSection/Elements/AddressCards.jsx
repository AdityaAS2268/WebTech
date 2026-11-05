import { CheckIcon, PinIcon } from "../../Elements/Icons.jsx";

export default function AddressCards({
                                         addresses,
                                         selectedId,
                                         setSelectedId,
                                         startEditAddress,
                                         setDefaultAddress,
                                         removeAddress
                                     }) {
    return (
        <>
            {addresses.length > 0 ? (
                <div className="address-grid">
                    {addresses.map((address) => {
                        const isSelected = selectedId === address.id;

                        return (
                            <article
                                key={address.id}
                                className={`address-card ${isSelected ? "address-card--selected" : ""}`}
                                onClick={() => setSelectedId(address.id)}
                                role="button"
                                tabIndex={0}
                                aria-pressed={isSelected}
                                aria-label={`Select ${address.label} address`}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        setSelectedId(address.id);
                                    }
                                }}
                                style={{ cursor: "pointer" }}
                            >
                                {/* Top Header / Selection Indicator */}
                                <div className="address-card__select">
                                    <span className={`selection-mark ${isSelected ? "selection-mark--active" : ""}`}>
                                        {isSelected && <CheckIcon />}
                                    </span>
                                    <span className="address-label">{address.label}</span>
                                    {address.isDefault && <span className="default-tag">DEFAULT</span>}
                                </div>

                                {/* Address Details */}
                                <div className="address-card__body">
                                    <p className="recipient">{address.name}</p>
                                    <p>{address.line1}</p>
                                    {address.line2 && <p>{address.line2}</p>}
                                    <p>{address.city}, {address.state} {address.pincode}</p>
                                    <p className="address-phone">{address.phone}</p>
                                </div>

                                {/* Footer Actions */}
                                <div className="address-card__footer">
                                    <button
                                        type="button"
                                        className="text-button"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevents triggers on parent card click
                                            startEditAddress(address);
                                        }}
                                    >
                                        Edit
                                    </button>
                                    {!address.isDefault && (
                                        <button
                                            type="button"
                                            className="text-button"
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevents triggers on parent card click
                                                setDefaultAddress(address.id);
                                            }}
                                        >
                                            Make default
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        className="text-button text-button--muted"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevents triggers on parent card click
                                            removeAddress(address.id);
                                        }}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </div>
            ) : (
                <div className="empty-addresses">
                    <span className="empty-icon"><PinIcon /></span>
                    <h3>No saved addresses yet</h3>
                    <p>Add an address and we’ll use it for this delivery.</p>
                </div>
            )}
        </>
    );
}