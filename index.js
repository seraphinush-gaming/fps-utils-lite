'use strict';

class fps_utils_lite {

  constructor(mod) {

    this.m = mod;
    this.c = mod.command;
    this.g = mod.game;
    this.s = mod.settings;
    this.hooks = [];
    this.loaded = false;

    this.gameId = BigInt(0);
    this.guild = new Set();

    this.user_list = {};
    this.user_shown = {};
    this.user_hidden = {};
    this.party_list = [];
    this.npc_hidden = {};
    this.servant_hidden = {};

    this.c.add('fps', {
      'all': () => {
        this.s.guild = this.s.party = false;
        this.show_all();
        this.send(`Showing all users.`);
      },
      'fireworks': () => {
        this.s.hideFireworks = !this.s.hideFireworks;
        this.send(`Hiding of firework effects ${this.s.hideFireworks ? 'en' : 'dis'}abled.`);
      },
      'guild': () => {
        this.s.guild = !this.s.guild;
        this.handle_hide_user();
        this.send(`Hiding of everyone but your guild members ${this.s.guild ? 'en' : 'dis'}abled.`);
      },
      'hit': (arg) => {
        switch (arg) {
          case 'damage':
            this.s.hitDamage = !this.s.hitDamage;
            this.send(`Hiding of the players skill damage numbers ${this.s.hitDamage ? 'en' : 'dis'}abled.`);
            break;
          case 'me':
            this.s.hitMe = !this.s.hitMe;
            this.send(`Hiding of the player's skill hits ${this.s.hitMe ? 'en' : 'dis'}abled.`);
            break;
          case 'other':
            this.s.hitOther = !this.s.hitOther;
            this.send(`Hiding of other players skill hits ${this.s.hitOther ? 'en' : 'dis'}abled.`);
            break;
          default:
            this.send(`Invalid argument. usage : fps hit [damage|me|other]`);
            break;
        }
      },
      'mode': (arg) => {
        let prev = this.s.mode;
        switch (arg) {
          case '0':
            this.s.mode = 0;
            this.s.guild = this.s.hitOther = this.s.party = false;
            this.handle_hide_user();
            this.send(`FPS mode set to 0, all FPS improvements disabled.`);
            break;
          case '1':
            this.s.mode = 1;
            this.s.hitOther = true;
            if (prev === 3) {
              this.handle_hide_user();
            }
            this.send(`FPS mode set to 1, projectiles hidden and abnormalities disabled.`);
            break;
          case '2':
            this.s.mode = 2;
            this.s.hitOther = true;
            if (prev === 3) {
              this.handle_hide_user();
            }
            this.send(`FPS mode set to 2, all skill effects disabled.`);
            break;
          case '3':
            this.s.mode = 3;
            this.s.hitOther = true;
            this.handle_hide_user();
            this.send(`FPS mode set to 3, all players, their effects and their hit effects disabled.`);
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
          this.show_all();
          this.load();
          this.send(`Loaded all necessary hooks.`);
        }
      },
      'party': () => {
        this.s.party = !this.s.party
        this.handle_hide_user();
        this.send(`Hiding of everyone but your group ${this.s.party ? 'en' : 'dis'}abled.`);
      },
      'proj': () => {
        this.s.hideProjectiles = !this.s.hideProjectiles;
        this.send(`Hiding of projectile effects ${this.s.hideProjectiles ? 'en' : 'dis'}abled.`);
      },
      'refresh': () => {
        this.handle_hide_user();
        this.send(`Refreshed spawned users.`);
      },
      'servants': () => {
        this.s.hideServants = !this.s.hideServants;
        this.send(`Hiding of pets and partners ${this.s.hideServants ? 'en' : 'dis'}abled.`);
      },
      'status': () => {
        this.send(`Status : `,
          `mode : ${this.s.mode}`,
          `guild : ${this.s.guild}`,
          `party : ${this.s.party}`,
          `fireworks : ${this.s.hideFireworks}`),
          `projectiles : ${this.s.hideProjectiles}`,
          `servants : ${this.s.hideServants}`,
          `summons : ${this.s.hideAllSummons}`
      },
      'summons': (arg) => {
        switch (arg) {
          case undefined:
            this.s.hideAllSummons = !this.s.hideAllSummons;
            this.send(`Hiding of summoned NPCs ${this.s.hideAllSummons ? 'en' : 'dis'}abled.`);
            break;
          case 'mine':
            this.s.keepMySummons = !this.s.keepMySummons;
            this.send(`Hiding of owned summoned NPCs ${this.s.keepMySummons ? 'dis' : 'en'}abled.`);
            break;
          default:
            this.send(`Invalid argument. usage : fps summons [mine]`);
        }
      },
      '$default': () => {
        this.send(`Invalid argument. usage : fps [all|fireworks|hit|guild|hit|mode|off|on|party|proj|refresh|servant|status|summons]`);
      }
    });

    // game state
    this.g.on('enter_game', () => {
      this.gameId = this.g.me.gameId;
    });

    this.g.me.on('change_zone', () => {
      this.user_list = {};
      this.user_shown = {};
      this.user_hidden = {};
      this.npc_hidden = {};
      this.servant_hidden = {};
    });

    this.m.hookOnce('S_GET_USER_LIST', this.m.majorPatchVersion >= 86 ? 17 : 16, { order: -1000 }, (e) => {
      e.characters.forEach((c) => {
        this.guild.add(c.guildName);
      });
    });

    this.load();

    // user movetype
    this.m.tryHook('S_USER_MOVETYPE', 'event', () => {
      return false;
    });

  }

