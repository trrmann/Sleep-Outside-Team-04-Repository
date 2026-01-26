export default function modal(){

           
       //creating modal elements
        const modalSection = document.getElementById("modal");

        const myModal = document.createElement("dialog");
        const closeBtn = document.createElement("button");
        const modalBody = document.createElement("div"); 
        modalBody.classList.add("modal-body");
        const modalContent = document.createElement("p");
        const subscribeBtn = document.createElement("button");
        
      

        closeBtn.classList.add("close-modal");
        myModal.id = "call-to-action";
        closeBtn.innerHTML= "x";
        modalContent.innerHTML = "Sign up to the site and get the member benefits! Push the button below and continue with the registration process"
        subscribeBtn.innerHTML = "Sign Up"

        myModal.appendChild(closeBtn);
        modalBody.appendChild(modalContent);
        modalBody.appendChild(subscribeBtn);
        myModal.appendChild(modalBody);
    

        

        modalSection.appendChild(myModal)

        myModal.showModal();
        //close modal
        closeBtn.addEventListener("click", ()=>{
            myModal.close();

        } );

        

        
    }
   

modal();

