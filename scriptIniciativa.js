var combatentes = [];
var ordemIniciativa = [];
var inimigos = [];
var nTurnos = 1;
function addCombatente(iniciativa, nome, PV){
    this.iniciativa = iniciativa
    this.nome = nome
    this.vida = PV
    this.vidaMax = PV
}

function contaTurno(){
    nTurnos++;
    const container = document.getElementById("nTurnos");
    container.innerHTML = "";
    container.innerHTML = `Turno#${nTurnos}`;
}

function ordenarCombatentes(){
    var i = combatentes.length;
    for(var j = 0; j<i; j++){
        for(var k = j; k<i; k++){
            if(combatentes[j] && parseInt(combatentes[j].iniciativa) < parseInt(combatentes[k].iniciativa)){
                var aux = combatentes[j];
                combatentes[j] = combatentes[k];
                combatentes[k] = aux;
            }
            //console.log(combatentes);
        }
    }
    //Adiciona um asterisco no primero combatente
    combatentes.forEach(combatente => {combatente.nome = combatente.nome.replace("*","").replace("*","")})
    combatentes[0].nome = "*" + combatentes[0].nome + "*"
    //Adiciona um asterisco no primero combatente
}

function renderizarCardsInimigos_popularOrdemIniciativa() {
    const container = document.getElementById('container-inimigos');
    if (!container) return;
    container.innerHTML = '';

    combatentes = combatentes.filter(combatente => (combatente.vida > 0 || combatente.vida === ""));
    console.log(combatentes)
    ordemIniciativa = [];
    inimigos =[];
    for(var j = 0; j<combatentes.length; j++){
        ordemIniciativa.push(" " + combatentes[j].nome + " (" + combatentes[j].iniciativa + ")");
        if(combatentes[j].vida){
            inimigos.push(combatentes[j]);
        }
    }
    
    inimigos.forEach((inimigo, index) => {
        const pvAtual = parseInt(inimigo.vida);
        const pvMaximo = parseInt(inimigo.vidaMax) || pvAtual;
        
        if(pvAtual>0){
            const card = document.createElement('div');
            card.className = 'col-xl-3 col-lg-4 col-md-6 mb-3';
            
            card.innerHTML = `
                <div class="card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h5 class="card-title mb-0">${inimigo.nome}</h5>
                            <span class="badge bg-dark">Inic: ${inimigo.iniciativa}</span>
                        </div>
                            
                        <!-- PV Atual / Máximo -->
                        <div class="text-center mb-2">
                            <span class="h4" id="pv-${index}">${pvAtual}</span>
                            <small class="text-muted"> / ${pvMaximo}</small>
                        </div>
                            
                        <!-- PROGRESS BAR CORRIGIDA -->
                        <div class="mb-3">
                            <progress class="w-100" 
                                    value="${pvAtual}" 
                                    max="${pvMaximo}"
                                    style="height: 20px; border-radius: 10px;">
                            </progress>
                        </div>
                            
                        <!-- Input para dano/cura -->
                        <div class="input-group mb-2">
                            <input type="text"
                                inputmode="decimal"
                                id="dano-${index}" 
                                class="form-control form-control-sm" 
                                placeholder="Dano/Cura"
                                enterkeyhint="done"
                                onkeydown = "detectaEnter(event, ${index})"
                                onblur="detectaEnter(event, ${index})">
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(card);
        }
    });
}

function detectaEnter(e,index){
    let dano = document.getElementById(`dano-${index}`).value;
    if (dano.includes(".")){dano = dano.replace(".","-")}
    if ((e.key === 'Enter' || e.type === 'blur') && dano) {
        e.preventDefault();
        // Cancel the default action, if needed
        console.log("Enter detectado");
        inimigos[index].vida = parseInt(inimigos[index].vida) + parseInt(dano);
        console.log(inimigos[index].vida)
        document.getElementById(`dano-${index}`).value = "";
        renderizarCardsInimigos_popularOrdemIniciativa();
        document.getElementById("ordem").innerText = "⭐" + ordemIniciativa;
    }
}
function passarTurno(){
    // Lógica para passar o turno
    if(document.getElementById("iniciativa").value && document.getElementById("nome").value){
        //console.log("Entrou no If")
        var entrada = new addCombatente(document.getElementById("iniciativa").value, document.getElementById("nome").value, document.getElementById("PV").value);
        combatentes.push(entrada);
        //console.log(combatentes)
        ordenarCombatentes();
        //console.log(combatentes);
    }
    else{
        var aux = combatentes[0];
        combatentes.shift();
        combatentes.push(aux);
        contaTurno();    
    }
    renderizarCardsInimigos_popularOrdemIniciativa()
    document.getElementById("ordem").innerText = "⭐" + ordemIniciativa;
    console.log("Turno passado!");
}

function limparInputs(){
    //console.log("Limpou!")
    document.getElementById("iniciativa").value = "";
    document.getElementById("nome").value = '';
    document.getElementById("PV").value = '';
}