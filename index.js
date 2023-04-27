// Seleção do nosso elemento HTML em nosso arquivo JS
const canvas = document.querySelector("canvas");

// Seleção do contexto do canvas, nos permitindo usar suas funções de desenho ("2d" porque será um jogo 2D)
const contexto = canvas.getContext("2d");

const pontuacaoEl = document.querySelector("#pontuacaoEl");
const statusEl = document.getElementById("statusEl");

// Setando a altura/largura do canvas para ser a mesma que a da tela
canvas.width = innerWidth;
canvas.height = innerHeight;

const corBarreira = `#${Math.floor(Math.random() * 16777215).toString(16)}`;

// CLASSES =================================================================

class Barreira {
  static largura = 40;
  static altura = 40;
  constructor({ posicao }) {
    this.posicao = posicao;
    this.largura = 40;
    this.altura = 40;
  }

  criar() {
    contexto.fillStyle = corBarreira;
    contexto.fillRect(
      this.posicao.x,
      this.posicao.y,
      this.largura,
      this.altura
    );
  }
}

class Jogador {
  constructor({ posicao, velocidade }) {
    this.posicao = posicao;
    this.velocidade = velocidade;
    this.raio = 15;
    this.rapidez = 4;
    this.radians = 0.75;
    this.openRate = 0.12;
    this.rotacao = 0;
  }

  criar() {
    contexto.save();
    contexto.translate(this.posicao.x, this.posicao.y);
    contexto.rotate(this.rotacao);
    contexto.translate(-this.posicao.x, -this.posicao.y);
    contexto.beginPath();
    contexto.arc(
      this.posicao.x,
      this.posicao.y,
      this.raio,
      this.radians,
      Math.PI * 2 - this.radians
    );
    contexto.lineTo(this.posicao.x, this.posicao.y);
    contexto.fillStyle = "yellow";
    contexto.fill();
    contexto.closePath();
    contexto.restore();
  }

  movimentar() {
    this.criar();
    this.posicao.x += this.velocidade.x;
    this.posicao.y += this.velocidade.y;

    if (this.radians < 0 || this.radians > 0.75) {
      this.openRate = -this.openRate;
    }

    this.radians += this.openRate;
  }
}

class Inimigo {
  static rapidez = 2;
  constructor({ posicao, velocidade, cor }) {
    this.posicao = posicao;
    this.velocidade = velocidade;
    this.raio = 15;
    this.cor = cor;
    this.colisoesAnteriores = [];
    this.rapidez = 2;
    this.assustado = false;
  }

  criar() {
    contexto.beginPath();
    contexto.arc(this.posicao.x, this.posicao.y, this.raio, 0, Math.PI * 2);
    contexto.fillStyle = this.assustado ? "blue" : this.cor;
    contexto.fill();
    contexto.closePath();
  }

  movimentar() {
    this.criar();
    this.posicao.x += this.velocidade.x;
    this.posicao.y += this.velocidade.y;
  }
}

class Ponto {
  constructor({ posicao }) {
    this.posicao = posicao;
    this.raio = 3;
  }

  criar() {
    contexto.beginPath();
    contexto.arc(this.posicao.x, this.posicao.y, this.raio, 0, Math.PI * 2);
    contexto.fillStyle = "white";
    contexto.fill();
    contexto.closePath();
  }
}

class PowerUp {
  constructor({ posicao }) {
    this.posicao = posicao;
    this.raio = 9;
  }

  criar() {
    contexto.beginPath();
    contexto.arc(this.posicao.x, this.posicao.y, this.raio, 0, Math.PI * 2);
    contexto.fillStyle = "white";
    contexto.fill();
    contexto.closePath();
  }
}

// CONSTS =================================================================

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

const inimigos = [];

for (let i = 2; 0 <= i; i--) {
  inimigos.push(
    new Inimigo({
      posicao: {
        x: Barreira.largura * 6 + Barreira.largura / 2,
        y: Barreira.altura + Barreira.altura / 2,
      },
      velocidade: {
        x: Inimigo.rapidez,
        y: 0,
      },
      cor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    })
  );
}

const jogador = new Jogador({
  posicao: {
    x: Barreira.largura + Barreira.largura / 2,
    y: Barreira.altura + Barreira.altura / 2,
  },
  velocidade: { x: 0, y: 0 },
});

