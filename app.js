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

function buildVenue() {
    SECTIONS.forEach((sec) => {
        const secEl = document.createElement("div");
        secEl.className = "section";

        const label = document.createElement("div");
        label.className = "section-name";
        label.textContent = `${sec.name} · ${sec.price} ₼`;

        secEl.appendChild(label);

        for (let r = 1; r <= sec.rows; r++) {
            const rowEl = document.createElement("div");
            rowEl.className = "row";

            for (let c = 1; c <= sec.cols; c++) {
                const id = `${sec.code}${r}-${c}`;
                const taken = ((r - 1) * 7 + (c - 1) * 3) % 9 === 0;

                seats[id] = {
                    id,
                    section: sec.name,
                    row: r,
                    col: c,
                    price: sec.price,
                    taken
                };

                const btn = document.createElement("button");

                btn.className = "seat" + (c === sec.cols / 2 + 1 ? " aisle" : "");
                btn.style.setProperty("--color", sec.color);
                btn.dataset.id = id;

                btn.setAttribute(
                    "aria-label",
                    `${sec.name} row ${r} seat ${c}${taken ? ", unavailable" : ""}`
                );

                seats[id].el = btn;

                rowEl.appendChild(btn);
            }

            secEl.appendChild(rowEl);
        }

        root.appendChild(secEl);
    });
}

buildVenue();