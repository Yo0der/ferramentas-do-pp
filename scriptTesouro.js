let tesouro = {};
let tabelaItens = [];
let tabelaRiquezas = [];
let tabelaMelhorias = [];
var bonusRolagem = 0;
var armasDisparo = [];
var armadurasPesadas = [];
var escudos = [];
var antiMelhorias = [];

//Droll
(function(root) {

   "use strict";

  var droll = {};

  // Define a "class" to represent a formula
  function DrollFormula() {
    this.numDice   = 0;
    this.numSides  = 0;
    this.modifier  = 0;
    
    this.minResult = 0;
    this.maxResult = 0;
    this.avgResult = 0;
  }

  // Define a "class" to represent the results of the roll
  function DrollResult() {
    this.rolls    = [];
    this.modifier = 0;
    this.total    = 0;
  }

  /**
   * Returns a string representation of the roll result
   */
  DrollResult.prototype.toString = function() {
    if (this.rolls.length === 1 && this.modifier === 0) {
      return this.rolls[0] + '';
    }
    if (this.rolls.length > 1 && this.modifier === 0) {
      return this.rolls.join(' + ') + ' = ' + this.total;
    }

    if (this.rolls.length === 1 && this.modifier > 0) {
      return this.rolls[0] + ' + ' + this.modifier + ' = ' + this.total;
    }

    if (this.rolls.length > 1 && this.modifier > 0) {
      return this.rolls.join(' + ') + ' + ' + this.modifier + ' = ' + this.total;
    }

    if (this.rolls.length === 1 && this.modifier < 0) {
      return this.rolls[0] + ' - ' + Math.abs(this.modifier) + ' = ' + this.total;
    }

    if (this.rolls.length > 1 && this.modifier < 0) {
      return this.rolls.join(' + ') + ' - ' + Math.abs(this.modifier) + ' = ' + this.total;
    }
  };

  /**
   * Parse the formula into its component pieces.
   * Returns a DrollFormula object on success or false on failure.
   */
  droll.parse = function(formula) {
    var pieces = null;
    var result = new DrollFormula();

    pieces = formula.match(/^([1-9]\d*)?d([1-9]\d*)([+-]\d+)?$/i);
    if (!pieces) { return false; }

    result.numDice  = (pieces[1] - 0) || 1;
    result.numSides = (pieces[2] - 0);
    result.modifier = (pieces[3] - 0) || 0;

    result.minResult = (result.numDice * 1) + result.modifier;
    result.maxResult = (result.numDice * result.numSides) + result.modifier;
    result.avgResult = (result.maxResult + result.minResult) / 2;

    return result;
  };

  /**
   * Test the validity of the formula.
   * Returns true on success or false on failure.
   */
  droll.validate = function(formula) {
    return (droll.parse(formula)) ? true : false ;
  };

  /**
   * Roll the dice defined by the formula.
   * Returns a DrollResult object on success or false on failure.
   */
  droll.roll = function(formula) {
    if (typeof formula === "string" && !formula.toLowerCase().includes("d")) {
      var valor = parseInt(formula);
      return { rolls:[valor], modifier:0, total:valor };
    }

    var pieces = null;
    var result = new DrollResult();

    pieces = droll.parse(formula);
    if (!pieces) { return false; }

    for (var a=0; a<pieces.numDice; a++) {
      result.rolls[a] = (1 + Math.floor(Math.random() * pieces.numSides));
    }

    result.modifier = pieces.modifier;

    for (var b=0; b<result.rolls.length; b++) {
      result.total += result.rolls[b];
    }
    result.total += result.modifier;

    return result;
  };

  // Export library for use in node.js or browser
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = droll;
  } else {
    root.droll = droll;
  }

}(this));

//Droll