  destructor() {
    this.c.remove('fps');
    this.unload();
  }

  // helper
  async handle_hide_user() {
    await this.hide_all();
    if (this.s.mode === 3)
      return;
    if (this.s.party)
      await this.show_party();
    if (this.s.guild)
      await this.show_guild();
    if (this.s.mode < 3 && !this.s.guild && !this.s.party)
      this.show_all();
  }

  show_guild() {
    return new Promise((resolve) => {
      for (let i in this.user_hidden) {
        let user = this.user_hidden[i];
        if (this.guild.has(user.guildName) && user.guildName !== '') {
          this.m.send('S_SPAWN_USER', 15, user);
          this.user_shown[user.gameId] = user;
          delete this.user_hidden[i];
        }
      }
      resolve();
    });
  }

  show_party() {
    return new Promise((resolve) => {
      for (let i in this.user_hidden) {
        let user = this.user_hidden[i];
        if (this.party_list.includes(user.name)) {
          this.m.send('S_SPAWN_USER', 15, user);
          this.user_shown[user.gameId] = user;
          delete this.user_hidden[i];
        }
      }
      resolve();
    });
  }

  show_all() {
    return new Promise((resolve) => {
      for (let i in this.user_hidden) {
        this.m.send('S_SPAWN_USER', 15, this.user_hidden[i]);
        this.user_shown[this.user_hidden[i].gameId] = this.user_hidden[i];
        delete this.user_hidden[i];
      }
      this.user_hidden = {};
      resolve();
    });
  }

