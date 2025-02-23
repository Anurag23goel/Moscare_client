import React, {useEffect, useState} from "react";
import DataTable from 'react-data-table-component';
import InputField from "@/components/widgets/InputField"; // Importing input field component
import Grid from "@/components/widgets/utils/Grid"; // Importing grid component
import {Container, Dropdown} from "react-bootstrap"; // Importing container and dropdown from React Bootstrap
import Row from "@/components/widgets/utils/Row"; // Importing row component

const ListingDataTable = ({data, selectedRowData, title}) => {
    const [filterText, setFilterText] = useState('');
    const [filterColumn, setFilterColumn] = useState('Select All');
    const [columnFilters, setColumnFilters] = useState({});
    const [visibleColumns, setVisibleColumns] = useState(() => {
        // Initialize visible columns from local storage if available
        if (typeof window !== 'undefined') {
            const savedColumns = localStorage.getItem('visibleColumns');
            return savedColumns ? JSON.parse(savedColumns) : [];
        }
        return [];
    });

    // const {colors, loading} = useContext(ColorContext);
    useEffect(() => {
        if (data.data && data.data.length > 0 && visibleColumns.length === 0) {
            const allColumns = Object.keys(data.data[0]);
            // show the first half of the columns
            const firstHalfColumns = allColumns.slice(0, Math.ceil(allColumns.length / 2));
            setVisibleColumns(firstHalfColumns);
            localStorage.setItem('visibleColumns', JSON.stringify(firstHalfColumns));
        }

        return () => {
            setFilterText('');
            setFilterColumn('Select All');
            setColumnFilters({});
            setVisibleColumns([]);
        }
    }, [data.data]);

    const columnsOptions = data.data && data.data.length > 0 ? Object.keys(data.data[0]).map(column => ({
        value: String(column),
        label: String(column),
    })) : [];

    // Function to handle filter change
    const handleFilterChange = (column, value) => {
        setColumnFilters(prevFilters => ({
            ...prevFilters,
            [column]: value
        }));
    };

    // Function to toggle column visibility
    const handleColumnToggle = (column) => {
        let updatedColumns;
        if (visibleColumns.includes(column)) {
            updatedColumns = visibleColumns.filter(col => col !== column);
        } else {
            updatedColumns = [...visibleColumns, column];
        }
        setVisibleColumns(updatedColumns);
        localStorage.setItem('visibleColumns', JSON.stringify(updatedColumns));
    };

    // Memoized columns configuration
    const columns = React.useMemo(() => {
        if (data.data && data.data.length > 0) {
            return Object.keys(data.data[0]).filter(key => visibleColumns.includes(key)).map(key => {
                return {
                    name: key,
                    selector: data => data[key],
                    sortable: true,
                    cell: row => row[key],
                }
            });
        }
        return [];
    }, [data.data, visibleColumns]);

    // Filter the data based on filterText and filterColumn
    const filteredData = data.data ? data.data.filter(item =>
        filterColumn === 'Select All'
            ? Object.values(item).some(s => String(s).toLowerCase().includes(filterText.toLowerCase()))
            : String(item[filterColumn]).toLowerCase().includes(filterText.toLowerCase())
    ).filter(item =>
        Object.keys(columnFilters).every(key =>
            String(item[key]).toLowerCase().includes((columnFilters[key] || '').toLowerCase())
        )
    ) : [];


    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    // Render the component
    return (
        <div>
            <Container>
                <Grid>
                    {/* Input field for filtering */}
                    <InputField
                        type="text"
                        placeholder="Filter All..."
                        value={filterText}
                        onChange={e => setFilterText(e.target.value)}
                    />
                    {/* Dropdown for selecting filter column */}
                    <select
                        style={{
                            height: '2.5rem',
                            width: '10rem',
                            marginTop: '0.7rem',
                        }}
                        className={'form-select'} value={filterColumn}
                        onChange={e => setFilterColumn(e.target.value)}>
                        <option value="Select All">Select All</option>
                        {columns.map(column => (
                            <option key={column.name} value={column.name}>{column.name}</option>
                        ))}
                    </select>
                    <div>
                        <h5>Column Chooser:</h5>
                        {/* Dropdown for selecting visible columns */}
                        <Dropdown>
                            <Dropdown.Toggle variant="primary" id="dropdown-basic">
                                Select Columns
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                {columnsOptions.map(option => (
                                    <Dropdown.Item key={option.value} onClick={() => handleColumnToggle(option.value)}>
                                        <Row>
                                            <input
                                                className={'form-check-input'}
                                                style={{marginRight: '0.5rem'}}
                                                disabled
                                                type="checkbox"
                                                checked={visibleColumns.includes(option.value)}
                                                onChange={() => {
                                                }}
                                            />
                                            {option.label}
                                        </Row>
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </Grid>
                <h4>Apply Filters:</h4>
                <Grid>
                    {/* Input fields for column-wise filtering */}
                    {columns.map(column => (
                        <div key={column.name}>
                            {column.name}
                            <InputField
                                type="text"
                                value={columnFilters[column.name] || ''}
                                onChange={e => handleFilterChange(column.name, e.target.value)}
                                placeholder={`Filter by ${column.name}`}
                            />
                        </div>
                    ))}
                </Grid>
                <hr></hr>
            </Container>
            {/* DataTable component */}
            <div
                style={{
                    padding: '2rem',
                }}
            >
                <DataTable
                    columns={columns}
                    data={filteredData} // Use the filtered data
                    pagination={true}
                    fixedHeader={true}
                    fixedHeaderScrollHeight="600px"
                    highlightOnHover={true}
                    responsive={true}
                    title={title}
                    onRowClicked={selectedRowData}
                    customStyles={{
                        head: {
                            style: {
                                zIndex: '1',
                            }
                        },
                        headCells: {
                            style: {
                                backgroundColor: "blue",
                                color: 'white',
                                fontSize: '1rem',
                            }
                        },
                        responsiveWrapper: {
                            style: {
                                overflow: 'auto',
                                backgroundColor: "red",
                            }
                        },
                        pagination: {
                            style: {
                                backgroundColor: "gray",
                            }
                        },
                        rows: {
                            style: {
                                fontSize: '1rem',
                            }
                        }

                    }}
                />
            </div>
        </div>
    );
}

export default ListingDataTable;
