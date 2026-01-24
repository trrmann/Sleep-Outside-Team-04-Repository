async function convertToJson(res) {
  const data = await res.json().catch(() => null);

  if (res.ok) return data;

  // include server message/details if provided
  throw new Error(
    `Request failed: ${res.status} ${res.statusText} :: ${JSON.stringify(data)}`
  );
}


const baseURL = import.meta.env.VITE_SERVER_URL;

export default class ProductData {
  constructor() {}

  async getData(category) {
    const response = await fetch(`${baseURL}products/search/${category}`);
    const data = await convertToJson(response);
    return data.Result ?? data;
  }

  async searchProducts(term) {
    const q = String(term || "").trim().toLowerCase();
    if (!q) return [];

    // Pull from API (all categories) then filter
    const categories = ["tents", "backpacks", "sleeping-bags", "hammocks"];

    const results = [];
    for (const cat of categories) {
      const items = await this.getData(cat);
      if (Array.isArray(items)) results.push(...items);
    }

    // Filter by common searchable fields
    return results.filter((p) => {
      const name = String(p?.NameWithoutBrand ?? p?.Name ?? "").toLowerCase();
      const brand = String(p?.Brand?.Name ?? p?.Brand ?? "").toLowerCase();
      const desc = String(p?.Description ?? p?.DescriptionHtmlSimple ?? "").toLowerCase();

      return name.includes(q) || brand.includes(q) || desc.includes(q);
    });
  }

  async findProductById(id) {
    const response = await fetch(`${baseURL}product/${id}`);
    const data = await convertToJson(response);
    return data.Result ?? data;
  }

  // NEW: W04 checkout POST
  async checkout(payload) {
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    };

    const response = await fetch(`${baseURL}checkout`, options);
    return await convertToJson(response);
  }
}
