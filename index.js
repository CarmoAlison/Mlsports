const API_URL = 'https://api.sheetbest.com/sheets/6532244a-29bb-425d-9261-70eb7df9c072';

let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

// Função para exibir produtos
function displayProducts() {
    fetch(API_URL)
        .then(response => {
            if (!response.ok) throw new Error('Erro ao buscar os produtos.');
            return response.json();
        })
        .then(produtos => {
            console.log(produtos); // Verificar os dados retornados pela API

            const cardsContainer = document.getElementById("cards-container");
            cardsContainer.innerHTML = "";

            // Verificar se os dados são um array e se há pelo menos um produto
            if (Array.isArray(produtos) && produtos.length > 0) {
                produtos.forEach(item => {
                    console.log(item); // Exibir cada produto para depuração

                    if (item.imagem && item.nome && item.descricao && item.preco) {
                        const card = document.createElement("div");
                        card.className = "card";
                        card.innerHTML = `
                            <img src="${item.imagem}" alt="${item.nome}">
                            <h2>${item.nome}</h2>
                            <div class="precos">
                                <p><strong>Preço:</strong> R$ ${parseFloat(item.preco).toFixed(2)}</p>
                                <button class="add-to-cart" data-nome="${item.nome}" 
                                        data-preco="${item.preco}" data-imagem="${item.imagem}">
                                        <img src="imagens/cart.png" alt="Adicionar ao carrinho" id="adicionar-carrinho">
                                </button>
                            </div>
                        `;
                        cardsContainer.appendChild(card);
                    }
                });
            } else {
                console.error("Nenhum produto encontrado ou formato de dados inválido.");
            }

            // Corrigir o evento de clique para garantir que o botão seja o alvo
            document.querySelectorAll('.add-to-cart').forEach(button => {
                button.addEventListener('click', event => {
                    const nome = event.target.closest('button').dataset.nome;
                    const preco = parseFloat(event.target.closest('button').dataset.preco);
                    const imagem = event.target.closest('button').dataset.imagem;
                    addToCart(nome, preco, imagem);
                });
            });
        })
        .catch(error => console.error('Erro ao carregar os produtos:', error));
}

// Adicionar produto ao carrinho
function addToCart(nome, preco, imagem) {
    const itemExistente = carrinho.find(item => item.nome === nome);

    if (itemExistente) {
        itemExistente.quantidade += 1;
    } else {
        carrinho.push({ nome, preco, imagem, quantidade: 1 });
    }

    updateCart();
    updateCartCount();
    saveCartToLocalStorage();  // Salvar no localStorage
}

// Atualizar número de itens no botão do carrinho
function updateCartCount() {
    const cartButton = document.getElementById('carrinho');
    const totalItems = carrinho.reduce((sum, item) => sum + item.quantidade, 0);
    cartButton.innerHTML = `
        <img src="imagens/cart.png" alt="Carrinho">
        <span id="cart-count">${totalItems}</span>
    `;
}

// Atualizar carrinho no modal
function updateCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');

    cartItems.innerHTML = '';
    let total = 0;

    carrinho.forEach(item => {
        total += item.preco * item.quantidade;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-items">
            <img src="${item.imagem}" alt="${item.nome}">
            <p>${item.nome} - R$ ${item.preco.toFixed(2)} (x${item.quantidade})</p>
            <div class="cart-buttons">
                <button class="decrease" data-nome="${item.nome}">-</button>
                <button class="increase" data-nome="${item.nome}">+</button>
            </div>
            </div>
            <hr/>
        `;
        
        cartItems.appendChild(cartItem);
    });

    cartTotal.innerText = `Total: R$ ${total.toFixed(2)}`;

    document.querySelectorAll('.decrease').forEach(button => {
        button.addEventListener('click', event => {
            const nome = event.target.dataset.nome;
            changeQuantity(nome, -1);
        });
    });

    document.querySelectorAll('.increase').forEach(button => {
        button.addEventListener('click', event => {
            const nome = event.target.dataset.nome;
            changeQuantity(nome, 1);
        });
    });
}

// Alterar quantidade no carrinho
function changeQuantity(nome, delta) {
    const item = carrinho.find(i => i.nome === nome);
    if (item) {
        item.quantidade += delta;
        if (item.quantidade <= 0) carrinho = carrinho.filter(i => i.nome !== nome);
    }
    updateCart();
    updateCartCount();
    saveCartToLocalStorage();  // Salvar no localStorage
}

// Salvar carrinho no localStorage
function saveCartToLocalStorage() {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
}

// Controle do modal
const cartModal = document.getElementById('cart-modal');
const cartButton = document.getElementById('carrinho');
const closeModal = document.querySelector('.close-modal');

cartButton.addEventListener('click', () => {
    cartModal.style.display = 'block';
});

closeModal.addEventListener('click', () => {
    cartModal.style.display = 'none';
});

window.onclick = event => {
    if (event.target === cartModal) cartModal.style.display = 'none';
};

// Função para finalizar compra e enviar para WhatsApp
function finalizarCompra() {
    if (carrinho.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }

    const telefone = '+5584996002433'; // Número do WhatsApp para o qual enviar
    let mensagem = `Olá, gostaria de finalizar a compra com os seguintes itens:\n\n`;

    let total = 0;

    carrinho.forEach(item => {
        mensagem += `- ${item.nome} (x${item.quantidade}): R$ ${(item.preco * item.quantidade).toFixed(2)}\n`;
        total += item.preco * item.quantidade;
    });

    mensagem += `\nTotal: R$ ${total.toFixed(2)}\n\nObrigado!`;

    // Codificar a mensagem para URL
    const mensagemEncoded = encodeURIComponent(mensagem);

    // Gerar o link do WhatsApp
    const whatsappURL = `https://api.whatsapp.com/send?phone=${telefone}&text=${mensagemEncoded}`;

    // Redirecionar para o WhatsApp
    window.open(whatsappURL, '_blank');
}

// Adicionar evento ao botão de finalizar compra
document.getElementById('finalizar-compra').addEventListener('click', finalizarCompra);

// Carregar os produtos na inicialização
window.onload = () => {
    displayProducts();
    updateCart();  // Atualizar carrinho ao carregar a página
    updateCartCount();  // Atualizar contador do carrinho ao carregar a página
};
