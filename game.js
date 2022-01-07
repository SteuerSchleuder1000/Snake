window.onload = function() {
    window.setInterval(function () {board.update()},20)
}



// Constants
const gridDim = [100,75]
const noSnakesInit = 15
const noSnakesMax = 20
const snakeLength = 10
const snakeLengthInit = 5
const decayRate = 0
const foodRate = 20
const food = [  {color:"blue",idx:0.1},
                {color:"green",idx:0.2},
                {color:"red",idx:0.3},
                {color:"purple",idx:0.4},
                {color:"yellow",idx:0.5}]

const nutrition_apple = 1
const nutrition_snake = 5



// Utility Stuff
function choice(arr) {return arr[Math.floor(Math.random()*arr.length)]}
function randint(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function randomColor(o=0) {
    
    if (o==0) {return "rgb("+randint(0,255)+","+randint(0,255)+","+randint(0,255)+")"}
    return o
    var c = [o[0]+randint(-5,5),o[1]+randint(-5,5),o[2]+randint(-5,5)]
    if (c[0] < 0) {c[0] = 0}
    if (c[0]>255) {c[0] = 255}
    if (c[1] < 0) {c[1] = 0}
    if (c[1]>255) {c[1] = 255}
    if (c[2] < 0) {c[2] = 0}
    if (c[2]>255) {c[2] = 255}
    print("color :"+c)
    return "rgb("+c[0]+","+c[1]+","+c[2]+")"
}

function print(text) {console.log(text)}






// Main class
class Board {
    constructor() {
	this.pixW = 10
	this.width = gridDim[0]
        this.height = gridDim[1]
        this.canvas = document.createElement("canvas")
        this.canvas.width = gridDim[0]*this.pixW
        this.canvas.height = gridDim[0]*this.pixW
        this.noOfSnakes = 0
        this.noOfApples = 100
        
        this.ctx = this.canvas.getContext("2d")
        document.body.insertBefore(this.canvas, document.body.childNodes[0])
        
        this.grid = []
        for (var i=0;i<this.height;i++) {
            var line = []
            for (var j=0;j<this.width;j++) {line.push({idx: 0, color: "white"})}
            this.grid.push(line)
        }


        // SNAKES!
        this.snakes = []
        for (var i=0;i<noSnakesInit;i++) {
            this.addSnake(i+1,0)
        }

        //Apples
        for (var i=0;i<this.noOfApples;i++) {
            var x = randint(0,gridDim[0])
            var y = randint(0,gridDim[1])
            this.grid[y][x].color = "red"
            this.grid[y][x].idx = 0.5
        }


    }
    addSnake(idx=0,dna=0) {
        if (this.noOfSnakes >= noSnakesMax) {return}
        this.noOfSnakes += 1
        if (dna == 0) {dna = new DNA()}

        var s = new Snake({
            idx: idx,
            board: this,
            grid: this.grid,
            dna: dna,
            x: randint(0,gridDim[0]),
            y: randint(0,gridDim[1])})

        this.snakes.push(s)
    }


    clear() {this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height)}

    update() {
        this.clear()
        if (this.noOfSnakes <= 5) {this.addSnake(this.snakes.length+1)}
        for (var i = this.snakes.length - 1; i >= 0; i--) {this.snakes[i].update(this.step)}
        for (var i=0;i<this.grid.length;i++) { // Row -> i= y
            for (var j=0;j<this.grid[0].length;j++) { // Col -> j= x
                var pixel = this.grid[i][j]
                this.ctx.fillStyle = pixel.color
                this.ctx.fillRect(j*this.pixW, i*this.pixW, this.pixW, this.pixW)
            }
        }
        for (var i=0;i<decayRate;i++) {
            var x = randint(0,this.width)
            var y = randint(0,this.height)
            if (this.grid[y][x].color == "black") {this.grid[y][x].color = "white"; this.grid[y][x].idx = 0}
        }
        if (randint(0,foodRate)==0) {
            var x = randint(0,this.width)
            var y = randint(0,this.height)
            var f = choice(food)
            if (this.grid[y][x].color == "white") {this.grid[y][x].color = f.color; this.grid[y][x].idx = f.idx}
        }
        
        this.step += 1
    }
}



