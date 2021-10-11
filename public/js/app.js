const socket= io();

window.onload= ()=> {
    // on écoute le submit
    document.querySelector("form").addEventListener("submit", e => {
        e.preventDefault();
        // console.log(e);
        const name= document.querySelector("#name");
        const message= document.querySelector("#message");
        // console.log(name.value + " " + message.value);
    })
}