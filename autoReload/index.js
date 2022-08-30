const Console = require("../../../BMPR-Release/BMPR-Release/core/console");
const fs = require("fs-extra");
const loader = require("../../../BMPR-Release/BMPR-Release/core/loader");
const path = require("path");

const CT = {};
const LIST = [];
const Directory = [];
let Lock = false;

setInterval(() => {
	if (Lock) return;
	Lock = true;
	const list = fs.readdirSync(path.resolve("./Plugin"));
	for (let index = 0; index < list.length; index++)
		if (fs.existsSync(path.resolve(`./Plugin/lock/${list[index]}`)))
			if (fs.statSync(path.resolve(`./Plugin/${list[index]}`)).isDirectory())
				Directory.push(path.resolve(`./Plugin/${list[index]}`));
			else
				LIST.push(path.resolve(`./Plugin/lock/${list[index]}`));
	loop();
	async function loop() {
		for (let index = 0; index < Directory.length; index++) {
			const Dlist = fs.readdirSync(Directory[index]);
			for (let Index = 0; Index < Dlist.length; Index++)
				if (fs.statSync(path.resolve(`${Directory[index]}/${Dlist[Index]}`)).isDirectory())
					Directory.push(path.resolve(`${Directory[index]}/${Dlist[Index]}`));
				else
					LIST.push(path.resolve(`${Directory[index]}/${Dlist[Index]}`));
			Directory.splice(index, 1);
		}
		if (Directory.length != 0)
			loop();
		else {
			for (let index = 0; index < LIST.length; index++)
				if (CT[LIST[index]] == undefined)
					CT[LIST[index]] = fs.statSync(LIST[index]).ctimeMs;
				else if (CT[LIST[index]] != fs.statSync(LIST[index]).ctimeMs) {
					CT[LIST[index]] = fs.statSync(LIST[index]).ctimeMs;
					const L = LIST[index].split("\\");
					await Console.main(`檢測到 ${L[L.indexOf("Plugin") + 1]} 插件 變更`, 3, "autoReload", "Main");
					await Console.main("觸發插件重載", 3, "autoReload", "Main");
					await loader.PluginUnload(L[L.indexOf("Plugin") + 1]);
					await loader.PluginLoad(L[L.indexOf("Plugin") + 1]);
				}
			Lock = false;
		}
	}
}, 5000);

module.exports = {
};
