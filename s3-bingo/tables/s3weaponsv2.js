var bingoList = [];

const weaponMap = new Map();

var brellaList = [
    {name: "Splat Brella", image: "../weapons/040.png", types: "Brella"},
    {name: "Tenta Brella", image: "../weapons/052.png", types: "Brella"},
    {name: "Undercover Brella", image: "../weapons/055.png", types: "Brella"}
];

var shooterList = [
    {name: ".52 Gal", image: "../weapons/001.png", types: "Shooter"},
    {name: ".96 Gal", image: "../weapons/002.png", types: "Shooter"},
    {name: "Aerospray MG", image: "../weapons/003.png", types: "Shooter"},
    {name: "H-3 Nozzlenose", image: "../weapons/021.png", types: "Shooter"},
    {name: "Hero Shot Replica", image: "../weapons/023.png", types: "Shooter"},
    {name: "Jet Squelcher", image: "../weapons/026.png", types: "Shooter"},
    {name: "L-3 Nozzlenose", image: "../weapons/027.png", types: "Shooter"},
    {name: "N-ZAP '85", image: "../weapons/030.png", types: "Shooter"},
    {name: "Splash-o-matic", image: "../weapons/039.png", types: "Shooter"},
    {name: "Splattershot", image: "../weapons/047.png", types: "Shooter"},
    {name: "Splattershot Jr.", image: "../weapons/048.png", types: "Shooter"},
    {name: "Splattershot Pro", image: "../weapons/049.png", types: "Shooter"},
    {name: "Sploosh-o-matic", image: "../weapons/050.png", types: "Shooter"},
    {name: "Squeezer", image: "../weapons/051.png", types: "Shooter"}
];

var splatlingList = [
    {name: "Ballpoint Splatling", image: "../weapons/004.png", types: "Splatling"},
    {name: "Heavy Splatling", image: "../weapons/022.png", types: "Splatling"},
    {name: "Hydra Splatling", image: "../weapons/024.png", types: "Splatling"},
    {name: "Mini Splatling", image: "../weapons/029.png", types: "Splatling"},
    {name: "Nautilus 47", image: "../weapons/031.png", types: "Splatling"}
];

var chargerList = [
    {name: "Bamboozler 14 Mk", image: "../weapons/005.png", types: "Charger"},
    {name: "Squiffer", image: "../weapons/010.png", types: "Charger"},
    {name: "E-liter 4K", image: "../weapons/015.png", types: "Charger"},
    {name: "E-liter 4K Scope", image: "../weapons/016.png", types: "Charger"},
    {name: "Goo Tuber", image: "../weapons/020.png", types: "Charger"},
    {name: "Splat Charger", image: "../weapons/041.png", types: "Charger"},
    {name: "Splatterscope", image: "../weapons/046.png", types: "Charger"}
];

var blasterList = [
    {name: "Blaster", image: "../weapons/006.png", types: "Blaster"},
    {name: "Clash Blaster", image: "../weapons/009.png", types: "Blaster"},
    {name: "Luna Blaster", image: "../weapons/028.png", types: "Blaster"},
    {name: "Range Blaster", image: "../weapons/033.png", types: "Blaster"},
    {name: "Rapid Blaster", image: "../weapons/034.png", types: "Blaster"},
    {name: "Rapid Blaster Pro", image: "../weapons/035.png", types: "Blaster"}
];

var slosherList = [
    {name: "Bloblobber", image: "../weapons/007.png", types: "Slosher"},
    {name: "Explosher", image: "../weapons/017.png", types: "Slosher"},
    {name: "Slosher", image: "../weapons/037.png", types: "Slosher"},
    {name: "Sloshing Machine", image: "../weapons/038.png", types: "Slosher"},
    {name: "Tri-Slosher", image: "../weapons/053.png", types: "Slosher"}
];

var rollerList = [
    {name: "Carbon Roller", image: "../weapons/008.png", types: "Roller"},
    {name: "Dynamo Roller", image: "../weapons/014.png", types: "Roller"},
    {name: "Flingza Roller", image: "../weapons/018.png", types: "Roller"},
    {name: "Splat Roller", image: "../weapons/043.png", types: "Roller"}
];

var dualiesList = [
    {name: "Dapple Dualies", image: "../weapons/011.png", types: "Dualies"},
    {name: "Dark Tetra Dualies", image: "../weapons/012.png", types: "Dualies"},
    {name: "Dualie Squelchers", image: "../weapons/013.png", types: "Dualies"},
    {name: "Glooga Dualies", image: "../weapons/019.png", types: "Dualies"},
    {name: "Splat Dualies", image: "../weapons/042.png", types: "Dualies"}
];

var brushList = [
    {name: "Inkbrush", image: "../weapons/025.png", types: "Brush"},
    {name: "Octobrush", image: "../weapons/032.png", types: "Brush"}
];

var stringerList = [
    {name: "REEF-LUX 450", image: "../weapons/036.png", types: "Stringer"},
    {name: "Tri-Stringer", image: "../weapons/054.png", types: "Stringer"}
];

var splatanaList = [
    {name: "Splatana Stamper", image: "../weapons/044.png", types: "Splatana"},
    {name: "Splatana Wiper", image: "../weapons/045.png", types: "Splatana"}
];

weaponMap.set('Brella', brellaList);
weaponMap.set('Shooter', shooterList);
weaponMap.set('Splatling', splatlingList);
weaponMap.set('Charger', chargerList);
weaponMap.set('Blaster', blasterList);
weaponMap.set('Slosher', slosherList);
weaponMap.set('Roller', rollerList);
weaponMap.set('Dualies', dualiesList);
weaponMap.set('Brush', brushList);
weaponMap.set('Stringer', stringerList);
weaponMap.set('Splatana', splatanaList);

$(function() { srl.bingo(weaponMap, 5); });
