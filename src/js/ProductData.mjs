
function convertToJson(res) {
  if (res.ok) {
    return res.json();
  } else {
    throw new Error("Bad Response");
  }
}

export default class ProductData {
  baseURL = import.meta.env.VITE_SERVER_URL;
  constructor(/*category*/) {
    /*
    this.category = category;
    this.path = `../json/${this.category}.json`;
    */
  }
  async getData(category) {
    const response = await fetch(`${this.baseURL}products/search/${category} `);
    const data = await convertToJson(response);
    return data.Result;
    /*return fetch(this.path)
      .then(convertToJson)
      .then((data) => data);*/
  }
  async findProductById(id) {
    const products = await this.getData();
    return products.find((item) => item.Id === id);
  }
}
