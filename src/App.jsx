import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import ProtectedRoute from "./auth/ProtectedRouteComponent";
import Nav from "./Components/Nav/Nav";
import Footer from "./Components/Footer/Footer";

// Public pages
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ManualPasswordChange from "./pages/ManualPasswordChange";
import Settings from "./pages/Settings";
import Dashboard from "./pages/Dashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import NotFound from "./pages/NotFound";
import RouteTest from "./pages/RouteTest";
import DriverDashboard from "./pages/DriverDashboard";

// Order management components
import OrderDetails from "./Components/orderDetails";
import AddNewOrder from "./Components/addNewOrder";
import UpdateOrder from "./Components/updateOrder";
import ProductCatalog from "./Components/ProductCatalog";
import ProductDetails from "./Components/ProductDetails";

// Admin Components
import AdminLayout from "./admin/components/AdminLayout";
import AdminDashboard from "./admin/pages/AdminDashboard";
import UserTable from "./admin/components/UserTable";
import EmployeeTable from "./admin/components/EmployeeTable";
import Charts from "./admin/components/Charts";
import Widgets from "./admin/components/Widgets";
import AllDrivers from "./admin/pages/AllDrivers";
import VehicleManagement from "./admin/pages/VehicleManagement";
import DeliveryManagement from "./admin/pages/DeliveryManagement";
import AllOrders from "./admin/pages/AllOrders";
import AddDriver from "./admin/pages/AddDriver";
import InventoryDashboard from "./Components/Inventory/Dashboard";
import Materials from "./Components/Inventory/Materials";
import Purchases from "./Components/Inventory/Purchase";
import Supplier from "./Components/Inventory/Supplier";
import InventoryReports from "./Components/Inventory/Reports";
import FinanceDashboard from "./Components/Finance/Dashbord";
import Expenses from "./Components/Finance/Expenses";
import Invoices from "./Components/Finance/Invoices";
import Payroll from "./Components/Finance/Payroll";
import FinanceReport from "./Components/Finance/Report";
import AddExpenses from "./Components/Finance/addExpenses";
import FinanceAddExpenses from "./Components/Finance/addExpenses";
import UpdateExpense from "./Components/Finance/updateExpenses";
import Reports from "./admin/pages/Reports";


function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const location = useLocation();
  const hideNavOnPaths = ['/login', '/register', '/forgot-password', '/change-password'];
  const shouldHideNav = hideNavOnPaths.includes(location.pathname);
  const hideFooterOnPaths = ['/login', '/register', '/forgot-password', '/change-password', '/admin'];
  const shouldHideFooter = hideFooterOnPaths.some(path => location.pathname.startsWith(path));

  return (
    <div className="min-h-screen bg-gray-100">
      {!shouldHideNav && <Nav />}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />  
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/features" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        
        {/* Product routes (from Order branch) */}
        <Route path="/products" element={<ProductCatalog />} />
        <Route path="/product/:productId" element={<ProductDetails />} />
        
        {/* Order management routes (from Order branch) */}
        <Route path="/order-details" element={<OrderDetails />} />
        <Route path="/add-new-order" element={<AddNewOrder />} />
        <Route path="/update-order/:orderId" element={<UpdateOrder />} />
        
        {/* Authentication routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/change-password" element={<ManualPasswordChange />} />
        
        {/* Route testing page */}
        <Route path="/test-routes" element={<RouteTest />} />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute requireAuth={true}>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/orders" 
          element={
            <ProtectedRoute requireAuth={true}>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute requireAuth={true}>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute requireAuth={true}>
              <Settings />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/employee/dashboard" 
          element={
            <ProtectedRoute requireAuth={true} requiredPermission="employee">
              <EmployeeDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/employee/tasks" 
          element={
            <ProtectedRoute requireAuth={true} requiredPermission="employee">
              <EmployeeDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/employee/production" 
          element={
            <ProtectedRoute requireAuth={true} requiredPermission="employee">
              <EmployeeDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/employee/quality" 
          element={
            <ProtectedRoute requireAuth={true} requiredPermission="employee">
              <EmployeeDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Driver Dashboard */}
        <Route 
          path="/driver/dashboard" 
          element={
            <ProtectedRoute requireAuth={true} requiredPermission="employee">
              <DriverDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Admin routes - all require admin role */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requireAuth={true} requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route 
            index 
            element={<Navigate to="/admin/dashboard" replace />} 
          />
          <Route 
            path="dashboard" 
            element={<AdminDashboard />} 
          />
          <Route 
            path="users" 
            element={<UserTable />} 
          />
          <Route 
            path="employees" 
            element={<EmployeeTable />} 
          />
          <Route 
            path="reports" 
            element={<Reports />} 
          />
          <Route 
            path="charts" 
            element={<Charts />} 
          />
          <Route 
            path="widgets" 
            element={<Widgets />} 
          />
          <Route 
            path="sales/drivers" 
            element={<AllDrivers />} 
          />
          <Route 
            path="sales/drivers/add" 
            element={<AddDriver />} 
          />
          <Route 
            path="sales/vehicles" 
            element={<VehicleManagement />} 
          />
          <Route 
            path="delivery/management" 
            element={<DeliveryManagement />} 
          />
          <Route 
            path="orders/all" 
            element={<OrderDetails />} 
          />
          <Route 
            path="orders/all-delivery-orders" 
            element={<AllOrders />} 
          />

          <Route 
            path="inventory/dashboard" 
            element={<InventoryDashboard/>} 
          />

          <Route 
            path="inventory/materials" 
            element={<Materials/>} 
          />

          <Route 
            path="inventory/purchase" 
            element={<Purchases/>} 
          />

          <Route 
            path="inventory/suppliers" 
            element={<Supplier/>} 
          />

          <Route 
            path="inventory/reports" 
            element={<InventoryReports/>} 
          />

          <Route 
            path="finance/dashboard" 
            element={<FinanceDashboard />} 
          />
          <Route 
            path="finance/expenses" 
            element={<Expenses/>} 
          />
          <Route 
            path="finance/invoices" 
            element={<Invoices/>} 
          />
          <Route 
            path="finance/payrolls" 
            element={<Payroll/>} 
          />

          <Route 
            path="finance/reports" 
            element={<FinanceReport/>}
          />

          <Route 
            path="/admin/finance/expenses/addExpenses" 
            element={<FinanceAddExpenses/>} 
          />
          <Route 
            path="/admin/finance/expenses/updateExpenses" 
            element={<UpdateExpense/>} 
          />


        </Route>

        {/* 404 Not Found - This should be the last route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* Footer - Hide on login, register, and admin pages */}
      {!shouldHideFooter && <Footer />}
    </div>
  );
}

export default App;