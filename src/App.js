import "./App.css";
import Navbar from "./components/navbar/navbar";
import Hero from "./components/hero/hero";
import Product from "./components/product/product";
import Footer from "./components/footer/footer";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Admin from "./components/admin/Admin";
import Upload from "./components/upload/Upload";
import ProtectedRoute from "./components/protectedroute/protectedroute";
import Trash from "./components/trash/trash";
import Suggest from "./components/suggest/suggest";
// import Suggest from "./components/suggest/suggest";
import GoogleAuthModel from "./components/auth/GoogleAuthModal.js";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="App">
              <Navbar />
              <Hero />
              <div id="tracks">
                <Product />
              </div>
              <Suggest />
              <GoogleAuthModel />
              <Footer />
            </div>
          }
        />
        <Route path="/admin" element={<Admin />} />
        {/* <Route path="/suggest" element={<Suggest />} /> */}
        <Route
          path="/admin/upload"
          element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/trash"
          element={
            <ProtectedRoute>
              <Trash />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
