// Este arquivo roda no Navegador (Cliente)
// Ele não fala com o NEON: chama as rotas /api do nosso server.js

const lista = document.getElementById('lista-categorias')
const formulario = document.getElementById('form-categoria')
const campoDescricao = document.getElementById('descricao')
const mensagem = document.getElementById('mensagem')

let categorias = []
let idEmEdicao = null

function mostrarMensagem(texto, tipo = 'sucesso') {
    mensagem.textContent = texto
    mensagem.className = `mensagem mensagem-${tipo}`
}

async function carregarCategorias() {
    lista.innerHTML = '<li class="lista-vazia">Carregando....</li>'
    try {
        const resposta = await fetch('/api/categorias')
        const dados = await resposta.json()

        if (!resposta.ok) throw new Error(dados.erro)
        categorias = dados
        renderizarLista()
    } catch (erro) {
        lista.innerHTML = ''
        mostrarMensagem(`Erro: ${erro.message}`, 'erro')
    }
}

function renderizarLista() {
    lista.innerHTML = ''
    if (categorias.length === 0) {
        lista.innerHTML = '<li class="lista-vazia">Nenhuma categoria cadastrada!</li>'
        return
    }
    for (const categoria of categorias) {
        lista.appendChild(
            categoria.id_categoria === idEmEdicao
                ? criarItemEdicao(categoria)
                : criarItemVisualizacao(categoria)
        )
    }
    // o foco só funciona depois que o input já está na página
    const inputEdicao = lista.querySelector('.input-edicao')
    if (inputEdicao) {
        inputEdicao.focus()
        inputEdicao.setSelectionRange(inputEdicao.value.length, inputEdicao.value.length)
    }
}

function criarItemVisualizacao(categoria) {
    const item = document.createElement('li')
    item.className = 'categoria-item'

    const info = document.createElement('span')
    info.className = 'categoria-info'

    const id = document.createElement('span')
    id.className = 'categoria-id'
    id.textContent = `#${categoria.id_categoria}`

    // textContent (e não innerHTML) evita que um texto com HTML quebre a página
    info.append(id, ` ${categoria.descricao}`)

    const btnEditar = document.createElement('button')
    btnEditar.textContent = 'Editar'
    btnEditar.className = 'btn btn-editar'
    btnEditar.addEventListener('click', () => {
        idEmEdicao = categoria.id_categoria
        renderizarLista()
    })

    const btnExcluir = document.createElement('button')
    btnExcluir.textContent = 'Excluir'
    btnExcluir.className = 'btn btn-excluir'
    btnExcluir.addEventListener('click', () => {
        // pede confirmação para não apagar sem querer
        if (confirm(`Excluir a categoria "${categoria.descricao}"?`)) {
            excluirCategoria(categoria.id_categoria)
        }
    })

    const acoes = document.createElement('div')
    acoes.className = 'categoria-acoes'
    acoes.append(btnEditar, btnExcluir)

    item.append(info, acoes)
    return item
}

function criarItemEdicao(categoria) {
    const item = document.createElement('li')
    item.className = 'categoria-item categoria-item-edicao'

    const input = document.createElement('input')
    input.type = 'text'
    input.className = 'input-edicao'
    input.value = categoria.descricao

    const salvar = () => editarCategoria(categoria.id_categoria, input.value)
    const cancelar = () => {
        idEmEdicao = null
        renderizarLista()
    }

    // Enter salva, Esc cancela
    input.addEventListener('keydown', (evento) => {
        if (evento.key === 'Enter') salvar()
        if (evento.key === 'Escape') cancelar()
    })

    const btnSalvar = document.createElement('button')
    btnSalvar.textContent = 'Salvar'
    btnSalvar.className = 'btn btn-salvar'
    btnSalvar.addEventListener('click', salvar)

    const btnCancelar = document.createElement('button')
    btnCancelar.textContent = 'Cancelar'
    btnCancelar.className = 'btn btn-cancelar'
    btnCancelar.addEventListener('click', cancelar)

    const acoes = document.createElement('div')
    acoes.className = 'categoria-acoes'
    acoes.append(btnSalvar, btnCancelar)

    item.append(input, acoes)
    return item
}

async function editarCategoria(id, novaDescricao) {
    try {
        const resposta = await fetch('/api/editarCategorias', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_categoria: id, descricao: novaDescricao })
        })
        const dados = await resposta.json()

        if (resposta.ok) {
            idEmEdicao = null
            mostrarMensagem(`Categoria "${dados.descricao}" editada!`)
            carregarCategorias()
        } else {
            mostrarMensagem(`Erro: ${dados.erro}`, 'erro')
        }
    } catch (erro) {
        mostrarMensagem(`Erro de conexão: ${erro.message}`, 'erro')
    }
}

async function excluirCategoria(id) {
    try {
        const resposta = await fetch('/api/excluirCategorias', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_categoria: id })
        })
        const dados = await resposta.json()

        if (resposta.ok) {
            idEmEdicao = null
            mostrarMensagem(`Categoria "${dados.descricao}" excluída!`)
            carregarCategorias()
        } else {
            mostrarMensagem(`Erro: ${dados.erro}`, 'erro')
        }
    } catch (erro) {
        mostrarMensagem(`Erro de conexão: ${erro.message}`, 'erro')
    }
}

formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault()
    try {
        const resposta = await fetch('/api/categorias', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ descricao: campoDescricao.value })
        })
        const dados = await resposta.json()

        if (resposta.ok) {
            mostrarMensagem(`Categoria "${dados.descricao}" cadastrada!`)
            campoDescricao.value = ''
            carregarCategorias()
        } else {
            mostrarMensagem(`Erro: ${dados.erro}`, 'erro')
        }
    } catch (erro) {
        mostrarMensagem(`Erro de conexão: ${erro.message}`, 'erro')
    }
})

carregarCategorias()

// --- PRODUTOS ---

// const listaProdutos = document.getElementById('lista-produtos')
// const formularioProduto = document.getElementById('form-produto')
// const tituloProduto = document.getElementById('titulo-produto')
// const campoProdutoId = document.getElementById('produto-id')
// const campoProdutoNome = document.getElementById('nome')
// const campoProdutoDescricao = document.getElementById('produto-descricao')
// const campoProdutoPreco = document.getElementById('produto-preco')
// const campoProdutoCategoria = document.getElementById('produto-categoria')
// const mensagemProduto = document.getElementById('mensagem-produto')
// const btnProduto = document.getElementById('btn-produto')
// const btnCancelarProduto = document.getElementById('btn-cancelar-produto')

// async function carregarCategoriasNoSelect() {
//     try {
//         const resposta = await fetch('/api/categorias')
//         const categorias = await resposta.json()
//         if (!resposta.ok) return

//         const selecionada = campoProdutoCategoria.value
//         campoProdutoCategoria.replaceChildren()

//         const padrao = document.createElement('option')
//         padrao.value = ''
//         padrao.textContent = 'Selecione a categoria'
//         campoProdutoCategoria.appendChild(padrao)

//         for (const categoria of categorias) {
//             const opcao = document.createElement('option')
//             opcao.value = categoria.id_categoria
//             opcao.textContent = categoria.descricao
//             campoProdutoCategoria.appendChild(opcao)
//         }
//         campoProdutoCategoria.value = selecionada
//     } catch {
//         // sem rede: o select fica só com a opção padrão
//     }
// }

// async function carregarProdutos() {
//     listaProdutos.replaceChildren(itemVazio('Carregando...'))
//     try {
//         const resposta = await fetch('/api/produtos')
//         const produtos = await resposta.json()
//         if (!resposta.ok) throw new Error(produtos.erro)

//         listaProdutos.replaceChildren()
//         for (const produto of produtos) {
//             const item = document.createElement('li')

//             const texto = document.createElement('span')
//             texto.textContent = `#${produto.id_produto} - ${produto.descricao} - R$ ${Number(produto.preco).toFixed(2)} (${produto.categoria ?? 'sem categoria'})`

//             const botaoEditar = document.createElement('button')
//             botaoEditar.type = 'button'
//             botaoEditar.className = 'secundario pequeno'
//             botaoEditar.textContent = 'Editar'
//             botaoEditar.addEventListener('click', () => entrarModoEdicao(produto))

//             item.append(texto, botaoEditar)
//             listaProdutos.appendChild(item)
//         }
//         if (produtos.length === 0) listaProdutos.replaceChildren(itemVazio('Nenhum produto cadastrado.'))
//     } catch (erro) {
//         listaProdutos.replaceChildren(itemVazio(`Erro: ${erro.message}`))
//     }
// }

// function entrarModoEdicao(produto) {
//     campoProdutoId.value = produto.id_produto
//     campoProdutoNome.value = produto.nome
//     campoProdutoDescricao.value = produto.descricao
//     campoProdutoPreco.value = produto.preco
//     campoProdutoCategoria.value = produto.id_categoria ?? ''
//     tituloProduto.textContent = `Editar produto #${produto.id_produto}`
//     btnProduto.textContent = 'Salvar'
//     btnCancelarProduto.hidden = false
//     mostrarMensagem(mensagemProduto, '')
//     formularioProduto.scrollIntoView({ behavior: 'smooth', block: 'center' })
//     campoProdutoDescricao.focus()
// }

// function sairModoEdicao() {
//     campoProdutoId.value = ''
//     formularioProduto.reset()
//     tituloProduto.textContent = 'Novo produto'
//     btnProduto.textContent = 'Cadastrar'
//     btnCancelarProduto.hidden = true
// }

// btnCancelarProduto.addEventListener('click', sairModoEdicao)

// formularioProduto.addEventListener('submit', async (evento) => {
//     evento.preventDefault()

//     const id = campoProdutoId.value
//     const corpo = {
//         nome: campoProdutoNome.value,
//         descricao: campoProdutoDescricao.value,
//         preco: Number(campoProdutoPreco.value),
//         id_categoria: campoProdutoCategoria.value || null
//     }

//     const url = id ? `/api/produtos/${id}` : '/api/produtos'
//     const metodo = id ? 'PUT' : 'POST'

//     try {
//         const resposta = await fetch(url, {
//             method: metodo,
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(corpo)
//         })
//         const dados = await resposta.json()

//         if (resposta.ok) {
//             mostrarMensagem(
//                 mensagemProduto,
//                 id ? `Produto "${dados.descricao}" atualizado!` : `Produto "${dados.descricao}" cadastrado!`
//             )
//             sairModoEdicao()
//             carregarProdutos()
//         } else {
//             mostrarMensagem(mensagemProduto, `Erro: ${dados.erro}`, true)
//         }
//     } catch {
//         mostrarMensagem(mensagemProduto, 'Erro: não foi possível falar com o servidor.', true)
//     }
// })

// carregarCategoriasNoSelect()
// carregarProdutos()
