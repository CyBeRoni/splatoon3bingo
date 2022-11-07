var bingoBoard = [];
var weaponsRolled = [];
var currentRandomWeapon = undefined;
var boardRNG;
var weaponRNG;

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

	// if the OBS dock is listening, send state.
	let showBoard = window.localStorage.showBoard;
	let showRandomizer = window.localStorage.showRandomizer;
	showHideBoard(showBoard === "true" || showBoard == undefined);
	showHideRandomizer(showRandomizer === "true" || showRandomizer == undefined);

	weaponRNG = new Math.seedrandom();

	// If we're in a browser rather than OBS, show the dock panel for controls.
	if (window.obsstudio == undefined){
		dock = document.createElement("iframe");
		dock.classList.add("dock")

		dock.src = "dock.html";
		document.body.appendChild(dock);
	}

}

var bingo = function(weaponMap, size, reseed, seed) {

	var SEED = getParam( 'seed' );

	if(SEED == undefined || SEED == "" || reseed) SEED = reseedPage(seed);

	boardRNG = new Math.seedrandom(parseInt(SEED)); //sets up the RNG

	// document.querySelector("#seedinfo").innerHTML = `Seed: ${SEED}`;

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
        var allWeaponsArray = [...weaponMap.values()].flat();
        var currentWeaponType;
        var mapOfWeaponTypesToFrequencyInBoard = new Map();
        var weaponTypesOnThisBoard = new Array(25);
        var retries;
        var foundAcceptableWeaponType;
        var thisBoardsWeapons = [];
        for (i=0; i<25; i++) {
            foundAcceptableWeaponType = false;
            retries = 200;
            do {
                var RNG = Math.floor(allWeaponsArray.length * boardRNG());
                if (RNG == allWeaponsArray.length) {
                    RNG--;
                }
                currentWeaponType = allWeaponsArray[RNG].types;
                if (currentWeaponType == undefined) {
                    console.log("Error weapon type undefined");
                }
                if (!mapOfWeaponTypesToFrequencyInBoard.has(currentWeaponType)
                    || mapOfWeaponTypesToFrequencyInBoard.get(currentWeaponType) < weaponMap.get(currentWeaponType).length) {
                    var bingoBoardIndex = i;
                    if (i == 0) {
                        bingoBoardIndex = 12; //The center square is always chosen first to prevent weird biasing issues
                    }
                    if (i == 12) {
                        bingoBoardIndex = 0; //Fill in the top left most square when we would otherwise have filled the center
                    }
                    if (avoidsDuplicatingTypesInRows(weaponTypesOnThisBoard, bingoBoardIndex, currentWeaponType)) {
                        weaponTypesOnThisBoard[bingoBoardIndex] = currentWeaponType;
                        mapOfWeaponTypesToFrequencyInBoard.set(currentWeaponType, mapOfWeaponTypesToFrequencyInBoard.get(currentWeaponType) + 1 || 1);
                        foundAcceptableWeaponType = true;
                    }
                }
                retries -=1;
            } while (!foundAcceptableWeaponType && retries >= 0);
        }
//        for (let [key, value] of mapOfWeaponTypesToFrequencyInBoard) {
//            console.log(key + ": " + value);
//        }
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
	    } while (weaponTypesOnThisBoard.includes(undefined));
        var thisBoardsWeapons = [];
        for (i=0; i<25; i++) {
            foundUnusedElement = false;
            retries = 50;
            do {
                var currentWeaponType = weaponTypesOnThisBoard.at(i);
                var currentWeaponTypeList = weaponMap.get(currentWeaponType);
                var RNG = Math.floor(currentWeaponTypeList.length * boardRNG());
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

	let showWeaponNames = window.localStorage.showWeaponNames === "true";

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

	// Crudely filter for weapons that are on the board
	if (window.localStorage.boardWeaponsOnly === "true"){
		result = result.filter(e => {
			return bingoBoard.find(el => { return el != undefined && el.name === e.name});
		});
	}

	// Crudely filter for duplicate weapons
	if (window.localStorage.noDuplicateWeapons === "true"){
		result = result.filter(el => {return el != undefined && !weaponsRolled.includes(el)});
	}

	return result;
}

function randomWeapon() {
    var currentObj, img, name, idx;
    var RNG;
    var allWeapons = getAllWeapons();

	if (allWeapons.length > 0){
		idx = Math.floor(allWeapons.length * weaponRNG());

		if (idx == allWeapons.length) { idx--; } //fix a miracle
		currentObj = allWeapons[idx];

		img = currentObj.image;
		name = currentObj.name;
		currentRandomWeapon = currentObj.name;
		setRandomWeapon(name, img);
		weaponsRolled.push(currentObj);
	} else {
		setRandomWeapon("sheldon");
	}
}


function resetRandomizer(cb){
	img = document.querySelector("#randomweapon_weapon img");
	img.src = "../img/unknownsplat1.png"
	if (cb !== undefined)
		onImageLoad(img, cb);
	document.querySelector("#randomweapon_bottomtext").innerHTML = "Unknown weapon…";
	document.querySelector("#randomweapon_middletext").innerHTML = "You'll be given an";
}

function setRandomWeapon(name, img){
	let randomizerWasHidden = window.localStorage.showRandomizer !== "true";
	let tl = gsap.timeline();
	let showIfHidden = true;
	let toptext = "Supplied Weapon"

	if (name == undefined){
		showIfHidden = false;
		toptext = "???"
		name = "Unknown weapon…";
		img = "../img/unknownsplat1.png";
		middletext = "You'll be given an";
	} else if (name == "sheldon"){
		img = "../img/sheldon.png";
		name = "Empty Hands!";
		toptext = "Out of stock"
		middletext = "You're left with";
	} else {
		name = name + "!";
		middletext = "You've been handed the";
	}

	if (randomizerWasHidden && showIfHidden){
		resetRandomizer(() => {
			showHideRandomizer(true);
			tl.delay(1);
			setTimeout(() => { showHideRandomizer(false)}, 10000);
		});

	}

	tl.to("#randomweapon_weapon, #randomweapon_bottomtext",
	  { opacity: 0, onComplete: () => {
			tl.pause();
			document.querySelector("#randomweapon_weapon img").src = img;
			onImageLoad(document.querySelector("#randomweapon_weapon img"), () => {
				tl.resume();
			});
			document.querySelector("#randomweapon_bottomtext").innerHTML = name;
			document.querySelector("#randomweapon_middletext").innerHTML = middletext;
			document.querySelector("#randomweapon_toptext").innerHTML = toptext;

	    }
	  })
	.set("#randomweapon_weapon", { scale: 0.5, rotation: 0 })
	.to("#randomweapon_weapon", { scale: 1, ease: "elastic.out(1, 0.3)", duration: 1.5})
	.to("#randomweapon_weapon", {opacity: 1, rotation: 0}, "<")
	.to("#randomweapon_bottomtext", {opacity: 1}, "<");
}

function setParam(paramName, val){
	const params = new URLSearchParams(location.search);
	params.set(paramName, val);
	window.history.replaceState({}, '', `${location.pathname}?${params.toString()}`);
}


function reseedBoardWithSeed(seed){
	clearBoard(seed);
}

function reseedPage(newSeed){
	if (newSeed == undefined)
		newSeed = Math.ceil(999999 * Math.random())
	setParam("seed", newSeed)
	window.localStorage.boardSeed = newSeed;

	return newSeed;
}

function setWeaponSeed(newSeed){
	if (newSeed != "")
		weaponRNG = new Math.seedrandom(parseInt(newSeed));
	else
		weaponRNG = new Math.seedrandom();
}


function clearBoard(seed){

	document.querySelectorAll(".redsquare, .greensquare").forEach(e => {
		e.classList.remove("redsquare");
		e.classList.remove("greensquare");
	})

	let showWeaponNames = window.localStorage.showWeaponNames === "true";

	gsap.timeline()
	.to(".slotweaponname", { opacity: 0, duration: showWeaponNames ? 0.25 : 0})
	.to(".slotcontent", { opacity: 0, duration: 0.5, scale: 0, stagger: { each: 0.05, grid: "auto", from: "center"},
		onComplete: function() {
			srl.bingo(weaponMap, 5, true, seed);
		}
	});
}

function showHideWeaponNames(show){
	console.log(show);
	gsap.to(".slotweaponname", {opacity: show ? 1 : 0});
}

function toggleWeaponNames(){
	let showWeaponNames = window.localStorage.showWeaponNames === "true";
	window.localStorage.showWeaponNames = !showWeaponNames;

	showHideWeaponNames(!showWeaponNames);
}

function showHideRandomizer(show){
	if (show){
		gsap.timeline().set("#randomweapon", {opacity: 0, scale: 0.7})
		.to("#randomweapon", {opacity: 1, duration: 0.4})
		.to("#randomweapon", {scale: 1.0, duration: 0.8, ease: "elastic.out(1, 0.3)"}, '<');
	} else {
		gsap.to("#randomweapon", {opacity: 0});
	}
}

function toggleRandomizer(){
	let showRandomizer = window.localStorage.showRandomizer === 'true'

	window.localStorage.showRandomizer = !showRandomizer;

	showHideRandomizer(!showRandomizer);
}

function showHideBoard(show){
	gsap.to("#results", {opacity: show? 1 : 0});

	if (window.localStorage.autoHideBoard === "true" && show){
		setTimeout(() => {
			// don't hide if the setting was disabled between the setTimeout() and now
			if (window.localStorage.autoHideBoard === "true") {
				showHideBoard(false);
				window.localStorage.showBoard = false;
			}
		}, 20000)
	}

}

function toggleBoard(){
	let showBoard = window.localStorage.showBoard === 'true'

	window.localStorage.showBoard = !showBoard;
	showHideBoard(!showBoard);
}

function resetUnknown(){
	resetRandomizer();
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

// Sync the visibility state of the randomizer and bingo board with
// the OBS dock
function checkVisibility(){
	// bc.postMessage({element: "board", visible: showBoard});
	//bc.postMessage({element: "randomizer", visible: showRandomizer});
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
		case 'checkVisibility':
			checkVisibility();
			break;
		case 'reseedBoardWithSeed':
			reseedBoardWithSeed(event.data.arg);
			break;
		case 'setWeaponSeed':
			setWeaponSeed(event.data.arg);
			break;
		case 'resetWeaponRolls':
			weaponsRolled = [];
			break;
	}
}

function setStorageCallback(key, cb){
	window.addEventListener('storage', (e) => {
		if (e.key === key)
			cb(e);
	})
}

setStorageCallback("showBoard", (e) => {
	showHideBoard(e.newValue === "true");
})

setStorageCallback("showRandomizer", (e) => {
	showHideRandomizer(e.newValue === "true");
});

setStorageCallback("showWeaponNames", (e) => {
	showHideWeaponNames(e.newValue === "true");
});

function onImageLoad(elem, cb){
    if (elem.complete){
        cb();
    } else {
       elem.decode().then(cb);
    }
}


// Backwards Compatability
var srl = { bingo:bingo };
