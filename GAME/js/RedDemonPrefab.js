var platformer = platformer || {};

platformer.RedDemonPrefab = function (game,x,y, _level) {

    this.level = _level;
    this.numHits = 3;
    this.active = false;
    this.game = game;

    Phaser.Sprite.call(this,game,x,y,'redDevil');
	game.add.existing (this);
	this.anchor.setTo(.5);
    this.scale.setTo(2);
    this.direction = Phaser.Math.sign(this.scale.x);

    //ANIMATIONS
    this.animations.add('activate', [0,1,2], 10, false);
    this.animations.add('fly',[8,9,8],10,true);

    //physics
	game.physics.arcade.enable(this);
    this.body.allowGravity = false;
    this.body.setSize(this.width/4*this.direction, this.height/2, this.width/8,0);

    this.activateNextMove = false;
    this.numOfMoves = 0;
    this.canShoot = true;
    this.dead = false;

    //AUDIO
    this.deathSound = this.level.add.audio('enemyDeath');
    this.hitSound = this.level.add.audio('devilHit');

    //Per quan mor
    this.events.onKilled.add(this.die, this);
    
    this.radiusX = 100;
    this.maxLowY = 150;

};
platformer.RedDemonPrefab.prototype=Object.create(Phaser.Sprite.prototype);
platformer.RedDemonPrefab.prototype.constructor=platformer.RedDemonPrefab;
platformer.RedDemonPrefab.prototype.update = function () {

    if(!this.dead){

        if(this.level.hero.player_life == 0){
            this.reset(2900,350);
            this.active = false;
            this.numHits = 3;
            this.activateNextMove = false;
            this.numOfMoves = 0;
            this.canShoot = true;
        }

        this.game.physics.arcade.collide(this, this.level.platform_collision);

        //QUAN ES DESPERTA
        if (!this.active && Phaser.Math.difference(this.position.x,this.level.hero.position.x) < 150 ) {
            this.animations.play('activate');
            this.active = true;
            this.animations.currentAnim.onComplete.add (this.goUp,this);

        }

        this.game.physics.arcade.overlap (this, this.level.projectiles,function (devil, bullet){
            bullet.kill();
            if(!devil.active){
                devil.animations.play('activate');
                devil.active = true;

                devil.animations.currentAnim.onComplete.add (devil.goUp,devil);
            }
            else{
                devil.numHits--;
                if(devil.numHits > 1)
                    devil.hitSound.play();
            }

        });

        //MORT
        if (this.numHits == 0) {
    		this.level.hud.spawnPoints(this.x,this.y,1000);
			this.kill();
        }

        //RUTINA DE DISPAR-3 VOLS RASANTS
        if (this.activateNextMove && this.numOfMoves < 3){
            this.activateNextMove = false;
            this.game.time.events.add(500,this.VueltoRasante,this);
        }
        //al vol del mig dispara tmb
        if (this.numOfMoves == 1 && this.y > 300 && this.canShoot){
            this.animations.stop();
            this.frame = 13;
            this.canShoot = false;
            var bala = new platformer.enemyBulletPrefab(this.game,this.x,this.y,0,0,gameOptions.eyeSpeed, this.level);
            this.game.time.events.add(250,function(){this.animations.play('fly');},this);
        } //tornem al behaviour de disparar i aquest ja activara la resta quan toqui
        else if (this.numOfMoves == 3 && this.activateNextMove){
            this.activateNextMove = false;
            this.numOfMoves = 0;
            this.canShoot = true;
            this.game.time.events.add(250, this.ShootTwice, this);
        }

        //COLISIONS
        this.game.physics.arcade.overlap (this, this.level.hero,function (devil, heroe){
            if (heroe.isKill > 0)
                heroe.killPlayer(devil,heroe);
        });
        
        //this.game.debug.body(this);
    }
    else{
        this.destroy();
    }
};
platformer.RedDemonPrefab.prototype.goUp = function () { //es posa a volar i després de 1s comença el seguent moviment

    this.animations.play('fly');
    this.game.add.tween(this).to( { y: 150 }, 500, "Linear", true, 0).onComplete.add(function() {  this.game.time.events.add(250, this.ShootTwice, this)}, this);


}
platformer.RedDemonPrefab.prototype.ShootTwice = function () {

    this.animations.stop();
    this.frame = 13;

    var bulletDir = new Phaser.Point(this.level.hero.x-this.x,this.level.hero.y-this.y);
    bulletDir.normalize().multiply(gameOptions.eyeSpeed*1.5,gameOptions.eyeSpeed*1.5);
    var bala = new platformer.enemyBulletPrefab(this.game,this.x,this.y,0,bulletDir.x,bulletDir.y, this.level);

    //Esperem 750ms i tornem a disparar
    this.game.time.events.add(500, function () {
        var bulletDir = new Phaser.Point(this.level.hero.x-this.x,this.level.hero.y-this.y);
        bulletDir.normalize().multiply(gameOptions.eyeSpeed*1.5,gameOptions.eyeSpeed*1.5);
        var bala = new platformer.enemyBulletPrefab(this.game,this.x,this.y,0,bulletDir.x,bulletDir.y, this.level);
    },this);
    
    var newX = 0;
     if(this.x > this.level.hero.x)
        newX = this.level.hero.x + this.radiusX;
    else
        newX = this.level.hero.x - this.radiusX;
    
    this.game.add.tween(this).to( { x: newX }, 500, "Linear", true, 0).onComplete.add(function() { 
        this.game.time.events.add(750,function(){this.VueltoRasante(); this.animations.play('fly');},this); 
    }, this);
    
}
platformer.RedDemonPrefab.prototype.VueltoRasante = function () {   

    if(this.x > this.level.hero.x)
        this.direction = 1;
    else
        this.direction = -1;
    
    var cX = this.x - this.radiusX*this.direction;
    var cY = this.y;
    
        

    //VolRasant
    var xMov = this.game.add.tween(this).to( { x: cX }, 1000, Phaser.Easing.Sinusoidal.In , true, 0);
    xMov.onComplete.add(function() { this.game.add.tween(this).to({ x: cX - (this.radiusX*this.direction) }, 1000, Phaser.Easing.Sinusoidal.Out , true, 0); }, this);
    var yMov = this.game.add.tween(this).to( { y: cY + this.maxLowY }, 1000, Phaser.Easing.Sinusoidal.Out , true, 0);
    yMov.onComplete.add(function() {
        var yMov2 = this.game.add.tween(this).to({ y: cY }, 1000, Phaser.Easing.Sinusoidal.In , true, 0);
        yMov2.onComplete.add(function(){this.activateNextMove = true;this.numOfMoves++;this.direction *=-1;},this);
    }, this);

}
platformer.RedDemonPrefab.prototype.die = function () {

    this.deathSound.play();
    this.dead = true;    
    this.numHits = -1;
    this.level.hud.updateScore(500);
	this.level.explosions.add(new platformer.explosionPrefab(this.level.game,this.x,this.y,0, this.level));
    
    this.body = null;
    
}
