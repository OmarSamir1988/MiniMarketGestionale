import { useEffect, useState } from "react";

export default function App() {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/products.php")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error("API error:", error));
  }, []);

  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
  });


  function isValidText(text) {
    return /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ0-9\s'-]*$/.test(text.trim());
  }

  async function addProduct(e) {
    e.preventDefault();

    if (
      !isValidText(form.name) ||
      !isValidText(form.category) ||
      Number(form.price) <= 0 ||
      Number(form.quantity) <= 0 ||
      !Number.isInteger(Number(form.quantity))
    ) {
      alert("Inserisci valori validi");
      return;
    }

    const response = await fetch("http://localhost:8000/products.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const newProduct = await response.json();

    setProducts([...products, newProduct]);

    setForm({
      name: "",
      category: "",
      price: "",
      quantity: "",
    });
  }

  function startEdit(product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      quantity: product.quantity,
    });
  }


  function cancelEdit() {
    setEditingId(null);
    setForm({
      name: "",
      category: "",
      price: "",
      quantity: "",
    });
  }

  async function updateProduct(e) {
    e.preventDefault();

    if (
      !isValidText(form.name) ||
      !isValidText(form.category) ||
      Number(form.price) <= 0 ||
      Number(form.quantity) <= 0 ||
      !Number.isInteger(Number(form.quantity))
    ) {
      alert("Inserisci valori validi");
      return;
    }

    const response = await fetch(`http://localhost:8000/products.php?id=${editingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const updatedProduct = await response.json();

    setProducts(
      products.map((product) =>
        product.id === editingId ? updatedProduct : product
      )
    );

    setEditingId(null);
    setForm({
      name: "",
      category: "",
      price: "",
      quantity: "",
    });
  }

  async function deleteProduct(id) {
    await fetch(`http://localhost:8000/products.php?id=${id}`, {
      method: "DELETE",
    });

    setProducts(products.filter((product) => product.id !== id));
  }

  const totalValue = products.reduce(
    (sum, product) => sum + product.price * product.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-10">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-500">
            MiniMarket Gestionale
          </h1>
          <p className="text-gray-400 mt-3">
            PC prodotti di cui hai bisogno.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-900 p-5 rounded-2xl">
            <p className="text-gray-400">Prodotti</p>
            <h2 className="text-3xl font-bold">{products.length}</h2>
          </div>

          <div className="bg-zinc-900 p-5 rounded-2xl">
            <p className="text-gray-400">Quantità totale</p>
            <h2 className="text-3xl font-bold">
              {products.reduce((sum, p) => sum + p.quantity, 0)}
            </h2>
          </div>

          <div className="bg-zinc-900 p-5 rounded-2xl">
            <p className="text-gray-400">Valore magazzino</p>
            <h2 className="text-3xl font-bold">€ {totalValue}</h2>
          </div>
        </section>

        <section className="bg-zinc-900 p-5 rounded-2xl mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            {editingId ? "Modifica prodotto" : "Aggiungi prodotto"}
          </h2>

          <form onSubmit={editingId ? updateProduct : addProduct} className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <input
              required
              className="p-3 rounded-xl bg-zinc-800 outline-none"
              placeholder="Nome"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              required
              className="p-3 rounded-xl bg-zinc-800 outline-none"
              placeholder="Categoria"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />

            <input
              required
              className="p-3 rounded-xl bg-zinc-800 outline-none"
              placeholder="Prezzo"
              type="number"
              min="1"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />

            <input
              required
              className="p-3 rounded-xl bg-zinc-800 outline-none"
              placeholder="Quantità"
              type="number"
              min="1"
              step="1"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold px-4 py-3"
              >
                {editingId ? "Aggiorna" : "Aggiungi"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-gray-600 hover:bg-gray-700 rounded-xl font-semibold px-4 py-3"
                >
                  Annulla
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="bg-zinc-900 p-5 rounded-2xl overflow-x-auto">
          <h2 className="text-2xl font-semibold mb-4">Lista prodotti</h2>

          <table className="w-full min-w-[700px] text-left">
            <thead>
              <tr className="text-gray-400 border-b border-zinc-700">
                <th className="p-3">Nome</th>
                <th className="p-3">Categoria</th>
                <th className="p-3">Prezzo</th>
                <th className="p-3">Quantità</th>
                <th className="p-3">Azioni</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-zinc-800">
                  <td className="p-3">{product.name}</td>
                  <td className="p-3">{product.category}</td>
                  <td className="p-3">€ {product.price}</td>
                  <td className="p-3">{product.quantity}</td>
                  <td className="p-3">
                    <button
                      onClick={() => startEdit(product)}
                      className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-xl mr-2"
                    >
                      Modifica
                    </button>

                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl"
                    >
                      Elimina
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}