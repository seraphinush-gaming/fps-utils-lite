'use strict';

async function asyncForEach(arr, cb) {
  for (let i = 0; i < arr.length; i++)
    await cb(arr[i], i, arr);
}

const DRUNK_ABN = [
  70251, 70252, 70253, 70254, 70255, 70256,
  4850, 48732, 48734, 48735, 48736, 48737, 48738,
  476806,
  630201, 630202, 630411, 630511, 631002, 631003, 631201, 631202,
  776017, 806001, 806002, 811061, 821101, 905656, 905657,
  7102001, 45000011, 45000012, 47660800, 47660900, 47661000, 47662300,
  999001011
];

const REGEX_ID = /#(\d+)@/;

class FpsUtilsLite {

  constructor(mod) {

    this.mod = mod;
    this.command = mod.command;
    this.hooks = [];
    this.loaded = false;

    // init
    this.guild = new Set();
    this.userList = {};
    this.userShown = {};
    this.userHidden = {};
    this.partyList = {};
    this.npcHidden = {};

    mod.command.add('fps', {
      'actionscript': () => {
        mod.settings.hide_actionScript = !mod.settings.hide_actionScript;
        this.send(`Hiding of screen script ${mod.settings.hide_actionScript ? 'en' : 'dis'}abled.`);
      },
      'all': () => {
        mod.settings.guild = mod.settings.party = false;
        this.showAll();
        this.send(`Showing all users.`);
      },
      'deathanim': () => {
        mod.settings.hide_deathAnim = !mod.settings.hide_deathAnim;
        this.send(`Hiding of death animation ${mod.settings.hide_deathAnim ? 'en' : 'dis'}abled.`);
      },
      'dropitem': {
        '$none': () => {
          mod.settings.hide_dropitem = !mod.settings.hide_dropitem;
          this.send(`Hiding of select dropitems ${mod.settings.hide_dropitem ? 'en' : 'dis'}abled.`);
        },
        'add': async (id) => {
          if (!id)
            return this.send(`Invalid argument. usage : fps dropitem add &lt;item id | chat link&gt;`);

          (!isNaN(parseInt(id))) ? id = parseInt(id) : id = await this.get_chatLinkId(id);
          mod.settings.dropitem_list.push(id);
          mod.settings.dropitem_list = Array.from(new Set(mod.settings.dropitem_list));
          mod.settings.dropitem_list.sort((a, b) => parseInt(a) - parseInt(b));
          let name = mod.game.data.items.get(id) ? mod.game.data.items.get(id).name : 'undefined';
          this.send(`Added &lt;${name}&gt; to dropitem list.`);
        },
        'list': () => {
          mod.log(`Dropitem list :`);
          mod.settings.dropitem_list.forEach((item) => {
            let name = mod.game.data.items.get(item) ? mod.game.data.items.get(item).name : 'undefined';
            console.log('- ' + item + ' : ' + name);
          });
          this.send(`Exported dropitem list to console.`);
        },
        'rm': async (id) => {
          if (!id)
            return this.send(`Invalid argument. usage : fps dropitem rm &lt;item id | chat link&gt;`);

          (!isNaN(parseInt(id))) ? id = parseInt(id) : id = await this.get_chatLinkId(id);
          mod.settings.dropitem_list.splice(mod.settings.dropitem_list.indexOf(id), 1);
          let name = mod.game.data.items.get(id) ? mod.game.data.items.get(id).name : 'undefined';
          this.send(`Removed &lt;${name}&gt; from dropitem list.`);
        },
        '$default': () => {
          this.send(`Invalid argument. usage : fps dropitem [add|list|rm]`);
        }
      },
      'drunkscreen': () => {
        mod.settings.hide_drunkScreen = !mod.settings.hide_drunkScreen;
        this.send(`Hiding of drunk screen ${mod.settings.hide_drunkScreen ? 'en' : 'dis'}abled.`);
      },
      'fireworks': () => {
        mod.settings.hide_fireworks = !mod.settings.hide_fireworks;
        this.send(`Hiding of fireworks ${mod.settings.hide_fireworks ? 'en' : 'dis'}abled.`);
      },
      'glm': () => {
        mod.settings.hide_glm = !mod.settings.hide_glm;
        this.send(`Hiding of Guardian Legion Mission UI ${mod.settings.hide_glm ? 'en' : 'dis'}abled.`);
      },
      'guild': () => {
        mod.settings.guild = !mod.settings.guild;
        this.handle_hideUser();
        this.send(`Hiding of everyone but your guild members ${mod.settings.guild ? 'en' : 'dis'}abled.`);
      },
      'hit': (arg) => {
        switch (arg) {
          case undefined:
            mod.settings.hide_hit = !mod.settings.hide_hit;
            this.send(`Hiding of other players skill hit effect ${mod.settings.hide_hit ? 'en' : 'dis'}abled.`);
            break;
          case 'mine':
            mod.settings.hide_myHit = !mod.settings.hide_myHit;
            this.send(`Hiding of the player's skill hit effect ${mod.settings.hide_myHit ? 'en' : 'dis'}abled.`);
            break;
          default:
            this.send(`Invalid argument. usage : fps hit [mine]`);
        }
      },
      'mode': (arg) => {
        const prev = mod.settings.mode;
        switch (arg) {
          case '0':
            mod.settings.mode = 0;
            mod.settings.guild = mod.settings.party = mod.settings.hide_hit = false;
            this.handle_hideUser();
            this.send(`Mode set to 0, all FPS improvements disabled.`);
            break;
          case '1':
            mod.settings.mode = 1;
            mod.settings.hide_hit = true;
            if (prev === 3) this.handle_hideUser();
            this.send(`Mode set to 1, projectiles and select skill effects disabled.`);
            break;
          case '2':
            mod.settings.mode = 2;
            mod.settings.hide_hit = true;
            if (prev === 3) this.handle_hideUser();
            this.send(`Mode set to 2, all skill motion of other players disabled.`);
            break;
          case '3':
            mod.settings.mode = 3;
            mod.settings.hide_hit = true;
            this.handle_hideUser();
            this.send(`Mode set to 3, all other players hidden.`);
            break;
          default:
            this.send(`Invalid argument. usage : fps mode [0|1|2|3]`);
        }
      },
      'party': () => {
        mod.settings.party = !mod.settings.party
        this.handle_hideUser();
        this.send(`Hiding of everyone but your party ${mod.settings.party ? 'en' : 'dis'}abled.`);
      },
      'proj': (arg) => {
        switch (arg) {
          case undefined:
            mod.settings.hide_projectiles = !mod.settings.hide_projectiles;
            this.send(`Hiding of other player projectile effects ${mod.settings.hide_projectiles ? 'en' : 'dis'}abled.`);
            break;
          case 'mine':
            mod.settings.hide_myProjectiles = !mod.settings.hide_myProjectiles;
            this.send(`Hiding of my projectile effects ${mod.settings.hide_myProjectiles ? 'en' : 'dis'}abled.`);
            break;
          default:
            this.send(`Invalid argument. usage : fps proj [mine]`);
        }
      },
      'refresh': async () => {
        await this.hideAll();
        this.handle_hideUser();
        this.send(`Refreshed spawned users.`);
      },
      'status': () => {
        mod.log(`Status :`);
        console.log(JSON.stringify(mod.settings, null, 2));
        this.send(`Exported settings to console.`);
      },
      'summons': (arg) => {
        switch (arg) {
          case undefined:
            mod.settings.hide_summons = !mod.settings.hide_summons;
            this.send(`Hiding of summoned NPCs ${mod.settings.hide_summons ? 'en' : 'dis'}abled.`);
            break;
          case 'mine':
            mod.settings.hide_mySummons = !mod.settings.hide_mySummons;
            this.send(`Hiding of self summoned NPCs ${mod.settings.hide_mySummons ? 'en' : 'dis'}abled.`);
            break;
          default:
            this.send(`Invalid argument. usage : fps summons [mine]`);
        }
      },
      '?': () => this.send(`Usage : fps [actionscript|all|deathanim|dropitem|drunkscreen|fireworks|glm|guild|hit|mode|party|proj|refresh|summons]`),
      '$default': () => this.send(`Invalid argument. usage : fps [actionscript|all|deathanim|dropitem|drunkscreen|fireworks|glm|guild|hit|mode|party|proj|refresh|summons|?]`)
    });

    // game state
    mod.game.on('enter_loading_screen', () => {
      this.userList = {};
      this.userShown = {};
      this.userHidden = {};
      this.npcHidden = {};
    });

    // mod.majorPatchVersion >= 101 ? 19 : 18
    // mod.majorPatchVersion >= 103 ? 20 : 19
    mod.hookOnce('S_GET_USER_LIST', mod.majorPatchVersion >= 104 ? 21 : 20, (e) => {
      e.characters.forEach((ch) => { this.guild.add(ch.guildName); });
    });

    // user movetype
    mod.tryHook('S_USER_MOVETYPE', 'event', () => { return false; });

    this.load();

  }

