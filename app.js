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

const STORAGE_KEY = "ticketing.cart.v1";

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

function buildLegend() {
    const legend = document.getElementById("legend");
    const first = legend.firstChild;

    SECTIONS.forEach((sec) => {
        const li = document.createElement("li");

        const sw = document.createElement("span");
        sw.className = "swatch";
        sw.style.setProperty("--color", sec.color);

        li.append(sw, `${sec.name} ${sec.price} ₼`);

        legend.insertBefore(li, first);
    });
}

root.addEventListener("click", (e) => {
    const btn = e.target.closest(".seat");

    if (!btn) return;

    state.inspected = btn.dataset.id;

    render();
});

function addToCart() {
    const seat = seats[state.inspected];

    if (!seat || seat.taken) return;
    if (state.cart.includes(seat.id)) return;

    state.cart.push(seat.id);

    saveCart();
    render();
}

function removeFromCart(id) {
    state.cart = state.cart.filter((x) => x !== id);

    saveCart();
    render();
}

document.getElementById("addBtn").addEventListener("click", addToCart);

function saveCart() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cart));
    } catch (err) {
        console.warn("Could not save cart", err);
    }
}

function loadCart() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

        if (!Array.isArray(saved)) return;

        state.cart = [...new Set(saved)].filter(
            (id) => seats[id] && !seats[id].taken
        );
    } catch (err) {
        state.cart = [];
    }
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

const STEP = 40;
const MIN_Z = 0.4;
const MAX_Z = 2;
const LIMIT = 400;

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

function applyView() {
    const v = state.view;

    v.zoom = clamp(v.zoom, MIN_Z, MAX_Z);
    v.x = clamp(v.x, -LIMIT, LIMIT);
    v.y = clamp(v.y, -LIMIT, LIMIT);

    $("mapInner").style.transform =
        `translate(${v.x}px, ${v.y}px) scale(${v.zoom})`;
}

const move = (dx, dy) => {
    state.view.x += dx;
    state.view.y += dy;

    applyView();
};

let targetZoom = state.view.zoom;
let zoomAnim = null;

function animateZoom() {
    const v = state.view;
    const diff = targetZoom - v.zoom;

    if (Math.abs(diff) < 0.001) {
        v.zoom = targetZoom;

        applyView();

        zoomAnim = null;

        return;
    }

    v.zoom += diff * 0.18;

    applyView();

    zoomAnim = requestAnimationFrame(animateZoom);
}

function setTargetZoom(z) {
    targetZoom = clamp(z, MIN_Z, MAX_Z);

    if (!zoomAnim) {
        zoomAnim = requestAnimationFrame(animateZoom);
    }
}

const zoomBy = (d) => setTargetZoom(targetZoom + d);

$("zoomIn").onclick = () => zoomBy(0.2);
$("zoomOut").onclick = () => zoomBy(-0.2);

$("up").onclick = () => move(0, STEP);
$("down").onclick = () => move(0, -STEP);
$("left").onclick = () => move(STEP, 0);
$("right").onclick = () => move(-STEP, 0);

$("reset").onclick = () => {
    state.view.x = 0;
    state.view.y = 0;

    setTargetZoom(defaultZoom());

    applyView();
};

// Bonus

const map = $("map");

map.addEventListener("wheel", (e) => {
    e.preventDefault();

    let dy = e.deltaMode === 1
        ? e.deltaY * 16
        : e.deltaY;

    dy = clamp(dy, -60, 60);

    const speed = e.ctrlKey ? 0.01 : 0.0015;

    setTargetZoom(targetZoom * Math.exp(-dy * speed));
}, {
    passive: false
});

let drag = null;

map.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".controls")) return;

    drag = {
        px: e.clientX,
        py: e.clientY,
        x: state.view.x,
        y: state.view.y,
        moved: false
    };
});

window.addEventListener("pointermove", (e) => {
    if (!drag) return;

    const dx = e.clientX - drag.px;
    const dy = e.clientY - drag.py;

    if (Math.abs(dx) + Math.abs(dy) > 4) {
        drag.moved = true;
    }

    if (drag.moved) {
        state.view.x = drag.x + dx;
        state.view.y = drag.y + dy;

        applyView();
    }
});

let justDragged = false;

window.addEventListener("pointerup", () => {
    justDragged = !!(drag && drag.moved);

    drag = null;

    setTimeout(() => {
        justDragged = false;
    }, 0);
});

map.addEventListener("click", (e) => {
    if (justDragged) {
        e.stopPropagation();
    }
}, true);

buildVenue();
buildLegend();
loadCart();
render();
applyView();