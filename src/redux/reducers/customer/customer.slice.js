import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  fetchCustomers, 
  createCustomer, 
  updateCustomer, 
  deleteCustomer, 
  getCustomerById 
} from '../../../components/forms/Customer/CustomerAPI';

// Async thunks
export const fetchCustomersAsync = createAsyncThunk(
  'customers/fetchCustomers',
  async ({ page, limit, fromDate, toDate }, { rejectWithValue }) => {
    try {
      const response = await fetchCustomers(page, limit, fromDate, toDate);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch customers');
    }
  }
);

export const createCustomerAsync = createAsyncThunk(
  'customers/createCustomer',
  async (customerData, { rejectWithValue }) => {
    try {
      const response = await createCustomer(customerData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create customer');
    }
  }
);

export const updateCustomerAsync = createAsyncThunk(
  'customers/updateCustomer',
  async ({ id, customerData }, { rejectWithValue }) => {
    try {
      const response = await updateCustomer(id, customerData);
      return { id, response };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update customer');
    }
  }
);

export const deleteCustomerAsync = createAsyncThunk(
  'customers/deleteCustomer',
  async (id, { rejectWithValue }) => {
    try {
      await deleteCustomer(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete customer');
    }
  }
);

export const getCustomerByIdAsync = createAsyncThunk(
  'customers/getCustomerById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await getCustomerById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to get customer');
    }
  }
);

const initialState = {
  customers: [],
  status: 'idle',
  error: null,
  selectedCustomer: null,
  totalRecords: 0,
  currentPage: 1,
  pageSize: 10
};

const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    setSelectedCustomer: (state, action) => {
      state.selectedCustomer = action.payload;
    },
    clearSelectedCustomer: (state) => {
      state.selectedCustomer = null;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setPageSize: (state, action) => {
      state.pageSize = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch customers
      .addCase(fetchCustomersAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCustomersAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.customers = action.payload.data || [];
        state.totalRecords = action.payload.totalRecords || action.payload.data?.length || 0;
      })
      .addCase(fetchCustomersAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Create customer
      .addCase(createCustomerAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createCustomerAsync.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(createCustomerAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Update customer
      .addCase(updateCustomerAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateCustomerAsync.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(updateCustomerAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Delete customer
      .addCase(deleteCustomerAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteCustomerAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.customers = state.customers.filter(customer => customer.CustomerID !== action.payload);
      })
      .addCase(deleteCustomerAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Get customer by ID
      .addCase(getCustomerByIdAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getCustomerByIdAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.selectedCustomer = action.payload;
      })
      .addCase(getCustomerByIdAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export const { 
  setSelectedCustomer, 
  clearSelectedCustomer,
  setCurrentPage,
  setPageSize
} = customerSlice.actions;

export default customerSlice.reducer;