  destructor() {
    this.command.remove('fps');
    this.mod.settings.dropitem_list = Array.from(new Set(this.mod.settings.dropitem_list));
    this.mod.settings.dropitem_list.sort((a, b) => parseInt(a) - parseInt(b));
    this.unload();

    this.loaded = undefined;
    this.hooks = undefined;
    this.command = undefined;
    this.mod = undefined;
  }

  // helper
  async handle_hideUser() {
    if (this.mod.settings.mode === 3) return this.hideAll();
    if (!this.mod.settings.guild && !this.mod.settings.party) return this.showAll();

    let toHide = [];
    for (const i in this.userShown) {
      const user = this.userShown[i];
      if (this.mod.settings.guild) {
        if (this.guild.has(user.guildName) && user.guildName !== '') continue;
      }
      if (this.mod.settings.party) {
        if (this.partyList[user.gameId]) continue;
      }
      toHide.push(user);
    }

    let toShow = [];
    for (const i in this.userHidden) {
      const user = this.userHidden[i];
      if (this.mod.settings.guild) {
        if (this.guild.has(user.guildName) && user.guildName !== '') {
          toShow.push(user);
          continue;
        }
      }
      if (this.mod.settings.party) {
        if (this.partyList[user.gameId]) {
          toShow.push(user);
          continue;
        }
      }
    }

    asyncForEach(toHide, async user => { await this.hideUser(user); });
    asyncForEach(toShow, async user => { await this.showUser(user); });
  }

