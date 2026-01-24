
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
        const modal = document.createElement("dialog");
        const closeBtn = document.createElement("button");
        const modalTitle = document.createElement("h3");
        const modalContent = document.createElement("p");
        const subscribeBtn = document.createElement("button");

        
        //adding content to the elements
        closeBtn.classList.add("close-modal");
        modal.id = "call-to-action";
        closeBtn.innerHTML= "x";
        modalTitle.innerHTML = "Register";
        modalContent.innerHTML = "Sign up to the site and get the member benefits! Write your email bellow and submit to continue with the registration process"
        subscribeBtn.innerHTML = "Sign Up"

        //appending elements to the html id

        modal.appendChild(closeBtn);
        modal.appendChild(modalTitle);
        modal.appendChild(modalContent);
        modal.appendChild(subscribeBtn);


        modalSection.appendChild(modal)

        modal.showModal();
        //close modal
        closeBtn.addEventListener("click", ()=>{
            modal.close();

        } );

        
        
    }
   
 createModal();




}