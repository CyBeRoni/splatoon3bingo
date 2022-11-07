var bingoBoard = [];
var showWeaponNames = false;
var showRandomizer = true;
var showBoard = true;
var currentRandomWeapon = undefined;

const bc = new BroadcastChannel("s3-bingo");

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

	var SEED = getParam( 'seed' );
	var MODE = getParam( 'mode' );

	if(SEED == undefined || SEED == "" || reseed) SEED = reseedPage();

	if (typeof size == 'undefined') size = 5;

	Math.seedrandom(SEED); //sets up the RNG

	document.querySelector("#seedinfo").innerHTML = `Seed: ${SEED}`;

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

	//populate the bingo board
    var generatedCard = generateBingoBoard();
    for (i=0; i<25; i++) {
        currentObj = generatedCard[i];

        bingoBoard[i+1] = { name: currentObj.name, image: currentObj.image };
    }

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

	if (document.getElementById("randomIgnore").checked === true) {
        document.getElementById("randomObey").disabled = true;
        Math.seedrandom();
        idx = Math.floor(allWeapons.length * Math.random()); //should be total chaos in random assignment
    } else {
        document.getElementById("randomIgnore").disabled = true;
        idx = Math.floor(allWeapons.length * Math.random()); //should preserve seed order
    }

	if (idx == allWeapons.length) { idx--; } //fix a miracle
    currentObj = allWeapons[idx];

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

function clearBoard(){

	document.querySelectorAll(".redsquare, .greensquare").forEach(e => {
		e.classList.remove("redsquare");
		e.classList.remove("greensquare");
	})

	gsap.timeline()
	.to(".slotweaponname", { opacity: 0, duration: showWeaponNames ? 0.25 : 0})
	.to(".slotcontent", { opacity: 0, duration: 0.5, scale: 0, stagger: { each: 0.05, grid: "auto", from: "center"},
		onComplete: function() {
			srl.bingo(weaponMap, 5, true);
		}
	});
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

bc.onmessage = (event) => {
	switch(event.data.function){
		case 'clearBoard':
			clearBoard();
			break;
		case 'toggleRandomizer':
			toggleRandomizer();
			break;
		case 'toggleBoard':
			toggleBoard();
			break;
		case 'randomWeapon':
			randomWeapon();
			break;
		case 'resetUnknown':
			resetUnknown();
			break;
		case 'win':
			win();
			break;
		case 'loss':
			loss();
			break;
	}
};


// Backwards Compatability
var srl = { bingo:bingo };
