import tabela from "./Fcrit.json" with {type:"json"};

console.log(tabela)
window.rolarTabelaF = function(){
    var rolagem = parseInt(document.getElementById("roll").value);
    for (let instancia of tabela){
        //console.log("Instancia:", instancia);
        if (rolagem == instancia.d) {
        //console.log("Item encontrado:", instancia.item);
        document.getElementById("resultado").innerText = instancia.efeito;
        return;
        }   
    }
}   