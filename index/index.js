// URL da API gerada pelo Sheet.best
const API_URL = 'https://api.sheetbest.com/sheets/6532244a-29bb-425d-9261-70eb7df9c072';

// Função para carregar os produtos da planilha
function displayProducts() {
    fetch(API_URL)
        .then(response => {
            // Verifica se a resposta foi bem-sucedida
            if (!response.ok) {
                throw new Error('Erro ao buscar os produtos.');
            }
            return response.json();
        })
        .then(produtos => {
            // Log da resposta para verificar a estrutura dos dados
            console.log(produtos);

            // Verifica se os produtos são um array
            if (Array.isArray(produtos)) {
                const cardsContainer = document.getElementById("cards-container");
                cardsContainer.innerHTML = "";  // Limpa o container de cards

                produtos.forEach(item => {
                    // Verifica se o item possui as propriedades necessárias
                    if (item.imagem && item.nome && item.descricao && item.preco && item.tipo) {
                        const card = document.createElement("div");
                        card.className = "card";
                        card.innerHTML = `
                            <img src="${item.imagem}" alt="${item.nome}" id="foto-card">
                            <h2>${item.nome}</h2>
                            <div class="precos">
                            <p><strong>Preço:</strong> R$ ${parseFloat(item.preco).toFixed(2)}</p>
                            <img src="/Imagens/carrinho.jpg" id="carrinho">
                            </div>
                        `;
                        cardsContainer.appendChild(card);
                    } else {
                        console.warn('Item de produto faltando dados:', item);
                    }
                });
            } else {
                console.error('A resposta da API não é um array. Verifique os dados.');
            }
        })
        .catch(error => {
            console.error('Erro ao carregar os produtos:', error);
        });
}

// Função para adicionar um novo produto
function addProduct(id, imagem, nome, descricao, preco, tipo) {
    // Verifique se a URL da imagem é válida
    if (!isValidImageURL(imagem)) {
        console.error('URL de imagem inválida');
        return;
    }

    const produto = { id, imagem, nome, descricao, preco, tipo };

    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(produto)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Produto adicionado', data);
        displayProducts();  // Atualiza a exibição dos produtos
    })
    .catch(error => console.error('Erro ao adicionar produto:', error));
}

// Função para validar a URL da imagem
function isValidImageURL(url) {
    const pattern = /\.(jpg|jpeg|png|gif|bmp|webb)$/i;
    return pattern.test(url);
}

// Carrega os produtos ao inicializar a página
window.onload = displayProducts;
