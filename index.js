// Seleção do nosso elemento HTML em nosso arquivo JS
const canvas = document.querySelector("canvas");

// Seleção do contexto do canvas, nos permitindo usar suas funções de desenho ("2d" porque será um jogo 2D)
const contexto = canvas.getContext("2d");

// Seleção do nosso elemento da pontuação e do status da partida, para alteração futura
const pontuacaoEl = document.querySelector("#pontuacaoEl");
const statusEl = document.getElementById("statusEl");

// Setando a altura/largura do canvas para ser a mesma que a da tela
canvas.width = innerWidth;
canvas.height = innerHeight;

// A barreira fica com uma cor aleatória a cada partida
const corBarreira = `#${Math.floor(Math.random() * 16777215).toString(16)}`;

// CLASSES =================================================================

class Barreira {
  // Altura e largura serão estáticas, pois todas as barreiras terão o mesmo formato, a única mudança entre elas será a sua posição (x ,y)
  static largura = 40;
  static altura = 40;

  // A classe está associada a um construtor pois cada barreira terá sua posição específica
  constructor({ posicao }) {
    this.posicao = posicao;
    this.largura = 40;
    this.altura = 40;
  }

  // Função que determina como a barreira vai ser desenhada
  desenhar() {
    // Setando a cor da barreira
    contexto.fillStyle = corBarreira;

    // Função do canvas usada para desenhar um retângulo, passando as propriedades de posição, largua e altura
    contexto.fillRect(
      this.posicao.x,
      this.posicao.y,
      this.largura,
      this.altura
    );
  }
}

class Jogador {
  // A classe está associada a um construtor pois o jogador terá sua posição e velocidade de acordo com seu movimento
  constructor({ posicao, velocidade }) {
    this.posicao = posicao;
    this.velocidade = velocidade;
    this.raio = 15;
    this.rapidez = 4;
    this.radians = 0.75;
    this.openRate = 0.12;
    this.rotacao = 0;
  }

  // Função que determina como o jogador vai ser desenhado
  desenhar() {
    contexto.save();
    contexto.translate(this.posicao.x, this.posicao.y);
    contexto.rotate(this.rotacao);
    contexto.translate(-this.posicao.x, -this.posicao.y);
    // Função do canvas usada para iniciar uma linha
    contexto.beginPath();
    // Função do canvas para criar um arco, com as propriedades de posição, raio, ângulo final e inicial
    contexto.arc(
      this.posicao.x,
      this.posicao.y,
      this.raio,
      this.radians,
      //Conta realizada para criar um círculo completo
      Math.PI * 2 - this.radians
    );
    contexto.lineTo(this.posicao.x, this.posicao.y);
    contexto.fillStyle = "yellow";
    // Função para preencher o arco
    contexto.fill();
    // Função do canvas usada para terminar uma linha
    contexto.closePath();

    contexto.restore();
  }

  movimentar() {
    this.desenhar();
    // A posição do jogador se baseia na sua velocidade a cada frame da animação
    this.posicao.x += this.velocidade.x;
    this.posicao.y += this.velocidade.y;

    // if (this.radians < 0 || this.radians > 0.75) {
    //   this.openRate = -this.openRate;
    // }

    // this.radians += this.openRate;
  }
}

class Fantasma {
  static rapidez = 2;
  // A classe está associada a um construtor pois o fantasma terá sua posição e velocidade de acordo, assim como uma cor aleatória
  constructor({ posicao, velocidade, cor }) {
    this.posicao = posicao;
    this.velocidade = velocidade;
    this.raio = 15;
    this.cor = cor;
    this.colisoesAnteriores = [];
    this.rapidez = 2;
    this.assustado = false;
  }

  // Função que determina como o fantasma vai ser desenhado
  desenhar() {
    // Função para desenhar um círculo semelhante ao o que foi feito para o jogador, mas com a condição da propriedade assustado, onde o fantasma fica azul enquanto está assustado
    contexto.beginPath();
    contexto.arc(this.posicao.x, this.posicao.y, this.raio, 0, Math.PI * 2);
    contexto.fillStyle = this.assustado ? "blue" : this.cor;
    contexto.fill();
    contexto.closePath();
  }

