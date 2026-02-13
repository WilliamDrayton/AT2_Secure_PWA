document.addEventListener('DOMContentLoaded', init, false);
function init() {
  console.log('page loaded')
  loadProducts();
  loadUsers();
}

async function loadProducts() {
    const res = await fetch("/api/products");
    const data = await res.json();
    document.getElementById("product-list").innerHTML =
        data.map(p => `<p>${p.name} - $${p.price}</p>`).join("");
}

async function loadUsers(){
  try{
    const response = await fetch('/api/users');
    if(!response.ok){
      throw new Error('HTTP error! status: ${response.status}');
    }
    const data = await response.json();
    console.log("Fetched users");
    document.getElementById('user-list').innerHTML =
    data.map(p => `<p>${p.userName} - ${p.password}</p>`).join("");
  }catch (error) {
        console.error("Error fetching users:", error);
    }
}