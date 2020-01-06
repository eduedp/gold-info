/* eslint-disable require-jsdoc */
'use strict';
String.prototype.clr = function(hexColor) {
    return `<font color='#${hexColor}'>${this}</font>`;
};

module.exports = function GoldInfo(mod) {
    mod.game.initialize('inventory');

    let startTime;
    let startGold;
    let interval;

    function getGoldFarmed() {
        return Number(mod.game.inventory.money) - Number(startGold);
    }

    function resetMod() {
        startTime = Date.now();
        startGold = Number(mod.game.inventory.money);

        if (interval) {
            clearInterval(interval);
            interval = null;
        }

        if (mod.settings.enabled) {
            interval = mod.setInterval(() => {
                if (mod.settings.enabled) {
                    goldInfo();
                }
            }, 3600000);
        }
    }

    mod.game.on('enter_game', () => {
        mod.setTimeout(() => {
            if (mod.settings.enabled) {
                resetMod();
            }
        }, 5000);
    });

    mod.command.add(['gold', 'goldinfo'], (arg) => {
        if (arg) arg = arg.toLowerCase();
        switch (arg) {
        case 'r':
        case 'res':
        case 'reset':
        case 'restart':
            resetMod();
            mod.command.message(('Resetted').clr('56B4E9'));
            return;
        case 'on':
        case 'enable':
            mod.settings.enabled = true;
            mod.command.message('Enabled'.clr('56B4E9'));
            return;
        case 'off':
        case 'disable':
            mod.settings.enabled = false;

            if (interval) {
                clearInterval(interval);
                interval = null;
            }

            mod.command.message('Disabled'.clr('E69F00'));
            return;
        }

        goldInfo();
    });

    function goldInfo() {
        mod.command.message('Session playtime: '.clr('FDD017') + msToTime(Date.now() - startTime).clr('56B4E9'));
        mod.command.message('Gold gained: '.clr('FDD017') + formatGold(getGoldFarmed()).clr('00FFFF'));
        if (startTime - (Date.now() - 3600000) < 0) {
            mod.command.message('Gold/hour: '.clr('FDD017') + formatGold(getGoldFarmed() / ((Date.now() - startTime) / 3600000)).clr('00FFFF'));
        }
        // mod.command.message('Total Gold: '.clr('FDD017') + formatGold(Number(mod.game.inventory.money)).clr('00FFFF'));
    }

    function formatGold(goldValue) {
        let format = goldValue / 10000;
        format = format.toLocaleString('pt-BR', {maximumFractionDigits: 0});
        return format + 'g';
    }

    function msToTime(duration) {
        const milliseconds = parseInt((duration % 1000) / 100);
        let seconds = Math.floor((duration / 1000) % 60);
        let minutes = Math.floor((duration / (1000 * 60)) % 60);
        let hours = Math.floor((duration / (1000 * 60 * 60)));

        hours = (hours < 10) ? '0' + hours : hours;
        minutes = (minutes < 10) ? '0' + minutes : minutes;
        seconds = (seconds < 10) ? '0' + seconds : seconds;

        return hours + 'h:' + minutes + 'm:' + seconds + 's';
    }

    this.saveState = () => {
        const state = {
            enabled: mod.settings.enabled,
        };
        return state;
    };

    this.loadState = (state) => {
        mod.settings.enabled = state.enabled;
    };

    this.destructor = () => {
        mod.command.remove('goldinfo');
        mod.command.remove('gold');

        if (interval) {
            clearInterval(interval);
            interval = null;
        }
    };
};
