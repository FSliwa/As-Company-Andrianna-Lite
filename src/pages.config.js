import Home from './pages/Home';
import About from './pages/About';
import Treatments from './pages/Treatments';
import Packages from './pages/Packages';
import Contact from './pages/Contact';
import Booking from './pages/Booking';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "About": About,
    "Treatments": Treatments,
    "Packages": Packages,
    "Contact": Contact,
    "Booking": Booking,
    "PaymentSuccess": PaymentSuccess,
    "PaymentCancel": PaymentCancel,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};