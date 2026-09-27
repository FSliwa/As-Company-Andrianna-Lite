import Home from './views/Home';
import About from './views/About';
import Treatments from './views/Treatments';
import Packages from './views/Packages';
import Contact from './views/Contact';
import Booking from './views/Booking';
import PaymentSuccess from './views/PaymentSuccess';
import PaymentCancel from './views/PaymentCancel';
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