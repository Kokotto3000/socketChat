// côté client

// on se connecte au serveur socket
const socket= io();

// gérer l'arrivée d'un nouvel utilisateur, venet qui permet de faire quelquechose au moment où qqn se connecte
socket.on("connect", ()=> {
    // on émet un message d'entrée dans une salle
    socket.emit("enter_room", "general");
})

window.onload= ()=> {
    // on écoute le submit
    document.querySelector("form").addEventListener("submit", e => {
        e.preventDefault();
        // console.log(e);
        const name= document.querySelector("#name");
        const message= document.querySelector("#message");
        // console.log(name.value + " " + message.value);
        const room= document.querySelector("#tabs li.active").dataset.room;
        const createdAt= new Date();

        // on peut envoyer le message
        socket.emit("chat_message", {
            name: name.value,
            message: message.value,
            room: room,
            createdAt: createdAt
        });

        document.querySelector("#message").value= "";
    });

    //  ici on écoute l'event chat message, celui que le serveur renvoie
    socket.on("received_message", msg=> {
        // console.log(msg);
        // et là le message s'affiche bien dans la console et si on ouvre plusieur fenêtre on voit bien qu el'on reçoit le message automatiquement dans l'autre fenêtre
        publishMessages(msg);
    });

    // écoute des clics sur les onglets
    document.querySelectorAll("#tabs li").forEach(tab=> {
        // on n'utilise pas une fonction fléchée pour pouvoir récupérer le contexte avec this
        tab.addEventListener("click", function(){
            // vérifie si l'onglet est inactif
            if(!this.classList.contains("active")){
                // on récupère l'élément actuellement actif et on lui retire son actif, et on met le actif sur l'élément cliqué
                const actif= document.querySelector("#tabs li.active");
                actif.classList.remove("active");
                this.classList.add("active");
                // on efface les messages affichés de la salle précédente
                document.querySelector("#messages").innerHTML= "";
                // pour que l'utilisateur ne soit pas dans plusieurs salle à la fois on crée un message pour quitter, on envoie le dataset de l'élément actif précédent
                socket.emit("leave_room", actif.dataset.room);
                // on entre dans la nouvelle salle
                socket.emit("enter_room", this.dataset.room);
                
            }
        });
    });

    // on écoute les init_messages
    socket.on("init_messages", msg=> {
        // console.log(msg);
        // on va boucler sur nos messages pour les afficher
        let data= JSON.parse(msg.messages);
        if(data != []){
            data.forEach(d=> {
                publishMessages(d);
            });
        }
        
    });

    // on va écoute la frappe au clavier
    document.querySelector("#message").addEventListener("input", ()=> {
        // on récupère le nom de celui qui tape, la salle...
        const name= document.querySelector("#name").value;
        const room= document.querySelector("#tabs li.active").dataset.room;
        socket.emit("typing", {
            name: name,
            room: room
        });

    });

    // on écoute si quelqu'un tape au clavier
    socket.on("userTyping", msg => {
        const writing= document.querySelector("#writing");
        writing.innerHTML= `${msg.name} est entrain d'écrire...`;

        setTimeout(()=> {
            writing.innerHTML= "";
        }, 3000);
    })
}

function publishMessages(msg){
    let created= new Date(msg.createdAt);
    let text= `<div>
            <p>${msg.name} <small>${created.toLocaleDateString()}</p>
            <p>dit ${msg.message}</p>
        </div>`;
    document.querySelector("#messages").innerHTML += text;
}

