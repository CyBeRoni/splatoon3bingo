"use strict";

const vsWeapons = [];
const weaponMap = new Map();

async function init_weapons(){
    const r = await init_versions();
    await get_weapons(r);

    weaponMap.set('Shooter', get_weapons_by_category("Shooter"));
    weaponMap.set('Splatling', get_weapons_by_category("Spinner"));
    weaponMap.set('Charger', get_weapons_by_category("Charger"));
    weaponMap.set('Blaster', get_weapons_by_category("Blaster"));
    weaponMap.set('Slosher', get_weapons_by_category("Slosher"));
    weaponMap.set('Dualies', get_weapons_by_category("Maneuver"));
    weaponMap.set('Brush', get_weapons_by_category("Roller"));
    weaponMap.set('Roller', get_weapons_by_category("Brush"));
    weaponMap.set('Brella', get_weapons_by_category("Shelter"));
    weaponMap.set('Misc', get_weapons_by_category(["Stringer", "Saber"]));
}

async function init_versions(){
    let v = await get_versions();

    let last = v[v.length-1];

    return last;
}

function getFilenameOfReward(value) {
    return value
        .replace("Work/Gyml/", "")
        .replace(".gyml", "")
        .replace("BadgeInfo", "Badge")
        .replace(".spl__BadgeInfo", "")
        .replace(".spl__LockerGoodsStickerInfo", "")
}

function urlForFilename(prefix, filename, ext){
    return `https://leanny.github.io/splat3/${prefix}${filename}.${ext}`
}

async function get_versions(){
    let res = await fetch(`https://leanny.github.io/splat3/versions.json`);

    let r = await res.json();

    return r;
}

async function get_language(language = "EUen"){
    let res = await fetch(`https://leanny.github.io/splat3/data/language/${language}.json`);

    let r = await res.json();

    return r["CommonMsg/Weapon/WeaponName_Main"];
}

async function get_weapons(version){
    console.log("Grabbing weapons for game version " + version)

    let res = await fetch(`https://leanny.github.io/splat3/data/mush/${version}/WeaponInfoMain.json`);
    let weapons = await res.json();

    let lang = await get_language();

    vsWeapons.length = 0;

    weapons.filter(e => e.Type == "Versus" && e.Season >= 0 ).forEach(e => {
        vsWeapons.push({
            internalName: e.__RowId,
            id: e.Id,
            name: lang[e.__RowId],
            image: urlForFilename("images/weapon_flat/Path_Wst_", e.__RowId, "webp"),
            stickerImage: urlForFilename("images/zakka/", getFilenameOfReward(e.RewardLv2), "webp"),
            stickerImageShiny: urlForFilename("images/zakka/", getFilenameOfReward(e.RewardLv3), "webp"),
            badgeImage: urlForFilename("images/badge/", getFilenameOfReward(e.RewardLv4), "webp"),
            badgeImageGold: urlForFilename("images/badge/", getFilenameOfReward(e.RewardLv5), "webp"),
            internalType: e.DefaultHitEffectorType,
            type: e.__RowId.split("_")[0]
        })
        e.Label = lang[e.__RowId];
    })
}

function get_random_filtered_weapon(filter){
    let filtered_weapons = vsWeapons.filter(e => filter(e));
    let weap = Math.floor(Math.random() * filtered_weapons.length);

    return filtered_weapons[weap];
}

function get_weapons_by_category(category){

    if (! Array.isArray(category))
        category = [category];

    return vsWeapons.filter((e) => category.includes(e.type));
}

function get_weapons_by_internal_type(type){
    return vsWeapons.filter((e) => e.internalType === type);
}

