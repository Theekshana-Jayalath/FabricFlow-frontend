import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import OrderDetails from "./components/orderDetails";
import AddNewOrder from "./components/addNewOrder";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/order-details" element={<OrderDetails />} />
          <Route path="/add-new-order" element={<AddNewOrder />} />
          <Route path="/" element={<OrderDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;