let ultimaTeclaPressionada = "";

let pontuacao = 0;

const mapa = [
  ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
  ["-", " ", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", "-"],
  ["-", ".", "-", "-", ".", "-", "-", ".", "-", "-", ".", "-", "-", ".", "-"],
  ["-", ".", ".", ".", ".", "-", ".", ".", ".", "-", ".", ".", ".", ".", "-"],
  ["-", ".", "-", ".", ".", ".", ".", "-", ".", ".", ".", ".", "-", ".", "-"],
  ["-", ".", "-", ".", "-", ".", "-", "-", "-", ".", "-", ".", "-", ".", "-"],
  ["-", ".", ".", ".", "-", ".", ".", "p", ".", ".", "-", ".", ".", ".", "-"],
  ["-", ".", "-", ".", "-", ".", "-", "-", "-", ".", "-", ".", "-", ".", "-"],
  ["-", ".", "-", ".", ".", ".", ".", "-", ".", ".", ".", ".", "-", ".", "-"],
  ["-", ".", ".", ".", ".", "-", ".", ".", ".", "-", ".", ".", ".", ".", "-"],
  ["-", ".", "-", "-", ".", "-", "-", ".", "-", "-", ".", "-", "-", ".", "-"],
  ["-", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", "-"],
  ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
];

// FUNÇÕES =================================================================

mapa.forEach((linha, i) => {
  linha.forEach((caractere, j) => {
    switch (caractere) {
      case "-":
        barreiras.push(
          new Barreira({
            posicao: {
              x: Barreira.largura * j,
              y: Barreira.altura * i,
            },
          })
        );
        break;
      case ".":
        pontos.push(
          new Ponto({
            posicao: {
              x: j * Barreira.largura + Barreira.largura / 2,
              y: i * Barreira.altura + Barreira.altura / 2,
            },
          })
        );
        break;
      case "p":
        powerUps.push(
          new PowerUp({
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

function colisao({ entidade, barreira }) {
  const padding = Barreira.largura / 2 - entidade.raio - 1;
  return (
    entidade.posicao.y - entidade.raio + entidade.velocidade.y <=
      barreira.posicao.y + barreira.altura + padding &&
    entidade.posicao.x + entidade.raio + entidade.velocidade.x >=
      barreira.posicao.x - padding &&
    entidade.posicao.y + entidade.raio + entidade.velocidade.y >=
      barreira.posicao.y - padding &&
    entidade.posicao.x - entidade.raio + entidade.velocidade.x <=
      barreira.posicao.x + barreira.largura + padding
  );
}

let animacaoId;

function animar() {
  animacaoId = requestAnimationFrame(animar);
  contexto.clearRect(0, 0, canvas.width, canvas.height);

  if (teclas.w.pressionado && ultimaTeclaPressionada === "w") {
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
        jogador.velocidade.y = 0;
        break;
      } else {
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
        jogador.velocidade.x = 0;
        break;
      } else {
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
        jogador.velocidade.y = 0;
        break;
      } else {
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
        jogador.velocidade.x = 0;
        break;
      } else {
        jogador.velocidade.x = jogador.rapidez;
      }
    }
  }
  for (let i = inimigos.length - 1; 0 <= i; i--) {
    const inimigo = inimigos[i];
    if (
      Math.hypot(
        inimigo.posicao.x - jogador.posicao.x,
        inimigo.posicao.y - jogador.posicao.y
      ) <
      inimigo.raio + jogador.raio
    ) {
      if (inimigo.assustado) {
        inimigos.splice(i, 1);
      } else {
        cancelAnimationFrame(animacaoId);
        statusEl.innerHTML = "VOCÊ PERDEU";
        statusEl.style.color = "red";
      }
    }
  }

  if (pontos.length === 0) {
    cancelAnimationFrame(animacaoId);
    statusEl.innerHTML = "VOCÊ VENCEU";
    statusEl.style.color = "green";
  }

  for (let i = powerUps.length - 1; 0 <= i; i--) {
    const powerUp = powerUps[i];
    powerUp.criar();

    if (
      Math.hypot(
        powerUp.posicao.x - jogador.posicao.x,
        powerUp.posicao.y - jogador.posicao.y
      ) <
      powerUp.raio + jogador.raio
    ) {
      powerUps.splice(i, 1);

      inimigos.forEach((inimigo) => {
        inimigo.assustado = true;

        setTimeout(() => {
          inimigo.assustado = false;
        }, 5000);
      });
    }
  }

  for (let i = pontos.length - 1; 0 <= i; i--) {
    const ponto = pontos[i];
    ponto.criar();

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

  barreiras.forEach((barreira) => {
    barreira.criar();

    if (colisao({ entidade: jogador, barreira: barreira })) {
      jogador.velocidade.x = 0;
      jogador.velocidade.y = 0;
    }
  });

  jogador.movimentar();

  inimigos.forEach((inimigo) => {
    inimigo.movimentar();

    const colisoes = [];

    barreiras.forEach((barreira) => {
      if (
        !colisoes.includes("direita") &&
        colisao({
          entidade: {
            ...inimigo,
            velocidade: {
              x: inimigo.rapidez,
              y: 0,
            },
          },
          barreira: barreira,
        })
      ) {
        colisoes.push("direita");
      }
      if (
        !colisoes.includes("esquerda") &&
        colisao({
          entidade: {
            ...inimigo,
            velocidade: {
              x: -inimigo.rapidez,
              y: 0,
            },
          },
          barreira: barreira,
        })
      ) {
        colisoes.push("esquerda");
      }
      if (
        !colisoes.includes("cima") &&
        colisao({
          entidade: {
            ...inimigo,
            velocidade: {
              x: 0,
              y: -inimigo.rapidez,
            },
          },
          barreira: barreira,
        })
      ) {
        colisoes.push("cima");
      }
      if (
        !colisoes.includes("baixo") &&
        colisao({
          entidade: {
            ...inimigo,
            velocidade: {
              x: 0,
              y: inimigo.rapidez,
            },
          },
          barreira: barreira,
        })
      ) {
        colisoes.push("baixo");
      }
    });
    if (colisoes.length > inimigo.colisoesAnteriores.length) {
      inimigo.colisoesAnteriores = colisoes;
    }
    if (
      JSON.stringify(colisoes) !== JSON.stringify(inimigo.colisoesAnteriores)
    ) {
      if (inimigo.velocidade.x > 0) {
        inimigo.colisoesAnteriores.push("direita");
      } else if (inimigo.velocidade.x < 0) {
        inimigo.colisoesAnteriores.push("esquerda");
      } else if (inimigo.velocidade.y < 0) {
        inimigo.colisoesAnteriores.push("cima");
      } else if (inimigo.velocidade.y > 0) {
        inimigo.colisoesAnteriores.push("baixo");
      }

      const caminhos = inimigo.colisoesAnteriores.filter((colisao) => {
        return !colisoes.includes(colisao);
      });

      const direcao = caminhos[Math.floor(Math.random() * caminhos.length)];

      switch (direcao) {
        case "baixo":
          inimigo.velocidade.y = inimigo.rapidez;
          inimigo.velocidade.x = 0;
          break;
        case "cima":
          inimigo.velocidade.y = -inimigo.rapidez;
          inimigo.velocidade.x = 0;
          break;
        case "direita":
          inimigo.velocidade.y = 0;
          inimigo.velocidade.x = inimigo.rapidez;
          break;
        case "esquerda":
          inimigo.velocidade.y = 0;
          inimigo.velocidade.x = -inimigo.rapidez;
          break;
      }

      inimigo.colisoesAnteriores = [];
    }
  });

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

// barreiras.forEach((barreira) => {
//   barreira.criar();
// });

// jogador.movimentar();

addEventListener("keydown", (event) => {
  switch (event.key) {
    case "w":
      teclas.w.pressionado = true;
      ultimaTeclaPressionada = "w";
      break;
    case "a":
      teclas.a.pressionado = true;
      ultimaTeclaPressionada = "a";
      break;
    case "s":
      teclas.s.pressionado = true;
      ultimaTeclaPressionada = "s";
      break;
    case "d":
      teclas.d.pressionado = true;
      ultimaTeclaPressionada = "d";
      break;
  }
});

addEventListener("keyup", (event) => {
  switch (event.key) {
    case "w":
      teclas.w.pressionado = false;
      break;
    case "a":
      teclas.a.pressionado = false;
      break;
    case "s":
      teclas.s.pressionado = false;
      break;
    case "d":
      teclas.d.pressionado = false;
      break;
  }
});
