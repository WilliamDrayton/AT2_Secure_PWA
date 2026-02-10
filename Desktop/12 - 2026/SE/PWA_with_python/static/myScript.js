document.addEventListener('DOMContentLoaded', init, false);
function init() {
  console.log('page loaded')
  loadProducts();
}

async function loadProducts() {
    const res = await fetch("/api/products");
    const data = await res.json();
    document.getElementById("product-list").innerHTML =
        data.map(p => `<p>${p.name} - $${p.price}</p>`).join("");
}