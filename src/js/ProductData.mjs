
function convertToJson(res) {
  if (res.ok) {
    return res.json();
  } else {
    throw new Error("Bad Response");
  }
}

const baseURL = import.meta.env.VITE_SERVER_URL;

export default class ProductData {
  constructor() { }

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

  /*
  async searchProducts(term) {
    const q = encodeURIComponent(term);
    const response = await fetch(`${baseURL}products/search/${q}`);
    const data = await convertToJson(response);
    return data.Result ?? data;
  }
*/
  async findProductById(id) {
    const response = await fetch(`${baseURL}product/${id}`);
    const data = await convertToJson(response);
    return data.Result ?? data;
  }
}
