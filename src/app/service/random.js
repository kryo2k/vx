angular.module('coordinate-vx')
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
  words = ['edacious','galactometer','barbette','halcyonine','cachet','echinuliform','calando','edapha','caducary','jackyard','ecliptic','faburden','balanism','ichneutic','halfpace','baculine','palaeolimnology','bandolier','famicide','caespitose','edaphic','jade','facultative','barathea','halieutic','decalcomania','cabré','handfast','palaeogeography','effigurate','barege','factive','bahuvrihi','ecophobia','ectogenesis','hame','fabulist','barbiton','icaco','cacoethes','ablepsia','caesaropapism','dation','aasvogel','ecbole','caddis','balustrade','hanap','falsidical','ichthyophagous','factious','debouchure','falanouc','pais','halitus','caisson','factitive','danism','calefacient','dactylography','palanquin','halophilous','fagin','dapocaginous','fandango','calathus','bardel','falcade','haemathermal','ichnogram','ecdemic','falconine','gal','cacidrosis','gallimaufry','ebullition','debellate','paizogony','abecedarian','hamarchy','baculiform','iatrophobia','caboose','palafitte','gallomania','fain','balneology','baetyl','galactophorous','balmorality','faldstool','gambrel','abarticular','cacography','dacnomania','face','baisemain','galère','calamanco','iatramelia','gallophile','darby','palaeogaea','ichnography','decarchy','ecaudate','barathrum','balanoid','effulge','ichthyophile','fanal','fane','cabas','hallux','jacquard','cacuminal','halation','gallipot','dapifer','dactylogram','jamb','calciform','davit','ecesis','deaconing','galliard','eclipsis','abigail','eccoprotic','gaita','hagiography','hamshackle','deadhouse','davenport','echinate','damnification','cabochon','iatrology','famigerate','ichthyic','cacogen','banteng','ichnology','gallize','galactophagist','barbarocracy','barbet','halyard','caducity','galop','ecbolic','effleurage','abear','eclat','baedeker','caitiff','ecclesiography','calender','palative','ecclesiolatry','cacodoxy','calcifuge','calamist','banjolin','gabelle','efferent','ecydisis','janitrix','fanfaron','galilee','cachaemic','galactic','ichnomancy','echidna','darcy','baculus','palaceous','gabbart','hakenkreuz','abdominous','caduceator','cable','falcate','balzarine','backstay','galvanoscope','fantigue','jalousie','darkle','effutiation','jaconet','cachalot','ballistophobia','galvanometer','bar','palaeography','gabion','palaeophile','damine','haliography','barbican','debouch','damascene','bargemaster','eccaleobion','janiform','dasypoedes','abiotrophy','cachinnate','falsiloquence','daphnomancy','ecclesiastry','dealate','echoism','jacu','ectobatic','gad','ecophene','calcine','paideutic','abeam','fagottist','calcariferous','abiectic','iatraliptic','bandore','decantate','calefactory','gambroon','banausic','hackle','eclipsareon','economacy','fairlead','eburnean','barbate','dalmatic','galbanum','damson','abature','balneography','eclaircise','ichthyoid','palaestra','echard','bacciform','cakewalk','debel','echopraxia','ectypography','palaeoclimatology','ecbatic','palaeobiology','balderdash','cabotage','falderal','calcariform','palabra','caconym','gallicide','cachepot','bacillicide','ichthyolatry','backpiece','damoiseau','cacaesthesia','hagiolatry','edh','dag','eclosion','daw','galloon','ecarlate','haematogenesis','ballaster','banquette','jactitation','dap','gallophobia','aberuncators'];

  return function (num) {
    return $randomPluck(words, $clamp($asNumber(num, $random(1, 5)), 1), true).join(' ');
  };
});
