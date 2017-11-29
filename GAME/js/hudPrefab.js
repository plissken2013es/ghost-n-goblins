var platformer = platformer || {};


platformer.hudPrefab=function(game,_level){
	this.level = _level;
    this.score = 0;
    this.vides = 0;
	
	/*---SPRITES---*/
	//Frame de l'arma 
	Phaser.Sprite.call(this,game,gameOptions.gameWidth/2,13*gameOptions.gameHeight/14,'hud');
    game.add.existing(this);
    this.anchor.setTo(.5);
	this.fixedToCamera = true;
	//TODO: FALTA POSAR LES VIDES GLOBALS
	//Arma
	this.weapon = game.add.sprite(gameOptions.gameWidth/2,13*gameOptions.gameHeight/14,'hud',3); 	//Per defecte és la llança
	this.weapon.anchor.setTo(.5);
	this.weapon.fixedToCamera = true;
	
	/*---TEXTOS---*/
	this.playerName		= platformer.game.add.bitmapText(10,  0,  'gngFont', 'PLAYER 1',  18);		//Enjoy the OCD :D
	this.topScore		= platformer.game.add.bitmapText(200, 0,  'gngFont', 'TOP SCORE', 18);
	this.scoreText		= platformer.game.add.bitmapText(10, 17,  'gngFont', '0', 		  18); 
	this.topScoreText 	= platformer.game.add.bitmapText(200,17,  'gngFont', '1000', 	  18);
	this.timeText 		= platformer.game.add.bitmapText(10, 34,  'gngFont', 'TIME', 	  18);
	this.timerText 		= platformer.game.add.bitmapText(10, 51,  'gngFont', '2.00', 	  18);
	//Cambiamos los colores
	this.topScore.tint		= '0xc40f0f';
	this.timeText.tint		= '0xffb7c9';
	this.timerText.tint		= '0x62fced';
	//Ponemos el anchor a la derecha
	this.scoreText.anchor.x 	= 1;
	this.topScoreText.anchor.x 	= 1;
	//Alineamos los textos
	this.scoreText.right 	= this.playerName.right;
	this.topScoreText.right = this.topScore.right;
	//Los textos siempre estan fijos en la cámara
	this.playerName.fixedToCamera 	= true;
	this.topScore.fixedToCamera 	= true;
    this.scoreText.fixedToCamera 	= true;
	this.topScoreText.fixedToCamera = true;
	this.timeText.fixedToCamera 	= true;
	this.timerText.fixedToCamera 	= true;
	
	/*---TEMPS---*/
	this.timer = game.time.create(false);
	this.timer.loop(gameOptions.tutorialTime*1000+999,this.timerFinished,this); 	//milisegons
	//this.timer.loop(3*1000+999,this.timerFinished,this); 							//per fer proves
	this.timer.start();
	
};

platformer.hudPrefab.prototype=Object.create(Phaser.Sprite.prototype);
platformer.hudPrefab.prototype.constructor=platformer.hudPrefab;
platformer.hudPrefab.prototype.update=function(){
	//actualitzem el text del contador al hud
	this.timerText.setText(Math.floor(this.timer.duration/60000)+"."+Math.floor((this.timer.duration/1000)%60)); //min:seg
};

platformer.hudPrefab.prototype.updateScore = function(newScore){
	this.score += newScore;
	this.scoreText.text = this.score;
};

platformer.hudPrefab.prototype.timerFinished = function(){
	console.log("--TIME OVER--");
	this.timer.stop();
	this.level.hero.deadByTimer();
};

platformer.hudPrefab.prototype.resetTimer = function(){
	this.timer.stop();
	this.timer.loop(gameOptions.tutorialTime*1000+999,this.timerFinished,this);		//milisegons
	this.timer.start();
};

//Per canviar l'arma del hud, newWeapon: 0-> llança, 1-> daga, 2-> antorcha
platformer.hudPrefab.prototype.changeWeapon = function(newWeapon){
	switch(newWeapon){
		case 0: this.weapon.frame = 3;	//Llança
			break;
		case 1: this.weapon.frame = 2;	//Daga
			break;
		case 2: this.weapon.frame = 1;	//Foc
			break;
	}
}
platformer.hudPrefab.prototype.spawnPoints = function(x,y,points){
	var newPoints = platformer.game.add.bitmapText(x, y, 'gngFont', ''+points,  15);
	newPoints.lifespan = 1000;
	newPoints.kill = function(){
		this.destroy();
	}
}