const Grid = (props) => {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', // Adjusted column width for better responsiveness
            gap: '20px', // Increased the gap for better separation between items
            padding: '20px', // Added padding for better spacing around the grid
            borderRadius: '8px', // Added border radius for a softer appearance
            ...props.style
        }}>
            {props.children}
        </div>
    );
};

export default Grid;