  movimentar() {
    this.desenhar();
    // A posição do fantasma se baseia na sua velocidade a cada frame da animação
    this.posicao.x += this.velocidade.x;
    this.posicao.y += this.velocidade.y;
  }
}

class Ponto {
  // A classe está associada a um construtor pois cada barreira terá sua posição específica
  constructor({ posicao }) {
    this.posicao = posicao;
    this.raio = 3;
  }

  // Função que determina como o ponto vai ser desenhado
  desenhar() {
    // Função para desenhar um círculo semelhante ao o que foi feito para o jogador
    contexto.beginPath();
    contexto.arc(this.posicao.x, this.posicao.y, this.raio, 0, Math.PI * 2);
    contexto.fillStyle = "white";
    contexto.fill();
    contexto.closePath();
  }
}

class PowerUp {
  // A classe está associada a um construtor pois cada barreira terá sua posição específica
  constructor({ posicao }) {
    this.posicao = posicao;
    this.raio = 9;
  }

  // Função que determina como o powerup vai ser desenhado
  desenhar() {
    // Função para desenhar um círculo semelhante ao o que foi feito para o jogador
    contexto.beginPath();
    contexto.arc(this.posicao.x, this.posicao.y, this.raio, 0, Math.PI * 2);
    contexto.fillStyle = "white";
    contexto.fill();
    contexto.closePath();
  }
}

// CONSTS =================================================================

// Objeto para ajudar a determinar quais teclas estão sendo pressionadas
const teclas = {
  w: {
    pressionado: false,
  },
  a: {
    pressionado: false,
  },
  s: {
    pressionado: false,
  },
  d: {
    pressionado: false,
  },
};

const barreiras = [];

const powerUps = [];

const pontos = [];

const fantasmas = [];

const jogador = new Jogador({
  // Criando um jogador na primeira posição do labirinto, no centro da posição (por isso, largura/altura dividido por 2)
  posicao: {
    x: Barreira.largura + Barreira.largura / 2,
    y: Barreira.altura + Barreira.altura / 2,
  },
  velocidade: { x: 0, y: 0 },
});

// Criando 3 fantasmas no centro do mapa, no centro de sua posição e com cores aleatórias
for (let i = 2; 0 <= i; i--) {
  fantasmas.push(
    new Fantasma({
      posicao: {
        x: Barreira.largura * 7 + Barreira.largura / 2,
        y: Barreira.altura * 6 + Barreira.altura / 2,
      },
      velocidade: {
        x: Fantasma.rapidez,
        y: 0,
      },
      cor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    })
  );
}

// É preciso determinar qual foi a última tecla pressionada, porque sem essa validação, se apertarmos W, e enquanto a tecla estiver pressionada, apertarmos a tecla A, o jogador vai continuar se movendo para cima
let ultimaTeclaPressionada = "";

let pontuacao = 0;

const mapa = [
  ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
  ["-", " ", ".", ".", "-", "-", ".", ".", ".", "-", "-", ".", ".", ".", "-"],
  ["-", ".", "-", ".", ".", ".", ".", "-", ".", ".", ".", ".", "-", ".", "-"],
  ["-", ".", "-", ".", "-", "-", ".", ".", ".", "-", "-", ".", "-", ".", "-"],
  ["-", ".", "-", ".", "-", ".", ".", "-", ".", ".", "-", ".", "-", ".", "-"],
  ["-", ".", ".", ".", ".", ".", "-", "-", "-", ".", ".", ".", ".", ".", "-"],
  ["-", "-", ".", "-", "-", ".", ".", "p", ".", ".", "-", "-", ".", "-", "-"],
  ["-", ".", ".", ".", ".", ".", "-", "-", "-", ".", ".", ".", ".", ".", "-"],
  ["-", ".", "-", ".", "-", ".", ".", "-", ".", ".", "-", ".", "-", ".", "-"],
  ["-", ".", "-", ".", "-", "-", ".", ".", ".", "-", "-", ".", "-", ".", "-"],
  ["-", ".", "-", ".", ".", ".", ".", "-", ".", ".", ".", ".", "-", ".", "-"],
  ["-", ".", ".", ".", "-", "-", ".", ".", ".", "-", "-", ".", ".", ".", "-"],
  ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
];

