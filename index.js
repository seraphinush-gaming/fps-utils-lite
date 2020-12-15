'use strict';

const DRUNK_ABN = [
  70251, 70252, 70253, 70254, 70255, 70256,
  4850, 48732, 48734, 48735, 48736, 48737, 48738,
  476806,
  630201, 630202, 630411, 630511, 631002, 631003, 631201, 631202,
  776017, 806001, 806002, 811061, 821101, 905656, 905657,
  7102001, 45000011, 45000012, 47660800, 47660900, 47661000, 47662300,
  999001011
]

class fps_utils_lite {

  constructor(mod) {

    this.mod = mod;
    this.command = mod.command;
    this.hooks = [];
    this.loaded = false;

    // initialize
    this.guild = new Set();

    this.user_list = {};
    this.user_shown = {};
    this.user_hidden = {};
    this.party_list = {};
    this.npc_hidden = {};
    this.servant_hidden = {};

    mod.command.add('fps', {
      'actionscript': () => {
        mod.settings.hide_action_script = !mod.settings.hide_action_script;
        this.send(`Hiding of screen zoom script ${mod.settings.hide_action_script ? 'en' : 'dis'}abled.`);
      },
      'all': () => {
        mod.settings.guild = mod.settings.party = false;
        this.show_all();
        this.send(`Showing all users.`);
      },
      'camerashake': () => {
        mod.settings.hide_camera_shake = !mod.settings.hide_camera_shake;
        this.handle_camera_shake();
        this.send(`Hiding of camera shake ${mod.settings.hide_camera_shake ? 'en' : 'dis'}abled.`);
      },
      'deathanim': () => {
        mod.settings.hide_death_anim = !mod.settings.hide_death_anim;
        this.send(`Hiding of death animation ${mod.settings.hide_death_anim ? 'en' : 'dis'}abled.`);
      },
      'dropitem': {
        '$none': () => {
          mod.settings.hide_dropitem = !mod.settings.hide_dropitem;
          this.send(`Hiding of dropitem ${mod.settings.hide_dropitem ? 'en' : 'dis'}abled.`);
        },
        'add': async (id) => {
          if (id) {
            (!isNaN(parseInt(id))) ? id = parseInt(id) : id = await this.get_chatlink_id(id);
            mod.settings.dropitem_list.push(id);
            this.send(`Added &lt;${mod.game.data.items.get(id).name}&gt; to dropitem list.`);
          }
          else { this.send(`Invalid argument. usage : fps dropitem add &lt;item id | chat link&gt;`); }
        },
        'list': () => {
          this.mod.log(`Dropitem list :`);
          mod.settings.dropitem_list.sort();
          mod.settings.dropitem_list.forEach((item) => {
            console.log('- ' + item + ' : ' + (mod.game.data.items.get(item) ? mod.game.data.items.get(item).name : 'undefined'));
          });
          this.send(`Exported dropitem list to console.`);
        },
        'rm': async (id) => {
          if (id) {
            (!isNaN(parseInt(id))) ? id = parseInt(id) : id = await this.get_chatlink_id(id);
            mod.settings.dropitem_list.splice(mod.settings.dropitem_list.indexOf(id), 1);
            this.send(`Removed &lt;${mod.game.data.items.get(id).name}&gt; from dropitem list.`);
          }
          else { this.send(`Invalid argument. usage : fps dropitem add &lt;item id | chat link&gt;`); }
        },
        '$default': () => {
          this.send(`Invalid argument. usage : fps dropitem [add|list|rm]`);
        }
      },
      'drunkscreen': () => {
        mod.settings.hide_drunk_screen = !mod.settings.hide_drunk_screen;
        this.send(`Hiding of drunk screen ${mod.settings.hide_drunk_screen ? 'en' : 'dis'}abled.`);
      },
      'fireworks': () => {
        mod.settings.hide_fireworks = !mod.settings.hide_fireworks;
        this.send(`Hiding of firework effects ${mod.settings.hide_fireworks ? 'en' : 'dis'}abled.`);
      },
      'glm': () => {
        mod.settings.hide_glm = !mod.settings.hide_glm;
        this.send(`Hiding of Guardian Legion Mission ui ${mod.settings.hide_glm ? 'en' : 'dis'}abled.`);
      },
      'guild': () => {
        mod.settings.guild = !mod.settings.guild;
        this.handle_hide_user();
        this.send(`Hiding of everyone but your guild members ${mod.settings.guild ? 'en' : 'dis'}abled.`);
      },
      'hit': (arg) => {
        switch (arg) {
          case 'damage':
            mod.settings.hit_damage = !mod.settings.hit_damage;
            this.send(`Hiding of the players skill damage numbers ${mod.settings.hit_damage ? 'en' : 'dis'}abled.`);
            break;
          case 'me':
            mod.settings.hit_me = !mod.settings.hit_me;
            this.send(`Hiding of the player's skill hits ${mod.settings.hit_me ? 'en' : 'dis'}abled.`);
            break;
          case 'other':
            mod.settings.hit_other = !mod.settings.hit_other;
            this.send(`Hiding of other players skill hits ${mod.settings.hit_other ? 'en' : 'dis'}abled.`);
            break;
          default:
            this.send(`Invalid argument. usage : fps hit [damage|me|other]`);
            break;
        }
      },
      'mode': (arg) => {
        let prev = mod.settings.mode;
        switch (arg) {
          case '0':
            mod.settings.mode = 0;
            mod.settings.guild = mod.settings.hit_other = mod.settings.party = false;
            this.handle_hide_user();
            this.send(`FPS mode set to 0, all FPS improvements disabled.`);
            break;
          case '1':
            mod.settings.mode = 1;
            mod.settings.hit_other = true;
            if (prev === 3) {
              this.handle_hide_user();
            }
            this.send(`FPS mode set to 1, projectiles hidden and abnormalities disabled.`);
            break;
          case '2':
            mod.settings.mode = 2;
            mod.settings.hit_other = true;
            if (prev === 3) {
              this.handle_hide_user();
            }
            this.send(`FPS mode set to 2, all skill effects disabled.`);
            break;
          case '3':
            mod.settings.mode = 3;
            mod.settings.hit_other = true;
            this.handle_hide_user();
            this.send(`FPS mode set to 3, all players, their effects and their hit effects disabled.`);
            break;
          default:
            this.send(`Invalid argument. usage : fps mode [0|1|2|3]`);
        }
      },
      'off': () => {
        if (this.loaded) {
          this.show_all();
          this.unload();
          this.send(`Removed all necessary hooks.`);
        }
      },
      'on': () => {
        if (!this.loaded) {
          this.load();
          this.send(`Loaded all necessary hooks.`);
        }
      },
      'party': () => {
        mod.settings.party = !mod.settings.party
        this.handle_hide_user();
        this.send(`Hiding of everyone but your group ${mod.settings.party ? 'en' : 'dis'}abled.`);
      },
      'proj': () => {
        mod.settings.hide_projectiles = !mod.settings.hide_projectiles;
        this.send(`Hiding of projectile effects ${mod.settings.hide_projectiles ? 'en' : 'dis'}abled.`);
      },
      'refresh': () => {
        this.handle_hide_user();
        this.send(`Refreshed spawned users.`);
      },
      'servants': () => {
        mod.settings.hide_servants = !mod.settings.hide_servants;
        this.send(`Hiding of pets and partners ${mod.settings.hide_servants ? 'en' : 'dis'}abled.`);
      },
      'status': () => {
        this.mod.log(`Status :`);
        console.log(JSON.stringify(this.s, null, 2));
        this.send(`Exported dropitem list to console.`);
      },
      'summons': (arg) => {
        switch (arg) {
          case undefined:
            mod.settings.hide_all_summons = !mod.settings.hide_all_summons;
            this.send(`Hiding of summoned NPCs ${mod.settings.hide_all_summons ? 'en' : 'dis'}abled.`);
            break;
          case 'mine':
            mod.settings.hide_my_summons = !mod.settings.hide_my_summons;
            this.send(`Hiding of owned summoned NPCs ${mod.settings.hide_my_summons ? 'en' : 'dis'}abled.`);
            break;
          default:
            this.send(`Invalid argument. usage : fps summons [mine]`);
        }
      },
      '$default': () => { this.send(`Invalid argument. usage : fps [actionscript|all|camerashake|deathanim|dropitem|drunkscreen|fireworks|glm|guild|hit|mode|off|on|party|proj|refresh|servants|summons]`); }
    });

    // game state
    mod.game.me.on('change_zone', () => {
      this.user_list = {};
      this.user_shown = {};
      this.user_hidden = {};
      this.npc_hidden = {};
      this.servant_hidden = {};
    });

    mod.hookOnce('S_GET_USER_LIST', mod.majorPatchVersion >= 101 ? 19 : 18, { order: -10 }, (e) => {
      e.characters.forEach((c) => {
        this.guild.add(c.guildName);
      });
    });

    this.load();

    // user movetype
    mod.tryHook('S_USER_MOVETYPE', 'event', () => {
      return false;
    });

    // camera shake
    this.handle_camera_shake();

  }

