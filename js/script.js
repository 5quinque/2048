
/**
 * 
 *
 * @returns {undefined}
 */
class Box {
  constructor(gameElement, input) {
    this.score = 0;
    this.highscore = 0;
    this.gameElement = gameElement;
    this.boxes = [];
    this.boxState = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.easyMode = false;

    this.drawGame();
  
    this.input = new Input(this);
  }

  drawBox () {
    this.boxes.push( $("<div>", {"class": "empty_box"}) );

    $(this.gameElement).append(this.boxes[this.boxes.length-1]);
  }

  drawGame () {
    for (var i = 0; i < 16; i++) {
      this.drawBox();
    }

    this.setStartingBoxes();
    this.getHighscore();
    this.updateScore(0);
  }

  newGame() {
    this.score = 0;
    this.boxes = [];
    $(".box_wrapper").empty();

    this.drawGame();
  }

  setStartingBoxes() {
    this.addBox(Math.floor(Math.random() * 16));
    this.addBox(Math.floor(Math.random() * 16));
  }

  getHighscore() {
    this.highscore = localStorage.getItem("highscore");
    if (!this.highscore) this.highscore = 0;
    $(".highscore").text(this.highscore);
  }

  setHighscore() {
    console.log("Setting Highscore!");
    localStorage.setItem("highscore", this.highscore);
  }

  updateScore(aScore) {
    this.score += aScore;
    $(".score").text(this.score);

    if (this.score > this.highscore) {
      this.highscore = this.score;
      $(".highscore").text(this.highscore);

      console.log("Setting high score!");
      this.setHighscore();
    }
  }

  checkGameOver() {
    var directions = ["up", "down", "left", "right"];

    for (var i = 14; i >= 0; i--) {
      for (var j = 0; j < directions.length; j++) {
        if (this.moveBox(i, directions[j], true)) {
          return false;
        }
      }
    }

    return true;
  }

  addBox(boxLocation = null, value = null) {
    if (boxLocation === null) {
      boxLocation = Math.floor(Math.random() * 16);
      while (this.boxes[boxLocation].text() != "") {
        boxLocation = Math.floor(Math.random() * 16);
      }
      this.boxes[boxLocation].addClass('box-new');

      var self = this;
      setTimeout(function() {
        self.boxes[boxLocation].removeClass("box-new");
      }, 250);

    }
    if (value === null) {
      if (this.easyMode) {
        value = '2';
      } else {
        value = ['2', '4'][Math.floor(Math.random() * 2)];
      }
    }
  
    this.boxes[boxLocation].removeClass('empty_box');
    this.boxes[boxLocation].addClass('box');
    this.boxes[boxLocation].addClass('box-'+value);
    this.boxes[boxLocation].text(value);

  }

  moveBox(index, direction, dryrun = false) {
    var movement = false;

    switch (direction) {
      case 'right': 
        this.end = function() { return index % 4 == 3 }
        break;
      case 'left': 
        this.end = function() { return index % 4 == 0 }
        break;
      case 'up':
        this.end = function() { return index < 4 }
        break;
      case 'down':
        this.end = function() { return index > 11 }
        break;
    }

    if (this.boxes[index].attr('class') == 'empty_box' || this.end() ) {
      return false;
    }

    var neighbourIndex = this.getNeighbourIndex(index, direction);

    var boxValue = this.boxes[index].text();
    var neighbourValue = this.boxes[neighbourIndex].text();


    if (boxValue == neighbourValue) {
      if (dryrun) return true;
      
      if (this.boxState[neighbourIndex] == 1) {
        console.log("Already merged", neighbourIndex);
        return false;
      }
      this.boxState[neighbourIndex] = 1;
      
      this.emptyBox(this.boxes[index]);
      this.emptyBox(this.boxes[neighbourIndex]);
      this.addBox(neighbourIndex, boxValue*2);
      this.boxes[neighbourIndex].addClass("box-combine");

      var self = this;
      setTimeout(function() {
        self.boxes[neighbourIndex].removeClass("box-combine");
      }, 300);

      this.updateScore(boxValue*2);
      movement = true;
    }

    if (this.boxes[neighbourIndex].attr('class') == 'empty_box') {
      if (dryrun) return true;
      //console.log('can move ' + direction);
      this.emptyBox(this.boxes[index]);
      this.addBox(neighbourIndex, boxValue);

      movement = true;
      this.moveBox(neighbourIndex, direction);
    }

    return movement;
  }

