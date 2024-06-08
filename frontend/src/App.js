import "./App.css";

import { Route,BrowserRouter as Router, Routes } from "react-router-dom";
import NotFound from "./components/layout/NotFound";
import adminRoutes from "./components/routes/adminRoutes";
import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import { Toaster } from "react-hot-toast";
import userRoutes from "./components/routes/userRoutes";
function App() {
  const UserRoutes = userRoutes();
  const AdminRoutes = adminRoutes();
  return (
    <Router>
      <div className="App"> 
      <Toaster position="top-center"/>       
      <Header />

        <div className="container">
          <Routes>
            {UserRoutes}
            {AdminRoutes}
            <Route path="*" element={<NotFound />} />
          </Routes>


        </div>

        <Footer />
      </div>
    </Router>
  );
}

export default App;