  destructor() {
    this.command.remove('fps');
    this.unload();
  }

  // helper
  async handle_hide_user() {
    await this.hide_all();
    if (this.mod.settings.mode === 3) return;
    if (this.mod.settings.party) await this.show_party();
    if (this.mod.settings.guild) await this.show_guild();
    if (this.mod.settings.mode < 3 && !this.mod.settings.guild && !this.mod.settings.party)
      this.show_all();
  }

  show_guild() {
    return new Promise((resolve) => {
      for (let i in this.user_hidden) {
        let user = this.user_hidden[i];
        if (this.guild.has(user.guildName) && user.guildName !== '') {
          this.mod.send('S_SPAWN_USER', 16, user);
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
        if (this.party_list[this.user_hidden[i].gameId]) {
          this.mod.send('S_SPAWN_USER', 16, this.user_hidden[i]);
          this.user_shown[this.user_hidden[i].gameId] = this.user_hidden[i];
          delete this.user_hidden[i];
        }
      }
      resolve();
    });
  }

  show_all() {
    return new Promise((resolve) => {
      for (let i in this.user_hidden) {
        this.mod.send('S_SPAWN_USER', 16, this.user_hidden[i]);
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

  get_chatlink_id(chatLink) {
    return new Promise((resolve) => {
      let regex_id = /#(\d+)@/;
      let res = chatLink.match(regex_id);
      res = parseInt(res[1]);
      resolve(res);
    });
  }

  handle_camera_shake() {
    this.mod.clientInterface.configureCameraShake(!this.mod.settings.hide_camera_shake, 0.3, 0.3);
  }

  update_user_loc(e) {
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
    this.hook('S_SPAWN_USER', 17, { order: -10 }, (e) => {
      this.user_list[e.gameId] = e;
      if (this.mod.settings.mode === 3) {
        this.user_hidden[e.gameId] = e;
        return false;
      }
      if (this.mod.settings.guild && e.guildName !== '' && this.guild.has(e.guildName)) {
        this.user_shown[e.gameId] = e;
        return;
      }
      if (this.mod.settings.party && this.party_list[e.gameId]) {
        this.user_shown[e.gameId] = e;
        return;
      }
      if (!this.mod.settings.guild && !this.mod.settings.party && this.mod.settings.mode < 3) {
        return;
      }
      this.user_hidden[e.gameId] = e;
      return false;
    });

    this.hook('S_DESPAWN_USER', 3, { order: 10 }, (e) => {
      delete this.user_list[e.gameId];
      delete this.user_shown[e.gameId];
      delete this.user_hidden[e.gameId];
    });

    this.hook('S_USER_LOCATION', 5, { order: 10 }, (e) => {
      this.user_list[e.gameId] ? this.user_list[e.gameId].loc = e.dest : null;
      if (this.user_hidden[e.gameId])
        return false;
    });

    // party
    // this.mod.majorPatchVersion >= 90 ? 7 : 7
    this.hook('S_PARTY_MEMBER_LIST', 7, (e) => {
      e.members.forEach((m) => {
        this.party_list[m.gameId] = m;
      });
    });

    this.hook('S_LEAVE_PARTY', 'event', { order: 10 }, () => {
      this.party_list = {};
      this.handle_hide_user();
    });

    // npc: summons, fireworks
    this.hook('S_SPAWN_NPC', this.mod.majorPatchVersion >= 101 ? 12 : 11, { order: -10 }, (e) => {
      if (e.templateId === 9901 && e.walkSpeed == 0 && e.runSpeed == 0)
        return false;

      if (e.huntingZoneId === 1023) {
        if (this.mod.settings.hide_all_summons) {
          if (!this.mod.settings.hide_my_summons && this.mod.game.me.gameId === e.owner) {
            return;
          }
          this.npc_hidden[e.gameId] = e;
          return false;
        }
        if (this.mod.settings.hide_fireworks && (e.templateId === 60016000 || e.templateId === 80037000))
          return false;
      }
    });

    this.hook('S_DESPAWN_NPC', 3, { order: -10 }, (e) => {
      delete this.npc_hidden[e.gameId];
      if (this.mod.settings.hide_death_anim && e.type == 5) {
        e.type = 1;
        return true;
      }
    });

    // servant
    this.hook('S_REQUEST_SPAWN_SERVANT', 4, { order: 10 }, (e) => {
      if (this.mod.settings.hide_servants && this.mod.game.me.gameId !== e.ownerId) {
        this.servant_hidden[e.gameId] = e;
        return false;
      }
    });

    this.hook('S_REQUEST_DESPAWN_SERVANT', 1, { order: 10 }, (e) => {
      delete this.servant_hidden[e.gameId];
    });

    // mount
    this.hook('S_MOUNT_VEHICLE', 2, { order: 10 }, (e) => {
      this.user_list[e.gameId] ? this.user_list[e.gameId].mount = e.id : null;
    });

    this.hook('S_UNMOUNT_VEHICLE', 2, { order: 10 }, (e) => {
      this.user_list[e.gameId] ? this.user_list[e.gameId].mount = 0 : null;
    });

    //
    this.hook('S_ACTION_STAGE', 9, { order: 10 }, (e) => {
      if (this.mod.game.me.gameId !== e.gameId && this.user_list[e.gameId]) {
        if (this.mod.settings.mode === 2 || this.user_hidden[e.gameId]) {
          this.update_user_loc(e);
          return false;
        }
      }
    });

    this.hook('S_ABNORMALITY_BEGIN', 4, { order: 10 }, (e) => {
      if (this.user_hidden[e.target])
        return false;
      if (this.mod.settings.hide_drunk_screen && DRUNK_ABN.includes(e.id))
        return false;
    });

    this.hook('S_ABNORMALITY_REFRESH', 2, { order: 10 }, (e) => {
      if (this.user_hidden[e.target])
        return false;
    });

    // hit
    // this.mod.majorPatchVersion >= 86 ? 14 : 13
    this.hook('S_EACH_SKILL_RESULT', 14, { order: 10 }, (e) => {
      if (this.mod.game.me.gameId === e.source || this.mod.game.me.gameId === e.owner) {
        if (this.mod.settings.hit_me) {
          e.skill.id = 0;
          return true;
        }
        if (this.mod.settings.hit_damage) {
          e.value = BigInt(0);
          return true;
        }
      }
      if (this.mod.settings.hit_other &&
        this.mod.game.me.gameId !== e.target &&
        (this.user_list[e.owner] || this.user_list[e.source])) {
        e.skill.id = 0;
        return true;
      }
    });

    // fear
    this.hook('S_FEARMOVE_STAGE', 2, { order: 10 }, (e) => {
      if ((this.mod.settings.mode === 3 && this.mod.game.me.gameId !== e.gameId) || this.user_hidden[e.gameId] || this.npc_hidden[e.gameId])
        return false;
    });
    this.hook('S_FEARMOVE_END', 2, { order: 10 }, (e) => {
      if ((this.mod.settings.mode === 3 && this.mod.game.me.gameId !== e.gameId) || this.user_hidden[e.gameId] || this.npc_hidden[e.gameId])
        return false;
    });

    // proj
    this.hook('S_START_USER_PROJECTILE', 9, { order: 10 }, (e) => {
      if (this.mod.game.me.gameId !== e.gameId && this.user_list[e.gameId] && (this.mod.settings.mode > 0 || this.mod.settings.hide_projectiles))
        return false;
    });

    this.hook('S_SPAWN_PROJECTILE', this.mod.majorPatchVersion >= 84 ? 5 : 5, { order: 10 }, (e) => { // TODO
      if (this.mod.game.me.gameId !== e.gameId && this.user_list[e.gameId] && (this.mod.settings.mode > 0 || this.mod.settings.hide_projectiles))
        return false;
    });

    // dropitem
    this.hook('S_SPAWN_DROPITEM', 9, { order: -10 }, (e) => {
      if (this.mod.settings.hide_dropitem && this.mod.settings.dropitem_list.includes(e.item))
        return false;
    });

    // action script
    this.hook('S_START_ACTION_SCRIPT', 'event', { order: -10 }, () => {
      if (this.mod.settings.hide_action_script)
        return false;
    });

    // guardian legion mission
    this.mod.tryHook('S_FIELD_EVENT_ON_ENTER', 'event', { order: -10 }, () => {
      if (this.mod.settings.hide_glm)
        return false;
    });

    this.hook('S_SYSTEM_MESSAGE', 1, { order: 10 }, (e) => {
      if (this.mod.settings.hide_glm) {
        let msg = this.mod.parseSystemMessage(e.message);
        switch (msg.id) {
          case 'SMT_FIELD_EVENT_REWARD_AVAILABLE':
            this.send(`Completed ${msg.tokens.number} / 40 Guardian Legion Mission rewards`);
            break;
        }
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

  send(msg) { this.command.message(': ' + msg); }

  saveState() {
    let state = {
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
    this.guild = state.guild;
    this.user_list = state.user_list;
    this.user_shown = state.user_shown;
    this.user_hidden = state.user_hidden;
    this.party_list = state.party_list;
    this.npc_hidden = state.npc_hidden;
    this.servant_hidden = state.servant_hidden;
  }

}

module.exports = { NetworkMod: fps_utils_lite };