async function carregarJSON() {
  try {
    const [t1, t2, t3, t4] = await Promise.all([
    fetch("tesouro.json").then(r => r.json()),
    fetch("riquezas.json").then(r => r.json()),
    fetch("itens.json").then(r => r.json()),
    fetch("melhorias.json").then(r => r.json()),
]);

    tesouro = t1.tesouro_por_nd;
    tabelaRiquezas = t2.riquezas;
    tabelaItens = t3;
    tabelaMelhorias = t4;
    console.log("Tudo carregado com sucesso.");
    //testeLoot(100000);
    
    // Extrair armas de disparo e escudos para validação de melhorias
    for(let arma of tabelaItens.armas){//armas de disparo
      if(arma.disparo){
        armasDisparo.push(arma.item);
      }
    }
    for(let escudo of tabelaItens.armaduras){//escudos
      if(escudo.escudoI){
        escudos.push(escudo.item);
      }
    }
    for(let armaduraP of tabelaItens.armaduras){//armaduras pesadas
      if(armaduraP.pesadaA){
        armadurasPesadas.push(armaduraP.item)
      }
    }
    //Extrair armas de disparo e escudos para validação de melhorias

  } catch (e) {
    console.error("Erro carregando JSON:", e);
  }
}

window.addEventListener("DOMContentLoaded", carregarJSON);

function rolarDados(formula) {
  var resultante = (formula).split("x");
  resultante[0] = droll.roll(resultante[0]).total;
  //console.log("Rolagem de " + formula + ": " + resultante[0] + " x " + resultante[1]);
  return resultante[0] * resultante[1];
}

function rolarTabelas(rolagem, id, tabelaI) {
  var tabela = id.split(".").reduce((obj,key)=>obj[key], tabelaI);

  if (bonusRolagem > 0) {rolagem = rolagem + bonusRolagem;}
    if(rolagem > 100){rolagem = 100;}

  if(!tabela){
    console.error("Tabela não encontrada:", id);
    return "Tabela inválida";
  }

  for (let instancia of tabela) {
    //console.log("Instancia:", instancia);
    if(instancia.range.includes("-")){
    var [min, max] = instancia.range.split("-").map(n => parseInt(n));
    }
    else{
      var min = parseInt(instancia.range);
      var max = min;
    }
    if (rolagem >= min && rolagem <= max) {
      //console.log("Item encontrado:", instancia.item);

      //Casos especiais de melhorias
      if (instancia.antiMelhoria){antiMelhorias.push(instancia.antiMelhoria);}
      //Casos especiais de melhorias

      return instancia;
    }
  }
}

