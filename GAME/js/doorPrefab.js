var platformer = platformer || {};

platformer.doorPrefab = function(game,x,y,_level){
    Phaser.Sprite.call(this,game,x,y,'door');
    game.add.existing(this);
    
    this.level = _level;
    this.game = game;
    this.animations.add('open', [0,1,2],8,false);
    
    this.open = false;
    
    //FISIQUES
    game.physics.arcade.enable(this);
    this.body.allowGravity = false;
    this.body.immovable = true;
       
}
platformer.doorPrefab.prototype=Object.create(Phaser.Sprite.prototype);
platformer.doorPrefab.prototype.constructor=platformer.doorPrefab;
platformer.doorPrefab.prototype.update = function(){   
    
    if (this.open){
        this.game.physics.arcade.overlap (this, this.level.hero,function (porta, heroi){
            porta.game.time.events.add(250, function() {
                porta.game.state.start('finalLevel');
            }.bind(porta),porta);
        });
    }
    
}