var base = require('./base-module');
var desktopApps = {};

for(var i in base){
    desktopApps[i] = base[i];
}

desktopApps.collection = "desktopApps";
desktopApps.column = {
    user         : 'user',
    apps         : 'apps'
};

module.exports = desktopApps;