  showUser(user) {
    return new Promise((resolve) => {
      this.mod.send('S_SPAWN_USER', 17, user);
      this.userShown[user.gameId] = user;
      delete this.userHidden[user.gameId];
      resolve();
    });
  }

  showAll() {
    return new Promise((resolve) => {
      for (const i in this.userHidden) {
        this.mod.send('S_SPAWN_USER', 17, this.userHidden[i]);
        this.userShown[this.userHidden[i].gameId] = this.userHidden[i];
        delete this.userHidden[i];
      }
      this.userHidden = {};
      resolve();
    });
  }

  hideUser(user) {
    return new Promise((resolve) => {
      this.mod.send('S_DESPAWN_USER', 3, {
        gameId: user.gameId,
        type: 1
      });
      this.userHidden[user.gameId] = user;
      delete this.userShown[user.gameId];
      resolve();
    });
  }

  hideAll() {
    return new Promise((resolve) => {
      for (const i in this.userList) {
        this.mod.send('S_DESPAWN_USER', 3, {
          gameId: this.userList[i].gameId,
          type: 1
        });
        this.userHidden[this.userList[i].gameId] = this.userList[i];
        delete this.userShown[i];
      }
      this.userShown = {};
      resolve();
    });
  }

  get_chatLinkId(chatLink) {
    return new Promise((resolve) => {
      let res = chatLink.match(REGEX_ID);
      res = parseInt(res[1]);
      resolve(res);
    });
  }

  // code
  hook() {
    this.hooks.push(this.mod.hook(...arguments));
  }

