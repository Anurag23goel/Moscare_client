const Button = ({type, label, color = 'white', backgroundColor, onClick, marginTop, ...props}) => {
    return (
        <button
            className="btn"
            style={{
                margin: '5px', // Reduced margin
                width: '6rem', // Reduced width
                color: color,
                backgroundColor: backgroundColor,
                borderColor: backgroundColor,
                fontSize: '0.8rem', // Reduced font size
                padding: '5px 5px', // Adjusted padding
                fontWeight: '600',
                marginTop: marginTop,
                borderRadius: '5px',
            }}
            type={type}
            onClick={onClick}
            {...props}
        >
            {label}
        </button>
    );
};

export default Button;