// FUNÇÕES =================================================================

// Para cada 'linha' no array 'mapa'...
mapa.forEach((linha, i) => {
  // Para cada caractere na linha...
  linha.forEach((caractere, j) => {
    switch (caractere) {
      // Caso o caractere seja '-', uma barreira será criada nessa posição
      case "-":
        // Função para adicionar uma barreira ao array de barreiras
        barreiras.push(
          new Barreira({
            posicao: {
              // Multiplicação da altura/largura da barreira (estaticamente 40) pela posição da linha/caractere, para ser criada corretamente na sua posição
              x: Barreira.largura * j,
              y: Barreira.altura * i,
            },
          })
        );
        break;

      // Caso o caractere seja '.', um ponto será criada nessa posição
      case ".":
        // Função para adicionar um ponto ao array de pontos
        pontos.push(
          new Ponto({
            // Multiplicação da altura/largura da barreira (estaticamente 40) pela posição da linha/caractere, somado com a divisão da altura/largura da barreira por 2, para ser criado um ponto no centro de sua posição
            posicao: {
              x: j * Barreira.largura + Barreira.largura / 2,
              y: i * Barreira.altura + Barreira.altura / 2,
            },
          })
        );
        break;

      // Caso o caractere seja 'p', um powerup será criada nessa posição
      case "p":
        // Função para adicionar um powerup ao array de powerups
        powerUps.push(
          new PowerUp({
            // Multiplicação da altura/largura da barreira (estaticamente 40) pela posição da linha/caractere, somado com a divisão da altura/largura da barreira por 2, para ser criado um powerup no centro de sua posição
            posicao: {
              x: j * Barreira.largura + Barreira.largura / 2,
              y: i * Barreira.altura + Barreira.altura / 2,
            },
          })
        );
        break;
    }
  });
});

// Função de colisão para as entidades (jogador/fantasmas)
function colisao({ entidade, barreira }) {
  const padding = Barreira.largura / 2 - entidade.raio - 1;
  return (
    // A velocidade do jogador é levada em consideração para parar o jogador pouco antes de colidir

    // Se o topo do jogador (posição y menos o raio) for menor ou igual que a parte debaixo da barreira (posição y mais a altura, considerando o padding), existe colisão
    entidade.posicao.y - entidade.raio + entidade.velocidade.y <=
      barreira.posicao.y + barreira.altura + padding &&
    // Sea  parte direita do jogador (posição y mais o raio) for maior ou igual que a parte esquerda da barreira (posição x, considerando o padding), existe colisão
    entidade.posicao.x + entidade.raio + entidade.velocidade.x >=
      barreira.posicao.x - padding &&
    // Se a parte debaixo do jogador (posição y mais o raio) for maior ou igual que o topo da barreira (posição y, considerando o padding), existe colisão
    entidade.posicao.y + entidade.raio + entidade.velocidade.y >=
      barreira.posicao.y - padding &&
    // Se a parte esquerda do jogador (posição x menos o raio) for menor ou igual à parte direita da barreira (posição x mais a largura, considerando o padding), existe colisão
    entidade.posicao.x - entidade.raio + entidade.velocidade.x <=
      barreira.posicao.x + barreira.largura + padding
  );
}

let animacaoId;

