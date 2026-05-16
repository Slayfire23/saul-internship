import Home from "./pages/Home";
import { HashRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import AOS from "aos";
import Explore from "./pages/Explore";
import Author from "./pages/Author";
import ItemDetails from "./pages/ItemDetails";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import "aos/dist/aos.css";

function AOSRefresh() {
  const location = useLocation();

  useEffect(() => {
    AOS.refreshHard();
  }, [location.pathname]);

  return null;
}

function App() {
  useEffect(() => {
    AOS.init({
      duration: 700,
      easing: "ease-out-cubic",
      once: true,
      offset: 80,
    });
  }, []);

  return (
    <Router>
      <AOSRefresh />
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/author" element={<Author />} />
        <Route path="/author/:id" element={<Author />} />
        <Route path="/item-details" element={<ItemDetails />} />
        <Route path="/item-details/:id" element={<ItemDetails />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
