var bingoBoard = [];
var showWeaponNames = false;
var showRandomizer = true;
var showBoard = true;
var currentRandomWeapon = undefined;

function getParam(name){
	const urlParams = new URLSearchParams(window.location.search);
	return urlParams.get(name);
}

function setupBoard(){
	$("#bingo tr td:not(.popout), #selected td").toggle(
		function () { $(this).addClass("greensquare"); },
		function () { $(this).addClass("redsquare").removeClass("greensquare"); },
		function () { $(this).removeClass("redsquare"); }
	);

	let bpos = getParam("b");
	let wpos = getParam("w");
	let spos = getParam("s");
	if (bpos){
		let [bposx, bposy] = bpos.split(",");
		gsap.set("#results", { x: bposx, y: bposy});
	}

	if (spos){
		let [sposx, sposy] = spos.split(",");
		gsap.set("#about_bingo", { x: sposx, y: sposy});
	}

	if (wpos){
		let [wposx, wposy] = wpos.split(",");
		gsap.set("#randomweapon", { x: wposx, y: wposy});
	}

}

var bingo = function(weaponMap, size, reseed) {

	var LANG = getParam( 'lang' );
	if (LANG == '') LANG = 'name';
	var SEED = getParam( 'seed' );
	var MODE = getParam( 'mode' );

	if(SEED == undefined  || SEED == "" || reseed) SEED = reseedPage();
	var cardtype = "Normal";

	if (typeof size == 'undefined') size = 5;

	Math.seedrandom(SEED); //sets up the RNG
	var MAX_SEED = 999999; //1 million cards
	var results = $("#results");
	//results.append ("<p>Splatoon 3 Weapons Bingo <strong>v2</strong>&emsp;Seed: <strong>" + SEED + "</strong>");
	document.querySelector("#seedinfo").innerHTML = `Seed: ${SEED}`;

	var noTypeCount = 0;

	var lineCheckList = [];

	if (size == 5) {
		lineCheckList[1]  = [1,2,3,4,5,10,15,20,6,12,18,24];
		lineCheckList[2]  = [0,2,3,4,6,11,16,21];
		lineCheckList[3]  = [0,1,3,4,7,12,17,22];
		lineCheckList[4]  = [0,1,2,4,8,13,18,23];
		lineCheckList[5]  = [0,1,2,3,8,12,16,20,9,14,19,24];

		lineCheckList[6]  = [0,10,15,20,6,7,8,9];
		lineCheckList[7]  = [0,12,18,24,5,7,8,9,1,11,16,21];
		lineCheckList[8]  = [5,6,8,9,2,12,17,22];
		lineCheckList[9]  = [4,12,16,20,9,7,6,5,3,13,18,23];
		lineCheckList[10]  = [4,14,19,24,8,7,6,5];

		lineCheckList[11] = [0,5,15,20,11,12,13,14];
		lineCheckList[12] = [1,6,16,21,10,12,13,14];
		lineCheckList[13] = [0,6,12,18,24,20,16,8,4,2,7,17,22,10,11,13,14];
		lineCheckList[14] = [3,8,18,23,10,11,12,14];
		lineCheckList[15] = [4,9,19,24,10,11,12,13];

		lineCheckList[16] = [0,5,10,20,16,17,18,19];
		lineCheckList[17] = [15,17,18,19,1,6,11,21,20,12,8,4];
		lineCheckList[18] = [15,16,18,19,2,7,12,22];
		lineCheckList[19] = [15,16,17,19,23,13,8,3,24,12,6,0];
		lineCheckList[20] = [4,9,14,24,15,16,17,18];

		lineCheckList[21] = [0,5,10,15,16,12,8,4,21,22,23,24];
		lineCheckList[22] = [20,22,23,24,1,6,11,16];
		lineCheckList[23] = [2,7,12,17,20,21,23,24];
		lineCheckList[24] = [20,21,22,24,3,8,13,18];
		lineCheckList[25] = [0,6,12,18,20,21,22,23,19,14,9,4];
	}





	$("#row1").hover(function() { $(".row1").addClass("hover"); }, function() {	$(".row1").removeClass("hover"); });
	$("#row2").hover(function() { $(".row2").addClass("hover"); }, function() {	$(".row2").removeClass("hover"); });
	$("#row3").hover(function() { $(".row3").addClass("hover"); }, function() {	$(".row3").removeClass("hover"); });
	$("#row4").hover(function() { $(".row4").addClass("hover"); }, function() {	$(".row4").removeClass("hover"); });
	$("#row5").hover(function() { $(".row5").addClass("hover"); }, function() {	$(".row5").removeClass("hover"); });

	$("#col1").hover(function() { $(".col1").addClass("hover"); }, function() {	$(".col1").removeClass("hover"); });
	$("#col2").hover(function() { $(".col2").addClass("hover"); }, function() {	$(".col2").removeClass("hover"); });
	$("#col3").hover(function() { $(".col3").addClass("hover"); }, function() {	$(".col3").removeClass("hover"); });
	$("#col4").hover(function() { $(".col4").addClass("hover"); }, function() {	$(".col4").removeClass("hover"); });
	$("#col5").hover(function() { $(".col5").addClass("hover"); }, function() {	$(".col5").removeClass("hover"); });

	$("#tlbr").hover(function() { $(".tlbr").addClass("hover"); }, function() {	$(".tlbr").removeClass("hover"); });
	$("#bltr").hover(function() { $(".bltr").addClass("hover"); }, function() {	$(".bltr").removeClass("hover"); });

	function mirror(i) {
		if      (i == 0) { i = 4; }
		else if (i == 1) { i = 3; }
		else if (i == 3) { i = 1; }
		else if (i == 4) { i = 0; }
		return i;
	}

	function difficulty(i) {
		// To create the magic square we need 2 random orderings of the numbers 0, 1, 2, 3, 4.
		// The following creates those orderings and calls them Table5 and Table1

		var Num3 = SEED%1000;	// Table5 will use the ones, tens, and hundreds digits.

		var Rem8 = Num3%8;
		var Rem4 = Math.floor(Rem8/2);
		var Rem2 = Rem8%2;
		var Rem5 = Num3%5;
		var Rem3 = Num3%3;	// Note that Rem2, Rem3, Rem4, and Rem5 are mathematically independent.
		var RemT = Math.floor(Num3/120);	// This is between 0 and 8

		// The idea is to begin with an array containing a single number, 0.
		// Each number 1 through 4 is added in a random spot in the array's current size.
		// The result - the numbers 0 to 4 are in the array in a random (and uniform) order.
		var Table5 = [0];
		Table5.splice(Rem2, 0, 1);
		Table5.splice(Rem3, 0, 2);
		Table5.splice(Rem4, 0, 3);
		Table5.splice(Rem5, 0, 4);

		Num3 = Math.floor(SEED/1000);	// Table1 will use the next 3 digits.
		Num3 = Num3%1000;

		Rem8 = Num3%8;
		Rem4 = Math.floor(Rem8/2);
		Rem2 = Rem8%2;
		Rem5 = Num3%5;
		Rem3 = Num3%3;
		RemT = RemT * 8 + Math.floor(Num3/120);	 // This is between 0 and 64.

		var Table1 = [0];
		Table1.splice(Rem2, 0, 1);
		Table1.splice(Rem3, 0, 2);
		Table1.splice(Rem4, 0, 3);
		Table1.splice(Rem5, 0, 4);

		i--;
		RemT = RemT%5;		//  Between 0 and 4, fairly uniformly.
		x = (i+RemT)%5;		//  RemT is horizontal shift to put any diagonal on the main diagonal.
		y = Math.floor(i/5);

		// The Tables are set into a single magic square template
		// Some are the same up to some rotation, reflection, or row permutation.
		// However, all genuinely different magic squares can arise in this fashion.
		var e5 = Table5[(x + 3*y)%5];
		var e1 = Table1[(3*x + y)%5];

		// Table5 controls the 5* part and Table1 controls the 1* part.
		value = 5*e5 + e1;

        value++;
		return value;
	}

	function isDuplicateType (myBoard, i, currentWeapon) {
        if(myBoard[i] !== undefined && myBoard[i] == currentWeapon) {
            return true;
        }
        return false;
	}

	function avoidsDuplicatingTypesInRows (myBoardArray, i, currentWeapon) {
	    var i;
	    var row = Math.floor(i/5);
	    var col = i % 5;
	    var isTLBR = (i % 6) == 0;
	    var isBLTR = (i % 4) == 0 && i > 0;
	    //if row contains same type, return false
	    for (var x=0+(5*row); x < 5+(5*row); x++) {
	        i = x;
	        if(isDuplicateType(myBoardArray, i, currentWeapon)) {
	            return false;
	        }
	    }
        //if column contains same type, return false
	    for (var y=0; y<5; y++) {
	        i = col + 5*y;
	        if(isDuplicateType(myBoardArray, i, currentWeapon)) {
	            return false;
	        }
	    }
	    //if isTLBR and TLBR contains same type, return false
	    if (isTLBR) {
	        var indices = [0, 6, 12, 18, 24];
	        for (index in indices) {
	            i = indices[index];
                if(isDuplicateType(myBoardArray, i, currentWeapon)) {
                    return false;
                }
	        }
	    }
	    //if isBLTR and BLTR contains same type, return false
	    if (isBLTR) {
            var indices = [4, 8, 12, 16, 20];
            for (index in indices) {
                i = indices[index];
                if(isDuplicateType(myBoardArray, i, currentWeapon)) {
                    return false;
                }
            }
	    }
	    return true;
	}

    function getArrayOfWeaponTypesForBoard() {
        var weaponTypes = Array.from(weaponMap.keys());
        var currentWeaponType;
        var mapOfWeaponTypesToFrequencyInBoard = new Map();
        var weaponTypesOnThisBoard = [];
        var retries;
        var foundAcceptableWeaponType;
        var thisBoardsWeapons = [];
        for (i=0; i<25; i++) {
            var tempWeaponTypes = weaponTypes.map((x) => x);
            foundAcceptableWeaponType = false;
            retries = 15;
            do {
                var RNG = Math.floor(tempWeaponTypes.length * Math.random());
                if (RNG == tempWeaponTypes.length) {
                    RNG--;
                }
                currentWeaponType = tempWeaponTypes[RNG];
                if (currentWeaponType == undefined) {
                    console.log("Error weapon type undefined");
                }
                if (!mapOfWeaponTypesToFrequencyInBoard.has(currentWeaponType)
                    || mapOfWeaponTypesToFrequencyInBoard.get(currentWeaponType) < weaponMap.get(currentWeaponType).length) {
                    if (avoidsDuplicatingTypesInRows(weaponTypesOnThisBoard, i, currentWeaponType)) {
                        weaponTypesOnThisBoard.push(currentWeaponType);
                        mapOfWeaponTypesToFrequencyInBoard.set(currentWeaponType, mapOfWeaponTypesToFrequencyInBoard.get(currentWeaponType) + 1 || 1);
                        foundAcceptableWeaponType = true;
                    }
                }
                tempWeaponTypes = tempWeaponTypes.filter(function(value) {
                    return value != currentWeaponType;
                });
                retries -=1;
            } while (!foundAcceptableWeaponType && tempWeaponTypes.length > 0);
        }
        if (weaponTypesOnThisBoard.length < 25) {
            console.log("error unable to generate card");
            //break;
        }
        return weaponTypesOnThisBoard;
    }

	function generateBingoBoard() {
	    var weaponTypesOnThisBoard;
	    do {
	        weaponTypesOnThisBoard = getArrayOfWeaponTypesForBoard();
	    } while (weaponTypesOnThisBoard.length < 25);
        var thisBoardsWeapons = [];
        for (i=0; i<25; i++) {
            foundUnusedElement = false;
            retries = 50;
            do {
                var currentWeaponType = weaponTypesOnThisBoard[i];
                var currentWeaponTypeList = weaponMap.get(currentWeaponType);
                var RNG = Math.floor(currentWeaponTypeList.length * Math.random());
                if (RNG == currentWeaponTypeList.length) {
                    RNG--;
                }
                var currentObj = currentWeaponTypeList[RNG];
                if (!thisBoardsWeapons.includes(currentWeaponTypeList[RNG])) {
                    thisBoardsWeapons.push(currentWeaponTypeList[RNG]);
                    var remainingWeapons = currentWeaponTypeList.filter(function(value) {
                        return value != currentWeaponType;
                    });
                    weaponMap.set(currentWeaponType, remainingWeapons)
                    foundUnusedElement = true;
                } else {
                    retries--;
                }
            } while (!foundUnusedElement && retries > 0);
            if (retries <= 0) {
                break;
            }
        }
        return thisBoardsWeapons;
	}

	for (var i=1;i<=25;i++) {
        bingoBoard[i] = {difficulty: 1}; //set it to 1 because we are expecting all elements to be in bingoList[1]
	}

	//populate the bingo board
    var generatedCard = generateBingoBoard();
    for (i=0; i<25; i++) {
        currentObj = generatedCard[i];
//            bingoBoard[i].types = currentObj.value.types;
//            bingoBoard[i].synergy = currentObj.synergy;
        bingoBoard[i+1].name = currentObj.name;
        bingoBoard[i+1].image = currentObj.image;
    }

	//populate the actual table on the page
	// for (i=1; i<=25; i++) {
	//   $('#slot'+i).append("<image width=70px height=70px src=" + bingoBoard[i].image + ">");
	//   $('#slot'+i).append(bingoBoard[i].name);
	// }

	gsap.timeline()
	.set(".slotcontent", {onComplete: function(){
		this.targets().forEach(e => {
			let i = e.dataset.index;
			e.dataset.weapon = bingoBoard[i].name;
			e.querySelector(".slotweaponimage").innerHTML = `<img src=${bingoBoard[i].image}>`;
			e.querySelector(".slotweaponname").innerHTML = bingoBoard[i].name;
		});
	}})
	.set(".slotcontent", { opacity: 0, scale: 0})
	.set(".slotweaponname", { opacity: 0})
	.to(".slotcontent", {duration: 0.5, opacity: 1, stagger: {
		each: 0.05,
		grid: "auto",
		from: "center"
	} })
	.to(".slotcontent", {duration: 1.0, scale: 1, ease: "back.out(3)", stagger: {
		each: 0.05,
		grid: "auto",
		from: "center"
	} }, "<")
	.to(".slotweaponname", { opacity: showWeaponNames?1:0});

	return true;
}; // setup