  getNeighbourIndex(index, direction) {
    var operators = {
      '+': function(a, b) { return a + b },
      '-': function(a, b) { return a - b },
    };
    var op;
    var inc;

    switch (direction) {
      case 'right': 
        op = '+';
        inc = 1;
        break;
      case 'left': 
        op = '-';
        inc = 1;
        break;
      case 'up':
        op = '-';
        inc = 4;
        break;
      case 'down':
        op = '+';
        inc = 4;
        break;
    }

    var neighbourIndex = operators[op](index, inc);

    return neighbourIndex;
  }

  move(direction) {
    this.boxState = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var movement = false;
    switch (direction) {
      case 'right': 
      for (var i = 14; i >= 0; i--) {
        if (this.moveBox(i, direction)) movement = true;
      }
      break;
      case 'left':
      for (var i = 0; i < 16; i++) {
        if (this.moveBox(i, direction)) movement = true;
      }
      break;
      case 'up':
      for (var i = 0; i < 16; i++) {
        var index = ((i % 4) * 4) + Math.floor(i / 4);
        if (this.moveBox(index, direction)) movement = true;
      }
      break;
      case 'down':
      for (var i = 14; i >= 0; i--) {
        var index = ((i % 4) * 4) + Math.floor(i / 4);
        if (this.moveBox(index, direction)) movement = true;
      }
      break;
    }

    // Only add a new box on movement
    if (movement) {
      this.addBox();
      
      //if (this.boxes.length != 16) {
      //  console.log("Not checking gameover");
      //  return 1;
      //}
      if (this.checkGameOver()) {
        console.log("Game over!");
        $(".game_over").fadeIn();
      }

    }
  }

  emptyBox(element) {
    element.removeClass();
    element.addClass("empty_box");
    element.text("");
  }

}

class Input {
  constructor(box) {
    this.box = box;
    this.autoPlayInt = false;

    this.listenForSettings();
    this.listenForInput();
    this.getSettings();

  }

  autoPlay() {
    console.log("AutoPLayFUNction");
    var directions = ["up", "down", "left", "right"];
    var direction = directions[Math.floor(Math.random() * 4)];
    this.box.move(direction);
  }

  getSettings() {
    this.box.easyMode = $("#easy_mode").is(":checked");
    //this.autoPlay = $("#auto_mode").is(":checked");
  }

  listenForSettings() {
    var self = this;

    $("#easy_mode").change(function() {
      box.easyMode = this.checked;
    });

    $("#auto_mode").change(function() {
      if (this.checked) {
        console.log("Starting autoplay");
        self.autoPlayInt = setInterval(self.autoPlay, 350);
      } else {
        console.log("Clearing autoplay");
        clearInterval(self.autoPlayInt);
      }
    });

    $(".play_again").on("click", function() {
      $(".box_wrapper").empty();
      self.box.newGame();
    
      $(".game_over").fadeOut();
    });
  }

  listenForInput() {
    var self = this;
    $(document).keydown(function(e) {
      switch(e.which) {
        case 37: // left
        self.box.move("left");
        break;
    
        case 38: // up
        self.box.move("up");
        break;
    
        case 39: // right
        self.box.move("right");
        break;
    
        case 40: // down
        self.box.move("down");
        break;
    
        default: return; // exit this handler for other keys
      }
      e.preventDefault(); // prevent the default action (scroll / move caret)
    });
  
    var touchStartX, touchStartY;
    var touchEndX, touchEndY;
    var gameElement = document.getElementsByClassName("box_wrapper")[0];

    gameElement.addEventListener("touchstart", function (event) {
      event.preventDefault();

      touchStartX = event.changedTouches[0].pageX;
      touchStartY = event.changedTouches[0].pageY;
    });

    gameElement.addEventListener("touchmove", function (event) {
      event.preventDefault();
    });

    gameElement.addEventListener("touchend", function (event) {
      event.preventDefault();

      touchEndX = event.changedTouches[0].pageX;
      touchEndY = event.changedTouches[0].pageY;

      var differenceX = Math.floor(Math.abs(touchStartX - touchEndX));
      var differenceY = Math.floor(Math.abs(touchStartY - touchEndY));

      if (differenceX > differenceY) {
        if (touchStartX - touchEndX > 0) {
          self.box.move("left");
        } else {
          self.box.move("right");
        }
      } else {
        if (touchStartY - touchEndY > 0) {
          self.box.move("up");
        } else {
          self.box.move("down");
        }
      }

    });

  }
}

var box = new Box(".box_wrapper", Input);


