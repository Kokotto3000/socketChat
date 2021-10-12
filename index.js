// notre serveur
// manip à faire avec les fichiers externes avec express

//  on instancie express
const express= require("express");
const app= express();

const port = process.env.PORT || 5000;

// on charge "path"
const path= require("path");

// on autorise le dossier public, indique à express d'utiliser ce chemin pour les fichiers static
app.use(express.static(path.join(__dirname, "public")));

//  on crée le serveur http qui utilise express
const http= require("http").createServer(app);

//  on instancie socket.io
const io= require("socket.io")(http);

// on charge sequelize
const Sequelize= require("sequelize");
const { Socket } = require("socket.io");

// on fabrique le lien de la base de données
const dbPath= path.resolve(__dirname, "chat.sqlite");

// pour se connecter à la bdd (sql est un langage de bdd, sqlite est un système de gestion de bdd, type de bdd)
const sequelize= new Sequelize("database", "username", "password", {
    host: "localhost",
    dialect: "sqlite", //si on veut sql on met mysql ici
    loggin: false,

    //sqlite seulement
    storage: dbPath

});

//  on charge notre model Chat
const Chat= require("./model/Chat")(sequelize, Sequelize.DataTypes);

// on effecture le chargement réel
Chat.sync();
// le fichier .sqlite se crée automatiquement, notre base de données est créée !!!

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

    // on écoute les entrées dans les salles, c'est nous qui décidons des noms des messages bien sûr
    socket.on("enter_room", room=> {
        // on entre dans la salle demandée
        socket.join(room);
        console.log(socket.rooms);
        // Set(2) { 'FxIkt57eti5de3HcAAAF', 'general' } numero de salle privée, celle du client lui-même, pour envoyer des messages privés par ex, et nom de la salle où l'utilisateur est connecté

        // on envoie tous les message de la base
        Chat.findAll({
            attributes: ["id", "name", "message", "room", "createdAt"],
            where: {
                room: room
            }
        })
        .then(list=> {
            socket.emit("init_messages", {
                messages: JSON.stringify(list)
            });
        })
        .catch(err=> {
            console.log(err);
        })
    });

    // on écoute les sorties
    socket.on("leave_room", room=> {
        // on entre dans la salle demandée
        socket.leave(room);
        console.log(socket.rooms);
        // Set(2) { 'FxIkt57eti5de3HcAAAF', 'general' } numero de salle privée, celle du client lui-même, pour envoyer des messages privés par ex, et nom de la salle où l'utilisateur est connecté
    });

    // pour gérer le chat, le message que l'on envoie
    socket.on("chat_message", msg=> {
        // console.log(msg);
        // { name: 'Kokotto3000', message: 'MESSAGE' }
        // d'abord on va stocker notre message dans la base de données
        // create = methode de sequelize
        const message= Chat.create({
            name: msg.name,
            message: msg.message,
            room: msg.room,
            createdAt: msg.createdAt
        })
        .then(()=>{
            // le message est stocké, on le relaie à tous les utilisateurs dans le salon correspondant
            io.in(msg.room).emit("received_message", msg);
        })
        .catch(err=> {
            console.log(err);
        });
        // à la reception on va le renvoyer vers tous les autres qui écoutent chat message
        // io.emit("received_message", msg);
    });

    // on écoute les msg typing et on relaie !
    socket.on("typing", msg=> {
        socket.to(msg.room).emit("userTyping", msg);
    })
})

// on va demander au serveur http de répondre sur le port 3000
http.listen(port, () => {
    console.log(`Listening on port ${port}`);
    // si on lance sans créer la route on a cannot GET, donc on crée la route avant
});