  hide_all() {
    return new Promise((resolve) => {
      for (let i in this.user_list) {
        this.m.send('S_DESPAWN_USER', 3, {
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

  update_user_loc(e) {
    this.m.send('S_USER_LOCATION', 5, {
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
    this.hooks.push(this.m.hook(...arguments));
  }

  load() {
    // user
    this.hook('S_SPAWN_USER', 15, { order: -10 }, (e) => {
      this.user_list[e.gameId] = e;
      if (this.s.mode === 3) {
        this.user_hidden[e.gameId] = e;
        return false;
      }
      if (this.s.guild && e.guildName !== '' && this.guild.has(e.guildName)) {
        this.user_shown[e.gameId] = e;
        return;
      }
      if (this.s.party && this.party_list.includes(e.name)) {
        this.user_shown[e.gameId] = e;
        return;
      }
      if (!this.s.guild && !this.s.party && this.s.mode < 3) {
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
      this.user_list[e.gameId] ? this.user_list[e.gameId].loc = e.dest : null;
      if (this.user_hidden[e.gameId])
        return false;
    });

    // party
    this.hook('S_PARTY_MEMBER_LIST', this.m.majorPatchVersion >= 90 ? 0 : 7, (e) => {
      e.members.forEach((m) => {
        this.party_list.push(m.name);
      });
    });

    this.hook('S_LEAVE_PARTY', 1, () => {
      this.party_list = [];
      this.handle_hide_user();
    });

    // npc: summons, fireworks
    this.hook('S_SPAWN_NPC', 11, { order: -10 }, (e) => {
      if (e.huntingZoneId === 1023) {
        if (this.s.hideAllSummons) {
          if (this.s.keepMySummons && this.gameId === e.owner) {
            return;
          }
          this.npc_hidden[e.gameId] = e;
          return false;
        }
        if (this.s.hideFireworks && (e.templateId === 60016000 || e.templateId === 80037000))
          return false;
      }
    });

    this.hook('S_DESPAWN_NPC', 3, (e) => {
      delete this.npc_hidden[e.gameId];
    });

    // servant
    this.hook('S_REQUEST_SPAWN_SERVANT', 3, { order: -10 }, (e) => {
      if (this.s.hideServants && this.gameId !== e.ownerId) {
        this.servant_hidden[e.gameId] = e;
        return false;
      }
    });

    this.hook('S_REQUEST_DESPAWN_SERVANT', 1, (e) => {
      delete this.servant_hidden[e.gameId];
    });

    // mount
    this.hook('S_MOUNT_VEHICLE', 2, (e) => {
      this.user_list[e.gameId] ? this.user_list[e.gameId].mount = e.id : null;
    });

    this.hook('S_UNMOUNT_VEHICLE', 2, (e) => {
      this.user_list[e.gameId] ? this.user_list[e.gameId].mount = 0 : null;
    });

    //
    this.hook('S_ACTION_STAGE', 9, { order: 100 }, (e) => {
      if (this.gameId !== e.gameId && this.user_list[e.gameId]) {
        if (this.s.mode === 2 || this.user_hidden[e.gameId]) {
          this.update_user_loc(e);
          return false;
        }
      }
    });

    this.hook('S_ABNORMALITY_BEGIN', 3, { order: 100 }, (e) => {
      if (this.user_hidden[e.target])
        return false;
    });

    this.hook('S_ABNORMALITY_REFRESH', 1, { order: 100 }, (e) => {
      if (this.user_hidden[e.target])
        return false;
    });

    // hit
    this.hook('S_EACH_SKILL_RESULT', this.m.majorPatchVersion >= 86 ? 14 : 13, { order: 100 }, (e) => {
      if (this.gameId === e.source || this.gameId === e.owner) {
        if (this.s.hitMe) {
          e.skill.id = 0;
          return true;
        }
        if (this.s.hitDamage) {
          e.value = BigInt(0);
          return true;
        }
      }
      if (this.s.hitOther &&
        this.gameId !== e.target &&
        (this.user_list[e.owner] || this.user_list[e.source])) {
        e.skill.id = 0;
        return true;
      }
    });

    // fear
    this.hook('S_FEARMOVE_STAGE', 2, (e) => {
      if ((this.s.mode === 3 && this.gameId !== e.gameId) ||
        this.user_hidden[e.gameId] ||
        this.npc_hidden[e.gameId]) {
        return false;
      }
    });
    this.hook('S_FEARMOVE_END', 2, (e) => {
      if ((this.s.mode === 3 && this.gameId !== e.gameId) ||
        this.user_hidden[e.gameId] ||
        this.npc_hidden[e.gameId]) {
        return false;
      }
    });

    // proj
    this.hook('S_START_USER_PROJECTILE', 9, { order: 100 }, (e) => {
      if (this.gameId !== e.gameId &&
        this.user_list[e.gameId] && 
        (this.s.mode > 0 || this.s.hideProjectiles)) {
        return false;
      }
    });

    this.hook('S_SPAWN_PROJECTILE', this.m.majorPatchVersion >= 84 ? 6 : 5, { order: 100 }, (e) => {
      if (this.gameId !== e.gameId &&
        this.user_list[e.gameId] &&
        (this.s.mode > 0 || this.s.hideProjectiles)) {
        return false;
      }
    });

    this.loaded = true;
  }

  unload() {
    if (this.hooks.length) {
      for (let h of this.hooks)
        this.m.unhook(h);
      this.hooks = [];
    }

    this.loaded = false;
  }

  send() { this.c.message(': ' + [...arguments].join('\n\t - ')); }

  saveState() {
    let state = {
      gameId: this.gameId,
      guild: this.guild,
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
    this.gameId = state.gameId;
    this.guild = state.guild;
    this.user_list = state.user_list;
    this.user_shown = state.user_shown;
    this.user_hidden = state.user_hidden;
    this.party_list = state.party_list;
    this.npc_hidden = state.npc_hidden;
    this.servant_hidden = state.servant_hidden;
  }

}

module.exports = fps_utils_lite;