class DNA {
    constructor() {
        this.mutationRate = randint(0,10) // the higher the less likely it changes
        this.pattern = []
        for (var i = 0; i<randint(1,20);i++) {this.pattern.push(randint(0,4))}
        this.color = [randomColor()]
        for (var i=0;i<100;i++) {this.color.push(randomColor(this.color[0]))}
        this.w_pattern = randint(0,100)
        this.w_senses = randint(0,100)
        this.food = []
        this.poison = []
        for (var i=0;i<food.length;i++) {
            if (randint(0,1)==0){this.food.push(food[i].idx)}
            else{this.food.push(food[i].idx)}}
        this.senses = {"white": randint(0,100),
                       "black": randint(0,100)}
        for (var i=0;i<food.length;i++) {
            this.senses[food[i].color] = randint(0,100)
        }
    }

    mutate() {
        var p_new = []
        

        for (var i=0;i<this.pattern.length;i++) {
            // if random -> new step, else old step
            if (this.luck()) {p_new.push(randint(0,4))}
            else {p_new.push(this.pattern[i])}
        }
        
        // 10% chance to remove a random step
        if (this.luck()) {p_new.slice(randint(0,p_new.length-1),1)}
        // 10% chance to add a random step
        if (this.luck()) {p_new.push(randint(0,4))}

        // Commit Pattern
        this.pattern = p_new
        
        
        // 10% chance to alter the response by 
        for (var key in this.senses) {
            if (this.luck()) {this.senses.key += randint(-1,2)}
        }
        
        for (var i=0;i<this.color;i++) {this.color[i] = randomColor(this.color[i])}
        
        if (this.luck()) {this.w_pattern += randint(-1,2)}
        if (this.luck()) {this.w_senses += randint(-1,2)}

        if (this.luck()) {this.mutationRate += randint(-1,2); if (this.mutationRate<=0) {this.mutationRate = 1}}
    }
    clone() {
        var dna = new DNA()
        dna.mutationRate = this.mutationRate
        dna.pattern = this.pattern.slice()
        dna.senses = {"white": this.senses["white"],
                       "black": this.senses["black"],
                       "red": this.senses["red"],
                       "purple": this.senses["purple"]}
        dna.w_pattern = this.w_pattern
        dna.w_senses = this.w_senses
        return dna
    }
    
    //luck() {return false}
    luck() {if (randint(0,this.mutationRate) == 0) {return true} else{return false}}
    
    printPattern() {
        var p = ""
        for (var i=0;i<this.pattern.length;i++) {p += this.pattern[i]+", "}
        print("DNA: "+p)
    }
    checkFood(color) {
        if (this.food.indexOf(color) != -1) {return 1}
        if (this.poison.indexOf(color) != -1) {return -1}
        return 0
    }
}





class Snake {

    constructor(options) {
        this.idx = options.idx
        this.x = options.x
        this.y = options.y
        this.grid = options.grid
        this.board = options.board
        this.checkCoordinats()
        this.length = snakeLengthInit
        this.alive = true
        this.mutated = false
        this.energy = 100 
        this.tail = [{x:this.x,y:this.y,color:this.color}]
        this.dna = options.dna               
        this.color = this.dna.color[0]

        this.move = 0
        this.directions = [0]
    }

    update (step) {
        if (!this.alive) {return}
        this.energy -= 1
        if (this.energy <= 0) {this.death();print(this.idx+" Starved!")}
        if (this.move >= 1000) {this.death();print(this.idx+" Old Age!")}

        if (this.energy <= 30 && !this.mutated) {this.dna.mutate();this.mutated = true}

        // Next Move
        var direction = this.chooseDirection(0)
        if (direction == 0) {this.y -= 1} // up
        if (direction == 2) {this.y += 1} // down
        if (direction == 3) {this.x -= 1} // left
        if (direction == 1) {this.x += 1} // right
        this.checkCoordinats()
        
        // Check where it landed
        var nextIdx = this.grid[this.y][this.x].idx
       
        
        // Other Snake
        if (nextIdx >= 1) {
            if (nextIdx == this.idx) {this.death();print(this.idx+" Suicide!");return}
            //var snake = this.board.snakes[nextIdx-1]
            //snake.death()
            this.eat(nutrition_snake)
        }
        var eaten = this.dna.checkFood(nextIdx)
        if (eaten == -1) {this.death(); print(this.idx+" Poisened!")}
        if (eaten == 1) {this.eat(nutrition_apple); this.board.noOfApples -= 0}


        // Delete last tail if not growing
        var l = this.tail[this.tail.length-1]
        if (this.length <= this.tail.length) {
            this.grid[l.y][l.x].color = "white"
            this.grid[l.y][l.x].idx = 0}
        // Still growing
        else {  
            var c = this.dna.color[this.tail.length]
            this.tail.push({x:l.x,y:l.y,color:c})
            this.grid[l.y][l.x].color = c
        }

        // Move Tail up
        for (var i=this.tail.length-1;i>0;i--) { 
            this.tail[i].x = this.tail[i-1].x
            this.tail[i].y = this.tail[i-1].y 
        }
         
        // Move Head
        this.tail[0].x = this.x
        this.tail[0].y = this.y

        // Present to grid
        for (var i=this.tail.length-1;i>=0;i--) {
            var t = this.tail[i]
            this.grid[t.y][t.x].color = t.color
            this.grid[t.y][t.x].idx = this.idx
        }

        // Aftermath
        this.move += 1
        
    }

