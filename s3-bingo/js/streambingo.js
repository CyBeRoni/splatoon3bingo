"use strict";

var currentRandomWeapon = undefined;
var board;
var weapons;

const bc = new BroadcastChannel("s3-bingo");

// Pre-load sounds
const rouletteSound = new Audio("../sound/roulette_mixdown2.wav");
const newWeaponSound = new Audio("../sound/ShopLyt_BuyDecide.wav");
const reRollSound = new Audio("../sound/ShrLyt_InkResetting.wav");

function getParam(name){
	const urlParams = new URLSearchParams(window.location.search);
	return urlParams.get(name);
}

function setup(){

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

	// Re-apply state
	let showBoard = window.localStorage.showBoard;
	let showRandomizer = window.localStorage.showRandomizer;
	let smallBoard = window.localStorage.smallBoard;
	let seethroughBoard = window.localStorage.setseethroughBoard;

	showHideBoard(showBoard === "true" || showBoard == undefined);
	showHideRandomizer(showRandomizer === "true" || showRandomizer == undefined);
	setSmallBoard(smallBoard === "true", true);
	setseethroughBoard(seethroughBoard === "true")

	// If we're in a browser rather than OBS, show the dock panel for controls.
	if (window.obsstudio == undefined){
		const dock = document.createElement("iframe");
		dock.classList.add("dock")

		dock.src = "dock.html";
		document.body.appendChild(dock);
	}

	board = generateBoard(undefined, undefined, false);
	weapons = generateWeapons();

	// Enable clicking squares to mark green or red
	document.querySelectorAll("td.slot").forEach(elem => {
		elem.addEventListener('click', (event) => {
			let e = event.currentTarget;

			if (!e.classList.contains("greensquare") && !e.classList.contains("redsquare")){
				e.classList.add("greensquare");
			} else if (e.classList.contains("greensquare")){
				e.classList.remove("greensquare");
				e.classList.add("redsquare");
			} else {
				e.classList.remove("redsquare")
			}
		});
	});

}

function generateWeapons(seed, boardOnly = false, noDuplicateWeapons = false){
	let ignoreSeed = false; // Always use the seed we give

	if (!seed){
		let weaponRNG = new Math.seedrandom();
		seed = Math.ceil(999999 * weaponRNG())
		console.log("generated new weapon seed:", seed);
	}

	window.localStorage.weaponSeed = seed;

	let wr = new WeaponRandomizer(board, `${seed}`, !boardOnly, !noDuplicateWeapons, ignoreSeed);

	return wr;
}

