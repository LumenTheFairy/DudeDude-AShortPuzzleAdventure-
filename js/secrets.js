// Written by TheOnlyOne aka LumenTheFairy aka @modest_ralts

dd.scripts.secrets = async function(locking) {
const secrets = {};

// polyfill for Safari
if(!crypto.subtle) {
	crypto.subtle = crypto.webkitSubtle;
}

const LOCK_TIMEOUT = 50;

let mine = localStorage.getItem('mine');
if(!mine) {
	mine = String(Math.floor(Math.random() * 10000000000000000));
	localStorage.setItem('mine', mine);
}
let hi = localStorage.getItem('___hi');
if(!hi) {
	localStorage.setItem('___hi', "Hi! Welcome to the localStorage for Dude Dude -A Short Puzzle Adventure-! If you're here because you think it's part of the puzzle, you can rest assured that it is not, and you can go back to the game proper. If you're here to change your scores or something, I'm not going to try to stop you; however, the data is slightly obfuscated, so it won't be entirely simple (but honestly not that hard either). Do be aware that tampering with the data here very well may cause issues in the game, and we aren't going to pretend that that isn't your own problem. So good luck with that.");
}

//https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
const sha256 = async function (message) {

    // encode as UTF-8
    const msgBuffer = new TextEncoder('utf-8').encode(message);

    // hash the message
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    
    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    // convert bytes to hex string
    const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
    return hashHex;
};
secrets.channel_name = "dudedude_" + await sha256(navigator.userAgent);

const flag_secret = ( async (key, name) => await sha256("saltedtunaicecream::" + key + "::" + name + "::" + mine) );
const value_check = ( async (key, name, value) => await sha256("saltedtunaicecream::" + key + "::" + name + "::" + value + "::" + mine) );

const get_key_map = function(key) {
	let key_map = localStorage.getItem(key);
	if(key_map) {
		return JSON.parse(key_map);
	}
	else {
		return {};
	}
};
const write_key_map = function(key, data) {
	localStorage.setItem(key, JSON.stringify(data) );
};

secrets.save_flag = async function(id, key, name) {
	const critical = async function() {
		const pw = await flag_secret(key, name);
		const key_map = get_key_map(key);
		key_map[name] = pw;
		write_key_map(key, key_map);
	};

	await locking.run_critical(id, key, critical, LOCK_TIMEOUT);
};

secrets.get_flags = async function(key) {
	const key_map = get_key_map(key);
	const good_names = [];

	for(let name in key_map) {
		const pw = await flag_secret(key, name);
		if(key_map[name] === pw) {
			good_names.push(name);
		}
	}

	return good_names;
};

//this should technically be locked, but it will probably hurt the performance,
//and this is run quite a bit for the moving tab
secrets.save_value = async function(key, name, value) {
	const key_map = get_key_map(key);
	const check = await value_check(key, name, value);
	key_map[name] = {v: value, s: check};
	write_key_map(key, key_map);
};

secrets.get_value = async function(key, name) {
	const key_map = get_key_map(key);
	if(name in key_map) {
		const value = key_map[name].v;
		const check = key_map[name].s;
		console.log(check);
		console.log(await value_check(key, name, value));
		if(check === await value_check(key, name, value)) {
			return value;
		}
	}
	return undefined;
};

return secrets;
};