    chooseDirection() {
        var p = this.dna.pattern[this.move%this.dna.pattern.length]
        if (p == 2) {p = choice([0,1,2])}
        if (p == 3) {p = 2}
        var neighbours = this.checkNeighbours(this.x,this.y)
        neighbours[p] = this.dna.w_pattern
        var idxT = this.chooseWeight(neighbours)
        var nextTurn = [0,1,3][idxT]
        var direction = (this.directions[0]+nextTurn)%4
        this.directions.splice(0,0,direction)
        return direction
    }
    
    chooseWeight(arr) {
        return arr.indexOf(Math.max(...arr));
        var sum = arr.reduce((a, b) => a + b, 0)
        if (sum == 0) {return 0}

        var rng = Math.random()
        var temp = 0
        for (var i=0;i<arr.length;i++) {
            temp += arr[i]/sum
            if (temp > rng) {return i}
        }
        return 2
    }

    turnHistory(snip) {
        var turns = []
        for (var i=0;i<snip||i<this.directions.length-2;i++) {
            turns.push((this.directions[i]-this.directions[i+1]+4)%4)
        }
        return turns
    }

    eat(amount) {
        if (randint(0,3)==0) {this.length += 1}
        this.energy += amount*30

        if (this.length > snakeLength) {
            var dna = this.dna.clone()
            dna.mutate()
            this.board.addSnake(this.board.snakes.length+1,dna)
            this.length = snakeLengthInit
            this.dna.printPattern()
        }
    }



    checkCoordinats() {
        var c = this.checkC(this.x,this.y)
        this.x = c.x
        this.y = c.y
    }
    
    checkC(x,y) {
        if (x >= gridDim[0]) {x -= gridDim[0]}
        if (y >= gridDim[1]) {y -= gridDim[1]}
        if (x < 0) {x += gridDim[0]}
        if (y < 0) {y += gridDim[1]}
        return {x:x,y:y}
    }

    checkNeighbours(x,y) {
        var up = this.checkC(x,y-1)
        var right = this.checkC(x+1,y)
        var down = this.checkC(x,y+1)
        var left = this.checkC(x-1,y)
        var neighbours = [up,right,down,left]
        
        var dir = this.directions[0]
        var d0 = neighbours[dir]
        var d1 = neighbours[(dir+1)%4]
        var d3 = neighbours[(dir+3)%4]
        
        // Save all neighbour pixels in result
        var result = [this.grid[d0.y][d0.x],this.grid[d1.y][d1.x],this.grid[d3.y][d3.x]]
        for (var i=0;i<3;i++) {
            //get color weight of color
            if (result[i].idx == this.idx) {result[i] = 0}
            else if (result[i].color in this.dna.senses) {result[i] = this.dna.senses[result[i].color]}
            else {result[i] = this.dna.senses["white"]}
            result[i] *= this.dna.w_senses
        }
        return result
    }
    
    death() {
        if (!this.alive) {return}
        this.board.noOfSnakes -= 1
        //print("Snake dead: "+this.idx+" snakes alive:"+this.board.noOfSnakes)
        
        this.alive = false
        for (var i=0;i<this.tail.length;i++) {
            var t = this.tail[i]
            t.color = "black"
            this.grid[t.y][t.x].color = "black"
            this.grid[t.y][t.x].idx = this.idx
        }
        
    }

}











const board = new Board()


