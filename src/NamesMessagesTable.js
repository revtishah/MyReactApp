import React, { useState, useEffect , useRef, useCallback } from 'react';
import Table from 'react-bootstrap/Table';
import Pagination from 'react-bootstrap/Pagination';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';

const NamesMessagesTable = ({ apiEndpoint }) => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]); // For storing filtered results
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; //Warning Message
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // State to track search input
  const [isGlobalSearch, setIsGlobalSearch] = useState(false);
  const [isGlobalSearchActive, setIsGlobalSearchActive] = useState(false);

  const mounted = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
        if (!isGlobalSearchActive) { // Only fetch data if a global search is not active
            setLoading(true);
            try {
              debugger;
              console.log(`Fetching data: ${apiEndpoint}/get-messages?page=${currentPage}&pageSize=${pageSize}`);
              const response = await fetch(`https://demoappexpress.azurewebsites.net/get-messages?page=${currentPage}&pageSize=${pageSize}`);
              if (!response.ok) {
                  throw new Error('Network response was not ok');
              }
              const result = await response.json();
              setData(result.data);
              setFilteredData(result.data); // Initially, filtered data is all data
              setTotalCount(result.totalCount);
              console.log("Data" ,result.data);
              setLoading(false);
            } catch (error) {
                setLoading(false);
                setError(error.message);
            }
        }
    };

    // Check if the component is mounted to prevent updating the state
    // after the component has unmounted
    if (mounted.current) {
        // Fetch data whenever currentPage, pageSize, or searchTerm changes
        fetchData();
    } else {
        // Set the mounted ref to true after the initial call
        mounted.current = true;
    }
  }, [apiEndpoint, currentPage, pageSize, isGlobalSearchActive]);

  /*const debounce = (func, delay) => {
    let inDebounce;
    return function(...args) {
      clearTimeout(inDebounce);
      inDebounce = setTimeout(() => func.apply(this, args), delay);
    };
  };*/
  
  //Global Search
  /*const handleGlobalSearch = async (searchTerm, page = currentPage) => {
    setIsGlobalSearchActive(true); // Set global search to active
    setLoading(true);
    try {
      const response = await fetch(`${apiEndpoint}/global-search?searchTerm=${encodeURIComponent(searchTerm)}&page=${page}&pageSize=${pageSize}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      setData(result.data); // Assuming your global search returns the structure { data: [...] }
      setFilteredData(result.data);
      setTotalCount(result.totalCount); // Adjust if your API provides a different way to determine total count
      setCurrentPage(page); // Set the current page here
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
    //setIsGlobalSearchActive(false); // Set global search to inactive
  };*/

   // `handleGlobalSearch` function wrapped in its own useCallback
   const handleGlobalSearch = useCallback(async (searchTerm, page = currentPage) => {
    setIsGlobalSearchActive(true);
    setLoading(true);
    try {
      console.log(`Global search: ${apiEndpoint}/global-search?searchTerm=${encodeURIComponent(searchTerm)}&page=${page}&pageSize=${pageSize}`);
      const response = await fetch(`https://demoappexpress.azurewebsites.net/global-search?searchTerm=${encodeURIComponent(searchTerm)}&page=${page}&pageSize=${pageSize}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      setData(result.data);
      setFilteredData(result.data);
      setTotalCount(result.totalCount);
      setCurrentPage(page);
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  }, [apiEndpoint, currentPage, pageSize]); 

  /*const debouncedGlobalSearch = useCallback(debounce((value) => {
    //debugger;
    handleGlobalSearch(value);
  }, 500), [handleGlobalSearch,pageSize]); // Adjust the delay as needed*/

  // Use useCallback directly with debounce logic
  const debouncedGlobalSearch = useCallback((value) => {
    let handler;
    clearTimeout(handler);
    handler = setTimeout(() => {
      handleGlobalSearch(value);
    }, 500);
  }, [handleGlobalSearch]); // Remove pageSize from dependencies

//Local Search Functionality
const handleSearchChange = (e) => {
    const value = e?.target?.value ?? '';
    setSearchTerm(value); // Update the search term state

    if (isGlobalSearch) {
        debouncedGlobalSearch(value);
    }else{
        // Perform the filtering directly here
        const lowercasedSearchTerm = value.toLowerCase();
        const filtered = data.filter(item =>
            item.name.toLowerCase().includes(lowercasedSearchTerm) ||
            item.message.toLowerCase().includes(lowercasedSearchTerm)
        );

        setFilteredData(filtered); // Update the filtered data state
        setTotalCount(filtered.length); // Update the total count based on the filtered data
        
    }
};

let totalPages = Math.ceil(totalCount / pageSize);

// Helper function to generate the page numbers with ellipses
const getPageNumbers = () => {
    const sidePages = 2; // Number of pages to show on each side of the current page
    const pages = [];
    
    const startPage = Math.max(1, currentPage - sidePages);
    const endPage = Math.min(totalPages, currentPage + sidePages);

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }
    for (let page = startPage; page <= endPage; page++) {
      pages.push(page);
    }
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    return pages;
};

    // Use the getPageNumbers function to generate pagination items
    let items = getPageNumbers().map((page, index) => {
        if (page === '...') {
            return <Pagination.Ellipsis key={`ellipsis-${index}`} />;
        } else {
            return (
                <Pagination.Item
                key={page}
                active={page === currentPage}
                onClick={() => {
                    setCurrentPage(page);
                    // Check if global search is enabled
                    if (isGlobalSearch) {
                        handleGlobalSearch(searchTerm,page);
                    } 
                }}
                >
                {page}
                </Pagination.Item>
            );
        }
    });
  
  
  return (
    <>
      <Form className="mb-4 d-flex align-items-center">
        <Form.Group controlId="search" className="flex-grow-1 me-2">
          <Form.Control
            type="text"
            placeholder="Search by name or message..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </Form.Group>
        <Form.Check
            type="switch"
            id="custom-switch"
            label="Global Search"
            checked={isGlobalSearch}
            onChange={(e) => setIsGlobalSearch(e.target.checked)}
            className="mb-2"
        />
      </Form>

      {error && <Alert variant="danger">Error: {error}</Alert>}

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.message}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    <Pagination className="justify-content-center">
        <Pagination.Prev
            onClick={() => {
            const newPage = Math.max(currentPage - 1, 1);
            if (isGlobalSearch) {
                handleGlobalSearch(searchTerm,newPage);
            } else {
                setCurrentPage(newPage);
            }
            }}
            disabled={currentPage === 1}
        />
        {items}
        <Pagination.Next
            onClick={() => {
                const newPage = Math.min(currentPage + 1, totalPages);
                if (isGlobalSearch) {
                    handleGlobalSearch(searchTerm,newPage);
                } else {
                setCurrentPage(newPage);
                // Optionally, trigger local filtering here if it's not automatically handled by useEffect
                }
            }}
            disabled={currentPage === totalPages}
        />
        </Pagination>
    </>
  );
};

export default NamesMessagesTable;
