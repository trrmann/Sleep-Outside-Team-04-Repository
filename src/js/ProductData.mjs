const baseURL = import.meta.env.VITE_SERVER_URL;

export default class ProductData {
  async getData(category) {
  const url = `${baseURL}products/search/${category}`;
  const response = await fetch(url);

  const text = await response.text();
  console.log("FETCH URL:", url);
  console.log("STATUS:", response.status);
  console.log("RESPONSE (first 200):", text.slice(0, 200));

  try {
    const data = JSON.parse(text);
    return data?.Result?.Products ?? data?.Result ?? [];
  } catch {
    throw new Error(`Expected JSON but got HTML/text. URL: ${url}`);
  }
}

  async findProductById(id) {
    const response = await fetch(`${baseURL}product/${id}`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  }

  async searchProducts(searchTerm) {
    const response = await fetch(`${baseURL}products/search/${encodeURIComponent(searchTerm)}`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return data?.Result?.Products ?? data?.Result ?? [];
  }
}
