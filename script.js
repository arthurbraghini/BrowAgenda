/* =========================================================
   BROWAGENDA
   Sistema simples de agenda e faturamento
   ========================================================= */


/* =========================================================
   DADOS
   ========================================================= */

let clientes =
    JSON.parse(
        localStorage.getItem("browagenda_clientes")
    ) || [];


let atendimentos =
    JSON.parse(
        localStorage.getItem("browagenda_atendimentos")
    ) || [];


let servicos =
    JSON.parse(
        localStorage.getItem("browagenda_servicos")
    ) || [];


/* Serviços padrão */

if (servicos.length === 0) {

    servicos = [

        {
            id: gerarId(),
            nome: "Design de sobrancelhas",
            preco: 35
        },

        {
            id: gerarId(),
            nome: "Design + Henna",
            preco: 50
        },

        {
            id: gerarId(),
            nome: "Brow Lamination",
            preco: 70
        },

        {
            id: gerarId(),
            nome: "Buço",
            preco: 15
        }

    ];

    salvarDados();
}


/* =========================================================
   UTILITÁRIOS
   ========================================================= */

function gerarId() {

    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );

}


function salvarDados() {

    localStorage.setItem(
        "browagenda_clientes",
        JSON.stringify(clientes)
    );

    localStorage.setItem(
        "browagenda_atendimentos",
        JSON.stringify(atendimentos)
    );

    localStorage.setItem(
        "browagenda_servicos",
        JSON.stringify(servicos)
    );

}


