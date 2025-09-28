import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import OrderDetails from "./components/orderDetails";
import AddNewOrder from "./components/addNewOrder";
import UpdateOrder from "./components/updateOrder";
import ProductCatalog from "./components/ProductCatalog";
import ProductDetails from "./components/ProductDetails";
import { CartProvider } from "./context/CartContext";

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            {/* Default route redirects to products */}
            <Route path="/" element={<Navigate to="/products" replace />} />
            
            {/* Product routes */}
            <Route path="/products" element={<ProductCatalog />} />
            <Route path="/product/:productId" element={<ProductDetails />} />
            
            {/* Order management routes */}
            <Route path="/order-details" element={<OrderDetails />} />
            <Route path="/add-new-order" element={<AddNewOrder />} />
            <Route path="/update-order/:orderId" element={<UpdateOrder />} />
            
            {/* Catch all route - redirect to products */}
            <Route path="*" element={<Navigate to="/products" replace />} />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;