function refreshBoard(showNames) {
    for (i=1; i<=25; i++) {
      document.getElementById("slot" + i).innerHTML = "";

      if (showNames) {
        $('#slot'+i).append("<image width=70px height=70px src=" + bingoBoard[i].image + ">");
        $('#slot'+i).append(bingoBoard[i].name);
      } else {
        $('#slot'+i).append("<image src=" + bingoBoard[i].image + ">");
      }
    }
}

function getAllWeapons() {
    var result = [];
    var mapKeys = Array.from(weaponMap.keys());
    for (key in mapKeys) {
        var value = weaponMap.get(mapKeys[key]);
        for (val in value) {
            result.push(value[val]);
        }
    }
    return result;
}

function randomWeapon() {
    var currentObj, img, name, idx;
    var RNG;
    var allWeapons = getAllWeapons();
    // console.log(allWeapons);
    if (document.getElementById("randomIgnore").checked === true) {
        document.getElementById("randomObey").disabled = true;
        Math.seedrandom();
        idx = Math.floor(allWeapons.length * Math.random()); //should be total chaos in random assignment
    } else {
        document.getElementById("randomIgnore").disabled = true;
        idx = Math.floor(allWeapons.length * Math.random()); //should preserve seed order
    }
    // console.log(idx);
    if (idx == allWeapons.length) { idx--; } //fix a miracle
    currentObj = allWeapons[idx];
    // console.log("currentobj is :" + currentObj);
    img = currentObj.image;
    name = currentObj.name;
	currentRandomWeapon = currentObj.name;
	setRandomWeapon(name, img);
}


