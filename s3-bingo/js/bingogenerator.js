/*

Example:

// Set up a new BingoBoard instance with weapons and a random number generator function
bb = new BingoBoard(weaponMap, new Math.seedrandom(1));
console.log(bb.generateBingoBoard());

Result: [{name: "Ballpoint Splatling", image: "../weapons/004.png", types: "Splatling"}, {etc. * 24}]

// Reseed the rng of an existing instance
bb.boardRNG = new Math.seedrandom(2);
console.log(bb.generateBingoBoard());

Result: [{name: "Sloshing Machine", image: "../weapons/038.png", types: "Slosher"}, {etc. * 24}]

*/

class BingoBoard {
    constructor(weaponMap, boardRNG){
        this.weaponMap = weaponMap;
        if (boardRNG !== undefined)
            this.boardRNG = boardRNG;
        else
            this.boardRNG = Math.random;
    }

    #isDuplicateType (myBoard, i, currentWeapon) {
        if(myBoard[i] !== undefined && myBoard[i] == currentWeapon) {
            return true;
        }
        return false;
	}

	#avoidsDuplicatingTypesInRows (myBoardArray, i, currentWeapon) {
	    let row = Math.floor(i/5);
	    let col = i % 5;
	    let isTLBR = (i % 6) == 0;
	    let isBLTR = (i % 4) == 0 && i > 0;
	    //if row contains same type, return false
	    for (let x=0+(5*row); x < 5+(5*row); x++) {
	        i = x;
	        if(this.#isDuplicateType(myBoardArray, i, currentWeapon)) {
	            return false;
	        }
	    }
        //if column contains same type, return false
	    for (let y=0; y<5; y++) {
	        i = col + 5*y;
	        if(this.#isDuplicateType(myBoardArray, i, currentWeapon)) {
	            return false;
	        }
	    }
	    //if isTLBR and TLBR contains same type, return false
	    if (isTLBR) {
	        let indices = [0, 6, 12, 18, 24];
	        for (const index in indices) {
	            i = indices[index];
                if(this.#isDuplicateType(myBoardArray, i, currentWeapon)) {
                    return false;
                }
	        }
	    }
	    //if isBLTR and BLTR contains same type, return false
	    if (isBLTR) {
            let indices = [4, 8, 12, 16, 20];
            for (const index in indices) {
                i = indices[index];
                if(this.#isDuplicateType(myBoardArray, i, currentWeapon)) {
                    return false;
                }
            }
	    }
	    return true;
	}

    #getArrayOfWeaponTypesForBoard() {
        let allWeaponsArray = [...weaponMap.values()].flat();
        let currentWeaponType;
        let mapOfWeaponTypesToFrequencyInBoard = new Map();
        let weaponTypesOnThisBoard = new Array(25);
        let retries;
        let foundAcceptableWeaponType;
        for (let i=0; i<25; i++) {
            foundAcceptableWeaponType = false;
            retries = 200;
            do {
                let RNG = Math.floor(allWeaponsArray.length * this.boardRNG());
                if (RNG == allWeaponsArray.length) {
                    RNG--;
                }
                currentWeaponType = allWeaponsArray[RNG].types;
                if (currentWeaponType == undefined) {
                    console.log("Error weapon type undefined");
                }
                if (!mapOfWeaponTypesToFrequencyInBoard.has(currentWeaponType)
                    || mapOfWeaponTypesToFrequencyInBoard.get(currentWeaponType) < weaponMap.get(currentWeaponType).length) {
                    let bingoBoardIndex = i;
                    if (i == 0) {
                        bingoBoardIndex = 12; //The center square is always chosen first to prevent weird biasing issues
                    }
                    if (i == 12) {
                        bingoBoardIndex = 0; //Fill in the top left most square when we would otherwise have filled the center
                    }
                    if (this.#avoidsDuplicatingTypesInRows(weaponTypesOnThisBoard, bingoBoardIndex, currentWeaponType)) {
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

	generateBingoBoard() {
	    let weaponTypesOnThisBoard;
	    do {
	        weaponTypesOnThisBoard = this.#getArrayOfWeaponTypesForBoard();
	    } while (weaponTypesOnThisBoard.includes(undefined));
        let thisBoardsWeapons = [];
        for (let i=0; i<25; i++) {
            let foundUnusedElement = false;
            let retries = 50;
            do {
                let currentWeaponType = weaponTypesOnThisBoard.at(i);
                let currentWeaponTypeList = weaponMap.get(currentWeaponType);
                let RNG = Math.floor(currentWeaponTypeList.length * this.boardRNG());
                if (RNG == currentWeaponTypeList.length) {
                    RNG--;
                }
                if (!thisBoardsWeapons.includes(currentWeaponTypeList[RNG])) {
                    thisBoardsWeapons.push(currentWeaponTypeList[RNG]);
                    let remainingWeapons = currentWeaponTypeList.filter(function(value) {
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

}

