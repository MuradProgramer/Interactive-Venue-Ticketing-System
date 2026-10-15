const SECTIONS = [
    {
        code: "V",
        name: "VIP",
        price: 80,
        color: "#f5b942",
        rows: 3,
        cols: 12
    },
    {
        code: "S",
        name: "Standard",
        price: 50,
        color: "#4f9cf9",
        rows: 6,
        cols: 16
    },
    {
        code: "B",
        name: "Balcony",
        price: 30,
        color: "#46c39a",
        rows: 4,
        cols: 18
    },
    {
        code: "G",
        name: "Gallery",
        price: 20,
        color: "#b78cf2",
        rows: 3,
        cols: 20
    }
];

const seats = {};

const state = {
    inspected: null,
    cart: [],
    view: {
        zoom: 1,
        x: 0,
        y: 0
    }
};

const defaultZoom = () => (window.innerWidth < 700 ? 0.6 : 1);

state.view.zoom = defaultZoom();

const root = document.getElementById("seatsRoot");