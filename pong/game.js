window.addEventListener('DOMContentLoaded', async e => {
  const intersectsWith = (a, b) => {
    return (a.x < b.x + b.width)
        && (a.x + a.width > b.x)
        && (a.y < b.y + b.height)
        && (a.y > b.y - b.height);
    return b;
  }

  class Game {
    constructor() {
      this.gameCanvas = document.createElement('canvas');
      this.gameCanvas.width = 1280;
      this.gameCanvas.height = 720;

      this.gameEl = document.getElementById('game');
      this.gameEl.appendChild(this.gameCanvas);
      this.ctx = this.gameCanvas.getContext('2d');

      Object.assign(this, {
        width: this.gameCanvas.width,
        height: this.gameCanvas.height,
      });
    }

    initializeBall() {
      const { ctx, width, height, lastFrameTime } = this;
      this.gameOver = false;
      const x = Math.floor(Math.random() * width);
      const y = Math.floor(Math.random() * height);

      this._ball = {
        y,
        x,
        vx: -0.1,
        vy: 0,
        height: 20,
        width: 20,
      };

    }

    ball() {
      if (this.gameOver) return;

      const { ctx, width, height, lastFrameTime } = this;
      const time = Date.now() - lastFrameTime;

      if (!this._ball) {
        this.initializeBall();
      }

      let ball = this._ball;
      const intersectingPaddle = ['other', 'self'].find(k => intersectsWith(this._ball, this.paddle[k] ));

      let sign = Math.sign(this._ball.vx)

      let currentAngle = 45 * sign;
      if (intersectingPaddle) {
        const mid = this.paddle[intersectingPaddle].height / 2;
        this._ball.vx *= -1;
        if (this._ball.y < this.paddle[intersectingPaddle].y + mid - 10 ) { // top half
          this._ball.vy = this._ball.vx*-Math.sin(-1 * currentAngle)
        } else if (this._ball.y > this.paddle[intersectingPaddle].y + mid + 10) { // bottom half
          this._ball.vy = this._ball.vx*-Math.sin(currentAngle)
        } else {
          this._ball.vy = 0;
        }
      } else if ( !(this._ball.y > 0) ) {
        let newAngle = 180 - currentAngle;
        this._ball.vy = this._ball.vx*-Math.sin(-1 * currentAngle)
      } else if ( !((this._ball.y + this._ball.height) < height) ) {
        let newAngle = 180 - currentAngle;
        this._ball.vy = this._ball.vx * -Math.sin(currentAngle)
      } else if ( this._ball.x < 0 || this._ball.x > (width + this.ball.width)) {
        this.gameOver = true;
        setTimeout(_ => {
          this.initializeBall();
        }, 1000);
        return;
      }

      ctx.fillStyle = '#FF0000';
      const maxY = height - ball.height;
      const maxX = width - ball.width;
      const minY = 0;
      const minX = 0;

      if ( ball.x <= maxX && ball.x >= minX) {
        this._ball.x += this._ball.vx * 50;
        this._ball.y += this._ball.vy * 50;
      }
      ctx.fillRect(ball.x, ball.y, ball.width, ball.height);
    }

    paddle(type, player) {
      const { ctx, width, height } = this;
      if ( type == 'left' ) {
        ctx.fillStyle = '#FF0000';
        if (!this.paddle[player]) {
          this.paddle[player] = {
            y: 50,
            x: 30,
            height: 100,
            width: 50,
          };
        }
        const { x, y, width, height } = this.paddle[player];
        ctx.fillRect(x, y, width, height);
      } else if ( type == 'right' ) {
        ctx.fillStyle = '#FF0000';
        if (!this.paddle[player]) {
          this.paddle[player] = {
            y: 50,
            x: width - 30 - 50,
            height: 100,
            width: 50,
          };
        }
        const paddle = this.paddle[player];
        ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
      }
    }

    movePaddle(direction, player) {
      const { height } = this;
      const { y: currentY, height: paddleHeight } = this.paddle[player];
      const maxY = height - paddleHeight;
      const minY = 0;

      if (direction === 'down' && currentY < maxY) {
        this.paddle[player].y += 30;
      } else if (direction === 'up' && currentY > minY) {
        this.paddle[player].y -= 30;
      }
    }

    start() {
      const { ctx, width, height } = this;
      document.addEventListener('keydown', e => {
        if (e.key === 'ArrowDown') {
          this.movePaddle('down', 'self');
        } else if (e.key === 'ArrowUp') {
          this.movePaddle('up', 'self');
        }
        if (e.key === 'j') {
          this.movePaddle('down', 'other');
        } else if (e.key === 'k') {
          this.movePaddle('up', 'other');
        }
      });
      setInterval(_ => {
        const start = Date.now();
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#333300';
        ctx.fillRect(0, 0, width, height);

        this.paddle('left', 'self');
        this.paddle('right', 'other');
        this.ball();

        this.lastFrameTime = Date.now() - start;
      }, 50);
    }
  }

  const game = new Game();

  game.start();
});
