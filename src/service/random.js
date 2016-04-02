angular.module('vx')
.service('$randomName', function ($random, $randomPluck) {
  var
  first  = ['Juan','Margaret','David','Jerry','Kathleen','Donna','Ruth','Roger','Gary','Andrew','Steven','Carol','Shirley','Jack','Cheryl','Joe','Heather','Gloria','Sharon','Ashley','Cynthia','Nancy','Jeffrey','Deborah','Stephanie','Martha','Virginia','Douglas','Mark','Jean','Carolyn','Raymond','Ann','Michael','Melissa','Stephen','Maria','Robert','John','Terry','Dorothy','Joseph','Kevin','Eric','Gregory','Michelle','Anthony','Peter','Ronald','Janet','Carl','Julie','Jonathan','Walter','Donald','Teresa','Amanda','Brian','Scott','Doris','Frank','Evelyn','Amy','Frances','Betty','George','Sarah','Jason','Christine','Anna','Jessica','Susan','Laura','Charles','Thomas','Paul','Timothy','Daniel','Brenda','Helen','Henry','Albert','Karen','Katherine','Linda','Lisa','Larry','Kenneth','Jose','Rebecca','Mary','Ryan','Marie','Christopher','Patrick','Richard','Sandra','Matthew','Diane','Edward','James','Arthur','Mildred','Jennifer','Justin','Harold','Barbara','Angela','Debra','Joyce','Joan','Alice','William','Dennis','Patricia','Kimberly','Catherine','Elizabeth','Pamela','Joshua','Judith'],
  middle = ['James','Daniel','Ruby','Paige','Lee','Jay','Henry','Belle','Anne','Thomas','Andrew','Alexander','Jade','William','Louise','Claire','Lily','Joseph','Elizabeth','Hope','Peter','Mary','Matthew','Charlotte','Christopher','May','Grace','Jane','John','Anthony','Michael','Kate','Jack','Marie','Oliver','Robert','Jean','David','Edward','Rose'],
  last   = ['Morgan','Rogers','Coleman','Rodriguez','Richardson','Brown','Nelson','Ruiz','Kelly','Price','Ross','Martin','Patterson','Sanders','Edwards','Kennedy','Marshall','Diaz','Ford','Chavez','Perez','Stewart','Robinson','Ward','Wood','Peterson','Turner','Lee','Wallace','Wells','Harrison','Jackson','Roberts','Howard','Garcia','Cox','Davis','Gonzales','Murray','Reed','Owens','Taylor','Mcdonald','Walker','Powell','White','Perry','Watson','Morris','Sanchez','Gibson','Ellis','Russell','Green','Foster','Hughes','Ramos','Simmons','Bell','Hernandez','Harris','Anderson','Sullivan','Thomas','Clark','Jenkins','Butler','Lopez','Myers','Evans','Mitchell','Torres','Nguyen','James','Bennett','Flores','Bryant','King','Lewis','Cook','Bailey','Hamilton','Wright','Gonzalez','Graham','Young','Long','Wilson','Martinez','Ortiz','Murphy','Cooper','Collins','Smith','Griffin','Carter','Gomez','Adams','Moore','Hayes','Hall','Cole','Henderson','Gray','Fisher','Williams','Kim','Barnes','Stevens','Parker','Jones','Brooks','Miller','Rivera','Thompson','West','Jordan','Gutierrez','Morales','Allen','Ramirez','Phillips','Scott','Johnson','Alexander','Hill','Cruz','Baker','Campbell','Reyes','Reynolds'];

  return function () {
    return {
      first:  $randomPluck(first),
      middle: $randomPluck(middle),
      last:   $randomPluck(last),
      birthday: new Date($random((new Date).getFullYear() - 80,(new Date).getFullYear(), 0),$random(0,11,0),$random(1,31,0),$random(0,23,0),$random(0,59,0),$random(0,59,0),$random(0,999,0)),
      toString: function () {
        return [this.first, this.middle, this.last].join(' ');
      }
    };
  };
})
.service('$randomEmail', function ($random, $randomName, $randomPluck) {
  var
  domain = ['aol.com','att.net','comcast.net','facebook.com','gmail.com','gmx.com','googlemail.com','google.com','hotmail.com','hotmail.co.uk','mac.com','me.com','mail.com','msn.com','live.com','sbcglobal.net','verizon.net','yahoo.com','yahoo.co.uk','email.com','games.com','gmx.net','hush.com','hushmail.com','icloud.com','inbox.com','lavabit.com','love.com','outlook.com','pobox.com','rocketmail.com','safe-mail.net','wow.com','ygm.com','ymail.com','zoho.com','fastmail.fm'];

  return function (name) {
    name = name || $randomName();

    name.domain   = $randomPluck(domain);
    name.username = String(name.last+'.'+name.first).toLowerCase() + '.' + name.birthday.getFullYear();

    // add a helper fn to build email if changes
    name.toEmail = name.toEmail || function () {
      return name.username+'@'+this.domain;
    };

    name.email = name.toEmail();

    return name;
  };
})
.service('$randomWords', function ($asNumber, $random, $clamp, $randomPluck) {
  var
  words = ['excite','short','silly','chivalrous','form','end','squalid','aback','salt','ratty','peep','board','day','letter','inexpensive','signal','queen','tire','regular','fantastic','plan','long','actor','toothpaste','descriptive','encouraging','occur','pump','idea','plausible','glossy','edge','public','breakable','wish','poison','comparison','deranged','bushes','glistening','hard','ready','abhorrent','sweet','multiply','young','hole','mighty','consider','respect','laborer','whirl','pies','float','tense','shape','wiry','calculator','channel','ancient','dream','magenta','sheet','soggy','ugly','nod','spotless','ossified','iron','creature','bleach','pin','snails','twig','condemned','observant','ink','vigorous','itch','phobic','guiltless','smelly','bottle','four','majestic','lowly','impartial','person','bite-sized','mass','hateful','parched','plastic','second-hand','spare','practise','industrious','straw','river','detailed','damaged','sweater','shut','oatmeal','found','hungry','robust','shake','overconfident','high','appear','daffy','scream','tree','yarn','trains','corn','frogs','pipe','amount','dirty','badge','pedal','chunky','straight','account','striped','sneaky','unbiased','mature','level','train','wander','crowded','jam','important','unpack','boil','terrify','fertile','quirky','weather','cake','bell','magnificent','angry','typical','jumpy','serve','scattered','horrible','obsequious','bait','pointless','awful','seashore','squirrel','tease','rotten','order','canvas','offer','evasive','trees','whole','silent','rescue','move','bag','jealous','fence','smoke','work','retire','trail','scintillating','dry','post','understood','addition','paste','labored','file','please','mice','snake','property','tent','dysfunctional','grateful','lace','curve','miss','scissors','wilderness','elite','mixed','greedy','noxious','towering'];

  return function (num) {
    return $randomPluck(words, $clamp($asNumber(num, $random(1, 5)), 1), true).join(' ');
  };
});
