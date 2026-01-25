export default function modal(){
/*
     if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createModal);
    } else {
        createModal(); 
    }
*/
    function createModal() {
        

        
       //creating modal elements
        const modalSection = document.getElementById("modal");
        const myModal = document.createElement("dialog");
        const modalHeader = document.createElement("div");
        const closeBtn = document.createElement("button");
        const modalBody = document.createElement("div"); 
        modalBody.classList.add("modal-body");
        const modalContent = document.createElement("p");
        const subscribeBtn = document.createElement("button");
        
        modalBody.appendChild(modalContent);
        modalBody.appendChild(subscribeBtn);
        //adding content to the elements
        closeBtn.classList.add("close-modal");
        myModal.id = "call-to-action";
        closeBtn.innerHTML= "x";
        modalContent.innerHTML = "Sign up to the site and get the member benefits! Push the button below and continue with the registration process"
        subscribeBtn.innerHTML = "Sign Up"

        //appending elements to the html id

        myModal.appendChild(modalContent);
        myModal.appendChild(subscribeBtn);
        myModal.appendChild(modalHeader);
        myModal.appendChild(modalBody);
        modalHeader.appendChild(closeBtn);
        modalHeader.classList.add("modal-header");

        modalSection.appendChild(myModal)

        myModal.showModal();
        //close modal
        closeBtn.addEventListener("click", ()=>{
            myModal.close();

        } );

        
        
    }
   
 createModal();


}

modal();