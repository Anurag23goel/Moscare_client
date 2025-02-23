const Row = (props) => {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center', // Center align items vertically
            gap: '20px', // Increased the gap between items for better separation
            padding: '10px', // Added padding for spacing around the row

            ...props.style
        }}>
            {props.children}
        </div>
    );
};

export default Row;
