export const getProducts = async ( token) => {
  const url = `http://localhost:4000/api/products`;
console.log(`token******** ${token}`)
  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    cache: "no-store",
    headers,
  });
  console.log("Server Hit");

  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
};

export const getProduct = async (id, token) => {
  const url = `http://localhost:4000/api/products/${id}`;

  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    cache: "no-store",
    headers,
  });
  console.log("Server Hit");

  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
};
