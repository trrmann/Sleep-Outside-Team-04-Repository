async function convertToJson(res) {
  const jsonResponse = await res.json().catch(() => null); //converting body of the function to json 
  // and handling with catch null the case when json is not received

  if(jsonResponse !== null) { //what will happen if we have a valid json file

    if (res.ok) {
    return jsonResponse;
  }
  else {  // Send full error object
  throw {
    name: "servicesError",
    message: jsonResponse,
  };
}

  }
  
}

const baseURL = import.meta.env.VITE_SERVER_URL;

export default class ExternalServices {
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

  async findProductById(id) {
    const response = await fetch(`${baseURL}product/${id}`);
    const data = await convertToJson(response);
    return data.Result ?? data;
  }
  // inside export default class ExternalServices { ... }

  async login(credentials) {
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    };

    const response = await fetch(`${baseURL}login`, options);
    return await convertToJson(response);
  }

  async registerUser(user) {
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    };

    const response = await fetch(`${baseURL}users`, options);
    return await convertToJson(response);
  }



  async getOrders(token) {
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await fetch(`${baseURL}orders`, options);
    return await convertToJson(response);
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