function setRandomWeapon(name, img){
	let randomizerWasHidden = !showRandomizer;
	let tl = gsap.timeline();

	if (name == undefined){
		name = "Unknown weapon…";
		img = "../img/unknownsplat1.png";
		middletext = "You'll be given an";
	} else {
		name = name + "!";
		middletext = "You've been handed the";
	}

	tl.to("#randomweapon_weapon, #randomweapon_bottomtext",
	  { opacity: 0, onComplete: () => {
			document.querySelector("#randomweapon_weapon img").src = img;
			document.querySelector("#randomweapon_bottomtext").innerHTML = name;
			if (randomizerWasHidden){
				showHideRandomizer(true);
			}
	    }
	  })

	.set("#randomweapon_weapon", { scale: 0.5 })
	.to("#randomweapon_weapon", { scale: 1, opacity: 1, ease: "elastic.out(1, 0.3)", duration: 1.5})
	.to("#randomweapon_bottomtext", {opacity: 1}, "<");
	document.querySelector("#randomweapon_middletext").innerHTML = middletext;

	if (randomizerWasHidden){
		setTimeout(() => { showHideRandomizer(false)}, 10000);
	}

}

// function reseedPage() {
// 	var qSeed = "?seed=" + Math.ceil(999999 * Math.random());
// 	window.location = qSeed;
// 	return false;
// }

