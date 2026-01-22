/*
export default class Alert {
    constructor(path){
        this.path = `../json/${path}.json`;
        this.data = null;
       
    }

    async getData(){

        const response = await fetch(this.path);
        if(!response.ok) {
            throw new Error("No alert information founded");
        }
        this.data = await response.json();
      
        return this.data.map(alert=> 
        `<section class="alert-list">
        <p style="background: ${alert.background}; color:${alert.color};">${alert.message} </p>
        <section>`
    
        ).join("");

    }
}
    */