function formatarMoeda(valor) {

    return Number(valor || 0).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


function dataHojeISO() {

    const hoje = new Date();

    const ano =
        hoje.getFullYear();

    const mes =
        String(
            hoje.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            hoje.getDate()
        ).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;

}


function formatarData(data) {

    if (!data) return "";

    const partes =
        data.split("-");

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


function escaparHTML(texto) {

    return String(texto ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   NAVEGAÇÃO
   ========================================================= */

const titulos = {

    inicio: [
        "Início",
        "Visão geral do seu negócio"
    ],

    agenda: [
        "Agenda",
        "Organize seus atendimentos"
    ],

    clientes: [
        "Clientes",
        "Cadastre e gerencie suas clientes"
    ],

    servicos: [
        "Serviços",
        "Cadastre os serviços oferecidos"
    ],

    faturamento: [
        "Faturamento",
        "Acompanhe seus resultados"
    ]

};


function mudarSecao(secao) {

    document
        .querySelectorAll(".section")
        .forEach(elemento => {

            elemento.classList.remove(
                "active"
            );

        });


    const alvo =
        document.getElementById(
            secao
        );


    if (alvo) {

        alvo.classList.add(
            "active"
        );

    }


    document
        .querySelectorAll(
            ".nav-item, .mobile-nav-item"
        )
        .forEach(botao => {

            botao.classList.toggle(
                "active",
                botao.dataset.section ===
                secao
            );

        });


    const titulo =
        titulos[secao];


    if (titulo) {

        document.getElementById(
            "pageTitle"
        ).textContent =
            titulo[0];


        document.getElementById(
            "pageSubtitle"
        ).textContent =
            titulo[1];

    }


    if (secao === "faturamento") {

        preencherMesesFaturamento();

        renderizarFaturamentoSelecionado();

    }

}


document
    .querySelectorAll(
        ".nav-item, .mobile-nav-item"
    )
    .forEach(botao => {

        botao.addEventListener(
            "click",
            () => {

                mudarSecao(
                    botao.dataset.section
                );

            }
        );

    });


/* =========================================================
   MODAIS
   ========================================================= */

function abrirModal(id) {

    const modal =
        document.getElementById(id);


    if (!modal) return;


    modal.classList.add(
        "active"
    );


    if (
        id ===
        "modalAgendamento"
    ) {

        preencherSelects();


        document.getElementById(
            "dataAgendamento"
        ).value =
            dataHojeISO();


        atualizarValorAgendamento();

    }

}


function fecharModal(id) {

    const modal =
        document.getElementById(id);


    if (!modal) return;


    modal.classList.remove(
        "active"
    );

}


document
    .querySelectorAll(".modal")
    .forEach(modal => {

        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target === modal
                ) {

                    fecharModal(
                        modal.id
                    );

                }

            }
        );

    });


/* =========================================================
   CLIENTES
   ========================================================= */

function salvarCliente(event) {

    event.preventDefault();


    const nome =
        document.getElementById(
            "nomeCliente"
        ).value.trim();


    const telefone =
        document.getElementById(
            "telefoneCliente"
        ).value.trim();


    const observacao =
        document.getElementById(
            "observacaoCliente"
        ).value.trim();


    if (!nome) {

        mostrarToast(
            "Digite o nome da cliente."
        );

        return;

    }


    clientes.push({

        id: gerarId(),

        nome,

        telefone,

        observacao,

        criadoEm:
            new Date().toISOString()

    });


    salvarDados();


    document
        .getElementById(
            "formCliente"
        )
        .reset();


    fecharModal(
        "modalCliente"
    );


    atualizarTudo();


    mostrarToast(
        "Cliente cadastrada com sucesso!"
    );

}


function excluirCliente(id) {

    const cliente =
        buscarCliente(id);


    if (!cliente) return;


    const confirmar =
        confirm(
            `Deseja excluir ${cliente.nome}?`
        );


    if (!confirmar) return;


    clientes =
        clientes.filter(
            cliente =>
                cliente.id !== id
        );


    salvarDados();


    atualizarTudo();


    mostrarToast(
        "Cliente excluída."
    );

}


/* =========================================================
   SERVIÇOS
   ========================================================= */

function salvarServico(event) {

    event.preventDefault();


    const nome =
        document.getElementById(
            "nomeServico"
        ).value.trim();


    const preco =
        Number(
            document.getElementById(
                "precoServico"
            ).value
        );


    if (!nome || preco < 0) {

        mostrarToast(
            "Preencha os dados corretamente."
        );

        return;

    }


    servicos.push({

        id: gerarId(),

        nome,

        preco

    });


    salvarDados();


    document
        .getElementById(
            "formServico"
        )
        .reset();


    fecharModal(
        "modalServico"
    );


    atualizarTudo();


    mostrarToast(
        "Serviço cadastrado com sucesso!"
    );

}


function excluirServico(id) {

    const servico =
        buscarServico(id);


    if (!servico) return;


    const usado =
        atendimentos.some(
            atendimento => {

                return (
                    atendimento.servicoId === id ||
                    atendimento.servicoId1 === id ||
                    atendimento.servicoId2 === id
                );

            }
        );


    if (usado) {

        mostrarToast(
            "Esse serviço possui atendimentos vinculados e não pode ser excluído."
        );

        return;

    }


    const confirmar =
        confirm(
            `Deseja excluir ${servico.nome}?`
        );


    if (!confirmar) return;


    servicos =
        servicos.filter(
            servico =>
                servico.id !== id
        );


    salvarDados();


    atualizarTudo();


    mostrarToast(
        "Serviço excluído."
    );

}


/* =========================================================
   BUSCAS
   ========================================================= */

function buscarCliente(id) {

    return clientes.find(
        cliente =>
            cliente.id === id
    );

}


function buscarServico(id) {

    return servicos.find(
        servico =>
            servico.id === id
    );

}


/* =========================================================
   SELECTS
   ========================================================= */

function preencherSelects() {

    const clienteSelect =
        document.getElementById(
            "clienteAgendamento"
        );


    const servicoSelect =
        document.getElementById(
            "servicoAgendamento"
        );


    const servicoSelect2 =
        document.getElementById(
            "servicoAgendamento2"
        );


    if (
        !clienteSelect ||
        !servicoSelect ||
        !servicoSelect2
    ) {

        return;

    }


    /* CLIENTES */

    clienteSelect.innerHTML =
        `
        <option value="">
            Selecione uma cliente
        </option>
        `;


    clientes
        .slice()
        .sort(
            (a, b) =>
                a.nome.localeCompare(
                    b.nome
                )
        )
        .forEach(cliente => {

            clienteSelect.innerHTML +=
                `
                <option value="${cliente.id}">
                    ${escaparHTML(
                        cliente.nome
                    )}
                </option>
                `;

        });


    /* SERVIÇO 1 */

    servicoSelect.innerHTML =
        `
        <option value="">
            Selecione um serviço
        </option>
        `;


    /* SERVIÇO 2 */

    servicoSelect2.innerHTML =
        `
        <option value="">
            Nenhum segundo serviço
        </option>
        `;


    servicos.forEach(servico => {

        const option =
            `
            <option value="${servico.id}">
                ${escaparHTML(
                    servico.nome
                )}
                — ${formatarMoeda(
                    servico.preco
                )}
            </option>
            `;


        servicoSelect.innerHTML +=
            option;


        servicoSelect2.innerHTML +=
            option;

    });


    atualizarValorAgendamento();

}


/* =========================================================
   CÁLCULO DOS SERVIÇOS
   ========================================================= */

function atualizarValorAgendamento() {

    const select1 =
        document.getElementById(
            "servicoAgendamento"
        );


    const select2 =
        document.getElementById(
            "servicoAgendamento2"
        );


    const elemento =
        document.getElementById(
            "valorTotalAgendamento"
        );


    if (
        !select1 ||
        !select2 ||
        !elemento
    ) {

        return;

    }


    const servico1 =
        buscarServico(
            select1.value
        );


    const servico2 =
        buscarServico(
            select2.value
        );


    const preco1 =
        servico1
            ? Number(servico1.preco)
            : 0;


    const preco2 =
        servico2
            ? Number(servico2.preco)
            : 0;


    const total =
        preco1 + preco2;


    elemento.textContent =
        formatarMoeda(total);

}


/* =========================================================
   AGENDAMENTO
   ========================================================= */

function salvarAgendamento(event) {

    event.preventDefault();


    const clienteId =
        document.getElementById(
            "clienteAgendamento"
        ).value;


    const servicoId =
        document.getElementById(
            "servicoAgendamento"
        ).value;


    const servicoId2 =
        document.getElementById(
            "servicoAgendamento2"
        ).value;


    const data =
        document.getElementById(
            "dataAgendamento"
        ).value;


    const hora =
        document.getElementById(
            "horaAgendamento"
        ).value;


    const observacao =
        document.getElementById(
            "observacaoAgendamento"
        ).value.trim();


    if (
        !clienteId ||
        !servicoId ||
        !data ||
        !hora
    ) {

        mostrarToast(
            "Preencha todos os campos obrigatórios."
        );

        return;

    }


    if (
        servicoId2 &&
        servicoId2 === servicoId
    ) {

        mostrarToast(
            "Escolha serviços diferentes."
        );

        return;

    }


    const conflito =
        atendimentos.some(
            atendimento => {

                return (
                    atendimento.data === data &&
                    atendimento.hora === hora &&
                    atendimento.status !==
                        "cancelado"
                );

            }
        );


    if (conflito) {

        mostrarToast(
            "Já existe um atendimento nesse horário."
        );

        return;

    }


    const servico1 =
        buscarServico(
            servicoId
        );


    const servico2 =
        servicoId2
            ? buscarServico(
                servicoId2
            )
            : null;


    const preco1 =
        servico1
            ? Number(servico1.preco)
            : 0;


    const preco2 =
        servico2
            ? Number(servico2.preco)
            : 0;


    const precoTotal =
        preco1 + preco2;


    atendimentos.push({

        id: gerarId(),

        clienteId,

        /*
         * Compatibilidade:
         * servicoId continua sendo o
         * primeiro serviço.
         */

        servicoId,

        /*
         * Segundo serviço.
         */

        servicoId2:
            servicoId2 || null,

        /*
         * Guardamos o preço de cada serviço
         * para preservar o histórico mesmo
         * que o preço seja alterado depois.
         */

        servicoPreco1:
            preco1,

        servicoPreco2:
            preco2,

        /*
         * Total do atendimento.
         */

        preco:
            precoTotal,

        data,

        hora,

        observacao,

        status:
            "agendado",

        criadoEm:
            new Date().toISOString()

    });


    salvarDados();


    document
        .getElementById(
            "formAgendamento"
        )
        .reset();


    document
        .getElementById(
            "dataAgendamento"
        ).value =
            dataHojeISO();


    atualizarValorAgendamento();


    fecharModal(
        "modalAgendamento"
    );


    atualizarTudo();


    mostrarToast(
        "Agendamento criado com sucesso!"
    );

}


/* =========================================================
   SERVIÇOS DO ATENDIMENTO
   ========================================================= */

function obterServicosDoAtendimento(
    atendimento
) {

    /*
     * NOVOS AGENDAMENTOS
     */

    if (
        atendimento.servicoId ||
        atendimento.servicoId1
    ) {

        const id1 =
            atendimento.servicoId1 ||
            atendimento.servicoId;


        const id2 =
            atendimento.servicoId2;


        const servico1 =
            buscarServico(id1);


        const servico2 =
            id2
                ? buscarServico(id2)
                : null;


        return [
            servico1,
            servico2
        ].filter(Boolean);

    }


    return [];

}


function obterServicosComPrecos(
    atendimento
) {

    /*
     * NOVO FORMATO
     */

    if (
        atendimento.servicoId ||
        atendimento.servicoId1
    ) {

        const id1 =
            atendimento.servicoId1 ||
            atendimento.servicoId;


        const id2 =
            atendimento.servicoId2;


        const servico1 =
            buscarServico(id1);


        const servico2 =
            id2
                ? buscarServico(id2)
                : null;


        let preco1;


        let preco2;


        if (
            atendimento.servicoPreco1 !==
            undefined
        ) {

            preco1 =
                Number(
                    atendimento.servicoPreco1
                );

        } else {

            preco1 =
                servico1
                    ? Number(
                        servico1.preco
                    )
                    : 0;

        }


        if (
            atendimento.servicoPreco2 !==
            undefined
        ) {

            preco2 =
                Number(
                    atendimento.servicoPreco2
                );

        } else {

            preco2 =
                servico2
                    ? Number(
                        servico2.preco
                    )
                    : 0;

        }


        const resultado = [];


        if (servico1) {

            resultado.push({

                servico:
                    servico1,

                preco:
                    preco1

            });

        }


        if (servico2) {

            resultado.push({

                servico:
                    servico2,

                preco:
                    preco2

            });

        }


        return resultado;

    }


    return [];

}


/* =========================================================
   CONCLUIR / CANCELAR
   ========================================================= */

function concluirAgendamento(id) {

    const atendimento =
        atendimentos.find(
            atendimento =>
                atendimento.id === id
        );


    if (!atendimento) return;


    atendimento.status =
        "concluido";


    salvarDados();


    atualizarTudo();


    mostrarToast(
        "Atendimento concluído!"
    );

}


function cancelarAgendamento(id) {

    const atendimento =
        atendimentos.find(
            atendimento =>
                atendimento.id === id
        );


    if (!atendimento) return;


    const confirmar =
        confirm(
            "Deseja cancelar este atendimento?"
        );


    if (!confirmar) return;


    atendimento.status =
        "cancelado";


    salvarDados();


    atualizarTudo();


    mostrarToast(
        "Atendimento cancelado."
    );

}


/* =========================================================
   AGENDA
   ========================================================= */

let mesAgendaAtual =
    new Date();


function nomeMes(mesAno) {

    const [ano, mes] =
        mesAno.split("-");


    const data =
        new Date(
            Number(ano),
            Number(mes) - 1,
            1
        );


    return data.toLocaleDateString(
        "pt-BR",
        {
            month: "long",
            year: "numeric"
        }
    );

}


function obterMesAtualAgenda() {

    return `${mesAgendaAtual.getFullYear()}-${String(
        mesAgendaAtual.getMonth() + 1
    ).padStart(2, "0")}`;

}


function mudarMes(valor) {

    mesAgendaAtual.setMonth(
        mesAgendaAtual.getMonth() +
        valor
    );


    renderizarAgenda();

}


function gerarHTMLAgendamento(
    atendimento
) {

    const cliente =
        buscarCliente(
            atendimento.clienteId
        );


    const servicosAtendimento =
        obterServicosDoAtendimento(
            atendimento
        );


    const nomeCliente =
        cliente
            ? cliente.nome
            : "Cliente removida";


    const nomesServicos =
        servicosAtendimento
            .map(
                servico =>
                    servico.nome
            )
            .join(" + ");


    let statusTexto =
        "Agendado";


    if (
        atendimento.status ===
        "concluido"
    ) {

        statusTexto =
            "Concluído";

    }


    if (
        atendimento.status ===
        "cancelado"
    ) {

        statusTexto =
            "Cancelado";

    }


    return `
        <div class="appointment">

            <div class="appointment-time">
                ${escaparHTML(
                    atendimento.hora
                )}
            </div>


            <div class="appointment-info">

                <strong>
                    ${escaparHTML(
                        nomeCliente
                    )}
                </strong>

                <span>
                    ${escaparHTML(
                        nomesServicos ||
                        "Serviço"
                    )}

                    •
                    ${formatarMoeda(
                        atendimento.preco
                    )}
                </span>

                ${
                    atendimento.observacao
                        ?
                        `
                        <span>
                            ${escaparHTML(
                                atendimento.observacao
                            )}
                        </span>
                        `
                        :
                        ""
                }

            </div>


            <span
                class="status ${atendimento.status}"
            >
                ${statusTexto}
            </span>


            <div class="appointment-actions">

                ${
                    atendimento.status ===
                    "agendado"
                        ?
                        `
                        <button
                            class="small-button"
                            onclick="concluirAgendamento('${atendimento.id}')"
                        >
                            Concluir
                        </button>

                        <button
                            class="small-button"
                            onclick="cancelarAgendamento('${atendimento.id}')"
                        >
                            Cancelar
                        </button>
                        `
                        :
                        ""
                }

            </div>

        </div>
    `;

}


function renderizarAgenda() {

    const container =
        document.getElementById(
            "listaAgenda"
        );


    const titulo =
        document.getElementById(
            "mesAgenda"
        );


    const mes =
        obterMesAtualAgenda();


    titulo.textContent =
        nomeMes(mes);


    const lista =
        atendimentos
            .filter(
                atendimento =>
                    atendimento.data.startsWith(
                        mes
                    )
            )
            .sort(
                (a, b) => {

                    const dataA =
                        `${a.data} ${a.hora}`;

                    const dataB =
                        `${b.data} ${b.hora}`;

                    return dataA.localeCompare(
                        dataB
                    );

                }
            );


    if (lista.length === 0) {

        container.innerHTML =
            `
            <div class="empty-state">

                <strong>
                    Nenhum atendimento
                </strong>

                Não existem atendimentos neste mês.

            </div>
            `;

        return;

    }


    let html = "";


    let dataAnterior = "";


    lista.forEach(
        atendimento => {

            if (
                atendimento.data !==
                dataAnterior
            ) {

                html +=
                    `
                    <div style="
                        margin-top: 12px;
                        margin-bottom: 8px;
                        font-size: 11px;
                        color: var(--texto-suave);
                        font-weight: 600;
                    ">
                        ${formatarData(
                            atendimento.data
                        )}
                    </div>
                    `;

                dataAnterior =
                    atendimento.data;

            }


            html +=
                gerarHTMLAgendamento(
                    atendimento
                );

        }
    );


    container.innerHTML =
        html;

}


/* =========================================================
   PRÓXIMOS ATENDIMENTOS
   ========================================================= */

function renderizarProximosAtendimentos() {

    const container =
        document.getElementById(
            "proximosAtendimentos"
        );


    const hoje =
        dataHojeISO();


    const lista =
        atendimentos
            .filter(
                atendimento =>
                    atendimento.data >= hoje &&
                    atendimento.status ===
                        "agendado"
            )
            .sort(
                (a, b) => {

                    const A =
                        `${a.data} ${a.hora}`;

                    const B =
                        `${b.data} ${b.hora}`;

                    return A.localeCompare(B);

                }
            )
            .slice(0, 5);


    if (lista.length === 0) {

        container.innerHTML =
            `
            <div class="empty-state">

                <strong>
                    Agenda livre
                </strong>

                Você não possui próximos atendimentos.

            </div>
            `;

        return;

    }


    container.innerHTML =
        lista
            .map(
                atendimento =>
                    gerarHTMLAgendamento(
                        atendimento
                    )
            )
            .join("");

}


/* =========================================================
   CLIENTES - RENDERIZAÇÃO
   ========================================================= */

function renderizarClientes() {

    const container =
        document.getElementById(
            "listaClientes"
        );


    const busca =
        document.getElementById(
            "buscaCliente"
        ).value
        .toLowerCase()
        .trim();


    const lista =
        clientes
            .filter(
                cliente =>
                    cliente.nome
                        .toLowerCase()
                        .includes(busca) ||
                    cliente.telefone
                        .toLowerCase()
                        .includes(busca)
            )
            .sort(
                (a, b) =>
                    a.nome.localeCompare(
                        b.nome
                    )
            );


    if (lista.length === 0) {

        container.innerHTML =
            `
            <div class="empty-state">

                <strong>
                    Nenhuma cliente encontrada
                </strong>

                Cadastre uma nova cliente para começar.

            </div>
            `;

        return;

    }


    container.innerHTML =
        lista
            .map(
                cliente =>
                    `
                    <div class="client-item">

                        <div class="client-info">

                            <strong>
                                ${escaparHTML(
                                    cliente.nome
                                )}
                            </strong>

                            <span>
                                ${
                                    cliente.telefone
                                        ?
                                        escaparHTML(
                                            cliente.telefone
                                        )
                                        :
                                        "Telefone não informado"
                                }
                            </span>

                            ${
                                cliente.observacao
                                    ?
                                    `
                                    <span>
                                        ${escaparHTML(
                                            cliente.observacao
                                        )}
                                    </span>
                                    `
                                    :
                                    ""
                            }

                        </div>


                        <div class="client-actions">

                            <button
                                class="small-button"
                                onclick="excluirCliente('${cliente.id}')"
                            >
                                Excluir
                            </button>

                        </div>

                    </div>
                    `
            )
            .join("");

}


/* =========================================================
   SERVIÇOS - RENDERIZAÇÃO
   ========================================================= */

function renderizarServicos() {

    const container =
        document.getElementById(
            "listaServicos"
        );


    if (servicos.length === 0) {

        container.innerHTML =
            `
            <div class="empty-state">

                <strong>
                    Nenhum serviço
                </strong>

                Cadastre seus serviços.

            </div>
            `;

        return;

    }


    container.innerHTML =
        servicos
            .map(
                servico =>
                    `
                    <div class="service-item">

                        <div class="service-info">

                            <strong>
                                ${escaparHTML(
                                    servico.nome
                                )}
                            </strong>

                            <span>
                                ${formatarMoeda(
                                    servico.preco
                                )}
                            </span>

                        </div>


                        <div class="service-actions">

                            <button
                                class="small-button"
                                onclick="excluirServico('${servico.id}')"
                            >
                                Excluir
                            </button>

                        </div>

                    </div>
                    `
            )
            .join("");

}


/* =========================================================
   FINANCEIRO
   ========================================================= */

function mesAtual() {

    const hoje =
        new Date();


    return `${hoje.getFullYear()}-${String(
        hoje.getMonth() + 1
    ).padStart(2, "0")}`;

}


function obterMesesComDados() {

    const meses =
        new Set();


    meses.add(
        mesAtual()
    );


    atendimentos.forEach(
        atendimento => {

            if (
                atendimento.data
            ) {

                meses.add(
                    atendimento.data.substring(
                        0,
                        7
                    )
                );

            }

        }
    );


    return Array
        .from(meses)
        .sort()
        .reverse();

}


function obterConcluidosDoMes(
    mes
) {

    return atendimentos.filter(
        atendimento =>
            atendimento.data.startsWith(
                mes
            ) &&
            atendimento.status ===
                "concluido"
    );

}


function calcularFaturamentoDoMes(
    mes
) {

    return obterConcluidosDoMes(
        mes
    )
        .reduce(
            (
                total,
                atendimento
            ) => {

                return (
                    total +
                    Number(
                        atendimento.preco ||
                        0
                    )
                );

            },
            0
        );

}


function preencherMesesFaturamento() {

    const select =
        document.getElementById(
            "mesFaturamento"
        );


    if (!select) return;


    const meses =
        obterMesesComDados();


    const valorAtual =
        select.value ||
        mesAtual();


    select.innerHTML =
        meses
            .map(
                mes =>
                    `
                    <option value="${mes}">
                        ${nomeMes(mes)}
                    </option>
                    `
            )
            .join("");


    if (
        meses.includes(
            valorAtual
        )
    ) {

        select.value =
            valorAtual;

    }

}


function renderizarFaturamentoSelecionado() {

    const select =
        document.getElementById(
            "mesFaturamento"
        );


    if (!select) return;


    const mes =
        select.value ||
        mesAtual();


    const concluidos =
        obterConcluidosDoMes(
            mes
        );


    const total =
        concluidos.reduce(
            (
                soma,
                atendimento
            ) =>
                soma +
                Number(
                    atendimento.preco ||
                    0
                ),
            0
        );


    const quantidade =
        concluidos.length;


    const ticket =
        quantidade > 0
            ? total / quantidade
            : 0;


    document.getElementById(
        "faturamentoTotal"
    ).textContent =
        formatarMoeda(total);


    document.getElementById(
        "atendimentosConcluidos"
    ).textContent =
        quantidade;


    document.getElementById(
        "ticketMedio"
    ).textContent =
        formatarMoeda(ticket);


    renderizarHistoricoMensal();


    renderizarFaturamentoServicos(
        mes
    );

}


function renderizarHistoricoMensal() {

    const container =
        document.getElementById(
            "historicoMensal"
        );


    if (!container) return;


    const meses =
        obterMesesComDados();


    container.innerHTML =
        meses
            .map(
                mes => {

                    const valor =
                        calcularFaturamentoDoMes(
                            mes
                        );


                    return `
                        <div class="history-row">

                            <span class="history-month">
                                ${nomeMes(mes)}
                            </span>

                            <span class="history-value">
                                ${formatarMoeda(
                                    valor
                                )}
                            </span>

                            <button
                                class="history-button"
                                onclick="selecionarMesFaturamento('${mes}')"
                            >
                                Ver mês
                            </button>

                        </div>
                    `;

                }
            )
            .join("");

}


function selecionarMesFaturamento(
    mes
) {

    const select =
        document.getElementById(
            "mesFaturamento"
        );


    select.value =
        mes;


    renderizarFaturamentoSelecionado();

}


function renderizarFaturamentoServicos(
    mes
) {

    const container =
        document.getElementById(
            "faturamentoServicos"
        );


    if (!container) return;


    const concluidos =
        obterConcluidosDoMes(
            mes
        );


    const faturamentoPorServico =
        {};


    concluidos.forEach(
        atendimento => {

            const servicosAtendimento =
                obterServicosComPrecos(
                    atendimento
                );


            servicosAtendimento.forEach(
                item => {

                    const id =
                        item.servico.id;


                    if (
                        !faturamentoPorServico[
                            id
                        ]
                    ) {

                        faturamentoPorServico[
                            id
                        ] = {

                            nome:
                                item.servico.nome,

                            valor:
                                0,

                            quantidade:
                                0

                        };

                    }


                    faturamentoPorServico[
                        id
                    ].valor +=
                        Number(
                            item.preco
                        );


                    faturamentoPorServico[
                        id
                    ].quantidade +=
                        1;

                }
            );

        }
    );


    const lista =
        Object.values(
            faturamentoPorServico
        )
        .sort(
            (a, b) =>
                b.valor -
                a.valor
        );


    if (lista.length === 0) {

        container.innerHTML =
            `
            <div class="empty-state">

                <strong>
                    Nenhum faturamento
                </strong>

                Ainda não existem atendimentos concluídos neste mês.

            </div>
            `;

        return;

    }


    container.innerHTML =
        lista
            .map(
                item =>
                    `
                    <div class="service-finance-item">

                        <div>

                            <strong>
                                ${escaparHTML(
                                    item.nome
                                )}
                            </strong>

                            <div style="
                                color: var(--texto-suave);
                                font-size: 10px;
                                margin-top: 4px;
                            ">
                                ${item.quantidade}
                                ${
                                    item.quantidade === 1
                                        ? "atendimento"
                                        : "atendimentos"
                                }
                            </div>

                        </div>

                        <span>
                            ${formatarMoeda(
                                item.valor
                            )}
                        </span>

                    </div>
                    `
            )
            .join("");

}


function atualizarFinanceiro() {

    preencherMesesFaturamento();

    renderizarFaturamentoSelecionado();

}


/* =========================================================
   INÍCIO / DASHBOARD
   ========================================================= */

function atualizarDashboard() {

    const hoje =
        dataHojeISO();


    const mes =
        mesAtual();


    const hojeQuantidade =
        atendimentos.filter(
            atendimento =>
                atendimento.data ===
                    hoje &&
                atendimento.status !==
                    "cancelado"
        ).length;


    const faturamento =
        calcularFaturamentoDoMes(
            mes
        );


    document.getElementById(
        "agendaHoje"
    ).textContent =
        hojeQuantidade;


    document.getElementById(
        "faturamentoInicio"
    ).textContent =
        formatarMoeda(
            faturamento
        );


    document.getElementById(
        "clientesInicio"
    ).textContent =
        clientes.length;

}


/* =========================================================
   ATUALIZAR TUDO
   ========================================================= */

function atualizarTudo() {

    preencherSelects();

    renderizarAgenda();

    renderizarProximosAtendimentos();

    renderizarClientes();

    renderizarServicos();

    atualizarDashboard();

    atualizarFinanceiro();

}


/* =========================================================
   TOAST
   ========================================================= */

let toastTimeout;


function mostrarToast(
    mensagem
) {

    const toast =
        document.getElementById(
            "toast"
        );


    toast.textContent =
        mensagem;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimeout
    );


    toastTimeout =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2800
        );

}


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const data =
            document.getElementById(
                "dataAgendamento"
            );


        if (data) {

            data.value =
                dataHojeISO();

        }


        atualizarTudo();

    }
);