function generateBoard(reseed, seed, sound = true){
	console.log('seed: ', seed);
	var SEED = getParam('seed');

	if(SEED == undefined || SEED == "" || reseed) SEED = reseedPage(seed);

	let board = new BingoBoard(weaponMap, `${SEED}`, true);
	let bingoBoard = board.getBoard();

	let showWeaponNames = window.localStorage.showWeaponNames === "true";

	gsap.timeline()
	.set(".slotcontent", {onComplete: function(){
		this.targets().forEach(e => {
			let i = parseInt(e.dataset.index) - 1;
			e.dataset.weapon = bingoBoard[i].name;
			e.querySelector(".slotweaponimage").innerHTML = `<img src=${bingoBoard[i].image}>`;
			e.querySelector(".slotweaponname").innerHTML = bingoBoard[i].name;
		});
	}})
	.set(".slotcontent", { opacity: 0, scale: 0})
	.set(".slotweaponname", { opacity: 0, onComplete: () => {
		if (sound) reRollSound.play();
	}})	.to(".slotcontent", {duration: 0.5, opacity: 1, stagger: {
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

	return board;

}

function randomWeapon() {
	let weapon = weapons.nextWeapon();

	if (weapon){
		setRandomWeapon(weapon.name, weapon.image);
		currentRandomWeapon = weapon;
	} else {
		setRandomWeapon("sheldon");
	}
}

function resetRandomizer(cb){
	let img = document.querySelector("#randomweapon_weapon img");
	img.src = "../img/unknownsplat1.png"
	if (cb !== undefined)
		onImageLoad(img, cb);
	document.querySelector("#randomweapon_bottomtext").innerHTML = "Unknown weapon…";
	document.querySelector("#randomweapon_middletext").innerHTML = "You'll be given an";
}

function setRandomWeapon(name, img){
	let randomizerWasHidden = window.localStorage.showRandomizer != undefined && !(window.localStorage.showRandomizer === "true");
	let tl = gsap.timeline();
	let showIfHidden = true;
	let toptext = "Supplied Weapon";
	let middletext;

	if (name == undefined){
		showIfHidden = false;
		toptext = "???"
		middletext = "You'll be given an";
		name = "Unknown weapon…";
		img = "../img/unknownsplat1.png";
	} else if (name == "sheldon"){
		img = "../img/sheldon.png";
		toptext = "Out of stock"
		middletext = "You're left with";
		name = "Empty Hands!";
	} else {
		name = name + "!";
		middletext = "You've been handed the";
	}
	if (randomizerWasHidden && showIfHidden){
		resetRandomizer(() => {
			showHideRandomizer(true);
			rouletteSound.play();
			tl.delay(1.2);
			setTimeout(() => { showHideRandomizer(false)}, 10000);
		});

	} else {
		newWeaponSound.play();
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
	console.log("reseed board with seed", seed)
	clearBoard(seed);
}

function reseedPage(newSeed){
	if (newSeed == undefined){
		let boardRNG = new Math.seedrandom();
		newSeed = Math.ceil(999999 * boardRNG());
		console.log("New seed: ", newSeed);
	}
	setParam("seed", newSeed)
	window.localStorage.boardSeed = newSeed;

	return newSeed;
}

function setWeaponSeed(newSeed){
	let boardWeaponsOnly = window.localStorage.boardWeaponsOnly === "true"; // default false
	let noDuplicateWeapons = window.localStorage.noDuplicateWeapons === "true" // default false

	console.log("weapons seed to", newSeed, boardWeaponsOnly, noDuplicateWeapons);
	weapons = generateWeapons(newSeed, boardWeaponsOnly, noDuplicateWeapons);
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
			generateBoard(true, seed);
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

function setSmallBoard(val, instant){
	let scale = 1;
	let originLR = "right";
	let originTB = "top";
	let animate = gsap.to;

	let table = document.querySelector("#results");
	let pos = table.getBoundingClientRect();
	let bodysize = document.body.getBoundingClientRect();

	if (pos.x + (pos.width / 2) < bodysize.width / 2){
		originLR = 'left';
	}
	if (pos.y + (pos.height / 2) > bodysize.height / 2){
		originTB = "bottom"
	}
	if (val)
		scale = 0.5;
	if (instant)
		animate = gsap.set;

	let origin = `${originTB} ${originLR}`;
	animate("#results", {scale: scale, transformOrigin: origin});
}

function setseethroughBoard(val, instant){
	let animate = gsap.to;
	let background = "rgba(0,0,0,1)";

	if (val)
		background = "rgba(0,0,0,0.75)";

	if (instant)
		animate = gsap.set;

	//animate("#bingo tr td", { backgroundColor: background});
	animate("td.slot", { opacity: val ? 0.75 : 1})
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
	if (!weapon)
		return undefined;

	let elems = Array.from(document.querySelectorAll(".slotcontent"));

	return elems.find(e => { return e.dataset.weapon == weapon.name});
}

function setGreen(){
	let elem = findTileForWeapon(currentRandomWeapon);
	if (! elem)
		return;

	elem.parentElement.classList.remove("redsquare");
	elem.parentElement.classList.add("greensquare");
}

function setRed(){
	let elem = findTileForWeapon(currentRandomWeapon);

	if (! elem)
		return;

		elem.parentElement.classList.remove("greensquare");
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
		case 'setGreen':
			setGreen();
			break;
		case 'setRed':
			setRed();
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
		case 'resetWeaponSeed':
			setWeaponSeed();
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

setStorageCallback("smallBoard", (e) => {
	setSmallBoard(e.newValue === "true");
});

setStorageCallback("seethroughBoard", (e) => {
	setseethroughBoard(e.newValue === "true");
});

function onImageLoad(elem, cb){
    if (elem.complete){
        cb();
    } else {
       elem.decode().then(cb);
    }
}

