'use strict';

class FpsUtilsLite {

  constructor(mod) {

    this.mod = mod;
    this.cmd = mod.command;
    this.game = mod.game;
    this.settings = mod.settings;
    this.hooks = [];
    this.loaded = false;

    this.myGameId = BigInt(0);
    this.myGuild = new Set();

    this.user_list = {};
    this.user_shown = {};
    this.user_hidden = {};
    this.party_list = [];
    this.npc_hidden = {};
    this.servant_hidden = {};

    this.cmd.add('fps', {
      'all': () => {
        this.settings.guild = false;
        this.settings.party = false;
        this.showAll();
        this.send(`Showing all users`);
      },
      'fireworks': () => {
        this.settings.hideFireworks = !this.settings.hideFireworks;
        this.send(`Hiding of firework effects ${this.settings.hideFireworks ? 'en' : 'dis'}abled`);
      },
      'guild': () => {
        this.settings.guild = !this.settings.guild;
        this.handleHideUser();
        this.send(`Hiding of everyone but your guild members ${this.settings.guild ? 'en' : 'dis'}abled`);
      },
      'hit': (arg) => {
        switch (arg) {
          case "damage":
            this.settings.hitDamage = !this.settings.hitDamage;
            this.send(`Hiding of the players skill damage numbers ${this.settings.hitDamage ? 'en' : 'dis'}abled`);
            break;
          case "me":
            this.settings.hitMe = !this.settings.hitMe;
            this.send(`Hiding of the players skill hits ${this.settings.hitMe ? 'en' : 'dis'}abled`);
            break;
          case "other":
            this.settings.hitOther = !this.settings.hitOther;
            this.send(`Hiding of other players skill hits ${this.settings.hitOther ? 'en' : 'dis'}abled`);
            break;
          default:
            this.send(`Invalid argument. usage : fps hit [damage|me|other]`);
            break;
        }
      },
      'mode': (arg) => {
        let prev = this.settings.mode;
        switch (arg) {
          case "0":
            this.settings.mode = 0;
            this.settings.guild = false;
            this.settings.hitOther = false;
            this.settings.party = false;
            this.handleHideUser();
            this.send(`FPS mode set to 0, all FPS improvements disabled`);
            break;
          case "1":
            this.settings.mode = 1;
            this.settings.hitOther = true;
            if (prev === 3) {
              this.handleHideUser();
            }
            this.send(`FPS mode set to 1, projectiles hidden and abnormalities disabled`);
            break;
          case "2":
            this.settings.mode = 2;
            this.settings.hitOther = true;
            if (prev === 3) {
              this.handleHideUser();
            }
            this.send(`FPS mode set to 2, all skill effects disabled`);
            break;
          case "3":
            this.settings.mode = 3;
            this.settings.hitOther = true;
            this.handleHideUser();
            this.send(`FPS mode set to 3, all players, their effects and their hit effects disabled`);
            break;
          default:
            this.send(`Invalid argument. usage : fps mode [0|1|2|3]`);
        }
      },
      'off': () => {
        if (this.loaded) {
          this.unload();
          this.send(`Removed all necessary hooks.`);
        }
      },
      'on': () => {
        if (!this.loaded) {
          this.showAll();
          this.load();
          this.send(`Loaded all necessary hooks.`);
        }
      },
      'party': () => {
        this.settings.party = !this.settings.party
        this.handleHideUser();
        this.send(`Hiding of everyone but your group ${this.settings.party ? 'en' : 'dis'}abled`);
      },
      'proj': () => {
        this.settings.hideProjectiles = !this.settings.hideProjectiles;
        this.send(`Hiding of projectile effects ${this.settings.hideProjectiles ? 'en' : 'dis'}abled`);
      },
      'refresh': () => {
        this.handleHideUser();
        this.send(`Refreshed spawned users`);
      },
      'servants': () => {
        this.settings.hideServants = !this.settings.hideServants;
        this.send(`Hiding of pets and partners ${this.settings.hideServants ? 'en' : 'dis'}abled`);
      },
      'status': () => {
        this.send(`Status : `,
          `mode : ${this.settings.mode}`,
          `guild : ${this.settings.guild}`,
          `party : ${this.settings.party}`,
          `fireworks : ${this.settings.hideFireworks}`),
          `projectiles : ${this.settings.hideProjectiles}`,
          `servants : ${this.settings.hideServants}`,
          `summons : ${this.settings.hideAllSummons}`
      },
      'summons': (arg) => {
        switch (arg) {
          case undefined:
            this.settings.hideAllSummons = !this.settings.hideAllSummons;
            this.send(`Hiding of summoned NPCs ${this.settings.hideAllSummons ? 'en' : 'dis'}abled`);
            break;
          case "mine":
            this.settings.keepMySummons = !this.settings.keepMySummons;
            this.send(`Hiding of owned summoned NPCs ${this.settings.keepMySummons ? 'dis' : 'en'}abled`);
            break;
          default:
            this.send(`Invalid argument. usage : fps summons ([mine])`);
        }
      },
      '$default': () => {
        this.send(`Invalid argument. usage : fps [all|fireworks|hit|guild|hit|mode|off|on|party|proj|refresh|servant|status|summons]`);
      }
    });

    // game state
    this.game.on('enter_game', () => {
      this.myGameId = this.game.me.gameId;
    });

    this.game.me.on('change_zone', () => {
      this.user_list = {};
      this.user_shown = {};
      this.user_hidden = {};

      this.npc_hidden = {};

      this.servant_hidden = {};
    });

    this.mod.hookOnce('S_GET_USER_LIST', this.mod.majorPatchVersion >= 86 ? 0 : 16, { order: -1000 }, (e) => {
      e.characters.forEach((c) => {
        this.myGuild.add(c.guildName);
      });
    });

    this.load();

  }

