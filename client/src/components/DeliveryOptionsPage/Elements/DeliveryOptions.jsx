export default function DeliveryOptionsPage({ Icon, options, speed, setSpeed, setNotice }) {
    return (
        <>
            <section className="delivery-choice-section">
                <div className="section-heading"><div><span className="section-index">01</span><div><h2>Choose delivery speed</h2><p>One choice for this order. Items may arrive on different days.</p></div></div></div>
                <div className="delivery-option-list">
                    {options.map((option) => {
                        const isSelected = speed === option.id;
                        return <button key={option.id} type="button" className={`delivery-option ${isSelected ? "delivery-option--selected" : ""}`} onClick={() => { setSpeed(option.id); setNotice(""); }} aria-pressed={isSelected}>
                            <span className={`option-select-mark ${isSelected ? "option-select-mark--selected" : ""}`}>{isSelected && <Icon name="check"/>}</span>
                            <span className="option-copy"><strong>{option.title}</strong><span>{option.copy}</span><small>First item arrives {option.earliest}</small></span>
                            <span className="option-price">{option.fee === 0 ? "FREE" : `₹${option.fee}`}</span>
                        </button>;
                    })}
                </div>
            </section>
        </>
    )
}