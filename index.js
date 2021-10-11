// notre serveur

//  on instancie express
const express= require("express");
const app= express();

//  on crée le serveur http qui utilise express
const http= require("http").createServer(app);

//  on instancie socket.io
const io= require("socket.io")(http);

// on crée la route GET
app.get("/", (req, res)=> {
    // res.send("Bonjour !");
    // __ variable system, mainatent quand on charge, tu charges direct le fichier index.html
    res.sendFile(__dirname + "/index.html");
    // console.log(req);
});

// on écoute l'event "connexion" de socket
io.on("connection", socket=> {
    console.log("une connexion s'active");
    // console.log(socket.id);
    // brut, donne énormément d'infos dans la console
    socket.on("disconnect", ()=> {
        console.log("un user s'est déconnecté");
    })

    // pour gérer le chat, le message que l'on envoie
    socket.on("chat_message", msg=> {
        console.log(msg);
        // { name: 'Kokotto3000', message: 'MESSAGE' }
        // à la reception on va le re,voyer vers tous les autres qui écoutent chat message
        io.emit("received_message", msg);
    })
})

// on va demander au serveur http de répondre sur le port 3000
http.listen(3000, ()=> {
    console.log("J'écoute le port 3000.");
    // si on lance sans créer la route on a cannot GET, donc on crée la route avant
});