  destructor() {
    this.mod.saveSettings();
    this.cmd.remove('fps');
    this.unload();

    this.servant_hidden = undefined;
    this.npc_hidden = undefined;
    this.party_list = undefined;
    this.user_hidden = undefined;
    this.user_shown = undefined;
    this.user_list = undefined;
    this.myGuild = undefined;
    this.myGameId = undefined;

    this.loaded = undefined;
    this.hooks = undefined;
    this.settings = undefined;
    this.game = undefined;
    this.cmd = undefined;
    this.mod = undefined;
  }

  // helper
  async handleHideUser() {
    await this.hideAll();
    if (this.settings.mode === 3) {
      return;
    }
    if (this.settings.party) {
      await this.showParty();
    }
    if (this.settings.guild) {
      await this.showGuild();
    }
    if (this.settings.mode < 3 && !this.settings.guild && !this.settings.party) {
      this.showAll();
    }
  }

  showGuild() {
    return new Promise((resolve) => {
      for (let i in this.user_hidden) {
        let user = this.user_hidden[i];
        if (this.myGuild.has(user.guildName) && user.guildName !== '') {
          this.mod.send('S_SPAWN_USER', 15, user);
          this.user_shown[user.gameId] = user;
          delete this.user_hidden[i];
        }
      }
      resolve();
    });
  }

  showParty() {
    return new Promise((resolve) => {
      for (let i in this.user_hidden) {
        let user = this.user_hidden[i];
        if (this.party_list.includes(user.name)) {
          this.mod.send('S_SPAWN_USER', 15, user);
          this.user_shown[user.gameId] = user;
          delete this.user_hidden[i];
        }
      }
      resolve();
    });
  }

  showAll() {
    return new Promise((resolve) => {
      for (let i in this.user_hidden) {
        this.mod.send('S_SPAWN_USER', 15, this.user_hidden[i]);
        this.user_shown[this.user_hidden[i].gameId] = this.user_hidden[i];
        delete this.user_hidden[i];
      }
      this.user_hidden = {};
      resolve();
    });
  }

  hideAll() {
    return new Promise((resolve) => {
      for (let i in this.user_list) {
        this.mod.send('S_DESPAWN_USER', 3, {
          gameId: this.user_list[i].gameId,
          type: 1
        });
        this.user_hidden[this.user_list[i].gameId] = this.user_list[i];
        delete this.user_shown[i];
      }
      this.user_shown = {};
      resolve();
    });
  }

  updateLoc(e) {
    this.mod.send('S_USER_LOCATION', 5, {
      gameId: e.gameId,
      loc: e.loc,
      w: e.w,
      dest: e.loc,
      speed: 300,
      type: 7
    });
  }

  // code
  hook() {
    this.hooks.push(this.mod.hook(...arguments));
  }