function gerarTesouro() {
  if (Object.keys(tesouro).length === 0) {
    document.getElementById("resultado").innerText =
      "JSON ainda não carregou.";
    return;
  }
  //pegar os valores dos inputs
  const nd = document.getElementById("nd").value.trim();
  const roll = parseInt(document.getElementById("roll").value);
  const tipo = document.getElementById("tipo").value;
  //pegar os valores dos inputs

  if(roll>100 || roll<1 ){
    document.getElementById("resultado").innerText = "Rolagem Inválida";
    console.log("Rolagem Inválida")
    return;
  }

  var tipoItem = "";
  var tipoMelhoria = "";
  var tamanho = "";
  var melhoria = "";
  var candidatoMelhoria = "";
  antiMelhorias = [];
  var resultado_final = "";
  var resultadoTesouro = "";
  const ttesouro = tesouro[nd][tipo];
  const mapaMelhorias = ["armas","armas","armas","armaduras","armaduras","esotericos"];
  const mapaEncantamentos = ["armas","armas","armaduras","acessorios","acessorios","acessorios"];
  const mapaMaterial = ["aço-rubi","adamante","gelo-eterno","madeira Tollon","matéria vermelha", "mitral"]

  function rolarMelhorias(){
    for(resultadoTesouro[1]; resultadoTesouro[1] > 0; resultadoTesouro[1]--){//n# melhorias
      while (melhoria.search(candidatoMelhoria.item) != -1 || candidatoMelhoria == "") {//Evitar melhorias repetidas
        //console.log("Re-rolando...")
        candidatoMelhoria = rolarTabelas(droll.roll("1d100").total, tipoMelhoria, tabelaMelhorias);
        if(candidatoMelhoria.doisX && resultadoTesouro[1] < 2){/*console.log("Re-rolando por 2x...");*/candidatoMelhoria = "";}//Trata as melhorias 2x
        if(candidatoMelhoria.doisX && resultadoTesouro[1] >= 2){/*console.log("Tratando melhoria 2x...");*/resultadoTesouro[1] = resultadoTesouro[1] - 1;}//Trata as melhorias 2x
        if(antiMelhorias.includes(candidatoMelhoria.antiMelhoria)){/*console.log("Re-rolando por anti-melhoria...");*/candidatoMelhoria = "";}//Trata as anti-melhorias
        if(candidatoMelhoria.item == "Mira telescópica" && !armasDisparo.includes(resultado_final)){/*console.log("Re-rolando por disparo...");*/candidatoMelhoria = "";}//Trata as melhorias de disparo
        if(candidatoMelhoria.escudoM && !escudos.includes(resultado_final)){/*console.log("Re-rolando por escudo...");*/candidatoMelhoria = "";}//Trata as melhorias de escudo
        if(candidatoMelhoria.aP && !armadurasPesadas.includes(resultado_final)){candidatoMelhoria = ""}
      }          
      melhoria += candidatoMelhoria.item + ", ";
    }
    if(melhoria.search("Item específico") != -1){melhoria = "Item específico,"}
  }

  if (!tesouro[nd]) {
    document.getElementById("resultado").innerText =
      "ND inválido.";
    return;
  }
//rolagem para encontrar o resultado do tesouro
  for (let item of ttesouro) {
        const [min, max] = item.range.split("-").map(n => parseInt(n));
        if (roll >= min && roll <= max) {
          //console.log("Item encontrado:", item.resultado);
          resultadoTesouro = item.resultado;
          if(item.bonus){bonusRolagem = 20;}
          break;
        }
  }
//rolagem para encontrar o resultado do tesouro
  if (!resultadoTesouro) {
    document.getElementById("resultado").innerText =
      "Resultado: Nada :(";
    return;
  }
  if(tipo == "dinheiro"){
    //console.log("Dinheiro encontrado:", resultadoTesouro);
    var resultanteD = (resultadoTesouro).split("x");
    //console.log("Dinheiro encontrado:", resultante);
    //Dinheiro
    if (resultanteD.length === 2) {
      document.getElementById("resultado").innerText =
      "Resultado: " + rolarDados(resultadoTesouro) + " T$";
      return;
    }
    //Dinheiro

    // Riquezas
    else{
      var resultanteR = (resultadoTesouro.replace("menores","menor").replace("médias","media").replace("média","media").replace("maiores","maior")).split(" ");
      var nRiquezas = droll.roll(resultanteR[0]).total;
      tamanho = resultanteR[2];
      //console.log("Tamanho da riqueza: " + tamanho + "," + resultanteR[0]);
      //console.log("Número de riquezas a rolar: " + nRiquezas);
      for(nRiquezas; nRiquezas > 0; nRiquezas--){
        var linhaRiqueza = rolarTabelas(droll.roll("1d100").total, tamanho, tabelaRiquezas);
        resultado_final += linhaRiqueza.item + " " + rolarDados(linhaRiqueza.valor) + "T$" + "\n\n";
      }
      bonusRolagem = 0;
      document.getElementById("resultado").innerText = "Resultado: " + resultado_final;
      return;
    }
    //Riquezas
  }
  if(tipo == "itens"){
    resultadoTesouro = resultadoTesouro.split(" ");
    console.log("Resultado do tesouro dividido:", resultadoTesouro);
    var nAleatório = droll.roll("1d6").total;
    var n2Aleatório = droll.roll("1d6").total;
    if(resultadoTesouro[1]){//Verificar se existe o segundo elemento para evitar erros
      resultadoTesouro[1] = resultadoTesouro[1].replace("(", "").replace(")", "").replace("menor", "1").replace("médio","2").replace("maior","3");
    }

    if(resultadoTesouro[0] == "Diverso"){
      tipoItem = "diverso";
      resultado_final = rolarTabelas(droll.roll("1d100").total, tipoItem, tabelaItens).item;

    }
    else if(resultadoTesouro[0] == "Equipamento" || resultadoTesouro[0] == "Superior"){
      tipoItem = mapaMelhorias[nAleatório-1];//Escolhe qual tipoItem
      resultado_final = rolarTabelas(droll.roll("1d100").total, tipoItem, tabelaItens).item;
      if(resultadoTesouro[0] == "Superior"){
        tipoMelhoria = "melhorias" + "." + tipoItem;
        rolarMelhorias();
        melhoria = melhoria.slice(0,-1).replace("Material especial", "Feita de " + mapaMaterial[n2Aleatório-1]); 
      }
    }
    else if(resultadoTesouro[0] == "Mágico"){
      //console.log(resultadoTesouro);
      tipoItem = mapaEncantamentos[nAleatório-1];//Escolhe qual tipoItem
      tipoMelhoria = "encantamentos" + "." + tipoItem;
      if(tipoItem != "acessorios"){
        resultado_final = rolarTabelas(droll.roll("1d100").total, tipoItem, tabelaItens).item;
        rolarMelhorias();
        melhoria = melhoria.slice(0,-1);
      }
      else{
        //console.log(tipoItem + "." + resultadoTesouro[1]);
        tipoItem = tipoItem + "." + resultadoTesouro[1];
        resultado_final = rolarTabelas(droll.roll("1d100").total, tipoItem, tabelaItens).item;

      }
    }
    else if(resultadoTesouro[1] == "poção" || resultadoTesouro[1] == "poções"){
      tipoItem = "pocoes";
      //console.log("Tipo de poção:", tipoItem);
      var nPocoes = droll.roll(resultadoTesouro[0]).total;
      for(nPocoes; nPocoes > 0; nPocoes--){
        resultado_final += rolarTabelas(droll.roll("1d100").total, tipoItem, tabelaItens).item + "\n";
      }
      bonusRolagem = 0;
      document.getElementById("resultado").innerText = "Resultado: Poção de " + resultado_final;
      return;//Fim poção
    }
    //console.log("Tipo de item encontrado:", tipoItem);
    if(!melhoria){document.getElementById("resultado").innerText = resultado_final;}
    else{document.getElementById("resultado").innerText = resultado_final + "("+ melhoria +")";}
    return;//Fim itens
  }

  document.getElementById("resultado").innerText =
  resultadoTesouro;
}
function testeLoot(iteracoes = 50000){

  console.log("Iniciando stress test...");

  let contagemItens = {};
  let erros = [];
  let logResultados = [];

  for(let i = 0; i < iteracoes; i++){

    try{

      let roll = Math.floor(Math.random()*100)+1;
      document.getElementById("roll").value = roll;

      const tipos = ["dinheiro","itens"];
      let tipo = tipos[Math.floor(Math.random()*tipos.length)];
      document.getElementById("tipo").value = tipo;

      const nds = Object.keys(tesouro);
      let nd = nds[Math.floor(Math.random()*nds.length)];
      document.getElementById("nd").value = nd;

      gerarTesouro();

      let resultado = document.getElementById("resultado").innerText;

      // salvar log detalhado
      logResultados.push({
        //iteracao: i,
        nd: nd,
        //tipo: tipo,
        roll: roll,
        resultado: resultado
      });

      // detectar erros
      if(resultado.includes("NaN") || resultado.includes("undefined")){
        erros.push({
          iteracao:i,
          nd: nd,
          tipo: tipo,
          roll: roll,
          resultado: resultado
        });
      }

      contagemItens[resultado] = (contagemItens[resultado] || 0) + 1;

    }catch(e){

      erros.push({
        iteracao:i,
        erro:e
      });

    }

  }

  console.log("Teste finalizado");

  //console.log("Distribuição de resultados:");
  //console.table(contagemItens);

  console.log("Amostra de execuções:");
  console.table(logResultados); // mostra só 50 para não explodir o console

  if(erros.length > 0){
    console.log("Erros encontrados:");
    console.table(erros);
  }

}