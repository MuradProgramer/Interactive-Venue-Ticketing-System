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

const $ = (id) => document.getElementById(id);

function render() {
    Object.values(seats).forEach((s) => {
        s.el.classList.toggle("taken", s.taken);
        s.el.classList.toggle("in-cart", state.cart.includes(s.id));
        s.el.classList.toggle("inspected", state.inspected === s.id);
        s.el.disabled = false;
    });

    const seat = seats[state.inspected];
    const addBtn = $("addBtn");

    if (!seat) {
        $("seatTitle").textContent = "No seat selected";
        $("seatSub").textContent = "Pick a seat on the map.";

        addBtn.textContent = "Add to cart";
        addBtn.disabled = true;
    } else {
        $("seatTitle").textContent =
            `${seat.section} · Row ${seat.row} · Seat ${seat.col}`;

        $("seatSub").textContent = seat.taken
            ? "Unavailable"
            : `${seat.price} ₼`;

        const inCart = state.cart.includes(seat.id);

        addBtn.textContent = seat.taken
            ? "Unavailable"
            : inCart
                ? "Already in cart"
                : "Add to cart";

        addBtn.disabled = seat.taken || inCart;
    }

    const list = $("cartList");

    list.innerHTML = "";

    let total = 0;

    state.cart.forEach((id) => {
        const s = seats[id];

        total += s.price;

        const li = document.createElement("li");

        li.innerHTML = `<span><strong>${id}</strong><br><small>${s.section}</small></span>`;

        const price = document.createElement("span");
        price.textContent = `${s.price} ₼`;

        const rm = document.createElement("button");
        rm.className = "remove";
        rm.textContent = "✕";

        rm.setAttribute("aria-label", `Remove ${id}`);

        rm.addEventListener("click", () => removeFromCart(id));

        li.append(price, rm);

        list.prepend(li);
    });

    if (!state.cart.length) {
        list.innerHTML = "<li>No tickets yet.</li>";
    }

    $("total").textContent = `${total} ₼`;
    $("topCart").textContent = `Cart: ${state.cart.length} · ${total} ₼`;
}

buildVenue();
render();