// Função de um loop de animação
function animar() {
  // A cada frame completo, a função 'animar' será chamada novamente
  animacaoId = requestAnimationFrame(animar);
  // Função de limpar o canvas
  contexto.clearRect(0, 0, canvas.width, canvas.height);
  // Animar o jogador de acordo com a tecla que está sendo pressinada/última tecla pressionada
  if (teclas.w.pressionado && ultimaTeclaPressionada === "w") {
    // Utilizando for ao invés de forEach para poder usar o 'break'
    for (const element of barreiras) {
      const barreira = element;
      if (
        colisao({
          entidade: {
            ...jogador,
            velocidade: {
              x: 0,
              y: -jogador.rapidez,
            },
          },
          barreira: barreira,
        })
      ) {
        // Caso exista colisão, o jogador deve parar de ir para cima
        jogador.velocidade.y = 0;
        break;
      } else {
        // Caso exista colisão, o jogador deve ir para cima
        jogador.velocidade.y = -jogador.rapidez;
      }
    }
  } else if (teclas.a.pressionado && ultimaTeclaPressionada === "a") {
    for (const element of barreiras) {
      const barreira = element;
      if (
        colisao({
          entidade: {
            ...jogador,
            velocidade: {
              x: -jogador.rapidez,
              y: 0,
            },
          },
          barreira: barreira,
        })
      ) {
        // Caso exista colisão, o jogador deve parar de ir para a esquerda
        jogador.velocidade.x = 0;
        break;
      } else {
        // Caso não exista colisão, o jogador deve ir para a esquerda
        jogador.velocidade.x = -jogador.rapidez;
      }
    }
  } else if (teclas.s.pressionado && ultimaTeclaPressionada === "s") {
    for (const element of barreiras) {
      const barreira = element;
      if (
        colisao({
          entidade: {
            ...jogador,
            velocidade: {
              x: 0,
              y: jogador.rapidez,
            },
          },
          barreira: barreira,
        })
      ) {
        // Caso exista colisão, o jogador deve parar de ir para baixo
        jogador.velocidade.y = 0;
        break;
      } else {
        // Caso não exista colisão, o jogador deve ir para baixo
        jogador.velocidade.y = jogador.rapidez;
      }
    }
  } else if (teclas.d.pressionado && ultimaTeclaPressionada === "d") {
    for (const element of barreiras) {
      const barreira = element;
      if (
        colisao({
          entidade: {
            ...jogador,
            velocidade: {
              x: jogador.rapidez,
              y: 0,
            },
          },
          barreira: barreira,
        })
      ) {
        // Caso exista colisão, o jogador deve parar de ir para a direita
        jogador.velocidade.x = 0;
        break;
      } else {
        // Caso não exista colisão, o jogador deve ir para a direita
        jogador.velocidade.x = jogador.rapidez;
      }
    }
  }

  // Para cada fantasma criado...
  for (let i = fantasmas.length - 1; 0 <= i; i--) {
    const fantasma = fantasmas[i];
    if (
      Math.hypot(
        fantasma.posicao.x - jogador.posicao.x,
        fantasma.posicao.y - jogador.posicao.y
      ) <
      fantasma.raio + jogador.raio
    ) {
      if (fantasma.assustado) {
        // Se o jogador colidir com o fantasma e ele estiver assustado, o mesmo será removido, um novo fantasma surgirá em 5 segundos
        fantasmas.splice(i, 1);
        setTimeout(() => {
          fantasmas.push(
            new Fantasma({
              posicao: {
                x: Barreira.largura * 7 + Barreira.largura / 2,
                y: Barreira.altura * 6 + Barreira.altura / 2,
              },
              velocidade: {
                x: Fantasma.rapidez,
                y: 0,
              },
              cor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
            })
          );
        }, 5000);
      } else {
        // Se o jogador colidir com o fantasma e ele não estiver assustado, a animação será cancelada, e uma mensagem escrita 'VOCÊ PERDEU' será mostrada na tela
        cancelAnimationFrame(animacaoId);
        statusEl.innerHTML = "VOCÊ PERDEU";
        statusEl.style.color = "red";
      }
    }
  }

  // Para cada powerup desenhado no mapa...
  for (let i = powerUps.length - 1; 0 <= i; i--) {
    const powerUp = powerUps[i];
    powerUp.desenhar();

    // Se o jogador colidir com o powerup, o mesmo será removido, e os fantasmas ficaram assustados por 5 segundos
    if (
      Math.hypot(
        powerUp.posicao.x - jogador.posicao.x,
        powerUp.posicao.y - jogador.posicao.y
      ) <
      powerUp.raio + jogador.raio
    ) {
      powerUps.splice(i, 1);

      fantasmas.forEach((fantasma) => {
        fantasma.assustado = true;

        setTimeout(() => {
          fantasma.assustado = false;
        }, 5000);
      });
    }
  }

  // Para cada ponto desenhado no mapa...
  for (let i = pontos.length - 1; 0 <= i; i--) {
    const ponto = pontos[i];
    ponto.desenhar();

    // Se o jogador colidir com o ponto, o mesmo será removido
    if (
      Math.hypot(
        ponto.posicao.x - jogador.posicao.x,
        ponto.posicao.y - jogador.posicao.y
      ) <
      ponto.raio + jogador.raio
    ) {
      pontuacao += 10;
      pontuacaoEl.innerHTML = pontuacao;
      pontos.splice(i, 1);
    }
  }

  if (pontos.length === 0) {
    // Se não existe mais pontos no mapa, a animação será cancelada, e uma mensagem escrita 'VOCÊ VENCEU' será mostrada na tela
    cancelAnimationFrame(animacaoId);
    statusEl.innerHTML = "VOCÊ VENCEU";
    statusEl.style.color = "green";
  }

  barreiras.forEach((barreira) => {
    barreira.desenhar();

    if (colisao({ entidade: jogador, barreira: barreira })) {
      jogador.velocidade.x = 0;
      jogador.velocidade.y = 0;
    }
  });

  jogador.movimentar();

  // Para cada fantasma...
  fantasmas.forEach((fantasma) => {
    fantasma.movimentar();

    // Definição de um array para determinar as direções em que o fantasma está colidindo
    const colisoes = [];

    // Para cada barreira...
    barreiras.forEach((barreira) => {
      // Se o array de colisões não possui 'direita' e o fantasma está colidindo com essa barreira pela direita, 'direita' é adicionado ao array de colisões deste fantasma
      if (
        !colisoes.includes("direita") &&
        colisao({
          entidade: {
            ...fantasma,
            velocidade: {
              x: fantasma.rapidez,
              y: 0,
            },
          },
          barreira: barreira,
        })
      ) {
        colisoes.push("direita");
      }

      // Se o array de colisões não possui 'esquerda' e o fantasma está colidindo com essa barreira pela direita, 'esquerda' é adicionado ao array de colisões deste fantasma
      if (
        !colisoes.includes("esquerda") &&
        colisao({
          entidade: {
            ...fantasma,
            velocidade: {
              x: -fantasma.rapidez,
              y: 0,
            },
          },
          barreira: barreira,
        })
      ) {
        colisoes.push("esquerda");
      }

      // Se o array de colisões não possui 'cima' e o fantasma está colidindo com essa barreira pela direita, 'cima' é adicionado ao array de colisões deste fantasma
      if (
        !colisoes.includes("cima") &&
        colisao({
          entidade: {
            ...fantasma,
            velocidade: {
              x: 0,
              y: -fantasma.rapidez,
            },
          },
          barreira: barreira,
        })
      ) {
        colisoes.push("cima");
      }

      // Se o array de colisões não possui 'baixo' e o fantasma está colidindo com essa barreira pela direita, 'baixo' é adicionado ao array de colisões deste fantasma
      if (
        !colisoes.includes("baixo") &&
        colisao({
          entidade: {
            ...fantasma,
            velocidade: {
              x: 0,
              y: fantasma.rapidez,
            },
          },
          barreira: barreira,
        })
      ) {
        colisoes.push("baixo");
      }
    });

    // Condição para apenas setar o valor 'colisoesAnteriores' se realmente existem colisões
    if (colisoes.length > fantasma.colisoesAnteriores.length) {
      fantasma.colisoesAnteriores = colisoes;
    }

    // Se o as colisões atuais forem diferentes das colisões anteriores, a velocidade do fantasma será afetada
    if (
      JSON.stringify(colisoes) !== JSON.stringify(fantasma.colisoesAnteriores)
    ) {
      if (fantasma.velocidade.x > 0) {
        fantasma.colisoesAnteriores.push("direita");
      } else if (fantasma.velocidade.x < 0) {
        fantasma.colisoesAnteriores.push("esquerda");
      } else if (fantasma.velocidade.y < 0) {
        fantasma.colisoesAnteriores.push("cima");
      } else if (fantasma.velocidade.y > 0) {
        fantasma.colisoesAnteriores.push("baixo");
      }

      // Constante que retorna os caminhos possíveis para o fantasma ir, validando se essa colisão que estamos percorrendo existe ou não dentro do array 'colisoes', caso não exista, é um caminho possível
      const caminhosPossivies = fantasma.colisoesAnteriores.filter(
        (colisao) => {
          return !colisoes.includes(colisao);
        }
      );

      // Retorna um caminho aleatório entre os caminhos possíveis
      const direcao =
        caminhosPossivies[Math.floor(Math.random() * caminhosPossivies.length)];

      switch (direcao) {
        case "baixo":
          fantasma.velocidade.y = fantasma.rapidez;
          fantasma.velocidade.x = 0;
          break;
        case "cima":
          fantasma.velocidade.y = -fantasma.rapidez;
          fantasma.velocidade.x = 0;
          break;
        case "direita":
          fantasma.velocidade.y = 0;
          fantasma.velocidade.x = fantasma.rapidez;
          break;
        case "esquerda":
          fantasma.velocidade.y = 0;
          fantasma.velocidade.x = -fantasma.rapidez;
          break;
      }

      fantasma.colisoesAnteriores = [];
    }
  });

  // Cálculo de rotação do jogador, para aonde a boca estará virada
  if (jogador.velocidade.x > 0) {
    jogador.rotacao = 0;
  } else if (jogador.velocidade.x < 0) {
    jogador.rotacao = Math.PI;
  } else if (jogador.velocidade.y > 0) {
    jogador.rotacao = Math.PI / 2;
  } else if (jogador.velocidade.y < 0) {
    jogador.rotacao = Math.PI * 1.5;
  }
}

