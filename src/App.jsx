import { useEffect, useMemo, useState } from "react";

const API_BASE = (import.meta.env.VITE_API_BASE || "http://127.0.0.1:8090").replace(/\/$/, "");
const API_HEADERS = {};
const STORE_TOKEN_KEY = "simple-pos-store-token";
const STORE_CUSTOMER_KEY = "simple-pos-store-customer";

function currency(value) {
  return `R ${Number(value || 0).toFixed(2)}`;
}

function productPlaceholder(product) {
  const category = String(product.category || "General");
  const name = String(product.name || "Product");
  const barcode = String(product.barcode || "");
  const presets = {
    Bakery: ["#f4b183", "#fff1db", "LOAF"],
    Drinks: ["#6ec1ff", "#e2f3ff", "DRINK"],
    Dairy: ["#b7d7ff", "#f4f9ff", "DAIRY"],
    Snacks: ["#ffd166", "#fff6d6", "SNACK"],
    Sweets: ["#ff9fcd", "#fff0f7", "SWEET"],
    General: ["#9ad0c2", "#eefbf7", "SHOP"],
  };
  const [bg, accent, badge] = presets[category] || presets.General;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 320">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${bg}" />
          <stop offset="100%" stop-color="${accent}" />
        </linearGradient>
      </defs>
      <rect width="480" height="320" rx="26" fill="url(#g)" />
      <circle cx="388" cy="78" r="54" fill="rgba(255,255,255,0.28)" />
      <rect x="38" y="42" width="138" height="42" rx="21" fill="rgba(45,36,24,0.16)" />
      <text x="107" y="69" text-anchor="middle" font-size="23" font-family="Segoe UI, Arial" font-weight="700" fill="#2d2418">${badge}</text>
      <text x="38" y="170" font-size="34" font-family="Segoe UI, Arial" font-weight="800" fill="#2d2418">${name.replace(/&/g, "&amp;")}</text>
      <text x="38" y="205" font-size="18" font-family="Segoe UI, Arial" font-weight="600" fill="#4b3f31">${category.replace(/&/g, "&amp;")}</text>
      <text x="38" y="244" font-size="16" font-family="Consolas, monospace" fill="#4b3f31">${barcode.replace(/&/g, "&amp;")}</text>
    </svg>
  `.trim();
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function businessLogoPlaceholder() {
  return "/assets/patala-pay-logo.png";
}

function currentViewFromHash() {
  return window.location.hash === "#account" ? "account" : "store";
}

function AuthPage({ businessProfile, status, authMode, authForm, onModeChange, onFieldChange, onSubmit, onBack, account, accountOrders, onLogout }) {
  return (
    <div className="auth-shell">
      <section className="auth-card">
        <div className="auth-brand">
          <div className="store-logo-wrap auth-logo-wrap">
            <img className="store-logo" src={businessProfile.logoUrl || businessLogoPlaceholder()} alt={businessProfile.businessName || "Store logo"} />
          </div>
          <div>
            <p className="eyebrow">Online Customer Access</p>
            <h1>{businessProfile.businessName || "Online Pickup Store"}</h1>
            <p className="muted">Customer sign-in is separate from the catalog and separate from POS staff accounts.</p>
          </div>
        </div>

        {account ? (
          <div className="auth-account-panel">
            <div className="auth-account-head">
              <div>
                <h2>{account.fullName}</h2>
                <p>{account.email}</p>
              </div>
              <div className="auth-page-actions">
                <button className="secondary" onClick={onBack}>Back to Store</button>
                <button onClick={onLogout}>Sign Out</button>
              </div>
            </div>
            <section className="panel auth-orders-panel">
              <div className="panel-head">
                <h3>My Orders</h3>
                <span>{accountOrders.length} orders</span>
              </div>
              <div className="account-orders">
                {accountOrders.map((order) => (
                  <div key={order.id} className="account-order-card">
                    <strong>{order.orderNumber}</strong>
                    <span>Status: {order.status}</span>
                    <span>Total: {currency(order.totalAmount)}</span>
                    <span>Created: {String(order.createdAt).replace("T", " ").slice(0, 16)}</span>
                  </div>
                ))}
                {!accountOrders.length ? <span className="muted">No online orders yet.</span> : null}
              </div>
            </section>
          </div>
        ) : (
          <div className="auth-layout">
            <div className="auth-copy">
              <h2>{authMode === "login" ? "Sign in to your account" : "Create your online account"}</h2>
              <p className="muted">
                {authMode === "login"
                  ? "Use your online customer account to track orders and reuse your details during checkout."
                  : "Create an account for online pickup orders. This does not create a staff login and does not change POS customer records."}
              </p>
              <div className="auth-feature-list">
                <span>Track pickup orders</span>
                <span>Reuse your details at checkout</span>
                <span>Keep shopping separate from sign-in</span>
              </div>
            </div>
            <div className="auth-form-panel">
              <div className="auth-mode-row">
                <button className={authMode === "login" ? "secondary active-tab" : "secondary"} onClick={() => onModeChange("login")}>Login</button>
                <button className={authMode === "register" ? "secondary active-tab" : "secondary"} onClick={() => onModeChange("register")}>Register</button>
              </div>
              <div className="form-grid auth-grid">
                {authMode === "register" ? (
                  <input placeholder="Full name" value={authForm.fullName} onChange={(e) => onFieldChange("fullName", e.target.value)} />
                ) : null}
                <input placeholder="Email address" value={authForm.email} onChange={(e) => onFieldChange("email", e.target.value)} />
                <input type="password" placeholder="Password" value={authForm.password} onChange={(e) => onFieldChange("password", e.target.value)} />
              </div>
              <button className="auth-submit" onClick={onSubmit}>
                {authMode === "register" ? "Create Online Account" : "Sign In"}
              </button>
              <button className="secondary auth-back" onClick={onBack}>Continue shopping</button>
              <div className="status-inline">{status}</div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function MarketplaceHeader({ businessProfile, account, status, query, onQueryChange, cartCount, onOpenAccount, onOpenLookup }) {
  return (
    <>
      <div className="utility-bar">
        <div className="utility-links">
          <span>Pickup orders only</span>
          <span>Live stock from POS</span>
        </div>
        <div className="utility-links">
          <button className="link-button" onClick={onOpenLookup}>Order Lookup</button>
          <button className="link-button" onClick={onOpenAccount}>{account ? "My Account" : "Login / Register"}</button>
        </div>
      </div>
      <header className="market-header">
        <div className="market-brand">
          <div className="market-logo-badge">
            <img className="store-logo" src={businessProfile.logoUrl || businessLogoPlaceholder()} alt={businessProfile.businessName || "Store logo"} />
          </div>
          <div>
            <strong>{businessProfile.businessName || "Online Pickup Store"}</strong>
            <span>Same stock as the in-store POS</span>
          </div>
        </div>
        <div className="market-search">
          <input value={query} onChange={(e) => onQueryChange(e.target.value)} placeholder="Search for products, barcode, or department" />
          <button type="button">Search</button>
        </div>
        <div className="market-actions">
          <div className="status-chip">{status}</div>
          <button className="secondary" onClick={onOpenAccount}>{account ? account.fullName : "Customer Login"}</button>
          <div className="cart-pill">Cart {cartCount}</div>
        </div>
      </header>
    </>
  );
}

function DepartmentRail({ products, departments, selectedDepartment, onSelect }) {
  return (
    <aside className="department-rail">
      <div className="department-rail-head">
        <strong>Shop by Department</strong>
      </div>
      <button className={`department-link ${selectedDepartment === "all" ? "active" : ""}`} onClick={() => onSelect("all")}>
        <span>All Departments</span>
        <small>{products.length}</small>
      </button>
      {departments.map((value) => {
        const count = products.filter((product) => String(product.category || "General") === value).length;
        return (
          <button key={value} className={`department-link ${selectedDepartment === value ? "active" : ""}`} onClick={() => onSelect(value)}>
            <span>{value}</span>
            <small>{count}</small>
          </button>
        );
      })}
    </aside>
  );
}

function ShowcaseHero({ featuredProduct, selectedDepartment, departments }) {
  const label = selectedDepartment === "all" ? "Store highlights" : selectedDepartment;
  return (
    <section className="showcase-hero">
      <div className="showcase-copy">
        <span className="hero-kicker">{label}</span>
        <h2>Order online and collect using live in-store stock.</h2>
        <p>Browse department by department, build your cart quickly, and collect with your order number.</p>
        <div className="hero-chip-row">
          {departments.slice(0, 5).map((dept) => (
            <span key={dept} className="hero-chip">{dept}</span>
          ))}
        </div>
      </div>
      {featuredProduct ? (
        <div className="showcase-card">
          <img src={featuredProduct.imageUrl || productPlaceholder(featuredProduct)} alt={featuredProduct.name} />
          <div>
            <span className="showcase-badge">Featured Product</span>
            <strong>{featuredProduct.name}</strong>
            <p>{featuredProduct.category || "General"}</p>
            <span>{currency(featuredProduct.price)}</span>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default function App() {
  const [view, setView] = useState(currentViewFromHash);
  const [products, setProducts] = useState([]);
  const [businessProfile, setBusinessProfile] = useState({ businessName: "Online Pickup Store" });
  const [cart, setCart] = useState([]);
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("all");
  const [status, setStatus] = useState("Loading products...");
  const [storeToken, setStoreToken] = useState(() => window.localStorage.getItem(STORE_TOKEN_KEY) || "");
  const [account, setAccount] = useState(() => {
    const raw = window.localStorage.getItem(STORE_CUSTOMER_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw);
    } catch (_error) {
      return null;
    }
  });
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ fullName: "", email: "", password: "" });
  const [accountOrders, setAccountOrders] = useState([]);
  const [customer, setCustomer] = useState({ customerName: "", customerPhone: "", customerEmail: "", notes: "" });
  const [orderLookup, setOrderLookup] = useState("");
  const [lookupResult, setLookupResult] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState("");

  useEffect(() => {
    const onHashChange = () => setView(currentViewFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    refreshProducts();
    fetch(`${API_BASE}/store/business-profile`, { headers: API_HEADERS })
      .then((response) => response.json())
      .then((data) => setBusinessProfile(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!storeToken) {
      setAccountOrders([]);
      return;
    }
    fetch(`${API_BASE}/store/auth/me`, {
      headers: {
        ...API_HEADERS,
        Authorization: `Bearer ${storeToken}`,
      },
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Session expired.");
        }
        setAccount(data.customer);
        window.localStorage.setItem(STORE_CUSTOMER_KEY, JSON.stringify(data.customer));
        setCustomer((current) => ({
          ...current,
          customerName: data.customer.fullName,
          customerEmail: data.customer.email,
        }));
        return loadAccountOrders(storeToken);
      })
      .catch((error) => {
        clearStoreSession();
        setStatus(error.message);
      });
  }, [storeToken]);

  const navigate = (nextView) => {
    window.location.hash = nextView === "account" ? "account" : "";
    setView(nextView);
  };

  const refreshProducts = async () => {
    try {
      const response = await fetch(`${API_BASE}/store/products`, { headers: API_HEADERS });
      const data = await response.json();
      setProducts(data);
      setStatus("Products loaded.");
    } catch (error) {
      setStatus(`Could not load products: ${error.message}`);
    }
  };

  const clearStoreSession = () => {
    setStoreToken("");
    setAccount(null);
    setAccountOrders([]);
    window.localStorage.removeItem(STORE_TOKEN_KEY);
    window.localStorage.removeItem(STORE_CUSTOMER_KEY);
  };

  const loadAccountOrders = async (token = storeToken) => {
    if (!token) {
      setAccountOrders([]);
      return;
    }
    const response = await fetch(`${API_BASE}/store/account/orders`, {
      headers: {
        ...API_HEADERS,
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Could not load account orders.");
    }
    setAccountOrders(data);
  };

  const departments = useMemo(() => {
    const values = [...new Set(products.map((product) => String(product.category || "General")).filter(Boolean))];
    return values.sort((a, b) => a.localeCompare(b));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return products.filter((product) => {
      const textMatch = !needle || [product.name, product.barcode, product.category].some((value) => String(value ?? "").toLowerCase().includes(needle));
      const departmentMatch = department === "all" || String(product.category || "General") === department;
      return textMatch && departmentMatch;
    });
  }, [products, query, department]);

  const spotlightProducts = useMemo(() => {
    const source = filteredProducts.length ? filteredProducts : products;
    return source.slice(0, 12);
  }, [filteredProducts, products]);

  const featuredProduct = spotlightProducts[0] ?? products[0] ?? null;
  const total = cart.reduce((sum, line) => sum + line.qty * line.price, 0);
  const cartCount = cart.reduce((sum, line) => sum + line.qty, 0);

  const addToCart = (product) => {
    setCart((current) => {
      const existing = current.find((line) => line.id === product.id);
      if (existing) {
        return current.map((line) => (line.id === product.id ? { ...line, qty: Math.min(line.qty + 1, product.stock) } : line));
      }
      return [...current, { id: product.id, name: product.name, barcode: product.barcode, price: Number(product.price), qty: 1, maxStock: product.stock }];
    });
  };

  const updateQty = (id, qty) => {
    setCart((current) =>
      current
        .map((line) => (line.id === id ? { ...line, qty: Math.max(1, Math.min(Number(qty) || 1, line.maxStock)) } : line))
        .filter((line) => line.qty > 0),
    );
  };

  const submitPayFastForm = ({ processUrl, fields }) => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = processUrl;
    Object.entries(fields).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value ?? "";
      form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
  };

  const startPayFastPayment = async (order) => {
    setPaymentLoading(true);
    setStatus(`Redirecting to PayFast for ${order.orderNumber}...`);
    window.location.href = `${API_BASE}/store/orders/${encodeURIComponent(order.orderNumber)}/payfast/redirect`;
  };

  const placeOrder = async ({ payOnline = false } = {}) => {
    if (!customer.customerName.trim() || !customer.customerPhone.trim()) {
      const message = "Customer name and phone are required.";
      setCheckoutMessage(message);
      setStatus(message);
      return;
    }
    if (!cart.length) {
      const message = "Add items to the cart first.";
      setCheckoutMessage(message);
      setStatus(message);
      return;
    }
    setCheckoutMessage("");
    try {
      const response = await fetch(`${API_BASE}/store/orders`, {
        method: "POST",
        headers: {
          ...API_HEADERS,
          "Content-Type": "application/json",
          ...(storeToken ? { Authorization: `Bearer ${storeToken}` } : {}),
        },
        body: JSON.stringify({
          ...customer,
          lines: cart.map((line) => ({ itemId: line.id, qty: line.qty })),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Order failed.");
      }
      setLookupResult(data.order);
      setCart([]);
      setCustomer({
        customerName: account?.fullName || "",
        customerPhone: "",
        customerEmail: account?.email || "",
        notes: "",
      });
      setStatus(`Order created: ${data.order.orderNumber}`);
      setCheckoutMessage(`Order created: ${data.order.orderNumber}`);
      await refreshProducts();
      if (storeToken) {
        await loadAccountOrders();
      }
      if (payOnline) {
        await startPayFastPayment(data.order);
      }
    } catch (error) {
      setCheckoutMessage(error.message);
      setStatus(error.message);
    }
  };

  const submitAuth = async () => {
    const endpoint = authMode === "register" ? "/store/auth/register" : "/store/auth/login";
    const payload = authMode === "register"
      ? authForm
      : { email: authForm.email, password: authForm.password };
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { ...API_HEADERS, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Authentication failed.");
      }
      setStoreToken(data.token);
      setAccount(data.customer);
      window.localStorage.setItem(STORE_TOKEN_KEY, data.token);
      window.localStorage.setItem(STORE_CUSTOMER_KEY, JSON.stringify(data.customer));
      setCustomer((current) => ({
        ...current,
        customerName: data.customer.fullName,
        customerPhone: "",
        customerEmail: data.customer.email,
      }));
      setAuthForm({ fullName: "", email: "", password: "" });
      setStatus(authMode === "register" ? "Online account created." : "Signed in.");
      navigate("store");
    } catch (error) {
      setStatus(error.message);
    }
  };

  const logout = async () => {
    try {
      if (storeToken) {
        await fetch(`${API_BASE}/store/auth/logout`, {
          method: "POST",
          headers: {
            ...API_HEADERS,
            Authorization: `Bearer ${storeToken}`,
          },
        });
      }
    } catch (_error) {
      // Ignore logout network failures and still clear local session.
    }
    clearStoreSession();
    setCustomer((current) => ({ ...current, customerName: "", customerPhone: "", customerEmail: "" }));
    setStatus("Signed out.");
    navigate("store");
  };

  const lookupOrder = async () => {
    if (!orderLookup.trim()) {
      setStatus("Enter an order number.");
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/store/orders/${orderLookup.trim()}`, { headers: API_HEADERS });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Order lookup failed.");
      }
      setLookupResult(data);
      setStatus(`Order ${data.orderNumber} loaded.`);
    } catch (error) {
      setStatus(error.message);
    }
  };

  if (view === "account") {
    return (
      <AuthPage
        businessProfile={businessProfile}
        status={status}
        authMode={authMode}
        authForm={authForm}
        onModeChange={setAuthMode}
        onFieldChange={(field, value) => setAuthForm((current) => ({ ...current, [field]: value }))}
        onSubmit={submitAuth}
        onBack={() => navigate("store")}
        account={account}
        accountOrders={accountOrders}
        onLogout={logout}
      />
    );
  }

  return (
    <div className="store-shell modern-store">
      <MarketplaceHeader
        businessProfile={businessProfile}
        account={account}
        status={status}
        query={query}
        onQueryChange={setQuery}
        cartCount={cartCount}
        onOpenAccount={() => navigate("account")}
        onOpenLookup={() => document.getElementById("order-lookup-section")?.scrollIntoView({ behavior: "smooth", block: "start" })}
      />

      <div className="promo-strip">
        <span>Weekly picks</span>
        <span>Fresh stock</span>
        <span>Most ordered</span>
        <span>Pickup specials</span>
        <span>New arrivals</span>
      </div>

      <section className="showcase-layout">
        <DepartmentRail products={products} departments={departments} selectedDepartment={department} onSelect={setDepartment} />
        <ShowcaseHero featuredProduct={featuredProduct} selectedDepartment={department} departments={departments} />
      </section>

      <section className="panel brand-row">
        <div className="panel-head">
          <h3>Popular Departments</h3>
          <span>{departments.length} groups</span>
        </div>
        <div className="brand-scroller">
          {departments.map((dept) => (
            <button key={dept} className="brand-tile" onClick={() => setDepartment(dept)}>
              <strong>{dept}</strong>
              <span>{products.filter((product) => String(product.category || "General") === dept).length} items</span>
            </button>
          ))}
        </div>
      </section>

      <main className="market-grid">
        <section className="panel catalog-panel">
          <div className="panel-head">
            <h3>{department === "all" ? "All Products" : `${department} Products`}</h3>
            <span>{filteredProducts.length} items</span>
          </div>
          <div className="catalog-toolbar">
            <div className="selected-department">
              <strong>{department === "all" ? "All Departments" : department}</strong>
            </div>
            <div className="catalog-stats">
              <span>{cart.length} cart lines</span>
              <span>{currency(total)} cart total</span>
            </div>
          </div>
          <div className="product-grid modern-grid">
            {spotlightProducts.map((product, index) => (
              <article key={product.id} className={`product-card modern-card ${index === 0 ? "product-card-featured" : ""}`}>
                <div className="product-image-wrap">
                  <img className="product-image" src={product.imageUrl || productPlaceholder(product)} alt={product.name} />
                </div>
                <div className="product-meta">
                  <span className="product-category">{product.category || "General"}</span>
                  <strong>{product.name}</strong>
                  <span className="product-barcode">{product.barcode}</span>
                </div>
                <div className="product-footer">
                  <div>
                    <strong>{currency(product.price)}</strong>
                    <span>Stock: {product.stock}</span>
                  </div>
                  <button onClick={() => addToCart(product)}>Add</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="panel cart-panel">
          <div className="panel-head">
            <h3>Pickup Order</h3>
            <span>{cart.length} lines</span>
          </div>
          <div className="checkout-hint">
            {account ? `Signed in as ${account.fullName}.` : "You can order as a guest or sign in from Customer Login."}
          </div>
          <div className="form-grid">
            <input placeholder="Customer name" value={customer.customerName} readOnly={Boolean(account)} onChange={(e) => setCustomer((current) => ({ ...current, customerName: e.target.value }))} />
            <input placeholder="Phone number" value={customer.customerPhone} onChange={(e) => setCustomer((current) => ({ ...current, customerPhone: e.target.value }))} />
            <input placeholder="Email" value={customer.customerEmail} readOnly={Boolean(account)} onChange={(e) => setCustomer((current) => ({ ...current, customerEmail: e.target.value }))} />
            <input placeholder="Collection notes (optional)" value={customer.notes} onChange={(e) => setCustomer((current) => ({ ...current, notes: e.target.value }))} />
          </div>
          <div className="cart-list">
            {cart.map((line) => (
              <div key={line.id} className="cart-row">
                <div>
                  <strong>{line.name}</strong>
                  <span>{currency(line.price)}</span>
                </div>
                <input type="number" min="1" value={line.qty} onChange={(e) => updateQty(line.id, e.target.value)} />
                <strong>{currency(line.qty * line.price)}</strong>
              </div>
            ))}
          </div>
          <div className="panel-head">
            <h3>Total</h3>
            <span>{currency(total)}</span>
          </div>
          <button onClick={() => placeOrder()}>Place Pickup Order</button>
          <button onClick={() => placeOrder({ payOnline: true })} disabled={paymentLoading}>
            {paymentLoading ? "Starting PayFast..." : "Pay Online with PayFast"}
          </button>
          {checkoutMessage ? <div className="checkout-message">{checkoutMessage}</div> : null}
        </aside>
      </main>

      <section id="order-lookup-section" className="panel lookup-panel">
        <div className="panel-head">
          <h3>Order Lookup</h3>
          <span>Use order number for collection</span>
        </div>
        <div className="lookup-row">
          <input value={orderLookup} onChange={(e) => setOrderLookup(e.target.value)} placeholder="Enter order number" />
          <button onClick={lookupOrder}>Find Order</button>
        </div>
        {lookupResult ? (
          <div className="lookup-result">
            <strong>{lookupResult.orderNumber}</strong>
            <span>{lookupResult.customerName} | {lookupResult.customerPhone}</span>
            <span>Status: {lookupResult.status}</span>
            <span>Payment: {lookupResult.paymentStatus || "UNPAID"}</span>
            {lookupResult.payfastPaymentId ? <span>PayFast ID: {lookupResult.payfastPaymentId}</span> : null}
            <span>Total: {currency(lookupResult.totalAmount)}</span>
            <ul>
              {(lookupResult.lines || []).map((line) => (
                <li key={line.id ?? `${line.itemId}-${line.barcode}`}>{line.itemName} x {line.qty}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    </div>
  );
}