  load() {
    // user
    this.hook('S_SPAWN_USER', 15, { order: -10 }, (e) => {
      this.user_list[e.gameId] = e;
      if (this.settings.mode === 3) {
        this.user_hidden[e.gameId] = e;
        return false;
      }
      if (this.settings.guild && e.guildName !== '' && this.myGuild.has(e.guildName)) {
        this.user_shown[e.gameId] = e;
        return;
      }
      if (this.settings.party && this.party_list.includes(e.name)) {
        this.user_shown[e.gameId] = e;
        return;
      }
      if (!this.settings.guild && !this.settings.party && this.settings.mode < 3) {
        return;
      }
      this.user_hidden[e.gameId] = e;
      return false;
    });

    this.hook('S_DESPAWN_USER', 3, { order: 1000 }, (e) => {
      delete this.user_list[e.gameId];
      delete this.user_shown[e.gameId];
      delete this.user_hidden[e.gameId];
    });

    this.hook('S_USER_LOCATION', 5, { order: 1000 }, (e) => {
      if (this.user_list[e.gameId]) {
        this.user_list[e.gameId].loc = e.dest;
      }

      if (this.user_hidden[e.gameId]) {
        return false;
      }
    });

    // party
    this.hook('S_PARTY_MEMBER_LIST', this.mod.majorPatchVersion >= 86 ? 0 : 7, (e) => {
      e.members.forEach((m) => {
        this.party_list.push(m.name);
      });
    });

    this.hook('S_LEAVE_PARTY', 1, () => {
      this.party_list = [];
      this.handleHideUser();
    });

    // npc: summons, fireworks
    this.hook('S_SPAWN_NPC', 11, { order: -10 }, (e) => {
      if (e.huntingZoneId === 1023) {
        if (this.settings.hideAllSummons) {
          if (this.settings.keepMySummons && this.myGameId === e.owner) {
            return;
          }
          this.npc_hidden[e.gameId] = e;
          return false;
        }
        if (this.settings.hideFireworks &&
          (e.templateId === 60016000 || e.templateId === 80037000)) {
          return false;
        }
      }
    });

    this.hook('S_DESPAWN_NPC', 3, (e) => {
      delete this.npc_hidden[e.gameId];
    });

    // servant
    this.hook('S_REQUEST_SPAWN_SERVANT', 3, { order: -10 }, (e) => {
      if (this.settings.hideServants && this.myGameId !== e.ownerId) {
        this.servant_hidden[e.gameId] = e;
        return false;
      }
    });

    this.hook('S_REQUEST_DESPAWN_SERVANT', 1, (e) => {
      delete this.servant_hidden[e.gameId];
    });

    // mount
    this.hook('S_MOUNT_VEHICLE', 2, (e) => {
      if (this.user_hidden[e.gameId]) {
        this.user_hidden[e.gameId].mount = e.id;
      }
    });

    this.hook('S_UNMOUNT_VEHICLE', 2, (e) => {
      if (this.user_hidden[e.gameId]) {
        this.user_hidden[e.gameId].mount = 0;
      }
    });

    //
    this.hook('S_ACTION_STAGE', 9, { order: 999 }, (e) => {
      if (this.myGameId !== e.gameId && this.user_list[e.gameId]) {
        if (this.settings.mode === 2 || this.user_hidden[e.gameId]) {
          this.updateLoc(e);
          return false;
        }
      }
    });

    this.hook('S_ABNORMALITY_BEGIN', 3, { order: 999 }, (e) => {
      if (this.user_hidden[e.target]) {
        return false;
      }
    });

    this.hook('S_ABNORMALITY_REFRESH', 1, { order: 999 }, (e) => {
      if (this.user_hidden[e.target]) {
        return false;
      }
    });

    // hit
    this.hook('S_EACH_SKILL_RESULT', 13, { order: 100 }, (e) => {
      if (this.myGameId === e.source || this.myGameId === e.owner) {
        if (this.settings.hitMe) {
          e.skill.id = 0;
          return true;
        }
        if (this.settings.hitDamage) {
          e.value = BigInt(0);
          return true;
        }
      }
      if (this.settings.hitOther &&
        this.myGameId !== e.target &&
        (this.user_list[e.owner] || this.user_list[e.source])) {
        e.skill.id = 0;
        return true;
      }
    });

    // fear
    this.hook('S_FEARMOVE_STAGE', 2, (e) => {
      if ((this.settings.mode === 3 && this.myGameId !== e.gameId) ||
        this.user_hidden[e.gameId] ||
        this.npc_hidden[e.gameId]) {
        return false;
      }
    });
    this.hook('S_FEARMOVE_END', 2, (e) => {
      if ((this.settings.mode === 3 && this.myGameId !== e.gameId) ||
        this.user_hidden[e.gameId] ||
        this.npc_hidden[e.gameId]) {
        return false;
      }
    });

    // user movetype
    this.hook('S_USER_MOVETYPE', 'raw', () => {
      return false;
    });

    // proj
    this.hook('S_START_USER_PROJECTILE', 9, { order: 999 }, (e) => {
      if (this.myGameId !== e.gameId &&
        this.user_list[e.gameId] && (this.user_hidden[e.gameId] ||
          this.settings.mode > 0 ||
          this.settings.hideProjectiles)) {
        return false;
      }
    });

    this.hook('S_SPAWN_PROJECTILE', this.mod.majorPatchVersion >= 84 ? 6 : 5, { order: 999 }, (e) => {
      if (this.myGameId !== e.gameId &&
        this.user_list[e.gameId] && (this.user_hidden[e.gameId] ||
          this.settings.mode > 0 ||
          this.settings.hideProjectiles)) {
        return false;
      }
    });

    this.loaded = true;
  }

  unload() {
    if (this.hooks.length) {
      for (let h of this.hooks)
        this.mod.unhook(h);
      this.hooks = [];
    }

    this.loaded = false;
  }

  send() { this.cmd.message(': ' + [...arguments].join('\n\t - ')); }

  saveState() {
    let state = {
      myGameId: this.myGameId,
      myGuild: this.myGuild,
      user_list: this.user_list,
      user_shown: this.user_shown,
      user_hidden: this.user_hidden,
      party_list: this.party_list,
      npc_hidden: this.npc_hidden,
      servant_hidden: this.servant_hidden
    }
    return state;
  }

  loadState(state) {
    this.myGameId = state.myGameId;
    this.myGuild = state.myGuild;
    this.user_list = state.user_list;
    this.user_shown = state.user_shown;
    this.user_hidden = state.user_hidden;
    this.party_list = state.party_list;
    this.npc_hidden = state.npc_hidden;
    this.servant_hidden = state.servant_hidden;
  }

}

module.exports = FpsUtilsLite;