  load() {
    // user
    this.hook('S_SPAWN_USER', 17, (e) => {
      if (this.mod.game.me.inBattleground) return;
      if (this.mod.game.me.inCivilUnrest) return;

      this.userList[e.gameId] = e;

      if (this.mod.settings.mode === 3) {
        this.userHidden[e.gameId] = e;
        return false;
      }

      if (this.mod.settings.guild && this.guild.has(e.guildName))
        return this.userShown[e.gameId] = e;

      if (this.mod.settings.party && this.partyList[e.gameId])
        return this.userShown[e.gameId] = e;

      if (!this.mod.settings.guild && !this.mod.settings.party)
        if (this.mod.settings.mode < 3)
          return this.userShown[e.gameId] = e;

      this.userHidden[e.gameId] = e;
      return false;
    });

    this.hook('S_DESPAWN_USER', 3, (e) => {
      delete this.userList[e.gameId];
      delete this.userShown[e.gameId];
      delete this.userHidden[e.gameId];
    });

    this.hook('S_USER_LOCATION', this.mod.majorPatchVersion >= 105 ? 6 : 5, (e) => {
      if (this.userList[e.gameId]) this.userList[e.gameId].loc = e.dest;
      if (this.userShown[e.gameId]) this.userShown[e.gameId].loc = e.dest;
      if (this.userHidden[e.gameId]) return false;
    });

    this.hook('S_ACTION_STAGE', 9, (e) => {
      if (this.mod.game.me.gameId !== e.gameId && this.userList[e.gameId]) {
        if (this.userHidden[e.gameId]) return false;
        if (this.mod.settings.mode === 2) return false;
      }
    });

    this.hook('S_ACTION_END', 5, (e) => {
      if (this.mod.game.me.gameId !== e.gameId && this.userList[e.gameId]) {
        this.userList[e.gameId].loc = e.loc;
        if (this.userHidden[e.gameId]) {
          this.userHidden[e.gameId].loc = e.loc;
          return false;
        }
        if (this.mod.settings.mode === 2 && this.userShown[e.gameId]) {
          this.mod.toClient('S_USER_LOCATION', this.mod.majorPatchVersion >= 105 ? 6 : 5, {
            gameId: e.gameId,
            loc: this.userShown[e.gameId].loc,
            w: e.w,
            speed: 300,
            dest: e.loc,
            type: 7
          });
          this.userShown[e.gameId].loc = e.loc;
          return false;
        }
      }
    });

    // hit
    // this.mod.majorPatchVersion >= 86 ? 14 : 13
    this.hook('S_EACH_SKILL_RESULT', this.mod.majorPatchVersion >= 110 ? 15 : 14, (e) => {
      if (this.userHidden[e.target]) return false;
      if (this.mod.game.me.gameId === e.source || this.mod.game.me.gameId === e.owner) {
        if (this.mod.settings.hide_myHit) return false;
      }
      else if (this.userList[e.source] || this.userList[e.owner]) {
        if (this.mod.settings.hide_hit) return false;
      }
    });

    // abnormality
    this.hook('S_ABNORMALITY_BEGIN', this.mod.majorPatchVersion >= 107 ? 5 : 4, (e) => {
      if (this.userHidden[e.target]) return false;
      if (this.mod.game.me.gameId == e.target) {
        if (this.mod.settings.hide_drunkScreen && DRUNK_ABN.includes(e.id))
          return false;
      }
    });

    this.hook('S_ABNORMALITY_REFRESH', 2, (e) => {
      if (this.userHidden[e.target]) return false;
    });

    this.hook('S_ABNORMALITY_END', 1, (e) => {
      if (this.userHidden[e.target]) return false;
    });

    // fear
    this.hook('S_FEARMOVE_STAGE', 2, (e) => {
      if (this.userHidden[e.gameId]) return false;
      if (this.npcHidden[e.gameId]) return false;
    });

    this.hook('S_FEARMOVE_END', 2, (e) => {
      if (this.userHidden[e.gameId]) return false;
      if (this.npcHidden[e.gameId]) return false;
    });

    // mount
    this.hook('S_MOUNT_VEHICLE', 2, (e) => {
      if (this.userList[e.gameId]) this.userList[e.gameId].mount = e.id;
      if (this.userHidden[e.gameId]) return false;
    });

    this.hook('S_UNMOUNT_VEHICLE', 2, (e) => {
      if (this.userList[e.gameId]) this.userList[e.gameId].mount = 0;
      if (this.userHidden[e.gameId]) return false;
    });

    // party
    // this.mod.majorPatchVersion >= 69 ? 7 : 6
    // this.mod.majorPatchVersion >= 90 ? 8 : 7
    this.hook('S_PARTY_MEMBER_LIST', this.mod.majorPatchVersion >= 106 ? 9 : 8, (e) => {
      e.members.forEach((member) => {
        this.partyList[member.gameId] = member;
        if (this.mod.settings.mode === 3) return;
        if (!this.mod.settings.party) return;
        if (this.userHidden[member.gameId])
          this.showUser(this.userHidden[member.gameId]);
      });
    });

    this.hook('S_LEAVE_PARTY', 'event', () => {
      for (const i in this.partyList) {
        if (this.mod.settings.guild && this.guild.has(member.guildName))
          continue;

        if (!this.mod.settings.guild && !this.mod.settings.party)
          if (this.mod.settings.mode < 3)
            continue;

        const member = this.partyList[i];
        if (this.userList[member.gameId])
          this.hideUser(this.userList[member.gameId]);
      }
      this.partyList = {};
    });

    // TODO
    // npc: summons, fireworks
    this.hook('S_SPAWN_NPC', this.mod.majorPatchVersion >= 101 ? 12 : 11, (e) => {
      if (e.templateId === 9901 && e.walkSpeed == 0 && e.runSpeed == 0) {
        this.npcHidden[e.gameId] = e;
        return false;
      }

      if (e.huntingZoneId === 1023) {
        if (this.mod.settings.hide_summons) {
          if (!this.mod.settings.hide_mySummons && this.mod.game.me.gameId === e.owner) return;
          this.npcHidden[e.gameId] = e;
          return false;
        }
        if (this.mod.settings.hide_fireworks) {
          if (e.templateId === 60016000 || e.templateId === 80037000) return false;
        }
      }
    });

    this.hook('S_DESPAWN_NPC', 3, (e) => {
      delete this.npcHidden[e.gameId];
      if (this.mod.settings.hide_deathAnim && e.type === 5) {
        e.type = 1;
        return true;
      }
    });

    // proj
    this.hook('S_START_USER_PROJECTILE', 9, (e) => {
      if (this.mod.game.me.gameId == e.gameId) return;
      if (this.mod.settings.mode !== 0) return false;
    });

    this.hook('S_SPAWN_PROJECTILE', this.mod.majorPatchVersion >= 101 ? 6 : 5, (e) => {
      if (this.mod.game.me.gameId == e.gameId) {
        if (this.mod.settings.hide_myProjectiles) return false;
        return;
      }
      if (this.userList[e.gameId]) {
        if (this.userHidden[e.gameId]) return false;
        if (this.mod.settings.hide_projectiles) return false;
        if (this.mod.settings.mode !== 0) return false;
      }
    });

    // dropitem
    this.hook('S_SPAWN_DROPITEM', 9, (e) => {
      if (this.mod.settings.hide_dropitem && this.mod.settings.dropitem_list.includes(e.item))
        return false;
    });

    // action script
    this.hook('S_START_ACTION_SCRIPT', 'event', () => {
      if (this.mod.settings.hide_actionScript) return false;
    });

    // guardian legion mission
    this.mod.tryHook('S_FIELD_EVENT_ON_ENTER', 'event', () => {
      if (this.mod.settings.hide_glm) return false;
    });

    this.hook('S_SYSTEM_MESSAGE', 1, (e) => {
      if (this.mod.settings.hide_glm) {
        const msg = this.mod.parseSystemMessage(e.message);
        switch (msg.id) {
          case 'SMT_FIELD_EVENT_REWARD_AVAILABLE':
            this.send(`Completed ${msg.tokens.number} Guardian Legion Mission rewards`);
            break;
        }
      }
    });

    this.loaded = true;
  }

  unload() {
    if (this.hooks.length) {
      for (const h of this.hooks)
        this.mod.unhook(h);
      this.hooks = [];
    }

    this.loaded = false;
  }

  send(msg) { this.command.message(': ' + msg); }

  saveState() {
    const state = {
      guild: this.guild,
      userList: this.userList,
      userShown: this.userShown,
      userHidden: this.userHidden,
      partyList: this.partyList,
      npcHidden: this.npcHidden,
    }
    return state;
  }

  loadState(state) {
    this.guild = state.guild;
    this.userList = state.userList;
    this.userShown = state.userShown;
    this.userHidden = state.userHidden;
    this.partyList = state.partyList;
    this.npcHidden = state.npcHidden;
  }

}

module.exports = { NetworkMod: FpsUtilsLite };