animar();

// Ao escutar um evento de tecla pressionada, a função será executada
addEventListener("keydown", (event) => {
  switch (event.key) {
    // Caso a tecla 'w' for pressionada
    case "w":
      teclas.w.pressionado = true;
      ultimaTeclaPressionada = "w";
      break;
    // Caso a tecla 'a' for pressionada
    case "a":
      teclas.a.pressionado = true;
      ultimaTeclaPressionada = "a";
      break;
    // Caso a tecla 's' for pressionada
    case "s":
      teclas.s.pressionado = true;
      ultimaTeclaPressionada = "s";
      break;
    // Caso a tecla 'd' for pressionada
    case "d":
      teclas.d.pressionado = true;
      ultimaTeclaPressionada = "d";
      break;
  }
});

// Ao escutar um evento de tecla solta, a função será executada
addEventListener("keyup", (event) => {
  switch (event.key) {
    // Caso a tecla 'w' for pressionada
    case "w":
      teclas.w.pressionado = false;
      break;
    // Caso a tecla 'a' for pressionada
    case "a":
      teclas.a.pressionado = false;
      break;
    // Caso a tecla 's' for pressionada
    case "s":
      teclas.s.pressionado = false;
      break;
    // Caso a tecla 'd' for pressionada
    case "d":
      teclas.d.pressionado = false;
      break;
  }
});