function setParam(paramName, val){
	const params = new URLSearchParams(location.search);
	params.set(paramName, val);
	window.history.replaceState({}, '', `${location.pathname}?${params.toString()}`);
}

function reseedPage(){
	const newSeed = Math.ceil(999999 * Math.random())
	setParam("seed", newSeed)

	return newSeed;
}

function clearSlot(slot){
	slot.querySelectorAll("div").forEach(e => { e.innerHTML = "?" });
}

function clearBoard(){
	gsap.timeline()
	.to(".slotweaponname", { opacity: 0, duration: showWeaponNames ? 0.25 : 0})
	.to(".slotcontent", { opacity: 0, duration: 0.5, scale: 0, stagger: { each: 0.05, grid: "auto", from: "center"},
	onComplete: function() {
		document.querySelectorAll(".redsquare, .greensquare").forEach(e => {
			e.classList.remove("redsquare");
			e.classList.remove("greensquare");
		})
		this.targets().forEach(e => clearSlot(e));
		srl.bingo(weaponMap, 5, true);
	}})
}

function toggleWeaponNames(){
	showWeaponNames = !showWeaponNames;
	gsap.to(".slotweaponname", {opacity: showWeaponNames ? 1 : 0});
}

function showHideRandomizer(show){
	showRandomizer = show;
	if (show){
		gsap.timeline().set("#randomweapon", {opacity: 0, scale: 0.7})
		.to("#randomweapon", {opacity: 1, duration: 0.4})
		.to("#randomweapon", {scale: 1.0, duration: 0.8, ease: "elastic.out(1, 0.3)"}, '<');
	} else {
		gsap.to("#randomweapon", {opacity: 0});
	}
}

function toggleRandomizer(){
	showHideRandomizer(!showRandomizer);
}

function toggleBoard(){
	showBoard = !showBoard;
	gsap.to("#results", {opacity: showBoard? 1 : 0});
}

function resetUnknown(){
	setRandomWeapon();
}

function dragEnd(e){
	setParam(e, `${this.x},${this.y}`);
}

function findTileForWeapon(weapon){
	elems = Array.from(document.querySelectorAll(".slotcontent"));

	return elems.find(e => { return e.dataset.weapon == weapon});
}

function win(){
	elem = findTileForWeapon(currentRandomWeapon);
	if (! elem)
		return;

	elem.parentElement.classList.remove("redsquare");
	elem.parentElement.classList.add("greensquare");
}

function loss(){
	elem = findTileForWeapon(currentRandomWeapon);

	if (! elem)
		return;

	if (! elem.parentElement.classList.contains("greensquare"))
		elem.parentElement.classList.add("redsquare");
}

// Backwards Compatability
var srl = { bingo:bingo };
